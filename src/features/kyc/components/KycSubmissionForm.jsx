import { useMemo, useRef, useState } from 'react'
import { FileUploadComponent } from '../../../shared/components/FileUploadComponent.jsx'
import { Button } from '../../../shared/components/Button.jsx'
import { Input } from '../../../shared/components/Input.jsx'
import { useCountries } from '../../auth/auth.hooks.js'
import { useSubmitKyc } from '../kyc.hooks.js'
import { mediaService } from '../../../services/media.service.js'
import useUIStore from '../../../shared/store/ui.store.js'

const DOCUMENT_TYPES = [
  { value: 'nin', label: 'NIN' },
  { value: 'bvn', label: 'BVN' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's license" },
  { value: 'voter_id', label: "Voter's ID" },
  { value: 'national_id', label: 'National ID' },
]

const KYC_IMAGE_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp'

function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `kyc-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

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

export function KycSubmissionForm() {
  const { toastError } = useUIStore()
  const { data: countriesData } = useCountries()
  const countries = countriesData?.countries ?? []

  const [documentType, setDocumentType] = useState('nin')
  const [idNumber, setIdNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [countryIso2, setCountryIso2] = useState('NG')
  const [documentFiles, setDocumentFiles] = useState([])
  const [selfieFiles, setSelfieFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  const idempotencyKeyRef = useRef(newIdempotencyKey())
  const { mutate: submitKyc, isPending: isSubmitting } = useSubmitKyc()

  const isPending = isUploading || isSubmitting

  const canSubmit = useMemo(() => (
    documentType
    && idNumber.trim()
    && firstName.trim()
    && lastName.trim()
    && dateOfBirth
    && documentFiles.length === 1
    && selfieFiles.length === 1
  ), [documentType, idNumber, firstName, lastName, dateOfBirth, documentFiles, selfieFiles])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit || isPending) return

    setIsUploading(true)
    try {
      const [documentAsset, selfieAsset] = await Promise.all([
        mediaService.upload(documentFiles[0], 'kyc_document'),
        mediaService.upload(selfieFiles[0], 'selfie'),
      ])

      setIsUploading(false)

      submitKyc({
        document_type: documentType,
        id_number: idNumber,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        gender: gender || undefined,
        country_iso2: countryIso2,
        document_media_asset_id: documentAsset.id,
        selfie_media_asset_id: selfieAsset.id,
        idempotencyKey: idempotencyKeyRef.current,
      }, {
        onSuccess: () => {
          idempotencyKeyRef.current = newIdempotencyKey()
        },
      })
    } catch (error) {
      setIsUploading(false)
      toastError(error?.message ?? 'Could not upload your documents. Try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '4px 16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Document type</label>
          <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={selectStyle}>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <Input label="ID number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="Enter your document number" />

        <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
        <Input label="Middle name (optional)" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Middle name" />
        <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
        <Input label="Date of birth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Gender (optional)</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={selectStyle}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Country</label>
          <select value={countryIso2} onChange={(e) => setCountryIso2(e.target.value)} style={selectStyle}>
            {countries.length === 0 && <option value="NG">Nigeria</option>}
            {countries.map((country) => (
              <option key={country.id} value={String(country.code || country.iso2_code || '').toUpperCase()}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={labelStyle}>Identity document</label>
        <FileUploadComponent
          files={documentFiles}
          onChange={setDocumentFiles}
          accept={KYC_IMAGE_ACCEPT}
          maxFiles={1}
          maxSize={5 * 1024 * 1024}
        />
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={labelStyle}>Selfie</label>
        <FileUploadComponent
          files={selfieFiles}
          onChange={setSelfieFiles}
          accept={KYC_IMAGE_ACCEPT}
          maxFiles={1}
          maxSize={5 * 1024 * 1024}
        />
      </div>

      <Button type="submit" variant="solid" isPending={isPending} disabled={!canSubmit} className="w-fit min-w-[220px] px-8 max-sm:w-full mt-4">
        {isUploading ? 'Uploading…' : isSubmitting ? 'Submitting…' : 'Submit for verification'}
      </Button>
    </form>
  )
}
