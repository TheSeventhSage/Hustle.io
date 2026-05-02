import { motion, AnimatePresence } from 'framer-motion'

export function BankAccountsModal({
  isOpen,
  onClose,
  bankAccounts = [],
  selectedBankAccountId = null,
  onSelectBankAccount,
  onAddBankAccount,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="bank-list-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 66 }}
          />
          <motion.div
            key="bank-list-modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 67,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div style={{
              background: 'var(--color-surface)', borderRadius: '20px',
              padding: '32px',
              width: '100%', maxWidth: '560px',
              maxHeight: '80vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <h2 style={{ fontFamily: 'var(--ff-body)', fontSize: '18px', fontWeight: 700, color: 'var(--color-text-1)' }}>
                  Bank accounts
                </h2>
                <button onClick={onAddBankAccount} style={addButtonStyle}>Add account</button>
              </div>

              {bankAccounts.length === 0 ? (
                <div style={{
                  border: '1px dashed var(--color-border)', borderRadius: '16px',
                  padding: '28px', textAlign: 'center', color: 'var(--color-text-3)',
                  fontFamily: 'var(--ff-body)', marginBottom: '18px',
                }}>
                  No bank accounts added yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px', marginBottom: '22px' }}>
                  {bankAccounts.map(account => {
                    const isSelected = selectedBankAccountId === account.id
                    return (
                      <button
                        key={account.id}
                        onClick={() => onSelectBankAccount(account.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: isSelected ? '#f0fdf4' : 'var(--color-surface)',
                          border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          borderRadius: '16px', padding: '16px 18px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)' }}>
                              {account.bank_name}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-3)', fontFamily: 'var(--ff-body)' }}>
                              {account.country_name || 'Country not set'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {account.is_default ? <span style={badgeStyle}>Default</span> : null}
                            {isSelected ? <span style={selectedBadgeStyle}>Selected</span> : null}
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <Meta label="Account number" value={account.account_number} />
                          <Meta label="Beneficiary" value={account.beneficiary_name} />
                          <Meta label="Branch" value={account.branch_name || '—'} />
                          <Meta label="Swift code" value={account.swift_code || '—'} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              <button onClick={onClose} style={closeButtonStyle}>Done</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-4)', marginBottom: '4px', fontFamily: 'var(--ff-body)' }}>{label}</div>
      <div style={{ fontSize: '14px', color: 'var(--color-text-1)', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>{value}</div>
    </div>
  )
}

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  height: '26px',
  padding: '0 10px',
  borderRadius: '999px',
  background: '#ecfdf5',
  color: '#047857',
  fontSize: '12px',
  fontWeight: 700,
  fontFamily: 'var(--ff-body)',
}

const selectedBadgeStyle = {
  ...badgeStyle,
  background: '#eff6ff',
  color: '#1d4ed8',
}

const addButtonStyle = {
  height: '38px',
  borderRadius: '999px',
  border: 'none',
  background: 'var(--color-primary-btn)',
  color: 'white',
  padding: '0 16px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'var(--ff-body)',
}

const closeButtonStyle = {
  width: '100%',
  height: '48px',
  borderRadius: '50px',
  border: '1.5px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-2)',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--ff-body)',
}
