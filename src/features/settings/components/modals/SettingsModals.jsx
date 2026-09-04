import { useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { PrimaryBtn } from '../settings/SettingsUI'
import useUIStore from '../../../../shared/store/ui.store.js'
import { useScheduleAccountDeletion } from '../../../auth/auth.hooks.js'

/* dotted-ring check icon */
function SuccessIcon({ size = 72 }) {
  const DOT_COUNT = 12
  const RING_R = size * 0.46
  const DOT_R = size * 0.045
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" style={{ animation: 'spinSlow 8s linear infinite' }}>
        {[...Array(DOT_COUNT)].map((_, i) => {
          const angle = (i / DOT_COUNT) * 2 * Math.PI - Math.PI / 2
          const cx = size / 2 + RING_R * Math.cos(angle)
          const cy = size / 2 + RING_R * Math.sin(angle)
          return <circle key={i} cx={cx} cy={cy} r={DOT_R} fill="var(--color-success)" opacity={0.25 + (i / DOT_COUNT) * 0.75} />
        })}
      </svg>
      <div className="relative z-10 flex items-center justify-center rounded-full bg-(--color-success) shadow-[0_4px_20px_rgba(74,222,128,0.33)]" style={{ width: size * 0.65, height: size * 0.65 }}>
        <svg width={size * 0.32} height={size * 0.32} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12l5 5 11-11" />
        </svg>
      </div>
      <style>{`@keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/**
 * SettingsSuccessModal
*/
export function SettingsSuccessModal({ isOpen, onClose, title, body, btnLabel = 'OK', onBtn }) {
  const handleBtn = () => { if (onBtn) onBtn(); else onClose() }
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div key="ss-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/35" />
          <Motion.div key="ss-modal" initial={{ opacity: 0, scale: 0.93, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            <div className="relative flex w-full max-w-[360px] flex-col items-center rounded-[var(--r-xl)] bg-[var(--color-surface)] p-[44px_36px_36px] shadow-[var(--shadow-lg)]">
              <div className="mb-5"><SuccessIcon size={76} /></div>
              <h3 className="mb-[10px] text-center font-[var(--ff-body)] text-[18px] font-bold text-[var(--color-text-1)]">{title}</h3>
              {body && <p className="mb-[28px] text-center font-[var(--ff-body)] text-[14px] leading-[1.65] text-[var(--color-text-3)]">{body}</p>}
              <PrimaryBtn onClick={handleBtn}>{btnLabel}</PrimaryBtn>
            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * DeleteAccountModal
*/
export function DeleteAccountModal({ isOpen, onClose }) {
  const [confirmed, setConfirmed] = useState(false)
  const [reason, setReason] = useState('')
  const { toastWarning } = useUIStore()
  const scheduleDeletion = useScheduleAccountDeletion()

  const handleClose = () => {
    if (scheduleDeletion.isPending) return
    setConfirmed(false)
    setReason('')
    onClose()
  }

  const handleDelete = () => {
    if (!confirmed) {
      toastWarning('Confirm the deletion terms before continuing.')
      return
    }

    scheduleDeletion.mutate(
      { reason: reason.trim() || undefined },
      { onSuccess: handleClose }
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div key="da-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[200] bg-black/35" />
          <Motion.div key="da-modal" initial={{ opacity: 0, scale: 0.93, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            <div className="relative w-full max-w-[500px] rounded-[var(--r-xl)] bg-[var(--color-surface)] p-9 shadow-[var(--shadow-lg)]">

              <button onClick={handleClose} className="absolute right-4 top-4 flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-transparent text-[var(--color-text-3)] transition-colors hover:bg-[var(--color-mist)]">
                <X size={15} />
              </button>

              <h3 className="mb-5 text-center font-[var(--ff-body)] text-[17px] font-bold text-[var(--text-4)]">Schedule Deletion</h3>

              <div className="mb-5 flex justify-center">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[var(--color-brand-neutral)]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                  </svg>
                </div>
              </div>

              <label className="mb-5 flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}
                  className="mt-[2px] h-[18px] w-[18px] shrink-0 cursor-pointer accent-[var(--color-brand-neutral-dark)]" />
                <span className="font-[var(--ff-body)] text-[13.5px] leading-[1.65] text-[var(--color-text-2)]">
                  I confirm that I want to schedule my account for deletion. I understand it will be permanently deleted after 7 days if I do not cancel the request.
                </span>
              </label>

              <AnimatePresence>
                {confirmed && (
                  <Motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <p className="mb-2 font-[var(--ff-body)] text-[13px] font-semibold text-[var(--color-text-2)]">Reason for leaving (Optional)</p>
                    <div className="relative mb-5">
                      <textarea
                        placeholder="Tell us why you are deleting your account..."
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        maxLength={500}
                        className="box-border h-[80px] w-full resize-none rounded-[var(--r-md)] border-[1.5px] border-[var(--color-border)] p-[12px_14px] font-[var(--ff-body)] text-[14px] text-[var(--color-text-1)] outline-none transition-colors focus:border-[var(--color-brand-neutral)]"
                      />
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              <button onClick={handleDelete} disabled={scheduleDeletion.isPending}
                className="h-[50px] w-full cursor-pointer rounded-[var(--r-full)] border-none bg-[var(--color-brand-neutral)] font-[var(--ff-body)] text-[15px] font-bold text-white transition-all duration-200 hover:brightness-90 disabled:cursor-wait disabled:opacity-70">
                {scheduleDeletion.isPending ? 'Scheduling...' : 'Schedule Account Deletion'}
              </button>

            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  )
}