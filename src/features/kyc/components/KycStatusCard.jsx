import { ShieldCheck } from 'lucide-react'
import { StatusBadge } from '../../../shared/components/StatusBadge.jsx'

const DOCUMENT_TYPE_LABELS = {
  bvn: 'BVN',
  nin: 'NIN',
  passport: 'Passport',
  drivers_license: "Driver's license",
  voter_id: "Voter's ID",
  national_id: 'National ID',
}

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function KycStatusCard({ submission }) {
  const status = submission?.status ?? 'pending'
  const documentLabel = DOCUMENT_TYPE_LABELS[submission?.document_type] ?? submission?.document_type
  const submittedAt = formatDate(submission?.submitted_at)
  const verifiedAt = formatDate(submission?.verified_at)

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: '20px',
        padding: '24px',
        display: 'grid',
        gap: '14px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={20} color="var(--color-primary)" />
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)' }}>
            Identity verification
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {documentLabel && (
          <StatusField label="Document type" value={documentLabel} />
        )}
        {submittedAt && (
          <StatusField label="Submitted" value={submittedAt} />
        )}
        {verifiedAt && (
          <StatusField label="Reviewed" value={verifiedAt} />
        )}
      </div>

      {status === 'rejected' && submission?.review_notes && (
        <p style={{ fontSize: '13px', color: 'var(--color-error)', lineHeight: 1.6, fontFamily: 'var(--ff-body)' }}>
          {submission.review_notes}
        </p>
      )}

      {status === 'pending' && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-3)', lineHeight: 1.6, fontFamily: 'var(--ff-body)' }}>
          Your documents are being reviewed. This usually takes 1–2 business days.
        </p>
      )}
    </div>
  )
}

function StatusField({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: '11px', color: 'var(--color-text-4)', marginBottom: '2px', fontFamily: 'var(--ff-body)' }}>{label}</p>
      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)' }}>{value}</p>
    </div>
  )
}
