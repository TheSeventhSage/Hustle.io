import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Landmark } from 'lucide-react'
import { formatWalletAccount } from '../../walletData'

/**
 * WithdrawalModal
 * Centered dialog with account number (pre-filled) and amount input.
 * onCancel: () => void
 * onWithdraw: (amount: number) => void
 */
export function WithdrawalModal({
  isOpen,
  onCancel,
  onWithdraw,
  maxAmount = 10000,
  bankAccount = null,
  isPending = false,
}) {
  const [amount, setAmount] = useState('0.00')

  const handleWithdrawMax = () => setAmount(String(maxAmount))

  const handleSubmit = () => {
    const num = parseFloat(amount)
    if (!num || num <= 0 || isPending || !bankAccount) return
    onWithdraw(num)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="wd-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 50 }}
          />
          <motion.div
            key="wd-modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 51,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div style={{
              background: 'var(--color-surface)', borderRadius: '20px',
              padding: '36px 36px 36px',
              width: '100%', maxWidth: '460px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid var(--color-border)',
            }}>
              <h2 style={{
                fontFamily: 'var(--ff-body)', fontSize: '18px', fontWeight: 700,
                color: 'var(--color-text-1)', textAlign: 'center', marginBottom: '28px',
              }}>Withdrawal</h2>

              {/* Account number */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>
                  Account number
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  height: '48px', padding: '0 16px',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: '12px', background: 'var(--color-mist)',
                }}>
                  <Landmark size={16} color="var(--color-text-4)" />
                  <span style={{ fontSize: '14px', color: 'var(--color-text-3)', fontFamily: 'var(--ff-body)' }}>
                    {formatWalletAccount(bankAccount)}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>
                  Amount to withdraw
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  height: '48px', padding: '0 16px',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: '12px',
                }}>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    onFocus={e => { if (e.target.value === '0.00') setAmount('') }}
                    style={{
                      flex: 1, border: 'none', outline: 'none',
                      fontSize: '14px', color: 'var(--color-text-1)',
                      fontFamily: 'var(--ff-body)', background: 'transparent',
                    }}
                  />
                  <button
                    onClick={handleWithdrawMax}
                    disabled={!bankAccount || isPending}
                    style={{
                      fontSize: '13px', fontWeight: 600,
                      color: 'var(--color-primary)', background: 'none', border: 'none',
                      cursor: !bankAccount || isPending ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--ff-body)', whiteSpace: 'nowrap',
                      opacity: !bankAccount || isPending ? 0.5 : 1,
                    }}
                  >
                    Withdraw max
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={onCancel}
                  style={{
                    flex: 1, height: '48px',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: '50px', fontSize: '14px', fontWeight: 600,
                    color: 'var(--color-text-2)', background: 'var(--color-surface)',
                    cursor: 'pointer', fontFamily: 'var(--ff-body)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-2)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!bankAccount || isPending}
                  style={{
                    flex: 1, height: '48px',
                    background: 'var(--color-primary-btn)', color: 'white',
                    border: 'none', borderRadius: '50px',
                    fontSize: '14px', fontWeight: 700,
                    cursor: !bankAccount || isPending ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--ff-body)',
                    transition: 'background 0.2s',
                    opacity: !bankAccount || isPending ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-sat)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary-btn)' }}
                >
                  {isPending ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
