import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { FormField, PasswordInput, TextInput, PrimaryBtn, ContentTitle, Toggle } from './SettingsUI'
import { SettingsSuccessModal, DeleteAccountModal } from '../modals/SettingsModals'
import useUIStore from '../../../../shared/store/ui.store.js'

/* ── Change Password ──────────────────────────────────────────────────────── */
function ChangePassword({ onDone }) {
  const [sent, setSent] = useState(false)
  const [countdown, setCountdown] = useState(45)
  const { toastInfo, toastSuccess } = useUIStore()

  const handleSend = (isResend = false) => {
    setSent(true)
    setCountdown(45)
    if (isResend) toastSuccess('Reset email resent.')
    else toastInfo('Password reset email sent. Check your inbox.')
    let c = 45
    const t = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0) clearInterval(t)
    }, 1000)
  }

  if (sent) {
    return (
      <div style={{ background: 'var(--color-primary-500)', borderRadius: '16px', padding: '48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '400px', position: 'relative' }}>
        <button onClick={() => setSent(false)} style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <ArrowLeft size={16} />
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '28px' }}>
          <div style={{ width: '52px', height: '52px', background: 'var(--color-accent-gold)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-display)', fontSize: '22px', fontWeight: 700, color: 'var(--color-primary-500)' }}>H</div>
          <span style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-accent-gold)', letterSpacing: '0.1em' }}>HUSTLE</span>
        </div>

        {/* Paper plane */}
        <div style={{ marginBottom: '28px' }}>
          <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
            <path d="M4 30L72 4 52 56 40 36 20 46z" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />
            <path d="M40 36l12-16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M52 56L40 36" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M60 44 Q72 48 76 56" stroke="var(--color-accent-gold)" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
          </svg>
        </div>

        <h3 style={{ fontFamily: 'var(--ff-body)', fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '12px', textAlign: 'center' }}>Change password</h3>
        <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.65, marginBottom: '28px', maxWidth: '360px', fontFamily: 'var(--ff-body)' }}>
          We've just sent an email to the address: sample@mail.com<br />
          Kindly check your email and click on the change password to reset your account on Hustle.
        </p>

        <button
          onClick={() => {
            if (countdown <= 0) {
              handleSend(true)
            }
          }}
          style={{ height: '50px', padding: '0 36px', background: countdown > 0 ? 'var(--color-accent-gold)' : 'white', color: countdown > 0 ? 'var(--color-primary-500)' : 'var(--color-primary-btn)', border: 'none', borderRadius: '50px', fontSize: '14px', fontWeight: 700, cursor: countdown > 0 ? 'default' : 'pointer', fontFamily: 'var(--ff-body)' }}>
          {countdown > 0 ? `Resend email in ${countdown}s` : 'Resend email'}
        </button>
      </div>
    )
  }

  return (
    <div>
      <ContentTitle>Change Password</ContentTitle>
      <p style={{ fontSize: '13.5px', color: 'var(--color-text-3)', marginBottom: '24px', lineHeight: 1.6, fontFamily: 'var(--ff-body)' }}>
        We'll send a password reset link to your registered email address. Click the link to set a new password.
      </p>
      <PrimaryBtn onClick={handleSend}>Send Reset Email</PrimaryBtn>
    </div>
  )
}

/* ── Change Email ─────────────────────────────────────────────────────────── */
function ChangeEmail() {
  const [form, setForm] = useState({ current: '', newEmail: '', password: '' })
  const [successOpen, setSuccessOpen] = useState(false)
  const { toastError, toastSuccess } = useUIStore()

  const handleSubmit = () => {
    if (!form.current || !form.newEmail || !form.password) {
      toastError('Fill in your current email, new email, and password.')
      return
    }

    setSuccessOpen(true)
    toastSuccess('Verification email sent to your new address.')
  }

  return (
    <>
      <div>
        <ContentTitle>Change Email</ContentTitle>
        <FormField label="Enter current email">
          <TextInput placeholder="Enter current email" type="email" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} />
        </FormField>
        <FormField label="Enter new email">
          <TextInput placeholder="Enter new email" type="email" value={form.newEmail} onChange={e => setForm(f => ({ ...f, newEmail: e.target.value }))} />
        </FormField>
        <FormField label="Enter password">
          <PasswordInput placeholder="Enter new password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </FormField>
        <PrimaryBtn onClick={handleSubmit}>Change Email</PrimaryBtn>
      </div>

      <SettingsSuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Email Verified"
        body="Your email has been updated successfully. Kindly Sign In using the new email you just added."
        btnLabel="Sign In"
        onBtn={() => setSuccessOpen(false)}
      />
    </>
  )
}

/* ── Notifications ────────────────────────────────────────────────────────── */
function Notifications() {
  const [enabled, setEnabled] = useState(true)
  const { toastInfo } = useUIStore()
  return (
    <div>
      <ContentTitle>Notifications</ContentTitle>
      <p style={{ fontSize: '13.5px', color: 'var(--color-text-3)', marginBottom: '24px', lineHeight: 1.6, fontFamily: 'var(--ff-body)' }}>
        Manage how you receive updates and alerts about account, hustles and messages.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)' }}>Enable all Notifications</span>
        <Toggle checked={enabled} onChange={(checked) => {
          setEnabled(checked)
          toastInfo(checked ? 'Notifications enabled.' : 'Notifications disabled.')
        }} />
      </div>
    </div>
  )
}

/* ── Delete Account ───────────────────────────────────────────────────────── */
function DeleteAccountSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const { toastWarning } = useUIStore()
  return (
    <>
      <div>
        <ContentTitle>Delete Account</ContentTitle>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '16px', fontFamily: 'var(--ff-body)' }}>
          Are you sure you want to delete your account?
        </h3>
        <div style={{ fontSize: '14px', color: 'var(--color-text-2)', lineHeight: 1.75, marginBottom: '24px', fontFamily: 'var(--ff-body)' }}>
          <p style={{ marginBottom: '8px' }}>You've requested to delete your account.</p>
          <p style={{ marginBottom: '8px' }}><strong>Please note:</strong> Your account is now scheduled for deletion.<br />
            If you do not log back in within 14 days, your profile, bookings, history, and all associated data will be permanently deleted and cannot be recovered.</p>
          <p style={{ marginBottom: '8px' }}>Changed your mind? Simply log in again before the 14-day period ends to cancel the deletion.</p>
          <p>Need help? Contact <a href="#" style={{ color: 'var(--color-accent-gold)', textDecoration: 'none', fontWeight: 600 }}>Customer Support</a> before proceeding.</p>
        </div>
        <PrimaryBtn danger onClick={() => {
          setModalOpen(true)
          toastWarning('Review the deletion prompt before continuing.')
        }} fullWidth={false} style={{ minWidth: '200px' }}>Delete Account</PrimaryBtn>
      </div>
      <DeleteAccountModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}

/* ── Account Management (parent) ──────────────────────────────────────────── */
const SUB_ITEMS = [
  { key: 'change-password', label: 'Change password' },
  { key: 'change-email', label: 'Change email' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'delete-account', label: 'Delete account' },
]

export function AccountManagement({ initialSub = 'change-password' }) {
  const [activeSub, setActiveSub] = useState(initialSub)

  return (
    <div style={{ display: 'flex', gap: '0', height: '100%' }}>
      {/* Sub-nav is handled by parent SettingsPage — this component just renders content */}
      <div style={{ flex: 1 }}>
        {activeSub === 'change-password' && <ChangePassword />}
        {activeSub === 'change-email' && <ChangeEmail />}
        {activeSub === 'notifications' && <Notifications />}
        {activeSub === 'delete-account' && <DeleteAccountSection />}
      </div>
    </div>
  )
}

// Export sub-items for the sidebar to use
export { SUB_ITEMS as ACCOUNT_MGMT_SUBS }
export { ChangePassword, ChangeEmail, Notifications, DeleteAccountSection }
