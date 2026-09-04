import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { FormField, PasswordInput, TextInput, PrimaryBtn, ContentTitle, Toggle } from './SettingsUI'
import { SettingsSuccessModal, DeleteAccountModal } from '../modals/SettingsModals'
import { authService } from '../../../auth/auth.service.js'
import {
  useForgotPassword, useDeletionStatus,
  useCheckDeletionEligibility,
  useCancelAccountDeletion
} from '../../../auth/auth.hooks.js'
import useAuthStore from '../../../auth/auth.store.js'
import useUIStore from '../../../../shared/store/ui.store.js'

/* ── Change Password ──────────────────────────────────────────────────────── */
function ChangePassword() {
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
  const [blockers, setBlockers] = useState(null)
  const { toastWarning, toastError } = useUIStore()

  const { data: statusData, isLoading: statusLoading } = useDeletionStatus()
  const { mutate: checkEligibility, isPending: checkingEligibility } = useCheckDeletionEligibility()
  const { mutate: cancelDeletion, isPending: cancelling } = useCancelAccountDeletion()

  const deletionInfo = statusData?.data?.deletion

  const handleInitiate = () => {
    setBlockers(null)
    checkEligibility(undefined, {
      onSuccess: (res) => {
        // Handles the HTTP 200 OK variation of a blocked response
        if (res?.data?.eligible === false || (res?.data?.reasons && res.data.reasons.length > 0)) {
          setBlockers(res.data.reasons)
        } else {
          setModalOpen(true)
          toastWarning('Review the deletion prompt before continuing.')
        }
      },
      onError: (err) => {
        const payload = err?.data || err?.response?.data || err?.payload || err
        const blockedReasons = payload?.data?.errors?.reasons || payload?.data?.reasons

        if (blockedReasons && Array.isArray(blockedReasons) && blockedReasons.length > 0) {
          setBlockers(blockedReasons)
        } else {
          // Only show the toast if we couldn't find specific blocking reasons
          toastError(err?.message || 'Failed to verify account eligibility.')
        }
      }
    })
  }

  if (statusLoading) {
    return <p style={{ fontSize: '14px', color: 'var(--color-text-3)', fontFamily: 'var(--ff-body)' }}>Loading status...</p>
  }

  // Pending State
  if (deletionInfo?.status === 'pending') {
    return (
      <div>
        <ContentTitle>Account Deletion Scheduled</ContentTitle>
        <div style={{ fontSize: '14px', color: 'var(--color-text-2)', lineHeight: 1.75, marginBottom: '24px', fontFamily: 'var(--ff-body)', background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '12px' }}>
          <p style={{ marginBottom: '8px', color: '#92400e', fontWeight: 600 }}>Your account is scheduled for permanent deletion.</p>
          <p style={{ color: '#92400e' }}>
            Scheduled for: <strong>{new Date(deletionInfo.scheduled_for).toLocaleString()}</strong>
          </p>
          <p style={{ marginTop: '8px', color: '#92400e' }}>
            If you change your mind, you can cancel this request before the scheduled date. Once the date passes, your account and data will be permanently removed.
          </p>
        </div>

        {deletionInfo.can_cancel && (
          <PrimaryBtn
            onClick={() => cancelDeletion()}
            disabled={cancelling}
            fullWidth={false}
            style={{ minWidth: '200px' }}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Account Deletion'}
          </PrimaryBtn>
        )}
      </div>
    )
  }

  // Default State
  return (
    <>
      <div>
        <ContentTitle>Delete Account</ContentTitle>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '16px', fontFamily: 'var(--ff-body)' }}>
          Are you sure you want to delete your account?
        </h3>
        <div style={{ fontSize: '14px', color: 'var(--color-text-2)', lineHeight: 1.75, marginBottom: '24px', fontFamily: 'var(--ff-body)' }}>
          <p style={{ marginBottom: '8px' }}>Your account will be permanently deleted after seven days. You may cancel before the scheduled date.</p>
          <p style={{ marginBottom: '8px' }}>You cannot request deletion while you have active jobs, unsettled payments, wallet funds, disputes or withdrawals.</p>
          <p>Need help? Contact <a href="#" style={{ color: 'var(--color-accent-gold)', textDecoration: 'none', fontWeight: 600 }}>Customer Support</a> before proceeding.</p>
        </div>

        {blockers && blockers.length > 0 && (
          <div style={{ marginBottom: '24px', padding: '16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px' }}>
            <p style={{ color: '#dc2626', fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Action Required:</p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#b91c1c', fontSize: '13.5px', fontFamily: 'var(--ff-body)' }}>
              {blockers.map((blocker, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{blocker.message}</li>
              ))}
            </ul>
          </div>
        )}

        <PrimaryBtn
          danger
          onClick={handleInitiate}
          disabled={checkingEligibility}
          fullWidth={false}
          style={{ minWidth: '200px' }}
        >
          {checkingEligibility ? 'Checking Eligibility...' : 'Schedule Account Deletion'}
        </PrimaryBtn>
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
  { key: 'delete-account', label: 'Delete account' },
]

export function AccountManagement({ initialSub = 'change-password' }) {
  const [activeSub] = useState(initialSub)

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
