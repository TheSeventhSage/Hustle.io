import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function VerifyWithdrawalOtpModal({
  isOpen,
  onCancel,
  onSubmit,
  isPending = false,
  otpHint = '',
}) {
  const [otpCode, setOtpCode] = useState('')

  useEffect(() => {
    if (isOpen) setOtpCode('')
  }, [isOpen])

  const handleSubmit = () => {
    const trimmed = otpCode.trim()
    if (trimmed.length < 4 || isPending) return
    onSubmit(trimmed)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="otp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 62 }}
          />
          <motion.div
            key="otp-modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 63,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div style={{
              background: 'var(--color-surface)', borderRadius: '20px',
              padding: '36px',
              width: '100%', maxWidth: '440px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid var(--color-border)',
            }}>
              <h2 style={{
                fontFamily: 'var(--ff-body)', fontSize: '18px', fontWeight: 700,
                color: 'var(--color-text-1)', textAlign: 'center', marginBottom: '12px',
              }}>
                Verify withdrawal
              </h2>

              <p style={{
                fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-3)',
                textAlign: 'center', marginBottom: '24px', fontFamily: 'var(--ff-body)',
              }}>
                Enter the OTP sent for this withdrawal request before the transfer is approved.
              </p>

              {otpHint && (
                <div style={{
                  background: '#fffbeb', border: '1px solid #fcd34d',
                  color: '#92400e', borderRadius: '12px', padding: '12px 14px',
                  fontSize: '13px', marginBottom: '18px', fontFamily: 'var(--ff-body)',
                }}>
                  Test OTP: <strong>{otpHint}</strong>
                </div>
              )}

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>
                  OTP code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%', height: '48px', padding: '0 16px',
                    border: '1.5px solid var(--color-border)', borderRadius: '12px',
                    fontSize: '16px', letterSpacing: '0.18em',
                    fontFamily: 'var(--ff-body)', outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={onCancel}
                  style={{
                    flex: 1, height: '48px', borderRadius: '50px',
                    border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
                    fontSize: '14px', fontWeight: 600, color: 'var(--color-text-2)',
                    cursor: 'pointer', fontFamily: 'var(--ff-body)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isPending || otpCode.trim().length < 4}
                  style={{
                    flex: 1, height: '48px', borderRadius: '50px',
                    border: 'none', background: 'var(--color-primary-btn)', color: 'white',
                    fontSize: '14px', fontWeight: 700,
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--ff-body)', opacity: isPending ? 0.65 : 1,
                  }}
                >
                  {isPending ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
