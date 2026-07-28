import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { bookingService } from '../booking.service.js'
import { Button } from '../../../shared/components/Button.jsx'
import {
  getPaymentReferenceFromSearchParams,
  getPaymentStatus,
  isCompletedPaymentStatus,
  cleanupPaymentSearchParams,
} from '../../../shared/utils/paymentFlow.js'
import { storage } from '../../../services/storage.js'

export default function PaymentCallbackPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [phase, setPhase] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')
  const hasRun = useRef(false)

  useEffect(() => {
    // Guard against StrictMode double-invoke and re-renders
    if (hasRun.current) return
    hasRun.current = true

    const reference = getPaymentReferenceFromSearchParams(searchParams)

    if (!reference) {
      setPhase('error')
      setErrorMessage('No payment reference found in the URL. If you completed payment, please check your bookings.')
      return
    }

    bookingService
      .verifyPayment(reference)
      .then((res) => {
        const payStatus = getPaymentStatus(res)
        storage.payments.clearSession('booking')
        cleanupPaymentSearchParams(searchParams, setSearchParams)

        if (isCompletedPaymentStatus(payStatus)) {
          setPhase('success')
        } else {
          setPhase('error')
          setErrorMessage(
            `Payment status returned as "${payStatus}". If you were charged, please contact support with reference: ${reference}`
          )
        }
      })
      .catch((err) => {
        storage.payments.clearSession('booking')
        cleanupPaymentSearchParams(searchParams, setSearchParams)
        setPhase('error')
        setErrorMessage(
          err?.message ?? `Verification failed. Please contact support with reference: ${reference}`
        )
      })
  }, []) // intentional empty deps — runs once on mount

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      {phase === 'verifying' && (
        <div className="text-center">
          <Loader2 className="mx-auto mb-5 h-12 w-12 animate-spin text-primary" />
          <h2 className="text-[22px] font-bold text-text-1 mb-2">Verifying payment...</h2>
          <p className="text-[14px] text-text-3">Please wait while we confirm your payment with Paystack.</p>
        </div>
      )}

      {phase === 'success' && (
        <div className="text-center max-w-[360px] w-full">
          <div className="mx-auto mb-6 w-20 h-20 bg-[#ECFDF3] rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-[24px] font-bold text-text-1 mb-2">Payment confirmed!</h2>
          <p className="text-[14px] text-text-3 mb-8 leading-relaxed">
            Your booking has been created and payment received. The artisan will be notified.
          </p>
          <Button variant="solid" className="w-full" onClick={() => navigate('/my-hustles')}>
            View my bookings
          </Button>
        </div>
      )}

      {phase === 'error' && (
        <div className="text-center max-w-[360px] w-full">
          <div className="mx-auto mb-6 w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-[24px] font-bold text-text-1 mb-2">Verification failed</h2>
          <p className="text-[14px] text-text-3 mb-8 leading-relaxed">{errorMessage}</p>
          <Button variant="solid" className="w-full" onClick={() => navigate('/my-hustles')}>
            Go to my bookings
          </Button>
        </div>
      )}
    </div>
  )
}
