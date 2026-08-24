import { Download, ShieldCheck, Smartphone } from 'lucide-react'

import { Button } from '../../../../shared/components/Button.jsx'
import { useKycStatus } from '../../../kyc/kyc.hooks.js'
import { KycStatusCard } from '../../../kyc/components/KycStatusCard.jsx'
import { KycSubmissionForm } from '../../../kyc/components/KycSubmissionForm.jsx'
import { CertificationsSection } from '../../../kyc/components/CertificationsSection.jsx'

export function AccountVerification({ isArtisan = false }) {
  if (!isArtisan) {
    return <MobileVerificationStub />
  }

  return <ArtisanKycFlow />
}

function ArtisanKycFlow() {
  const { data: submission, isLoading } = useKycStatus()
  const status = submission?.status
  const canResubmit = !submission || status === 'rejected'

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-1)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>
          Account Verification
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-3)', lineHeight: 1.65, fontFamily: 'var(--ff-body)' }}>
          Submit your identity documents so we can verify your account. Approved verification is required before you can withdraw earnings.
        </p>
      </div>

      {isLoading ? (
        <p style={{ fontSize: '13px', color: 'var(--color-text-4)', fontFamily: 'var(--ff-body)' }}>Loading verification status…</p>
      ) : (
        <>
          {submission && <KycStatusCard submission={submission} />}
          {canResubmit && <KycSubmissionForm />}
        </>
      )}

      <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
        <CertificationsSection />
      </div>
    </div>
  )
}

function MobileVerificationStub() {
  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-1)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>
          Account Verification
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-3)', lineHeight: 1.65, fontFamily: 'var(--ff-body)' }}>
          Identity verification applies to artisan accounts. There is nothing you need to submit here.
        </p>
      </div>

      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: '24px',
          padding: '28px',
          display: 'grid',
          gap: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'rgba(10,35,24,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={24} color="var(--color-primary)" />
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '4px', fontFamily: 'var(--ff-body)' }}>
              Verification is handled in the Hustle mobile application
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-3)', fontFamily: 'var(--ff-body)' }}>
              Switching to an artisan account? Download the app to submit your documents and track your verification status.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: '16px', padding: '16px', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Smartphone size={18} color="var(--color-primary)" />
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)' }}>What you can do there</p>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-3)', lineHeight: 1.6, fontFamily: 'var(--ff-body)' }}>
              Submit KYC details, upload identity files, and monitor approval without using the web settings page.
            </p>
          </div>

          <div style={{ border: '1px solid var(--color-border)', borderRadius: '16px', padding: '16px', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Download size={18} color="var(--color-primary)" />
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)' }}>Next step</p>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-3)', lineHeight: 1.6, fontFamily: 'var(--ff-body)' }}>
              Download the current app build and continue the verification flow from your device.
            </p>
          </div>
        </div>

        <Button variant="solid" className="w-fit min-w-[220px] px-8 max-sm:w-full">
          Download application
        </Button>
      </div>
    </div>
  )
}
