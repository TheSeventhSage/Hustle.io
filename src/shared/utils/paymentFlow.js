import { storage } from '../../services/storage.js'
import { unwrapData } from '../lib/api/response.js'

const PAYSTACK_SCRIPT_SRC = 'https://js.paystack.co/v2/inline.js'

export const PAYMENT_SESSION_TYPES = {
  booking: 'booking',
  cityAccess: 'cityAccess',
  hustle: 'hustle',
}

const PAYMENT_SUCCESS_STATUSES = new Set(['approved', 'paid', 'success'])
const PAYMENT_CALLBACK_PARAM_KEYS = ['payment_ref', 'reference', 'trxref']
const PAYMENT_SESSION_MAX_AGE_MS = 60 * 60 * 1000

export function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop)
      return
    }

    const existingScript = document.querySelector(`script[src="${PAYSTACK_SCRIPT_SRC}"]`)
    if (existingScript) {
      const checkPaystack = setInterval(() => {
        if (window.PaystackPop) {
          clearInterval(checkPaystack)
          resolve(window.PaystackPop)
        }
      }, 100)

      setTimeout(() => {
        clearInterval(checkPaystack)
        if (!window.PaystackPop) {
          reject(new Error('Paystack script timeout'))
        }
      }, 10000)
      return
    }

    const script = document.createElement('script')
    script.src = PAYSTACK_SCRIPT_SRC
    script.async = true
    script.onload = () => {
      if (window.PaystackPop) {
        resolve(window.PaystackPop)
      } else {
        reject(new Error('Paystack script loaded but PaystackPop not available'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load Paystack script'))
    document.head.appendChild(script)
  })
}

export function getPaymentPayload(response) {
  const payload = unwrapData(response)
  return payload?.item ?? payload ?? null
}

export function getPaymentStatus(responseOrPayload) {
  const payload = responseOrPayload?.data ? getPaymentPayload(responseOrPayload) : responseOrPayload
  return String(payload?.payment_status ?? payload?.status ?? '').toLowerCase()
}

export function isCompletedPaymentStatus(status) {
  return PAYMENT_SUCCESS_STATUSES.has(String(status || '').toLowerCase())
}

export function getPaymentReferenceFromSearchParams(searchParams) {
  return PAYMENT_CALLBACK_PARAM_KEYS
    .map((key) => searchParams.get(key))
    .find(Boolean) ?? null
}

export function cleanupPaymentSearchParams(searchParams, setSearchParams) {
  const next = new URLSearchParams(searchParams)
  PAYMENT_CALLBACK_PARAM_KEYS.forEach((key) => next.delete(key))
  setSearchParams(next, { replace: true })
}

function resolveReturnUrl(returnUrl, context = {}) {
  return typeof returnUrl === 'function' ? returnUrl(context) : returnUrl
}

export async function runPaymentFlow({
  initializePayment,
  verifyPayment,
  sessionType,
  sessionData = {},
  returnUrl,
  retryOnForceNew = true,
  onAlreadyPaid,
  onPaymentSuccess,
  onPaymentStatusMismatch,
  onPaymentCancelled,
  onPaymentError,
  onVerificationError,
}) {
  return start(false)

  async function start(forceNew) {
    const callbackUrl = resolveReturnUrl(returnUrl)
    const initResponse = await initializePayment({ forceNew, callbackUrl })
    const paymentData = getPaymentPayload(initResponse)
    const status = getPaymentStatus(paymentData)

    if (isCompletedPaymentStatus(status)) {
      storage.payments.clearSession(sessionType)
      await onAlreadyPaid?.({ initResponse, paymentData, status })
      return { kind: 'already_paid', paymentData }
    }

    const accessCode = paymentData?.access_code
    const reference = paymentData?.reference
    const authUrl = paymentData?.authorization_url

    if (!accessCode || !reference) {
      if (!forceNew && retryOnForceNew) return start(true)

      const error = new Error('Payment initialization failed. Missing payment details.')
      await onPaymentError?.(error)
      throw error
    }

    storage.payments.setSession(sessionType, {
      reference,
      timestamp: Date.now(),
      ...(typeof sessionData === 'function' ? sessionData({ paymentData, reference }) : sessionData),
    })

    const redirectToHosted = async () => {
      if (authUrl) {
        window.location.href = authUrl
        return { kind: 'redirected', reference }
      }

      if (!forceNew && retryOnForceNew) return start(true)

      storage.payments.clearSession(sessionType)
      const error = new Error('Payment initialization failed. Missing payment URL.')
      await onPaymentError?.(error)
      throw error
    }

    try {
      const PaystackPop = await loadPaystackScript()
      if (!PaystackPop) return redirectToHosted()

      return await new Promise((resolve, reject) => {
        try {
          const popup = new PaystackPop()
          const handleSuccess = async (transaction = {}) => {
            const resolvedReference = transaction?.reference || reference

            try {
              const verifyResponse = await verifyPayment(resolvedReference)
              const verifyStatus = getPaymentStatus(verifyResponse)

              storage.payments.clearSession(sessionType)

              if (isCompletedPaymentStatus(verifyStatus)) {
                await onPaymentSuccess?.({ verifyResponse, paymentData, reference: resolvedReference, status: verifyStatus })
                resolve({ kind: 'verified', verifyResponse, status: verifyStatus })
                return
              }

              await onPaymentStatusMismatch?.({ verifyResponse, paymentData, reference: resolvedReference, status: verifyStatus })
              resolve({ kind: 'status_mismatch', verifyResponse, status: verifyStatus })
            } catch (error) {
              storage.payments.clearSession(sessionType)
              await onVerificationError?.(error)
              reject(error)
            }
          }

          popup.onSuccess = handleSuccess
          popup.onCancel = async () => {
            storage.payments.clearSession(sessionType)
            await onPaymentCancelled?.()
            resolve({ kind: 'cancelled' })
          }
          popup.onError = async (error) => {
            storage.payments.clearSession(sessionType)
            await onPaymentError?.(error ?? new Error('Payment failed.'))
            reject(error ?? new Error('Payment failed.'))
          }

          if (typeof popup.resumeTransaction !== 'function') {
            throw new Error('Paystack resumeTransaction is not available.')
          }

          popup.resumeTransaction(accessCode)
        } catch (error) {
          redirectToHosted().then(resolve).catch(reject)
        }
      })
    } catch {
      return redirectToHosted()
    }
  }
}

export async function reconcileStoredPayment({
  sessionType,
  searchParams,
  setSearchParams,
  verifyPayment,
  shouldHandle,
  onMissingSession,
  onMismatch,
  onExpired,
  onSuccess,
  onError,
}) {
  const paymentRef = getPaymentReferenceFromSearchParams(searchParams)
  if (!paymentRef) return false

  if (shouldHandle && !shouldHandle({ paymentRef, searchParams })) return false

  const pendingPayment = storage.payments.getSession(sessionType)
  const hasPendingPayment = Boolean(pendingPayment)
  let validationState = 'matched'

  if (!pendingPayment) {
    validationState = 'missing'
    await onMissingSession?.()
  } else if (pendingPayment.reference !== paymentRef) {
    validationState = 'mismatch'
    storage.payments.clearSession(sessionType)
    await onMismatch?.(pendingPayment)
  } else if (Date.now() - Number(pendingPayment.timestamp ?? 0) > PAYMENT_SESSION_MAX_AGE_MS) {
    validationState = 'expired'
    storage.payments.clearSession(sessionType)
    await onExpired?.(pendingPayment)
  }

  try {
    const verifyResponse = await verifyPayment(paymentRef)
    storage.payments.clearSession(sessionType)
    cleanupPaymentSearchParams(searchParams, setSearchParams)
    await onSuccess?.({
      pendingPayment: hasPendingPayment ? pendingPayment : null,
      paymentRef,
      verifyResponse,
      status: getPaymentStatus(verifyResponse),
      validationState,
    })
  } catch (error) {
    storage.payments.clearSession(sessionType)
    cleanupPaymentSearchParams(searchParams, setSearchParams)
    await onError?.(error, hasPendingPayment ? pendingPayment : null)
  }

  return true
}
