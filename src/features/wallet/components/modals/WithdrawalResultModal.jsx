import { motion, AnimatePresence } from 'framer-motion'
import { ResultIcon } from '../wallet/ResultIcon'
import { getWithdrawalStatusCopy, isRefundedWithdrawalStatus } from '../../walletData'

/**
 * WithdrawalResultModal
 * status: flow state — 'success' | 'failed' | 'pending'
 * withdrawalStatus: the API withdrawal status (approved/queued/paid/…). Only
 *   `paid` is treated as a completed payout — everything else is "in progress".
 */
export function WithdrawalResultModal({ isOpen, status = 'success', withdrawalStatus = null, onClose }) {
  if (!isOpen) return null

  let cfg
  if (status === 'failed') {
    cfg = { type: 'error', title: 'Withdrawal failed', subtitle: 'Your funds remain in your wallet.', btnLabel: 'Go to Wallet' }
  } else if (status === 'success') {
    const apiStatus = String(withdrawalStatus || 'approved').toLowerCase()
    const subtitle = getWithdrawalStatusCopy(apiStatus)
    if (apiStatus === 'paid') {
      cfg = { type: 'success', title: 'Payout completed', subtitle, btnLabel: 'Go to Wallet' }
    } else if (isRefundedWithdrawalStatus(apiStatus)) {
      cfg = { type: 'error', title: 'Withdrawal not completed', subtitle, btnLabel: 'Go to Wallet' }
    } else {
      // approved / queued / processing / otp — confirmed but NOT yet paid.
      cfg = { type: 'pending', title: 'Withdrawal confirmed', subtitle, btnLabel: 'Go to Wallet' }
    }
  } else {
    cfg = { type: 'pending', title: 'Withdrawal pending', subtitle: 'Awaiting confirmation.', btnLabel: 'Go to Wallet' }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="wr-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 60 }}
          />
          <motion.div
            key="wr-modal"
            initial={{ opacity: 0, scale: 0.93, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 61,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div style={{
              background: 'var(--color-surface)', borderRadius: '20px',
              padding: '44px 36px 36px',
              width: '100%', maxWidth: '340px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid var(--color-border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{ marginBottom: '20px' }}>
                <ResultIcon type={cfg.type} size={80} />
              </div>

              <h3 style={{
                fontFamily: 'var(--ff-body)', fontSize: '17px', fontWeight: 700,
                color: 'var(--color-text-1)', marginBottom: cfg.subtitle ? '8px' : '28px',
                textAlign: 'center',
              }}>
                {cfg.title}
              </h3>
              {cfg.subtitle && (
                <p style={{ fontFamily: 'var(--ff-body)', fontSize: '13px', color: 'var(--color-text-3)', textAlign: 'center', marginBottom: '28px', lineHeight: 1.5 }}>
                  {cfg.subtitle}
                </p>
              )}

              <button
                onClick={onClose}
                style={{
                  width: '100%', height: '48px',
                  background: 'var(--color-primary-btn)', color: 'white',
                  border: 'none', borderRadius: '50px',
                  fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'var(--ff-body)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-sat)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary-btn)' }}
              >
                {cfg.btnLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
