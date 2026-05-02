import { motion, AnimatePresence } from 'framer-motion'
import { ResultIcon } from '../wallet/ResultIcon'

const CONFIG = {
  success: {
    type: 'success',
    title: 'Withdrawal Successful',
    btnLabel: 'Go to Wallet',
  },
  failed: {
    type: 'error',
    title: 'Withdrawal Failed',
    btnLabel: 'Go to Wallet',
  },
  pending: {
    type: 'pending',
    title: 'Withdrawal pending',
    btnLabel: 'Go to Wallet',
  },
}

/**
 * WithdrawalResultModal
 * status: 'success' | 'failed' | 'pending'
 * onClose: () => void
 */
export function WithdrawalResultModal({ isOpen, status = 'success', onClose }) {
  if (!isOpen) return null
  const cfg = CONFIG[status] || CONFIG.success

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
                color: 'var(--color-text-1)', marginBottom: '28px',
              }}>
                {cfg.title}
              </h3>

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
