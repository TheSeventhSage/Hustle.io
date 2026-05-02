import { useEffect, useMemo, useState } from 'react'
import { Mail, Phone, Pencil } from 'lucide-react'

import { Button } from '../../../../shared/components/Button.jsx'

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

function ServiceCard({ service, categories, onEdit }) {
  const categoryName = resolveCategoryName(service.category_id, categories)

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: '14px', padding: '16px', background: 'var(--color-surface)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <h4 style={{ fontSize: '16px', color: 'var(--color-text-1)', fontWeight: 700, fontFamily: 'var(--ff-body)' }}>{service.title || 'Untitled service'}</h4>
        <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 700, fontFamily: 'var(--ff-body)' }}>
          {service.currency_code || 'NGN'} {service.default_rate_amount ?? 0}
        </span>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--color-text-2)', marginBottom: '10px', fontFamily: 'var(--ff-body)' }}>{service.short_description || 'No description yet.'}</p>
      <p style={{ fontSize: '12px', color: 'var(--color-text-4)', marginBottom: '12px', fontFamily: 'var(--ff-body)' }}>
        {categoryName || `Category #${service.category_id || '-'}`} | {service.pricing_model_default || '-'} | {service.experience_level || '-'}
      </p>
      <button
        type="button"
        onClick={() => onEdit(service)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          border: 'none',
          background: 'transparent',
          color: 'var(--color-primary)',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'var(--ff-body)',
        }}
      >
        <Pencil size={14} />
        Change this service
      </button>
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
    }
  }

  return {
    first_name: profile?.first_name || account?.first_name || '',
    last_name: profile?.last_name || account?.last_name || '',
    phone_number: profile?.phone_number || account?.phone_number || '',
    bio: profile?.bio || '',
    default_city_id: profile?.default_city_id?.toString?.() || '',
    profile_image_url: profile?.profile_image_url || '',
  }
}

function ContactDetailsSection({ account, profile, cities, isPending, onSave }) {
  const role = account?.account_type || account?.role
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
        profile_image_url: form.profile_image_url || undefined,
      })
      return
    }

    onSave({
      first_name: form.first_name,
      last_name: form.last_name,
      phone_number: form.phone_number || undefined,
      bio: form.bio || undefined,
      default_city_id: form.default_city_id ? Number(form.default_city_id) : undefined,
      profile_image_url: form.profile_image_url || undefined,
    })
  }

  return (
    <div>
      <SectionTitle title="Contact details" subtitle="Prefilled from `GET /profile` and mapped with the live city lookup." />

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
          <SettingsField label="Profile image URL">
            <TextField value={form.profile_image_url} onChange={handleChange('profile_image_url')} placeholder="https://example.com/company.jpg" />
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
          <SettingsField label="Default city">
            <SelectField value={form.default_city_id} onChange={handleChange('default_city_id')}>
              <option value="">Select city</option>
              {cities.map((city) => <option key={city.id} value={String(city.id)}>{city.name}</option>)}
            </SelectField>
          </SettingsField>
          <SettingsField label="Profile image URL">
            <TextField value={form.profile_image_url} onChange={handleChange('profile_image_url')} placeholder="https://example.com/profile.jpg" />
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
    is_active: true,
  })
  const [portfolioForm, setPortfolioForm] = useState({
    service_name: '',
    brief_description: '',
    image_url: '',
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
        is_active: true,
      })
      return
    }

    setServiceForm({
      id: activeService.id,
      category_id: activeService.category_id?.toString?.() || '',
      title: activeService.title || '',
      short_description: activeService.short_description || '',
      experience_level: activeService.experience_level || '',
      pricing_model_default: activeService.pricing_model_default || '',
      default_rate_amount: activeService.default_rate_amount?.toString?.() || '',
      currency_code: activeService.currency_code || 'NGN',
      image_url: activeService.image_url || '',
      is_active: activeService.is_active ?? true,
    })
  }, [activeService])

  const serviceCards = useMemo(() => services.slice(0, 6), [services])

  const handleServiceChange = (field) => (event) => {
    const value = field === 'is_active' ? event.target.checked : event.target.value
    setServiceForm((current) => ({ ...current, [field]: value }))
  }

  const handlePortfolioChange = (field) => (event) => {
    setPortfolioForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleEditService = (service) => {
    setActiveTab('services')
    setServiceForm({
      id: service.id,
      category_id: service.category_id?.toString?.() || '',
      title: service.title || '',
      short_description: service.short_description || '',
      experience_level: service.experience_level || '',
      pricing_model_default: service.pricing_model_default || '',
      default_rate_amount: service.default_rate_amount?.toString?.() || '',
      currency_code: service.currency_code || 'NGN',
      image_url: service.image_url || '',
      is_active: service.is_active ?? true,
    })
  }

  const submitService = () => {
    onSaveService({
      id: serviceForm.id,
      category_id: Number(serviceForm.category_id),
      title: serviceForm.title,
      short_description: serviceForm.short_description || undefined,
      experience_level: serviceForm.experience_level || undefined,
      pricing_model_default: serviceForm.pricing_model_default || undefined,
      default_rate_amount: serviceForm.default_rate_amount ? Number(serviceForm.default_rate_amount) : undefined,
      currency_code: serviceForm.currency_code || undefined,
      image_url: serviceForm.image_url || undefined,
      is_active: serviceForm.is_active,
    })
  }

  const submitPortfolio = () => {
    onCreatePortfolio({
      service_name: portfolioForm.service_name,
      brief_description: portfolioForm.brief_description || undefined,
      image_url: portfolioForm.image_url || undefined,
    })
    setPortfolioForm({
      service_name: '',
      brief_description: '',
      image_url: '',
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
            {serviceCards.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {serviceCards.map((service) => (
                  <ServiceCard key={service.id || service.title} service={service} categories={categories} onEdit={handleEditService} />
                ))}
              </div>
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
            <SettingsField label="Image URL">
              <TextField value={serviceForm.image_url} onChange={handleServiceChange('image_url')} placeholder="https://example.com/service.jpg" />
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
            <SettingsField label="Image URL">
              <TextField value={portfolioForm.image_url} onChange={handlePortfolioChange('image_url')} placeholder="https://example.com/portfolio.jpg" />
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
  const isArtisan = role === 'artisan'

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
