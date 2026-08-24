import { useRef, useState } from 'react'
import { Award, Plus } from 'lucide-react'
import { StatusBadge } from '../../../shared/components/StatusBadge.jsx'
import { Button } from '../../../shared/components/Button.jsx'
import { Input } from '../../../shared/components/Input.jsx'
import { FileUploadComponent } from '../../../shared/components/FileUploadComponent.jsx'
import { useCertificationTypes, useKycCertifications, useSubmitCertification } from '../kyc.hooks.js'
import { mediaService } from '../../../services/media.service.js'
import useUIStore from '../../../shared/store/ui.store.js'

const KYC_IMAGE_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp'

const selectStyle = {
  width: '100%',
  height: '46px',
  padding: '0 14px',
  fontSize: '14px',
  fontFamily: 'var(--ff-body)',
  color: 'var(--color-text-1)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--color-text-2)',
  marginBottom: '6px',
  fontFamily: 'var(--ff-body)',
}

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function CertificationRow({ certification }) {
  const title = certification?.certification_type_name ?? certification?.certification_name ?? 'Certification'
  const status = String(certification?.status ?? 'pending_review')
  const issuedAt = formatDate(certification?.issued_at)
  const expiresAt = formatDate(certification?.expires_at)

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)' }}>{title}</p>
        {certification?.certification_number && (
          <p style={{ fontSize: '12px', color: 'var(--color-text-4)', fontFamily: 'var(--ff-body)' }}>No. {certification.certification_number}</p>
        )}
        {(issuedAt || expiresAt) && (
          <p style={{ fontSize: '12px', color: 'var(--color-text-4)', fontFamily: 'var(--ff-body)' }}>
            {issuedAt ? `Issued ${issuedAt}` : ''}{issuedAt && expiresAt ? ' · ' : ''}{expiresAt ? `Expires ${expiresAt}` : ''}
          </p>
        )}
      </div>
      <StatusBadge status={status} />
    </div>
  )
}

export function CertificationsSection() {
  const { toastError } = useUIStore()
  const [showForm, setShowForm] = useState(false)
  const [certificationTypeId, setCertificationTypeId] = useState('')
  const [certificationNumber, setCertificationNumber] = useState('')
  const [issuedAt, setIssuedAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const formResetKeyRef = useRef(0)

  const { data: certifications = [], isLoading } = useKycCertifications()
  const { data: certificationTypes = [] } = useCertificationTypes(undefined, { enabled: showForm })
  const { mutate: submitCertification, isPending: isSubmitting } = useSubmitCertification()

  const isPending = isUploading || isSubmitting
  const canSubmit = Boolean(certificationTypeId) && files.length === 1

  const resetForm = () => {
    setCertificationTypeId('')
    setCertificationNumber('')
    setIssuedAt('')
    setExpiresAt('')
    setFiles([])
    formResetKeyRef.current += 1
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit || isPending) return

    setIsUploading(true)
    try {
      const asset = await mediaService.upload(files[0], 'kyc_document')
      setIsUploading(false)

      submitCertification({
        certification_type_id: certificationTypeId,
        certification_number: certificationNumber || undefined,
        media_asset_id: asset.id,
        issued_at: issuedAt || undefined,
        expires_at: expiresAt || undefined,
      }, {
        onSuccess: () => {
          resetForm()
          setShowForm(false)
        },
      })
    } catch (error) {
      setIsUploading(false)
      toastError(error?.message ?? 'Could not upload your certificate. Try again.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={18} color="var(--color-primary)" />
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)' }}>Certifications</p>
        </div>
        <Button variant="ghost" onClick={() => setShowForm((s) => !s)} className="w-fit px-4 h-9">
          <Plus size={14} /> Add certification
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ border: '1px solid var(--color-border)', borderRadius: '16px', padding: '18px', marginBottom: '18px', display: 'grid', gap: '4px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Certification type</label>
            <select value={certificationTypeId} onChange={(e) => setCertificationTypeId(e.target.value)} style={selectStyle}>
              <option value="">Select a certification type</option>
              {certificationTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <Input label="Certificate number (optional)" value={certificationNumber} onChange={(e) => setCertificationNumber(e.target.value)} placeholder="Certificate number" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0 16px' }}>
            <Input label="Issued on (optional)" type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} />
            <Input label="Expires on (optional)" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>

          <FileUploadComponent files={files} onChange={setFiles} accept={KYC_IMAGE_ACCEPT} maxFiles={1} maxSize={5 * 1024 * 1024} />

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button type="submit" variant="solid" isPending={isPending} disabled={!canSubmit} className="w-fit px-6">
              {isUploading ? 'Uploading…' : isSubmitting ? 'Submitting…' : 'Submit certification'}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm() }} className="w-fit px-6">
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p style={{ fontSize: '13px', color: 'var(--color-text-4)', fontFamily: 'var(--ff-body)' }}>Loading certifications…</p>
      ) : certifications.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--color-text-4)', fontFamily: 'var(--ff-body)' }}>No certifications submitted yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {certifications.map((certification, index) => (
            <CertificationRow key={certification?.id ?? index} certification={certification} />
          ))}
        </div>
      )}
    </div>
  )
}
