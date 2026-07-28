import { useEffect, useMemo, useState } from 'react'
import { Mail, Phone, Pencil, Upload, X, Image as ImageIcon, ChevronDown } from 'lucide-react'

import { Button } from '../../../../shared/components/Button.jsx'
import { storage } from '../../../../services/storage.js'

const inputStyles = {
  width: '100%',
  minHeight: '48px',
  padding: '0 14px',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
  outline: 'none',
  fontSize: '14px',
  color: 'var(--color-text-1)',
  background: 'var(--color-surface)',
  fontFamily: 'var(--ff-body)',
  boxSizing: 'border-box',
}

const EXPERIENCE_LEVELS = [
  { value: '', label: 'Select experience level' },
  { value: 'entry', label: 'Entry' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
]

const PRICING_MODELS = [
  { value: '', label: 'Select pricing model' },
  { value: 'per_service', label: 'Per service' },
  { value: 'full_amount', label: 'Full amount' },
  { value: 'per_hour', label: 'Per hour' },
]

function SettingsField({ label, children, helper }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-2)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>
        {label}
      </label>
      {helper ? (
        <p style={{ fontSize: '12px', color: 'var(--color-text-4)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>{helper}</p>
      ) : null}
      {children}
    </div>
  )
}

function TextField({ icon, style = {}, ...props }) {
  return (
    <div style={{ position: 'relative' }}>
      {icon ? (
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-4)', display: 'flex' }}>
          {icon}
        </span>
      ) : null}
      <input
        {...props}
        style={{
          ...inputStyles,
          ...(icon ? { padding: '0 14px 0 42px' } : {}),
          ...style,
        }}
      />
    </div>
  )
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      style={{
        ...inputStyles,
        minHeight: '124px',
        padding: '14px',
        resize: 'vertical',
      }}
    />
  )
}

function SelectField({ children, ...props }) {
  return (
    <select {...props} style={inputStyles}>
      {children}
    </select>
  )
}

function ImageUploadField({ value, onChange, onAssetIdChange, assetType, label = 'Upload image', isUploading: externalUploading }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(value || null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState(null)

  const isUploading = externalUploading || uploadingImage

  useEffect(() => {
    if (value && !imagePreview) {
      setImagePreview(value)
    }
  }, [value, imagePreview])

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, JPEG, PNG, and WebP are allowed.')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size exceeds 5MB limit.')
      return
    }

    setSelectedImage(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Auto-upload immediately after selection
    uploadImageFile(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    onChange('')
    if (onAssetIdChange) onAssetIdChange(null)
  }

  const uploadImageFile = async (file) => {
    setUploadingImage(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('asset_type', assetType)

      const token = storage.getToken()
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api-v2.hustleapp.info/api/v1'

      const response = await fetch(`${baseURL}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const result = await response.json()
      setUploadingImage(false)

      if (result.data?.asset?.url && result.data?.asset?.id) {
        onChange(result.data.asset.url)
        if (onAssetIdChange) onAssetIdChange(result.data.asset.id)
        setSelectedImage(null)
        return { url: result.data.asset.url, id: result.data.asset.id }
      }

      throw new Error('No URL or ID returned from upload')
    } catch (err) {
      setUploadingImage(false)
      setError(err.message || 'Upload failed')
      // Reset on error
      setSelectedImage(null)
      setImagePreview(value || null)
      throw err
    }
  }

  return (
    <div>
      {!imagePreview ? (
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '160px',
            border: '2px dashed var(--color-border)',
            borderRadius: '12px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            background: 'var(--color-mist)',
            transition: 'border-color 0.2s',
            opacity: isUploading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => !isUploading && (e.currentTarget.style.borderColor = 'var(--color-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          <Upload size={32} style={{ color: 'var(--color-text-4)', marginBottom: '8px' }} />
          <p style={{ fontSize: '13px', color: 'var(--color-text-2)', fontWeight: 600, marginBottom: '4px', fontFamily: 'var(--ff-body)' }}>
            {isUploading ? 'Uploading...' : label}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--color-text-4)', fontFamily: 'var(--ff-body)' }}>
            JPG, PNG, or WebP (max 5MB)
          </p>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageSelect}
            disabled={isUploading}
            style={{ display: 'none' }}
          />
        </label>
      ) : (
        <div style={{ position: 'relative' }}>
          <img
            src={imagePreview}
            alt="Preview"
            style={{
              width: '100%',
              height: '160px',
              objectFit: 'cover',
              borderRadius: '12px',
              opacity: isUploading ? 0.6 : 1,
            }}
          />
          {!isUploading && (
            <button
              type="button"
              onClick={handleRemoveImage}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '32px',
                height: '32px',
                background: 'rgba(0, 0, 0, 0.6)',
                border: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)')}
            >
              <X size={16} style={{ color: 'white' }} />
            </button>
          )}
          {isUploading && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '12px 20px',
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(4px)',
                borderRadius: '8px',
              }}
            >
              <p style={{ fontSize: '13px', color: 'white', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>
                Uploading...
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: '12px', color: '#dc2626', fontFamily: 'var(--ff-body)' }}>
            {error}
          </p>
        </div>
      )}
    </div>
  )
}

function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-1)', marginBottom: subtitle ? '6px' : 0, fontFamily: 'var(--ff-body)' }}>{title}</h3>
      {subtitle ? <p style={{ fontSize: '13px', color: 'var(--color-text-3)', fontFamily: 'var(--ff-body)' }}>{subtitle}</p> : null}
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: '14px', padding: '16px', background: 'var(--color-surface)' }}>
      <p style={{ fontSize: '12px', color: 'var(--color-text-4)', marginBottom: '6px', fontFamily: 'var(--ff-body)' }}>{label}</p>
      <p style={{ fontSize: '15px', color: 'var(--color-text-1)', fontWeight: 600, fontFamily: 'var(--ff-body)', overflowWrap: 'anywhere' }}>{value || '-'}</p>
    </div>
  )
}

function resolveCityName(id, cities) {
  const city = cities.find((item) => String(item.id) === String(id))
  return city?.name || ''
}

function resolveCategoryName(id, categories) {
  const category = categories.find((item) => String(item.id) === String(id))
  return category?.name || ''
}

function hasArtisanRole(role) {
  if (Array.isArray(role)) return role.some((value) => String(value).trim().toLowerCase() === 'artisan')
  return String(role ?? '')
    .split(/[,\s|/]+/)
    .some((value) => value.trim().toLowerCase() === 'artisan')
}

function formatServiceRate(service) {
  return `${service.currency_code || 'NGN'} ${service.default_rate_amount ?? 0}`
}

function getServiceId(service) {
  return service?.id ?? service?.service_id ?? service?.provider_service_id ?? service?.providerServiceId ?? null
}

function ServiceListItem({ service, categories, isExpanded, onToggle, onEdit, onCreateNew }) {
  const categoryName = resolveCategoryName(service.category_id, categories)

  return (
    <div
      style={{
        border: `1px solid ${isExpanded ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: '14px',
        background: 'var(--color-surface)',
        transition: 'all 0.15s',
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(service)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '14px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h4 style={{ fontSize: '15px', color: 'var(--color-text-1)', fontWeight: 700, fontFamily: 'var(--ff-body)' }}>
            {service.title || 'Untitled service'}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', color: isExpanded ? 'var(--color-primary)' : 'var(--color-text-4)', fontWeight: 700, fontFamily: 'var(--ff-body)', whiteSpace: 'nowrap' }}>
              {formatServiceRate(service)}
            </span>
            <ChevronDown
              size={16}
              style={{
                color: isExpanded ? 'var(--color-primary)' : 'var(--color-text-4)',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
              }}
            />
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-3)', marginBottom: '10px', fontFamily: 'var(--ff-body)', lineHeight: 1.5 }}>
          {service.short_description || 'No description yet.'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[categoryName || `Category #${service.category_id || '-'}`, service.pricing_model_default || '-', service.experience_level || '-'].map((value) => (
            <span
              key={value}
              style={{
                display: 'inline-flex',
                minHeight: '24px',
                alignItems: 'center',
                padding: '0 10px',
                borderRadius: '999px',
                background: 'var(--color-mist)',
                color: 'var(--color-text-3)',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'var(--ff-body)',
              }}
            >
              {value}
            </span>
          ))}
        </div>
      </button>

      {isExpanded ? (
        <div style={{ borderTop: '1px solid var(--color-border)', padding: '14px 16px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <SummaryCard label="Rate" value={formatServiceRate(service || {})} />
            <SummaryCard label="Category" value={categoryName || `Category #${service?.category_id || '-'}`} />
            <SummaryCard label="Pricing model" value={service?.pricing_model_default || '-'} />
            <SummaryCard label="Experience level" value={service?.experience_level || '-'} />
            <SummaryCard label="Status" value={service?.is_active ? 'Active' : 'Inactive'} />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onEdit(service)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '40px',
                padding: '0 16px',
                borderRadius: '999px',
                border: '1px solid var(--color-primary)',
                background: 'var(--color-surface)',
                color: 'var(--color-primary)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--ff-body)',
              }}
            >
              <Pencil size={14} />
              Edit service
            </button>
            <button
              type="button"
              onClick={onCreateNew}
              style={{
                minHeight: '40px',
                padding: '0 16px',
                borderRadius: '999px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-mist)',
                color: 'var(--color-text-2)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--ff-body)',
              }}
            >
              Create new service
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function PortfolioCard({ item }) {
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: '14px', padding: '16px', background: 'var(--color-surface)' }}>
      <h4 style={{ fontSize: '15px', color: 'var(--color-text-1)', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>{item.service_name || 'Untitled portfolio item'}</h4>
      <p style={{ fontSize: '13px', color: 'var(--color-text-2)', marginBottom: '10px', fontFamily: 'var(--ff-body)' }}>{item.brief_description || 'No description yet.'}</p>
      <p style={{ fontSize: '12px', color: 'var(--color-text-4)', fontFamily: 'var(--ff-body)', overflowWrap: 'anywhere' }}>{item.image_url || 'No image URL'}</p>
    </div>
  )
}

function buildProfileForm(role, profile, account) {
  if (role === 'company') {
    return {
      company_name: profile?.company_name || account?.company_name || '',
      overview: profile?.overview || '',
      location_text: profile?.location_text || '',
      city_id: profile?.city_id?.toString?.() || '',
      profile_image_url: profile?.profile_image_url || '',
      profile_image_asset_id: profile?.profile_image_asset_id || null,
    }
  }

  return {
    first_name: profile?.first_name || account?.first_name || '',
    last_name: profile?.last_name || account?.last_name || '',
    phone_number: profile?.phone_number || account?.phone_number || '',
    bio: profile?.bio || '',
    date_of_birth: (profile?.date_of_birth || '').slice(0, 10),
    gender: profile?.gender || '',
    default_city_id: profile?.default_city_id?.toString?.() || '',
    profile_image_url: profile?.profile_image_url || '',
    profile_image_asset_id: profile?.profile_image_asset_id || null,
  }
}

function ContactDetailsSection({ account, profile, cities, isPending, onSave }) {
  const role = account?.account_type || account?.role
  const isArtisan = hasArtisanRole(role)
  const [form, setForm] = useState(() => buildProfileForm(role, profile, account))

  useEffect(() => {
    setForm(buildProfileForm(role, profile, account))
  }, [role, profile, account])

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = () => {
    if (role === 'company') {
      onSave({
        company_name: form.company_name,
        overview: form.overview,
        location_text: form.location_text,
        city_id: form.city_id ? Number(form.city_id) : undefined,
        profile_image_asset_id: form.profile_image_asset_id || undefined,
      })
      return
    }

    onSave({
      first_name: form.first_name,
      last_name: form.last_name,
      phone_number: form.phone_number || undefined,
      bio: form.bio || undefined,
      date_of_birth: form.date_of_birth || undefined,
      gender: form.gender || undefined,
      // City persistence is an artisan-only concern (drives the provider feed).
      default_city_id: isArtisan && form.default_city_id ? Number(form.default_city_id) : undefined,
      profile_image_asset_id: form.profile_image_asset_id || undefined,
    })
  }

  return (
    <div>
      <SectionTitle title="Contact details" subtitle="View and Update your contact details." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <SummaryCard label="Account type" value={role} />
        <SummaryCard label="Email" value={account?.email} />
        <SummaryCard label="Status" value={account?.status} />
      </div>

      {role === 'company' ? (
        <>
          <SettingsField label="Company name">
            <TextField value={form.company_name} onChange={handleChange('company_name')} placeholder="Enter company name" />
          </SettingsField>
          <SettingsField label="Company overview">
            <TextArea value={form.overview} onChange={handleChange('overview')} placeholder="Describe the company" />
          </SettingsField>
          <SettingsField label="Location text">
            <TextField value={form.location_text} onChange={handleChange('location_text')} placeholder="Enter business location" />
          </SettingsField>
          <SettingsField label="City">
            <SelectField value={form.city_id} onChange={handleChange('city_id')}>
              <option value="">Select city</option>
              {cities.map((city) => <option key={city.id} value={String(city.id)}>{city.name}</option>)}
            </SelectField>
          </SettingsField>
          <SettingsField label="Profile image">
            <ImageUploadField
              value={form.profile_image_url}
              onChange={(url) => setForm((current) => ({ ...current, profile_image_url: url }))}
              onAssetIdChange={(assetId) => setForm((current) => ({ ...current, profile_image_asset_id: assetId }))}
              assetType="profile_image"
              label="Click to upload profile image"
              isUploading={isPending}
            />
          </SettingsField>
        </>
      ) : (
        <>
          <SettingsField label="First name">
            <TextField value={form.first_name} onChange={handleChange('first_name')} placeholder="Enter first name" />
          </SettingsField>
          <SettingsField label="Last name">
            <TextField value={form.last_name} onChange={handleChange('last_name')} placeholder="Enter last name" />
          </SettingsField>
          <SettingsField label="Phone number">
            <TextField value={form.phone_number} onChange={handleChange('phone_number')} placeholder="Enter phone number" icon={<Phone size={16} />} />
          </SettingsField>
          <SettingsField label="Email address">
            <TextField value={account?.email || ''} readOnly icon={<Mail size={16} />} style={{ background: 'var(--color-mist)' }} />
          </SettingsField>
          <SettingsField label="Bio">
            <TextArea value={form.bio} onChange={handleChange('bio')} placeholder="Tell clients about your work" />
          </SettingsField>
          <SettingsField label="Date of birth">
            <TextField type="date" value={form.date_of_birth} onChange={handleChange('date_of_birth')} />
          </SettingsField>
          <SettingsField label="Gender">
            <SelectField value={form.gender} onChange={handleChange('gender')}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </SelectField>
          </SettingsField>
          {isArtisan ? (
            <SettingsField label="Default city" helper="Used to match you with nearby hustles on your feed.">
              <SelectField value={form.default_city_id} onChange={handleChange('default_city_id')}>
                <option value="">Select city</option>
                {cities.map((city) => <option key={city.id} value={String(city.id)}>{city.name}</option>)}
              </SelectField>
            </SettingsField>
          ) : null}
          <SettingsField label="Profile image">
            <ImageUploadField
              value={form.profile_image_url}
              onChange={(url) => setForm((current) => ({ ...current, profile_image_url: url }))}
              onAssetIdChange={(assetId) => setForm((current) => ({ ...current, profile_image_asset_id: assetId }))}
              assetType="profile_image"
              label="Click to upload profile image"
              isUploading={isPending}
            />
          </SettingsField>
        </>
      )}

      <Button variant="solid" onClick={handleSubmit} isPending={isPending} className="mt-2 w-fit min-w-[240px] px-8 max-sm:w-full">
        Save update
      </Button>
    </div>
  )
}

function SectionTabs({ activeTab, onChange, tabs }) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            style={{
              minHeight: '40px',
              padding: '0 16px',
              borderRadius: '999px',
              border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: active ? 'var(--color-primary)' : 'var(--color-surface)',
              color: active ? 'var(--color-white)' : 'var(--color-text-2)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--ff-body)',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

function MyServiceSection({
  services,
  portfolio,
  categories,
  isServicePending,
  isPortfolioPending,
  onSaveService,
  onCreatePortfolio,
}) {
  const [activeTab, setActiveTab] = useState('services')
  const activeService = services[0] || null
  const [serviceForm, setServiceForm] = useState({
    category_id: '',
    title: '',
    short_description: '',
    experience_level: '',
    pricing_model_default: '',
    default_rate_amount: '',
    currency_code: 'NGN',
    image_url: '',
    primary_image_asset_id: null,
    is_active: true,
  })
  const [portfolioForm, setPortfolioForm] = useState({
    service_name: '',
    brief_description: '',
    image_url: '',
    image_asset_id: null,
  })

  useEffect(() => {
    if (!activeService) {
      setServiceForm({
        category_id: '',
        title: '',
        short_description: '',
        experience_level: '',
        pricing_model_default: '',
        default_rate_amount: '',
        currency_code: 'NGN',
        image_url: '',
        primary_image_asset_id: null,
        is_active: true,
      })
      return
    }

    setServiceForm({
      id: getServiceId(activeService),
      category_id: activeService.category_id?.toString?.() || '',
      title: activeService.title || '',
      short_description: activeService.short_description || '',
      experience_level: activeService.experience_level || '',
      pricing_model_default: activeService.pricing_model_default || '',
      default_rate_amount: activeService.default_rate_amount?.toString?.() || '',
      currency_code: activeService.currency_code || 'NGN',
      image_url: activeService.image_url || '',
      primary_image_asset_id: activeService.primary_image_asset_id || null,
      is_active: activeService.is_active ?? true,
    })
  }, [activeService])

  const [selectedServiceId, setSelectedServiceId] = useState(() => getServiceId(activeService))

  useEffect(() => {
    if (!services.length) {
      setSelectedServiceId(null)
      return
    }

    const stillExists = services.some((service) => String(getServiceId(service)) === String(selectedServiceId))
    if (!stillExists) {
      setSelectedServiceId(getServiceId(services[0]))
    }
  }, [services, selectedServiceId])

  const selectedService = useMemo(
    () => services.find((service) => String(getServiceId(service)) === String(selectedServiceId)) || services[0] || null,
    [services, selectedServiceId]
  )

  const handleServiceChange = (field) => (event) => {
    const value = field === 'is_active' ? event.target.checked : event.target.value
    setServiceForm((current) => ({ ...current, [field]: value }))
  }

  const handlePortfolioChange = (field) => (event) => {
    setPortfolioForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleEditService = (service) => {
    setActiveTab('services')
    setSelectedServiceId(getServiceId(service))
    setServiceForm({
      id: getServiceId(service),
      category_id: service.category_id?.toString?.() || '',
      title: service.title || '',
      short_description: service.short_description || '',
      experience_level: service.experience_level || '',
      pricing_model_default: service.pricing_model_default || '',
      default_rate_amount: service.default_rate_amount?.toString?.() || '',
      currency_code: service.currency_code || 'NGN',
      image_url: service.image_url || '',
      primary_image_asset_id: service.primary_image_asset_id || null,
      is_active: service.is_active ?? true,
    })
  }

  const handleCreateNewService = () => {
    setSelectedServiceId(null)
    setServiceForm({
      category_id: '',
      title: '',
      short_description: '',
      experience_level: '',
      pricing_model_default: '',
      default_rate_amount: '',
      currency_code: 'NGN',
      image_url: '',
      primary_image_asset_id: null,
      is_active: true,
    })
  }

  const submitService = () => {
    const payload = {
      id: serviceForm.id,
      category_id: Number(serviceForm.category_id),
      title: serviceForm.title,
      short_description: serviceForm.short_description || undefined,
      experience_level: serviceForm.experience_level || undefined,
      pricing_model_default: serviceForm.pricing_model_default || undefined,
      default_rate_amount: serviceForm.default_rate_amount ? Number(serviceForm.default_rate_amount) : undefined,
      currency_code: serviceForm.currency_code || undefined,
      is_active: serviceForm.is_active,
    }

    // Add image asset ID if available
    if (serviceForm.primary_image_asset_id) {
      payload.primary_image_asset_id = serviceForm.primary_image_asset_id
    }

    onSaveService(payload)
  }

  const submitPortfolio = () => {
    const payload = {
      service_name: portfolioForm.service_name,
      brief_description: portfolioForm.brief_description || undefined,
    }

    // Add image asset ID if available
    if (portfolioForm.image_asset_id) {
      payload.image_asset_id = portfolioForm.image_asset_id
    }

    onCreatePortfolio(payload)
    setPortfolioForm({
      service_name: '',
      brief_description: '',
      image_url: '',
      image_asset_id: null,
    })
  }

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div>
        <SectionTitle title="My services" subtitle="Service and portfolio items are grouped here for quicker updates." />
        <SectionTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { key: 'services', label: 'My services' },
            { key: 'portfolio', label: 'Portfolio items' },
          ]}
        />

        {activeTab === 'services' ? (
          <>
            {services.length ? (
              <>
                <div style={{ marginBottom: '18px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-2)', marginBottom: '12px', fontFamily: 'var(--ff-body)' }}>
                    {services.length} service{services.length !== 1 ? 's' : ''} total
                  </p>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {services.map((service) => (
                      <ServiceListItem
                        key={getServiceId(service) || service.title}
                        service={service}
                        categories={categories}
                        isExpanded={String(getServiceId(service)) === String(selectedServiceId)}
                        onToggle={(selected) => setSelectedServiceId((current) => (
                          String(current) === String(getServiceId(selected)) ? null : getServiceId(selected)
                        ))}
                        onEdit={handleEditService}
                        onCreateNew={handleCreateNewService}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ border: '1px dashed var(--color-border)', borderRadius: '14px', padding: '18px', marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--color-text-3)', fontFamily: 'var(--ff-body)' }}>
                  No service yet. The form below will create the first `my/services` item.
                </p>
              </div>
            )}

            {serviceForm.id ? (
              <div style={{ marginBottom: '18px', border: '1px solid rgba(10,35,24,0.1)', borderRadius: '14px', padding: '14px 16px', background: 'rgba(10,35,24,0.03)' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '4px', fontFamily: 'var(--ff-body)' }}>
                  Editing existing service
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-3)', fontFamily: 'var(--ff-body)' }}>
                  The form is prefilled from your current service data. Change any field and click update service.
                </p>
              </div>
            ) : null}

            <SettingsField label="Category" helper="Loaded from `GET /categories`.">
              <SelectField value={serviceForm.category_id} onChange={handleServiceChange('category_id')}>
                <option value="">Select category</option>
                {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
              </SelectField>
            </SettingsField>
            <SettingsField label="Service title">
              <TextField value={serviceForm.title} onChange={handleServiceChange('title')} placeholder="Enter service title" />
            </SettingsField>
            <SettingsField label="Short description">
              <TextArea value={serviceForm.short_description} onChange={handleServiceChange('short_description')} placeholder="Describe the service" />
            </SettingsField>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
              <SettingsField label="Experience level">
                <SelectField value={serviceForm.experience_level} onChange={handleServiceChange('experience_level')}>
                  {EXPERIENCE_LEVELS.map((option) => <option key={option.value || 'empty'} value={option.value}>{option.label}</option>)}
                </SelectField>
              </SettingsField>
              <SettingsField label="Pricing model">
                <SelectField value={serviceForm.pricing_model_default} onChange={handleServiceChange('pricing_model_default')}>
                  {PRICING_MODELS.map((option) => <option key={option.value || 'empty'} value={option.value}>{option.label}</option>)}
                </SelectField>
              </SettingsField>
              <SettingsField label="Rate amount">
                <TextField value={serviceForm.default_rate_amount} onChange={handleServiceChange('default_rate_amount')} type="number" placeholder="Enter amount" />
              </SettingsField>
              <SettingsField label="Currency code">
                <TextField value={serviceForm.currency_code} onChange={handleServiceChange('currency_code')} placeholder="NGN" />
              </SettingsField>
            </div>
            <SettingsField label="Service image">
              <ImageUploadField
                value={serviceForm.image_url}
                onChange={(url) => setServiceForm((current) => ({ ...current, image_url: url }))}
                onAssetIdChange={(assetId) => setServiceForm((current) => ({ ...current, primary_image_asset_id: assetId }))}
                assetType="listing_image"
                label="Click to upload service image"
                isUploading={isServicePending}
              />
            </SettingsField>
            <label style={{ display: 'inline-flex', gap: '10px', alignItems: 'center', marginBottom: '18px', fontSize: '14px', color: 'var(--color-text-2)', fontFamily: 'var(--ff-body)' }}>
              <input type="checkbox" checked={Boolean(serviceForm.is_active)} onChange={handleServiceChange('is_active')} />
              Active service
            </label>

            <Button variant="solid" onClick={submitService} isPending={isServicePending} className="w-fit min-w-[240px] px-8 max-sm:w-full">
              {serviceForm.id ? 'Update service' : 'Create service'}
            </Button>
          </>
        ) : (
          <>
            {portfolio.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {portfolio.map((item) => (
                  <PortfolioCard key={item.id || item.service_name} item={item} />
                ))}
              </div>
            ) : (
              <div style={{ border: '1px dashed var(--color-border)', borderRadius: '14px', padding: '18px', marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--color-text-3)', fontFamily: 'var(--ff-body)' }}>
                  No portfolio items yet. Use the form below to create the first one.
                </p>
              </div>
            )}

            <SettingsField label="Service name">
              <TextField value={portfolioForm.service_name} onChange={handlePortfolioChange('service_name')} placeholder="Enter portfolio service name" />
            </SettingsField>
            <SettingsField label="Brief description">
              <TextArea value={portfolioForm.brief_description} onChange={handlePortfolioChange('brief_description')} placeholder="Describe the portfolio item" />
            </SettingsField>
            <SettingsField label="Portfolio image">
              <ImageUploadField
                value={portfolioForm.image_url}
                onChange={(url) => setPortfolioForm((current) => ({ ...current, image_url: url }))}
                onAssetIdChange={(assetId) => setPortfolioForm((current) => ({ ...current, image_asset_id: assetId }))}
                assetType="portfolio_image"
                label="Click to upload portfolio image"
                isUploading={isPortfolioPending}
              />
            </SettingsField>

            <Button variant="solid" onClick={submitPortfolio} isPending={isPortfolioPending} className="w-fit min-w-[240px] px-8 max-sm:w-full">
              Create portfolio item
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export function BusinessDetails({
  activeSub = 'contact-details',
  account,
  profile,
  services,
  portfolio,
  categories = [],
  cities = [],
  pending,
  onSaveProfile,
  onSaveService,
  onCreatePortfolio,
}) {
  const role = account?.account_type || account?.role
  const isArtisan = hasArtisanRole(role)

  if (activeSub === 'my-service' && isArtisan) {
    return (
      <MyServiceSection
        services={services}
        portfolio={portfolio}
        categories={categories}
        isServicePending={pending.service}
        isPortfolioPending={pending.portfolio}
        onSaveService={onSaveService}
        onCreatePortfolio={onCreatePortfolio}
      />
    )
  }

  return (
    <ContactDetailsSection
      account={account}
      profile={profile}
      cities={cities}
      isPending={pending.profile}
      onSave={onSaveProfile}
    />
  )
}
