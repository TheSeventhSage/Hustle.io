/**
 * directBookingPayment.js
 *
 * Self-contained module for the new "Book and Pay" flow.
 *
 * Flow:
 *   1. POST /bookings/direct-payment         → booking starts as awaiting_payment
 *   2. POST /bookings/{id}/payment/initialize → returns authorization_url + reference
 *   3. window.location.href = authorization_url → user pays on Paystack hosted page
 *   4. Paystack redirects back to the booking page with ?reference=…
 *   5. useDirectBookingPaymentCallback() runs verify immediately on mount
 *
 * The old /bookings endpoint and runPaymentFlow (inline popup) are untouched.
 * Use this module ONLY when the user explicitly chooses "Book and Pay".
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../services/api.client.js'
import { storage } from '../../services/storage.js'
import useUIStore from '../../shared/store/ui.store.js'
import { bookingService } from './booking.service.js'
import {
  getPaymentPayload,
  getPaymentStatus,
  isCompletedPaymentStatus,
  getPaymentReferenceFromSearchParams,
  cleanupPaymentSearchParams,
} from '../../shared/utils/paymentFlow.js'

const BOOKINGS_KEY = ['bookings', 'mine']

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * POST /bookings/direct-payment
 *
 * Response data shape:
 * { booking_id, job_id, conversation_id, status: "awaiting_payment",
 *   payment_initialize_endpoint }
 */
export async function createDirectBookingService(payload) {
  const response = await apiClient('/bookings/direct-payment', {
    method: 'POST',
    body: payload,
  })
  if (response?.error) throw response.error
  return response
}

/**
 * Safely extracts booking_id from the direct booking response.
 * The spec returns { data: { booking_id } } but we also guard
 * against { data: { id } } in case the shape shifts.
 */
export function getDirectBookingId(response) {
  const data = response?.data?.data ?? response?.data ?? {}
  return data.booking_id ?? data.id ?? null
}

// ─── Payment flow ─────────────────────────────────────────────────────────────

/**
 * Initializes payment for a direct booking then hard-redirects to Paystack.
 *
 * Per the API spec: "Frontend/mobile should open: authorization_url"
 * This is NOT the inline popup flow — the user navigates away from the page.
 *
 * Before redirecting we write a payment session to localStorage so that
 * reconcileStoredPayment() can pick up the reference when Paystack returns
 * with ?reference=… in the URL (same mechanism the existing booking flow uses).
 *
 * @param {object}        opts
 * @param {string|number} opts.bookingId
 * @param {object}        [opts.extraSessionData]  merged into stored session
 * @param {Function}      [opts.onAlreadyPaid]     (sync or async) fired when
 *                        the backend already shows a completed payment status
 * @param {Function}      [opts.onError]           (sync or async) fired before
 *                        the function re-throws — use for UI feedback
 *
 * @returns {Promise<{ kind: 'redirected' | 'already_paid', reference?, authUrl?, paymentData? }>}
 */
export async function runDirectPaymentRedirect({
  bookingId,
  extraSessionData = {},
  onAlreadyPaid,
  onError,
}) {
  if (!bookingId) {
    const err = new Error('Direct payment requires a valid booking ID.')
    await onError?.(err)
    throw err
  }

  // ── Step 1: initialize payment ───────────────────────────────────────────
  let initResponse
  try {
    initResponse = await apiClient(`/bookings/${bookingId}/payment/initialize`, {
      method: 'POST',
      body: {},
    })
    if (initResponse?.error) throw initResponse.error
  } catch (err) {
    await onError?.(err)
    throw err
  }

  const paymentData = getPaymentPayload(initResponse)
  const status = getPaymentStatus(paymentData)

  // ── Guard: backend already shows this as paid ────────────────────────────
  if (isCompletedPaymentStatus(status)) {
    const reference = paymentData?.reference ?? null
    if (reference) {
      storage.payments.setSession('booking', {
        reference,
        bookingId,
        timestamp: Date.now(),
        needsVerification: true,
        ...extraSessionData,
      })
    } else {
      storage.payments.clearSession('booking')
    }
    await onAlreadyPaid?.({ initResponse, paymentData, status })
    return { kind: 'already_paid', paymentData }
  }

  const reference = paymentData?.reference
  const authUrl = paymentData?.authorization_url

  // ── Guard: missing reference ─────────────────────────────────────────────
  if (!reference) {
    const err = new Error('Payment initialization returned no reference. Cannot proceed.')
    await onError?.(err)
    throw err
  }

  // ── Guard: missing authorization_url ────────────────────────────────────
  // The spec is explicit: frontend should open authorization_url.
  // access_code alone cannot be used here because this is a redirect flow.
  if (!authUrl) {
    const err = new Error('Payment initialization returned no authorization URL. Cannot redirect.')
    await onError?.(err)
    throw err
  }

  // ── Store session BEFORE redirect ────────────────────────────────────────
  // The page unloads immediately after location.href is set.
  // reconcileStoredPayment() reads this session when Paystack returns.
  storage.payments.setSession('booking', {
    reference,
    bookingId,
    timestamp: Date.now(),
    ...extraSessionData,
  })

  window.location.href = authUrl
  return { kind: 'redirected', reference, authUrl }
}

// ─── React hooks ──────────────────────────────────────────────────────────────

/**
 * Mutation for step 1: create a direct booking.
 *
 * Handles error status codes that are specific to this endpoint:
 *   409 — artisan already booked for the requested time window
 *   403 — caller is not a client (artisan/company accounts cannot book)
 *   422 — request body failed backend validation
 */
export function useCreateDirectBooking() {
  const queryClient = useQueryClient()
  const { toastError } = useUIStore()

  return useMutation({
    mutationFn: (payload) => createDirectBookingService(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })
    },
    onError(err) {
      const status = err?.status ?? err?.statusCode
      if (status === 409) {
        toastError('The provider is already booked for that time window.')
      } else if (status === 403) {
        toastError('Only client accounts can create direct bookings.')
      } else if (status === 422) {
        toastError(err?.message ?? 'Invalid booking details. Please check all required fields.')
      } else {
        toastError(err?.message ?? 'Failed to create booking. Please try again.')
      }
    },
  })
}

/**
 * Hook for step 2: initialize payment and redirect to Paystack.
 *
 * Returns { run, isPending }.
 *
 * isPending stays true from when the user clicks Pay until the redirect
 * fires (window.location.href assignment). Once the page unloads the state
 * is discarded — this is intentional. The isPending flag prevents double-clicks
 * during the async initialize call.
 *
 * Usage:
 *   const { run, isPending } = useDirectBookingPayment()
 *   await run({ bookingId: 123 })
 */
export function useDirectBookingPayment() {
  const queryClient = useQueryClient()
  const { toastError, toastInfo } = useUIStore()
  const [isPending, setIsPending] = useState(false)

  const run = useCallback(
    async ({ bookingId, extraSessionData = {} } = {}) => {
      setIsPending(true)
      try {
        return await runDirectPaymentRedirect({
          bookingId,
          extraSessionData,
          async onAlreadyPaid() {
            queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })
            toastInfo('This booking has already been paid.')
          },
          async onError(err) {
            toastError(err?.message ?? 'Could not start payment. Please try again.')
          },
        })
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, toastError, toastInfo]
  )

  return { run, isPending }
}

// ─── Payment return / verification ────────────────────────────────────────────

/**
 * Drop this hook into whatever page the backend redirects to after Paystack.
 *
 * It runs once on mount, reads ?reference= / ?trxref= from the URL, checks
 * that a booking payment session exists in localStorage (written by
 * runDirectPaymentRedirect before the redirect), then immediately calls
 * POST /payments/{reference}/verify.
 *
 * It is a complete no-op when:
 *   - no reference param is in the URL
 *   - no booking payment session is stored (prevents false triggers)
 *
 * @param {object}   [opts]
 * @param {Function} [opts.onSuccess]  called with { res, reference, bookingId } on verified
 * @param {Function} [opts.onError]    called with the Error on failure
 *
 * @returns {{ phase: 'idle'|'verifying'|'success'|'error', bookingId: number|null, errorMessage: string }}
 */
export function useDirectBookingPaymentCallback({ onSuccess, onError } = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()
  const [phase, setPhase] = useState('idle')
  const [bookingId, setBookingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const hasRun = useRef(false)

  useEffect(() => {
    // Guard: StrictMode double-invoke / re-renders
    if (hasRun.current) return

    const reference = getPaymentReferenceFromSearchParams(searchParams)
    if (!reference) return

    // Guard: only handle if a direct booking session is stored.
    // This prevents the hook from accidentally firing on pages that happen to
    // have a ?reference= param for an unrelated reason.
    const session = storage.payments.getSession('booking')
    if (!session) return

    hasRun.current = true
    setPhase('verifying')
    setBookingId(session.bookingId ?? null)

    bookingService
      .verifyPayment(reference)
      .then((res) => {
        const payStatus = getPaymentStatus(res)
        storage.payments.clearSession('booking')
        cleanupPaymentSearchParams(searchParams, setSearchParams)
        queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })

        if (isCompletedPaymentStatus(payStatus)) {
          setPhase('success')
          toastSuccess('Payment confirmed! Your booking is active.')
          onSuccess?.({ res, reference, bookingId: session.bookingId ?? null })
        } else {
          const msg = `Payment status: "${payStatus}". Contact support with ref: ${reference}`
          setPhase('error')
          setErrorMessage(msg)
          toastError(msg)
          onError?.(new Error(msg))
        }
      })
      .catch((err) => {
        storage.payments.clearSession('booking')
        cleanupPaymentSearchParams(searchParams, setSearchParams)
        const msg = err?.message ?? `Verification failed. Contact support with ref: ${reference}`
        setPhase('error')
        setErrorMessage(msg)
        toastError(msg)
        onError?.(err)
      })
  }, []) // intentional — must only fire once on mount

  return { phase, bookingId, errorMessage }
}
