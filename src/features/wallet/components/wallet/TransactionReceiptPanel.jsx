import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Copy } from 'lucide-react'
import { formatMoney } from '../../walletData'

function ReceiptField({ label, value, copyable }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(String(value)).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontSize: '13px', color: 'var(--color-text-3)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>{label}</p>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '10px',
        background: 'var(--color-mist)', border: '1px solid var(--color-border)',
        borderRadius: '10px', padding: '12px 14px',
      }}>
        <span style={{ fontSize: '14px', color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)', wordBreak: 'break-all' }}>{value}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-4)', flexShrink: 0, padding: 0, display: 'flex' }}
          >
            {copied ? <Check size={15} color="var(--color-primary)" /> : <Copy size={15} />}
          </button>
        )}
      </div>
    </div>
  )
}

export function TransactionReceiptPanel({
  isOpen,
  onClose,
  transaction,
  bankAccount = null,
  currencyCode = 'NGN',
}) {
  if (!transaction) return null

  const transactionDate = transaction.created_at ? new Date(transaction.created_at) : null
  const formattedDateTime = transactionDate
    ? transactionDate.toLocaleString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    : '—'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="receipt-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 42 }}
          />

          <motion.div
            key="receipt-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 43,
              width: '100%', maxWidth: '600px',
              background: 'var(--color-bg)',
              boxShadow: '-4px 0 40px rgba(0,0,0,0.12)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 28px', borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)' }}>
                Transaction receipt
              </h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
              <div style={{
                background: 'var(--color-surface)', borderRadius: '16px',
                border: '1px solid var(--color-border)',
                padding: '36px 32px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none', zIndex: 0,
                }}>
                  <span style={{
                    fontSize: '80px', fontWeight: 900, color: 'rgba(56,125,112,0.06)',
                    letterSpacing: '0.05em', fontFamily: 'var(--ff-display)',
                    transform: 'rotate(-20deg)',
                    userSelect: 'none',
                  }}>Hustle.io</span>
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      border: '2px solid var(--color-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={22} color="var(--color-primary)" strokeWidth={2.5} />
                    </div>
                  </div>

                  <p style={{
                    textAlign: 'center', fontSize: '16px', fontWeight: 700,
                    color: 'var(--color-primary)', marginBottom: '28px',
                    fontFamily: 'var(--ff-body)',
                  }}>
                    Payment receipt
                  </p>

                  <ReceiptField label="Card holder name" value={bankAccount?.beneficiary_name || '—'} />
                  <ReceiptField label="Payment date/Time" value={formattedDateTime} />
                  <ReceiptField label="Payment method" value={bankAccount?.bank_name ? `Bank transfer (${bankAccount.bank_name})` : 'Bank transfer'} />
                  <ReceiptField label="Transaction ID" value={String(transaction.id)} copyable />
                  <ReceiptField label="Total amount withdrawn" value={formatMoney(transaction.amount, currencyCode)} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
