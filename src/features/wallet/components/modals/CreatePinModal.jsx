import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { PinInput } from '../wallet/PinInput'

/**
 * CreatePinModal
 * Two PIN rows: Enter Pin + Re-enter Pin
 * Shows error banner when PINs don't match.
 * onSuccess: () => void — PIN created successfully
 */
export function CreatePinModal({ isOpen, onSuccess }) {
  const [pin, setPin] = useState(['', '', '', ''])
  const [rePin, setRePin] = useState(['', '', '', ''])
  const [error, setError] = useState(false)

  const handleCreate = () => {
    const p1 = pin.join('')
    const p2 = rePin.join('')
    if (p1.length < 4 || p2.length < 4) return
    if (p1 !== p2) { setError(true); return }
    setError(false)
    onSuccess()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="create-pin-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 50 }}
          />
          <motion.div
            key="create-pin-modal"
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
              width: '100%', maxWidth: '390px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}>
              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: '#fef2f2',
                      borderBottom: '1px solid #fecaca',
                      padding: '12px 24px',
                      display: 'flex', alignItems: 'center', gap: '10px',
                    }}
                  >
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertCircle size={13} color="white" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#ef4444', fontFamily: 'var(--ff-body)' }}>
                      Pin doesn&apos;t match
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ padding: '36px 36px 40px' }}>
                {/* Title */}
                <h2 style={{
                  fontFamily: 'var(--ff-body)', fontSize: '18px', fontWeight: 700,
                  color: 'var(--color-text-1)', textAlign: 'center', marginBottom: '12px',
                }}>Create PIN</h2>

                <p style={{
                  fontFamily: 'var(--ff-body)', fontSize: '13.5px',
                  color: 'var(--color-text-3)', textAlign: 'center',
                  lineHeight: 1.6, marginBottom: '28px',
                }}>
                  Your pin will be used to authenticate your transactions.<br />
                  Choose a 4-digit pin you can remember.
                </p>

                {/* Enter Pin */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '10px', fontFamily: 'var(--ff-body)' }}>
                    Enter Pin
                  </p>
                  <PinInput value={pin} onChange={setPin} error={error} />
                </div>

                {/* Re-enter Pin */}
                <div style={{ marginBottom: '28px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '10px', fontFamily: 'var(--ff-body)' }}>
                    Re-enter Pin
                  </p>
                  <PinInput value={rePin} onChange={(v) => { setRePin(v); setError(false) }} error={error} />
                </div>

                <button
                  onClick={handleCreate}
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
