import { motion, AnimatePresence } from 'framer-motion'
import { ResultIcon } from '../wallet/ResultIcon'

/**
 * PinSuccessModal
 * "You're All Set" — shown after successful PIN creation.
 * onEnterWallet: () => void
 */
export function PinSuccessModal({ isOpen, onEnterWallet }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="pin-success-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 50 }}
          />
          <motion.div
            key="pin-success-modal"
            initial={{ opacity: 0, scale: 0.93, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 51,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div style={{
              background: 'var(--color-surface)', borderRadius: '20px',
              padding: '44px 40px 40px',
              width: '100%', maxWidth: '380px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid var(--color-border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <h2 style={{
                fontFamily: 'var(--ff-body)', fontSize: '18px', fontWeight: 700,
                color: 'var(--color-text-1)', marginBottom: '28px',
              }}>You&apos;re All Set</h2>

              <div style={{ marginBottom: '24px' }}>
                <ResultIcon type="success" size={80} />
              </div>

              <p style={{
                fontFamily: 'var(--ff-body)', fontSize: '14px',
                color: 'var(--color-text-3)', textAlign: 'center',
                lineHeight: 1.65, marginBottom: '32px',
              }}>
                Your PIN has been created successfully.<br />
                Use it to authorize all your wallet transactions
              </p>

              <button
                onClick={onEnterWallet}
                style={{
                  width: '100%', height: '50px',
                  background: 'var(--color-primary-btn)', color: 'white',
                  border: 'none', borderRadius: '50px',
                  fontSize: '15px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'var(--ff-body)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-sat)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary-btn)' }}
              >
                Enter Wallet
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
