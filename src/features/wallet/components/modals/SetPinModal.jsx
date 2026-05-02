import { motion, AnimatePresence } from 'framer-motion'

/**
 * SetPinModal
 * Shown on first wallet visit. Prompts user to create a PIN.
 * onCreatePin: () => void — advances to CreatePinModal
 */
export function SetPinModal({ isOpen, onCreatePin }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="set-pin-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 50 }}
          />

          {/* Modal */}
          <motion.div
            key="set-pin-modal"
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
              gap: '0',
            }}>
              {/* Title */}
              <h2 style={{
                fontFamily: 'var(--ff-body)', fontSize: '18px', fontWeight: 700,
                color: 'var(--color-text-1)', textAlign: 'center', marginBottom: '28px',
              }}>Set PIN</h2>

              {/* Wallet illustration */}
              <div style={{ marginBottom: '24px' }}>
                <svg width="72" height="60" viewBox="0 0 72 60" fill="none">
                  {/* Wallet body */}
                  <rect x="4" y="16" width="64" height="40" rx="8" fill="#FDBA40" />
                  {/* Wallet flap */}
                  <rect x="4" y="10" width="64" height="20" rx="6" fill="#F5A623" />
                  {/* Coin slot */}
                  <rect x="46" y="28" width="18" height="14" rx="7" fill="#E8940F" />
                  <circle cx="55" cy="35" r="4" fill="#FDBA40" />
                  {/* Strap */}
                  <rect x="4" y="10" width="4" height="40" rx="2" fill="#E8940F" />
                  {/* Dots */}
                  <circle cx="36" cy="55" r="2" fill="#E8940F" />
                </svg>
              </div>

              {/* Copy */}
              <p style={{
                fontFamily: 'var(--ff-body)', fontSize: '14px',
                color: 'var(--color-text-3)', textAlign: 'center',
                lineHeight: 1.65, marginBottom: '32px', maxWidth: '280px',
              }}>
                Welcome to Hustle.io Wallet screen!<br />
                To use all wallet features, set up a secure 4-digit PIN.<br />
                This PIN will used to authorize all transactions.<br />
                Let&apos;s create your pin!
              </p>

              {/* CTA */}
              <button
                onClick={onCreatePin}
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
                Create PIN
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
