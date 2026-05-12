import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft, X, Star, MapPin, CreditCard, AlertCircle } from 'lucide-react'
import { VerifiedBadge } from '../VerifiedBadge.jsx'
import { formatMoney } from './hustleDetailPanel.utils.js'
import { RejectModal } from './RejectModal.jsx'
import { ResultModal } from './ResultModal.jsx'
import { SendMessageModal } from './SendMessageModal.jsx'
import { useDecideApplication } from '../../hustles.hooks.js'
import { useInitializeJobPayment } from '../../../../shared/hustles/jobs.hooks.js'
import { useVerifyPayment } from '../../../booking/booking.hooks.js'
import useUIStore from '../../../../shared/store/ui.store.js'
import { Button } from '../../../../shared/components/Button.jsx'

export function ApplicantDetailView({ hustleId, applicant, onBack, onClose }) {
  const [flow, setFlow] = useState('idle')
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const { toastError, toastSuccess } = useUIStore()
  const { mutate: decideApplication, isPending: decidingApplication } = useDecideApplication()
  const { mutate: initializePayment, isPending: initializingPayment } = useInitializeJobPayment()
  const { mutate: verifyPayment, isPending: verifyingPayment } = useVerifyPayment()

  const handleAcceptClick = () => {
    setShowPaymentModal(true)
  }

  const handleConfirmAccept = () => {
    // Step 1: Accept the application to create the job
    decideApplication(
      {
        hustleId,
        applicationId: applicant.id,
        decision: 'accepted',
      },
      {
        onSuccess: (response) => {
          // Extract job data from response
          const jobData = response?.data?.data || response?.data
          const jobId = jobData?.job_id
          const paymentRequired = jobData?.payment_required

          if (!jobId) {
            toastError('Job created but no job ID found. Please contact support.')
            setShowPaymentModal(false)
            return
          }

          if (!paymentRequired) {
            toastSuccess('Application accepted successfully!')
            setShowPaymentModal(false)
            setFlow('payment_success')
            return
          }

          // Step 2: Initialize payment for the job
          initializePayment(jobId, {
            onSuccess: async (paymentResponse) => {
              const paymentData = paymentResponse?.data?.data || paymentResponse?.data
              const accessCode = paymentData?.access_code
              const reference = paymentData?.reference

              if (!accessCode || !reference) {
                toastError('Payment initialization failed. Missing payment details.')
                setShowPaymentModal(false)
                return
              }

              // Store payment info for verification
              localStorage.setItem('pending_hustle_payment', JSON.stringify({
                reference,
                jobId,
                hustleId,
                applicationId: applicant.id,
                timestamp: Date.now()
              }))

              // Step 3: Use Paystack Inline JS (popup) instead of redirect
              try {
                // Check if PaystackPop is loaded
                if (typeof window.PaystackPop === 'undefined') {
                  // Fallback to redirect if Paystack Inline JS is not loaded
                  const authUrl = paymentData?.authorization_url
                  if (authUrl) {
                    const returnUrl = `${window.location.origin}/my-hustles?tab=pending&payment_ref=${reference}`
                    window.location.href = `${authUrl}&callback_url=${encodeURIComponent(returnUrl)}`
                  } else {
                    toastError('Payment initialization failed. Missing payment URL.')
                    setShowPaymentModal(false)
                  }
                  return
                }

                const popup = new window.PaystackPop()
                popup.resumeTransaction(accessCode, {
                  onSuccess: () => {
                    // Payment successful - now verify it
                    toastSuccess('Payment successful! Verifying...')

                    // Verify payment
                    verifyPayment(reference, {
                      onSuccess: (verifyResponse) => {
                        const status = verifyResponse?.data?.data?.status || verifyResponse?.data?.status
                        if (status === 'approved' || status === 'paid' || status === 'success') {
                          toastSuccess('Payment verified! The hustler can now begin work.')
                          setShowPaymentModal(false)
                          setFlow('payment_success')
                        } else {
                          toastError(`Payment status: ${status}. Please contact support if needed.`)
                          setShowPaymentModal(false)
                        }

                        // Clean up
                        localStorage.removeItem('pending_hustle_payment')
                      },
                      onError: (err) => {
                        toastError(err?.message ?? 'Payment verification failed.')
                        setShowPaymentModal(false)
                        localStorage.removeItem('pending_hustle_payment')
                      },
                    })
                  },
                  onCancel: () => {
                    toastError('Payment cancelled.')
                    setShowPaymentModal(false)
                    localStorage.removeItem('pending_hustle_payment')
                  },
                  onError: (error) => {
                    toastError(error?.message ?? 'Payment failed.')
                    setShowPaymentModal(false)
                    localStorage.removeItem('pending_hustle_payment')
                  },
                })
              } catch (error) {
                console.error('Paystack popup error:', error)
                // Fallback to redirect
                const authUrl = paymentData?.authorization_url
                if (authUrl) {
                  const returnUrl = `${window.location.origin}/my-hustles?tab=pending&payment_ref=${reference}`
                  window.location.href = `${authUrl}&callback_url=${encodeURIComponent(returnUrl)}`
                } else {
                  toastError('Payment initialization failed.')
                  setShowPaymentModal(false)
                  localStorage.removeItem('pending_hustle_payment')
                }
              }
            },
            onError: (err) => {
              toastError(err?.message ?? 'Failed to initialize payment.')
              setShowPaymentModal(false)
            },
          })
        },
        onError: (err) => {
          toastError(err?.message ?? 'Failed to accept application.')
          setShowPaymentModal(false)
        },
      }
    )
  }

  const isProcessing = decidingApplication || initializingPayment || verifyingPayment

  return (
    <>
      <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-7 py-4 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-text-3 hover:bg-mist transition-all"
            aria-label="Back"
          >
            <ArrowLeft size={17} />
          </button>
          <h2 className="text-[16px] font-bold text-text-1">Applicant Details</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMessageModalOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4 hover:bg-mist hover:text-primary transition-all"
            aria-label={`Send message to ${applicant?.name ?? 'applicant'}`}
            title="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H9l-3 3v-3H3a1 1 0 01-1-1V3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4 hover:bg-mist transition-all">
            <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
              <circle cx="2" cy="2" r="1.5" fill="currentColor" />
              <circle cx="2" cy="8" r="1.5" fill="currentColor" />
              <circle cx="2" cy="14" r="1.5" fill="currentColor" />
            </svg>
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4 hover:bg-mist transition-all">
            <X size={17} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-6">
        {isProcessing && (
          <div className="mb-5 px-4 py-3 bg-mist border border-border rounded-xl">
            <p className="text-[13px] font-semibold text-text-2">
              {decidingApplication && 'Creating job...'}
              {initializingPayment && 'Initializing payment...'}
              {verifyingPayment && 'Verifying payment...'}
            </p>
          </div>
        )}

        <div className="flex items-start gap-4 mb-5">
          <img
            src={applicant.avatar}
            alt={applicant.name}
            className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-[17px] font-extrabold text-text-1">{applicant.name}</h3>
              {applicant.verified && <VerifiedBadge />}
            </div>
            <p className="text-[13px] text-text-3 mb-1.5">{applicant.role.replace('...', ' | And anything beauty')}</p>
            <div className="flex items-center gap-1 mb-1">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-[12px] font-semibold text-text-2">
                {applicant.rating} ({applicant.hustlesCompleted} hustles completed)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-text-4" />
              <span className="text-[12px] text-text-4">{applicant.location}</span>
            </div>
          </div>
        </div>

        {/* <button className="text-[13px] text-primary font-semibold mb-6 flex items-center gap-1 hover:underline">
          View hustler&apos;s full profile →
        </button> */}

        <div className="border-t border-border mb-6" />

        <div className="mb-5">
          <p className="text-[13px] text-text-3 mb-1">Total Cost:</p>
          <p className="text-[22px] font-extrabold text-text-1">
            {formatMoney(applicant.totalCost, applicant.currencyCode)}
            <span className="text-[14px] font-semibold text-text-4">/per service</span>
          </p>
        </div>

        <div className="mb-5">
          <p className="text-[13px] text-text-3 mb-1">Duration for Completion</p>
          <p className="text-[15px] font-bold text-text-1">{applicant.duration}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-[13px] text-text-3 mb-1">Preferred date</p>
            <p className="text-[13px] font-semibold text-text-1">{applicant.preferredDate}</p>
          </div>
          <div>
            <p className="text-[13px] text-text-3 mb-1">Preferred time</p>
            <p className="text-[13px] font-semibold text-text-1">{applicant.preferredTime}</p>
          </div>
        </div>

        <p className="text-[12px] text-text-4 leading-relaxed mb-7">
          You will be required to make payment immediately after accepting this offer for the hustler to begin working.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={handleAcceptClick}
            disabled={isProcessing}
            className="flex-1 h-12 bg-primary hover:bg-primary-sat text-white text-[14px] font-bold rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Accept Offer
          </Button>
          <Button
            onClick={() => setFlow('reject_modal')}
            disabled={isProcessing}
            className="flex-1 h-12 border-2 border-[var(--color-brand-grey)] text-[var(--color-brand-grey)] text-[14px] font-bold rounded-full hover:bg-[var(--color-mist)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Reject this proposal
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showPaymentModal && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
              onClick={() => !isProcessing && setShowPaymentModal(false)}
            />
            <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
              <div className="bg-surface rounded-3xl border border-border shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4">
                  <CreditCard size={24} className="text-blue-600" />
                </div>
                <h3 className="text-[18px] font-bold text-text-1 text-center mb-2">
                  Payment Required
                </h3>
                <p className="text-[14px] text-text-3 text-center mb-6 leading-relaxed">
                  You will be redirected to Paystack to complete payment of <span className="font-bold text-text-1">{formatMoney(applicant.totalCost, applicant.currencyCode)}</span>. The hustler can only begin work after payment is verified.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentModal(false)}
                    disabled={isProcessing}
                    className="flex-1 h-11 text-[14px] font-bold rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="solid"
                    onClick={handleConfirmAccept}
                    disabled={isProcessing}
                    className="flex-1 h-11 text-[14px] font-bold rounded-full"
                  >
                    {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
        {flow === 'reject_modal' && (
          <RejectModal
            applicant={applicant}
            onCancel={() => setFlow('idle')}
            onConfirm={() => setFlow('rejected')}
          />
        )}
        {(flow === 'payment_success' || flow === 'rejected') && (
          <ResultModal
            type={flow}
            applicantName={applicant.name}
            onDone={onBack}
          />
        )}
      </AnimatePresence>

      <SendMessageModal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        applicant={applicant}
      />
    </>
  )
}
