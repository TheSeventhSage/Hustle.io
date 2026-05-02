import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const INITIAL_FORM = {
  bank_name: '',
  account_number: '',
  beneficiary_name: '',
  branch_name: '',
  country_id: '1',
  swift_code: '',
  is_default: 1,
}

export function AddBankAccountModal({ isOpen, onCancel, onSubmit, isPending = false }) {
  const [form, setForm] = useState(INITIAL_FORM)

  useEffect(() => {
    if (isOpen) setForm(INITIAL_FORM)
  }, [isOpen])

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const handleSubmit = () => {
    onSubmit({
      ...form,
      account_number: form.account_number.trim(),
      country_id: Number(form.country_id),
      is_default: Number(form.is_default),
    })
  }

  const isValid = form.bank_name.trim()
    && form.account_number.trim()
    && form.beneficiary_name.trim()
    && form.country_id

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="bank-add-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 64 }}
          />
          <motion.div
            key="bank-add-modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 65,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div style={{
              background: 'var(--color-surface)', borderRadius: '20px',
              padding: '32px 32px 28px',
              width: '100%', maxWidth: '520px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid var(--color-border)',
            }}>
              <h2 style={{ fontFamily: 'var(--ff-body)', fontSize: '18px', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '24px' }}>
                Add bank account
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Field label="Bank name">
                  <input value={form.bank_name} onChange={e => updateField('bank_name', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Account number">
                  <input value={form.account_number} inputMode="numeric" onChange={e => updateField('account_number', e.target.value.replace(/\D/g, ''))} style={inputStyle} />
                </Field>
                <Field label="Beneficiary name">
                  <input value={form.beneficiary_name} onChange={e => updateField('beneficiary_name', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Branch name">
                  <input value={form.branch_name} onChange={e => updateField('branch_name', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Country ID">
                  <input value={form.country_id} inputMode="numeric" onChange={e => updateField('country_id', e.target.value.replace(/\D/g, ''))} style={inputStyle} />
                </Field>
                <Field label="Swift code">
                  <input value={form.swift_code} onChange={e => updateField('swift_code', e.target.value)} style={inputStyle} />
                </Field>
              </div>

              <div style={{ marginTop: '16px', marginBottom: '28px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-text-2)', fontFamily: 'var(--ff-body)' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(form.is_default)}
                    onChange={e => updateField('is_default', e.target.checked ? 1 : 0)}
                  />
                  Set as default payout account
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={onCancel} style={secondaryButtonStyle}>Cancel</button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid || isPending}
                  style={{
                    ...primaryButtonStyle,
                    opacity: !isValid || isPending ? 0.65 : 1,
                    cursor: !isValid || isPending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isPending ? 'Saving...' : 'Add account'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

const inputStyle = {
  width: '100%',
  height: '46px',
  border: '1.5px solid var(--color-border)',
  borderRadius: '12px',
  padding: '0 14px',
  fontSize: '14px',
  fontFamily: 'var(--ff-body)',
  outline: 'none',
  boxSizing: 'border-box',
}

const secondaryButtonStyle = {
  flex: 1, height: '48px',
  border: '1.5px solid var(--color-border)',
  borderRadius: '50px', background: 'var(--color-surface)',
  fontSize: '14px', fontWeight: 600,
  color: 'var(--color-text-2)',
  cursor: 'pointer', fontFamily: 'var(--ff-body)',
}

const primaryButtonStyle = {
  flex: 1, height: '48px',
  border: 'none', borderRadius: '50px',
  background: 'var(--color-primary-btn)', color: 'white',
  fontSize: '14px', fontWeight: 700,
  fontFamily: 'var(--ff-body)',
}
