import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { usePayoutBanks, useResolveBankAccount } from '../../wallet.hooks.js'
import { maskAccountNumber } from '../../walletData.js'

function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `bank-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * AddBankAccountModal
 * Per the withdrawal handoff (§3): the bank list comes from GET /wallet/payout-banks
 * (no hard-coded list, no free-text bank name), the account name is Paystack-resolved
 * and read-only, and the save is sent with a stable idempotency key.
 */
export function AddBankAccountModal({ isOpen, onCancel, onSubmit, isPending = false }) {
  const [step, setStep] = useState('enter') // 'enter' | 'confirm'
  const [bankQuery, setBankQuery] = useState('')
  const [bankOpen, setBankOpen] = useState(false)
  const [selectedBank, setSelectedBank] = useState(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [isDefault, setIsDefault] = useState(true)
  const [resolved, setResolved] = useState(null)
  const idempotencyKeyRef = useRef(null)

  const { data: banks = [], isLoading: banksLoading, isError: banksError } = usePayoutBanks({}, { enabled: isOpen })
  const { mutate: resolveAccount, isPending: isResolving } = useResolveBankAccount()

  useEffect(() => {
    if (isOpen) {
      setStep('enter')
      setBankQuery('')
      setBankOpen(false)
      setSelectedBank(null)
      setAccountNumber('')
      setIsDefault(true)
      setResolved(null)
      // One stable key per "add account" action, reused if a save is retried.
      idempotencyKeyRef.current = newIdempotencyKey()
    }
  }, [isOpen])

  const filteredBanks = useMemo(() => {
    const q = bankQuery.trim().toLowerCase()
    const list = Array.isArray(banks) ? banks : []
    if (!q) return list.slice(0, 40)
    return list.filter((b) => String(b?.name ?? '').toLowerCase().includes(q)).slice(0, 40)
  }, [banks, bankQuery])

  const canResolve = Boolean(selectedBank?.code) && accountNumber.trim().length >= 6

  const handleResolve = () => {
    if (!canResolve) return
    resolveAccount(
      { bank_code: selectedBank.code, account_number: accountNumber.trim() },
      {
        onSuccess: (res) => {
          setResolved(res?.data?.data ?? res?.data ?? null)
          setStep('confirm')
        },
      }
    )
  }

  const handleSave = () => {
    onSubmit({
      bank_code: selectedBank.code,
      account_number: accountNumber.trim(),
      is_default: isDefault,
      idempotencyKey: idempotencyKeyRef.current,
    })
  }

  const resolvedName = resolved?.account_name ?? ''
  const resolvedBank = resolved?.bank_name ?? selectedBank?.name ?? ''
  const resolvedMasked = maskAccountNumber(resolved) || maskAccountNumber({ account_number: accountNumber })

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="bank-add-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 64 }}
          />
          <motion.div
            key="bank-add-modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{ position: 'fixed', inset: 0, zIndex: 65, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          >
            <div style={{ background: 'var(--color-surface)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid var(--color-border)' }}>

              {step === 'enter' ? (
                <>
                  <h2 style={titleStyle}>Add payout account</h2>
                  <p style={subtitleStyle}>Choose your bank and enter your account number. We’ll verify the account name with your bank before saving.</p>

                  {/* Bank picker */}
                  <Field label="Bank">
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-4)' }} />
                        <input
                          value={selectedBank ? selectedBank.name : bankQuery}
                          onChange={(e) => { setSelectedBank(null); setBankQuery(e.target.value); setBankOpen(true) }}
                          onFocus={() => setBankOpen(true)}
                          placeholder={banksLoading ? 'Loading banks…' : 'Search your bank'}
                          style={{ ...inputStyle, paddingLeft: 34 }}
                        />
                      </div>
                      {bankOpen && !selectedBank && (
                        <div style={dropdownStyle}>
                          {banksError ? (
                            <div style={dropdownEmptyStyle}>Couldn’t load banks. Try again.</div>
                          ) : filteredBanks.length === 0 ? (
                            <div style={dropdownEmptyStyle}>{banksLoading ? 'Loading…' : 'No banks match your search.'}</div>
                          ) : (
                            filteredBanks.map((bank) => (
                              <button
                                key={bank.code ?? bank.id}
                                type="button"
                                onClick={() => { setSelectedBank(bank); setBankOpen(false); setBankQuery('') }}
                                style={dropdownItemStyle}
                              >
                                {bank.name}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </Field>

                  <Field label="Account number">
                    <input
                      value={accountNumber}
                      inputMode="numeric"
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter account number"
                      style={inputStyle}
                    />
                  </Field>

                  <label style={checkboxRowStyle}>
                    <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
                    Set as default payout account
                  </label>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={onCancel} style={secondaryButtonStyle}>Cancel</button>
                    <button
                      onClick={handleResolve}
                      disabled={!canResolve || isResolving}
                      style={{ ...primaryButtonStyle, opacity: !canResolve || isResolving ? 0.65 : 1, cursor: !canResolve || isResolving ? 'not-allowed' : 'pointer' }}
                    >
                      {isResolving ? 'Verifying…' : 'Verify account'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => setStep('enter')} style={backButtonStyle}>
                    <ChevronLeft size={16} /> Back
                  </button>
                  <h2 style={{ ...titleStyle, marginTop: 8 }}>Confirm account</h2>
                  <p style={subtitleStyle}>This name is verified by your bank. Confirm it’s correct before saving.</p>

                  <div style={confirmCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <CheckCircle2 size={18} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>Account verified</span>
                    </div>
                    <ConfirmRow label="Account name" value={resolvedName || '—'} strong />
                    <ConfirmRow label="Bank" value={resolvedBank || '—'} />
                    <ConfirmRow label="Account number" value={resolvedMasked || '—'} />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => setStep('enter')} style={secondaryButtonStyle}>Edit</button>
                    <button
                      onClick={handleSave}
                      disabled={isPending}
                      style={{ ...primaryButtonStyle, opacity: isPending ? 0.65 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                    >
                      {isPending ? 'Saving…' : 'Save account'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>{label}</span>
      {children}
    </label>
  )
}

function ConfirmRow({ label, value, strong }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '8px 0' }}>
      <span style={{ fontSize: 13, color: 'var(--color-text-3)' }}>{label}</span>
      <span style={{ fontSize: strong ? 15 : 14, fontWeight: strong ? 800 : 600, color: 'var(--color-text-1)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

const titleStyle = { fontFamily: 'var(--ff-body)', fontSize: '18px', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '6px' }
const subtitleStyle = { fontSize: '13px', color: 'var(--color-text-3)', marginBottom: '20px', lineHeight: 1.5 }
const inputStyle = { backgroundColor: 'var(--color-surface)', color: 'var(--color-text-1)', width: '100%', height: '46px', border: '1.5px solid var(--color-border)', borderRadius: '12px', padding: '0 14px', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none', boxSizing: 'border-box' }
const dropdownStyle = { position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, maxHeight: 220, overflowY: 'auto', background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 5 }
const dropdownItemStyle = { display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 14, color: 'var(--color-text-1)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--ff-body)' }
const dropdownEmptyStyle = { padding: '12px 14px', fontSize: 13, color: 'var(--color-text-4)' }
const checkboxRowStyle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-text-2)', fontFamily: 'var(--ff-body)' }
const confirmCardStyle = { border: '1px solid var(--color-border)', borderRadius: 14, padding: '16px 18px', background: 'var(--color-mist)' }
const backButtonStyle = { display: 'inline-flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: 'var(--color-text-3)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--ff-body)', padding: 0 }
const secondaryButtonStyle = { flex: 1, height: '48px', border: '1.5px solid var(--color-border)', borderRadius: '50px', background: 'var(--color-surface)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-2)', cursor: 'pointer', fontFamily: 'var(--ff-body)' }
const primaryButtonStyle = { flex: 1, height: '48px', border: 'none', borderRadius: '50px', background: 'var(--color-primary-btn)', color: 'white', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--ff-body)' }
