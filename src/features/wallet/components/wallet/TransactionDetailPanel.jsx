import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check } from 'lucide-react'
import { formatEntryType, formatMoney } from '../../walletData'

const STATUS_STYLES = {
  Approved: { bg: '#dcfce7', color: '#16a34a', label: 'Approved' },
  Pending: { bg: '#fef9c3', color: '#ca8a04', label: 'Pending' },
  Failed: { bg: '#fee2e2', color: '#dc2626', label: 'Failed' },
  Declined: { bg: '#fee2e2', color: '#dc2626', label: 'Declined' },
  In_review: { bg: '#dbeafe', color: '#2563eb', label: 'In review' },
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: '12px', color: 'var(--color-text-4)', marginBottom: '4px', fontFamily: 'var(--ff-body)' }}>{label}</p>
      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--ff-body)' }}>{value}</p>
    </div>
  )
}

function CopyableId({ value }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(value).catch(() => { })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--ff-body)', wordBreak: 'break-all' }}>{value}</span>
      <button
        onClick={handleCopy}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-4)', flexShrink: 0, padding: 0, display: 'flex' }}
      >
        {copied ? <Check size={15} color="var(--color-primary)" /> : <Copy size={15} />}
      </button>
    </div>
  )
}

export function TransactionDetailPanel({
  isOpen,
  transaction,
  bankAccount = null,
  currencyCode = 'NGN',
  onClose,
  onDownloadReceipt,
  onShareReceipt,
}) {
  if (!transaction) return null

  const statusKey = transaction.status
    ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
    : 'Pending'
  const st = STATUS_STYLES[statusKey] || STATUS_STYLES.Pending
  const isApproved = statusKey === 'Approved'

  const transactionDate = transaction.created_at ? new Date(transaction.created_at) : null
  const formattedDate = transactionDate
    ? transactionDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
  const formattedTime = transactionDate
    ? transactionDate.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })
    : '—'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="td-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 40 }}
          />

          <motion.div
            key="td-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 41,
              width: '100%', maxWidth: '600px',
              background: 'var(--color-surface)',
              boxShadow: '-4px 0 40px rgba(0,0,0,0.12)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 28px', borderBottom: '1px solid var(--color-border)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)' }}>
                Transaction details
              </h3>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{
                  display: 'inline-block',
                  background: st.bg, color: st.color,
                  fontSize: '12px', fontWeight: 700,
                  padding: '4px 14px', borderRadius: '50px',
                  fontFamily: 'var(--ff-body)',
                }}>
                  {st.label}
                </span>
              </div>

              <p style={{
                fontFamily: 'var(--ff-body)', fontSize: '26px', fontWeight: 800,
                color: 'var(--color-text-1)', marginBottom: '28px',
              }}>
                {formatMoney(transaction.amount, currencyCode)}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <DetailRow label="Transaction type" value={formatEntryType(transaction.entry_type)} />
                <DetailRow label="Account name" value={bankAccount?.beneficiary_name || '—'} />
                <DetailRow label="Account number" value={bankAccount?.account_number || '—'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '36px', alignItems: 'start' }}>
                <DetailRow label="Time" value={formattedTime} />
                <DetailRow label="Date" value={formattedDate} />
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-4)', marginBottom: '4px', fontFamily: 'var(--ff-body)' }}>Transaction ID</p>
                  <CopyableId value={String(transaction.id)} />
                </div>
              </div>

              {isApproved && (
                <div style={{ display: 'flex', gap: '14px' }}>
                  <button
                    onClick={onDownloadReceipt}
                    style={{
                      flex: 1, height: '48px',
                      background: 'var(--color-primary-btn)', color: 'white',
                      border: 'none', borderRadius: '50px',
                      fontSize: '14px', fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'var(--ff-body)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-sat)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary-btn)' }}
                  >
                    View receipt
                  </button>
                  <button
                    onClick={onShareReceipt}
                    style={{
                      flex: 1, height: '48px',
                      background: 'var(--color-surface)', color: 'var(--color-primary-btn)',
                      border: '1.5px solid var(--color-primary-btn)', borderRadius: '50px',
                      fontSize: '14px', fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'var(--ff-body)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-mist)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface)' }}
                  >
                    Share receipt
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
