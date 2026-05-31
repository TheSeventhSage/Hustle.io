import { storage } from '../../services/storage.js'
import { unwrapData } from '../lib/api/response.js'

const PAYSTACK_SCRIPT_SRC = 'https://js.paystack.co/v2/inline.js'

export const PAYMENT_SESSION_TYPES = {
  booking: 'booking',
  cityAccess: 'cityAccess',
  hustle: 'hustle',
}

const PAYMENT_SUCCESS_STATUSES = new Set(['approved', 'paid', 'success', 'active'])
const PAYMENT_CALLBACK_PARAM_KEYS = ['payment_ref', 'reference', 'trxref']
const PAYMENT_SESSION_MAX_AGE_MS = 60 * 60 * 1000
const PAYMENT_VERIFICATION_IN_FLIGHT = new Set()
const PAYSTACK_RECOVERABLE_HINTS = [
  'already paid',
  'has already been paid',
  'duplicate transaction',
  'transaction has been completed',
  'transaction was completed',
  'passing the correct reference for the requested resource that exists on this integration',
  'Not Found',
]

function getPaystackClient() {
  return window.Paystack ?? window.PaystackPop ?? null
}

function createPaystackPopup(client) {
  if (!client) return null

  if (typeof client === 'function') {
    return new client()
  }

  if (typeof client.resumeTransaction === 'function') {
    return client
  }

  if (client?.default && typeof client.default.resumeTransaction === 'function') {
    return client.default
  }

  throw new Error('Paystack resumeTransaction is not available.')
}

export function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    const existingClient = getPaystackClient()
    if (existingClient) {
      resolve(existingClient)
      return
    }

    const existingScript = document.querySelector(`script[src="${PAYSTACK_SCRIPT_SRC}"]`)
    if (existingScript) {
      const checkPaystack = setInterval(() => {
        const client = getPaystackClient()
        if (client) {
          clearInterval(checkPaystack)
          resolve(client)
        }
      }, 100)

      setTimeout(() => {
        clearInterval(checkPaystack)
        if (!getPaystackClient()) {
          reject(new Error('Paystack script timeout'))
        }
      }, 10000)
      return
    }

    const script = document.createElement('script')
    script.src = PAYSTACK_SCRIPT_SRC
    script.async = true
    script.onload = () => {
      const client = getPaystackClient()
      if (client) {
        resolve(client)
      } else {
        reject(new Error('Paystack script loaded but no Paystack client is available'))
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

export function getPaymentMessage(responseOrPayload) {
  return String(
    responseOrPayload?.message
    ?? responseOrPayload?.data?.message
    ?? responseOrPayload?.data?.data?.message
    ?? responseOrPayload?.payment_message
    ?? ''
  ).trim()
}

export function getPaymentStatus(responseOrPayload) {
  const payload = responseOrPayload?.data ? getPaymentPayload(responseOrPayload) : responseOrPayload
  return String(payload?.payment_status ?? payload?.subscription_status ?? payload?.status ?? '').toLowerCase()
}

export function isCompletedPaymentStatus(status) {
  return PAYMENT_SUCCESS_STATUSES.has(String(status || '').toLowerCase())
}

function getPaymentErrorMessage(error) {
  if (!error) return ''
  if (typeof error === 'string') return error
  return String(error?.message ?? error?.statusMessage ?? error?.status_message ?? error?.msg ?? '').trim()
}

function isRecoverablePaystackError(error) {
  const message = getPaymentErrorMessage(error).toLowerCase()
  return PAYSTACK_RECOVERABLE_HINTS.some((hint) => message.includes(hint))
}

function isUserClosedPaystackError(error) {
  const message = getPaymentErrorMessage(error).toLowerCase()
  return [
    'cancelled',
    'canceled',
    'user canceled',
    'user cancelled',
    'closed by user',
    'user closed',
    'window closed',
  ].some((hint) => message.includes(hint))
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
  includeCallbackUrl = false,
  allowRedirectFallback = false,
  recoverInlineErrorWithVerification = false,
  initialForceNew = false,
  retryOnForceNew = true,
  shouldRequireManualVerificationOnInitialize,
  onAlreadyPaid,
  onNeedsVerification,
  onPaymentSuccess,
  onPaymentStatusMismatch,
  onPaymentCancelled,
  onPaymentError,
  onVerificationError,
  onRecoverablePaymentError,
}) {
  return start(initialForceNew)

  async function start(forceNew) {
    const initArgs = { forceNew }
    if (includeCallbackUrl) {
      const callbackUrl = resolveReturnUrl(returnUrl)
      if (callbackUrl) initArgs.callbackUrl = callbackUrl
    }

    const initResponse = await initializePayment(initArgs)
    const paymentData = getPaymentPayload(initResponse)
    const status = getPaymentStatus(paymentData)
    const message = getPaymentMessage(initResponse)

    const shouldPauseForManualVerification =
      referenceExists(paymentData) &&
      shouldRequireManualVerificationOnInitialize?.({
        initResponse,
        paymentData,
        status,
        message,
        forceNew,
      })

    if (shouldPauseForManualVerification) {
      const reference = paymentData?.reference ?? paymentData?.subscription_reference ?? null

      storage.payments.setSession(sessionType, {
        reference,
        timestamp: Date.now(),
        requiresManualVerification: true,
        forceNewOnRetry: false,
        ...(typeof sessionData === 'function'
          ? sessionData({ paymentData, reference })
          : sessionData),
      })
      await onNeedsVerification?.({ initResponse, paymentData, reference, status, message })
      return { kind: 'needs_verification', paymentData, reference, message }
    }

    if (isCompletedPaymentStatus(status)) {
      const reference = paymentData?.reference ?? paymentData?.subscription_reference ?? null

      // If there is a reference we can verify with the backend.
      // Store a session so the UI can surface a "Verify Payment" button and
      // persist the state across re-renders / page refreshes.
      if (reference) {
        storage.payments.setSession(sessionType, {
          reference,
          timestamp: Date.now(),
          needsVerification: true,
          ...(typeof sessionData === 'function'
            ? sessionData({ paymentData, reference })
            : sessionData),
        })
        await onNeedsVerification?.({ initResponse, paymentData, reference, status })
        return { kind: 'needs_verification', paymentData, reference }
      }

      // No reference – nothing to verify, just treat as already paid.
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

    const handleInlineUnavailable = async (reason) => {
      if (allowRedirectFallback && authUrl) {
        window.location.href = authUrl
        return { kind: 'redirected', reference }
      }

      storage.payments.clearSession(sessionType)
      const error = reason instanceof Error
        ? reason
        : new Error('Payment could not be started.')
      await onPaymentError?.(error)
      throw error
    }

    try {
      const PaystackClient = await loadPaystackScript()
      if (!PaystackClient) {
        return handleInlineUnavailable(new Error('Paystack popup is unavailable.'))
      }

      return await new Promise((resolve, reject) => {
        try {
          const popup = createPaystackPopup(PaystackClient)
          let handledPaystackReturn = false

          const handleCancelled = async (context = {}) => {
            if (handledPaystackReturn) return
            handledPaystackReturn = true

            storage.payments.clearSession(sessionType)
            await onPaymentCancelled?.(context)
            resolve({ kind: 'cancelled' })
          }

          const handleSuccess = async (transaction = {}) => {
            if (handledPaystackReturn) return
            handledPaystackReturn = true

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

          // Paystack v2: callbacks MUST be passed as the second argument to
          // resumeTransaction. Setting them as properties on the popup object
          // (v1 style) does not work in v2 and the success callback will never
          // fire, so the backend verify call would never be made.
          popup.resumeTransaction(accessCode, {
            onSuccess: handleSuccess,
            onCancel: async () => handleCancelled({ reason: 'cancelled' }),
            onClose: async () => handleCancelled({ reason: 'closed' }),
            onError: async (error) => {
              if (handledPaystackReturn) return

              const resolvedError = error ?? new Error('Payment failed.')
              const errorMessage = getPaymentErrorMessage(resolvedError)

              if (isUserClosedPaystackError(resolvedError)) {
                await handleCancelled({ reason: 'closed', error: resolvedError })
                return
              }

              handledPaystackReturn = true

              if (recoverInlineErrorWithVerification && reference) {
                try {
                  const verifyResponse = await verifyPayment(reference)
                  const verifyStatus = getPaymentStatus(verifyResponse)

                  if (isCompletedPaymentStatus(verifyStatus)) {
                    storage.payments.clearSession(sessionType)
                    await onPaymentSuccess?.({
                      verifyResponse,
                      paymentData,
                      reference,
                      status: verifyStatus,
                    })
                    resolve({ kind: 'verified_after_error', verifyResponse, status: verifyStatus })
                    return
                  }

                  if (!forceNew && retryOnForceNew) {
                    const retryResult = await start(true)
                    resolve(retryResult)
                    return
                  }

                  storage.payments.clearSession(sessionType)
                  await onPaymentStatusMismatch?.({
                    verifyResponse,
                    paymentData,
                    reference,
                    status: verifyStatus,
                  })
                  resolve({ kind: 'status_mismatch', verifyResponse, status: verifyStatus })
                  return
                } catch (verificationError) {
                  storage.payments.clearSession(sessionType)
                  await onVerificationError?.(verificationError)
                  reject(verificationError)
                  return
                }
              }

              const isRecoverable = reference && isRecoverablePaystackError(resolvedError)

              if (isRecoverable) {
                const existingSession = storage.payments.getSession(sessionType) ?? {}
                storage.payments.setSession(sessionType, {
                  ...existingSession,
                  reference,
                  timestamp: Date.now(),
                  requiresManualVerification: true,
                  recoveryMessage: errorMessage,
                  forceNewOnRetry: false,
                })
                await onRecoverablePaymentError?.({
                  error: resolvedError,
                  message: errorMessage,
                  reference,
                  paymentData,
                })
                await onPaymentError?.(resolvedError)
                resolve({ kind: 'recoverable_error', reference, error: resolvedError })
                return
              }

              storage.payments.clearSession(sessionType)
              await onPaymentError?.(resolvedError)
              reject(resolvedError)
            },
          })
        } catch (error) {
          handleInlineUnavailable(error).then(resolve).catch(reject)
        }
      })
    } catch (error) {
      return handleInlineUnavailable(error)
    }
  }
}

function referenceExists(paymentData) {
  return Boolean(paymentData?.reference ?? paymentData?.subscription_reference)
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

  const verificationKey = `${sessionType}:${paymentRef}`
  if (PAYMENT_VERIFICATION_IN_FLIGHT.has(verificationKey)) return false
  PAYMENT_VERIFICATION_IN_FLIGHT.add(verificationKey)

  const pendingPayment = storage.payments.getSession(sessionType)
  const hasPendingPayment = Boolean(pendingPayment)
  let validationState = 'matched'

  try {
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

  PAYMENT_VERIFICATION_IN_FLIGHT.delete(verificationKey)
  return true
}
