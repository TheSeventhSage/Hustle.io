import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { FormField, PasswordInput, TextInput, PrimaryBtn, ContentTitle, Toggle } from './SettingsUI'
import { SettingsSuccessModal, DeleteAccountModal } from '../modals/SettingsModals'
import { authService } from '../../../auth/auth.service.js'
import { useForgotPassword } from '../../../auth/auth.hooks.js'
import useAuthStore from '../../../auth/auth.store.js'
import useUIStore from '../../../../shared/store/ui.store.js'

/* ── Change Password ──────────────────────────────────────────────────────── */
function ChangePassword({ onDone }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const { toastError } = useUIStore()
  const { mutate: sendResetEmail, isPending } = useForgotPassword()

  const handleSend = () => {
    const email = user?.email?.trim()
    if (!email) {
      toastError('No email address was found for this account.')
      return
    }

    sendResetEmail(
      {
        email,
        account_type: user?.role || undefined,
      },
      {
        onSuccess: async () => {
          try {
            await authService.signOut()
          } catch {
            // Clear the local session even if the server session is already gone.
          }

          logout()
          queryClient.clear()

          const nextParams = new URLSearchParams({
            email,
            sent: '1',
          })

          if (user?.role) {
            nextParams.set('account_type', user.role)
          }

          navigate(`/reset-password?${nextParams.toString()}`, { replace: true })
        },
      }
    )
  }

  return (
    <div>
      <ContentTitle>Change Password</ContentTitle>
      <p style={{ fontSize: '13.5px', color: 'var(--color-text-3)', marginBottom: '24px', lineHeight: 1.6, fontFamily: 'var(--ff-body)' }}>
        We'll send a password reset link to your registered email address, sign you out, and take you to the reset page. Use the link in your email to finish setting a new password.
      </p>
      <PrimaryBtn onClick={handleSend} disabled={isPending}>
        {isPending ? 'Sending...' : 'Send Reset Email'}
      </PrimaryBtn>
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
  { key: 'my-subscription', label: 'My subscription' },
  { key: 'appearance-settings', label: 'Appearance settings' },
  { key: 'contact-support', label: 'Contact support' },
  // { key: 'change-email', label: 'Change email' },
  // { key: 'notifications', label: 'Notifications' },
  // { key: 'delete-account', label: 'Delete account' },
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
