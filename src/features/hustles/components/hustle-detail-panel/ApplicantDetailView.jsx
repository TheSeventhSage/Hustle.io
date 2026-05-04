import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft, X, Star, MapPin } from 'lucide-react'
import { VerifiedBadge } from '../VerifiedBadge.jsx'
import { formatMoney } from './hustleDetailPanel.utils.js'
import { DebitConfirmModal } from './DebitConfirmModal.jsx'
import { RejectModal } from './RejectModal.jsx'
import { ResultModal } from './ResultModal.jsx'
import { SendMessageModal } from './SendMessageModal.jsx'
import { useDecideApplication } from '../../hustles.hooks.js'
import { storage } from '../../../../services/storage.js'
import useUIStore from '../../../../shared/store/ui.store.js'
import { initializePaystackPayment, makePaymentReference } from '../../../../shared/utils/paystack.js'

export function ApplicantDetailView({ hustleId, applicant, onBack, onClose }) {
  const [flow, setFlow] = useState('idle')
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [launchingPayment, setLaunchingPayment] = useState(false)
  const [finalisingDecision, setFinalisingDecision] = useState(false)
  const { toastError } = useUIStore()
  const { mutate: decideApplication } = useDecideApplication()

  const handleAcceptOffer = async () => {
    const user = storage.getUser()
    const email = user?.email || `company.${user?.id || 'customer'}@hustle.local`
    const amount = Math.round(Number(applicant?.totalCost || 0) * 100)

    if (!amount || amount < 100) {
      toastError('Invalid payment amount.')
      return
    }

    try {
      setLaunchingPayment(true)
      setFlow('idle')

      await initializePaystackPayment({
        email,
        amount,
        currency: applicant.currencyCode || 'NGN',
        reference: makePaymentReference(`hustle_${hustleId}_app`, applicant.id),
        metadata: {
          hustle_id: String(hustleId),
          application_id: String(applicant.id),
          artisan_account_id: String(applicant?._raw?.artisan_account_id ?? ''),
          source: 'hustle_creator_accept_offer',
        },
        onSuccess: () => {
          setFinalisingDecision(true)
          decideApplication(
            {
              hustleId,
              applicationId: applicant.id,
              decision: 'accepted',
            },
            {
              onSuccess: () => {
                setFinalisingDecision(false)
                setFlow('payment_success')
              },
              onError: () => {
                setFinalisingDecision(false)
                setFlow('idle')
              },
            }
          )
        },
        onCancel: () => {
          setLaunchingPayment(false)
          setFlow('idle')
        },
      })
      setLaunchingPayment(false)
    } catch (error) {
      setLaunchingPayment(false)
      setFlow('idle')
      toastError(error.message || 'Unable to open payment gateway.')
    }
  }

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
        {finalisingDecision && (
          <div className="mb-5 px-4 py-3 bg-mist border border-border rounded-xl">
            <p className="text-[13px] font-semibold text-text-2">Payment received. Finalising applicant acceptance...</p>
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

        <button className="text-[13px] text-primary font-semibold mb-6 flex items-center gap-1 hover:underline">
          View hustler&apos;s full profile →
        </button>

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
          Accepting this offer will lead you to Paystack to complete payment before the applicant is confirmed.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setFlow('debit_confirm')}
            disabled={launchingPayment || finalisingDecision}
            className="flex-1 h-12 bg-primary hover:bg-primary-sat text-white text-[14px] font-bold rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Accept Offer
          </button>
          <button
            onClick={() => setFlow('reject_modal')}
            disabled={launchingPayment || finalisingDecision}
            className="flex-1 h-12 border-2 border-[var(--color-brand-grey)] text-[var(--color-brand-grey)] text-[14px] font-bold rounded-full hover:bg-[var(--color-mist)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Reject this proposal
          </button>
        </div>
      </div>

      <AnimatePresence>
        {flow === 'debit_confirm' && (
          <DebitConfirmModal
            amount={applicant.totalCost}
            currencyCode={applicant.currencyCode}
            isPending={launchingPayment}
            onCancel={() => setFlow('idle')}
            onProceed={handleAcceptOffer}
          />
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
