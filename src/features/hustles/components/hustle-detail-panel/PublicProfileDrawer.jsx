import { AnimatePresence, motion } from 'framer-motion'
import { Briefcase, Globe, Mail, MapPin, Phone, Star, UserCircle2, CheckCircle2, Building2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../../../../shared/components/Button.jsx'
import { publicProfileService } from '../../../../shared/api/publicProfile.service.js'
import { queryKeys } from '../../../../services/query-keys.js'
import { formatCurrencyCodeAmount, formatDate, formatExperienceLevel, formatStatusLabel } from '../../../../shared/lib/format.js'
import { firstDefined, normalizeCollection, resolveLinkedEndpoint, serviceBelongsToAccount } from '../../../../shared/lib/normalize.js'

function formatStats(profile) {
  return [
    { label: 'Rating', value: profile?.stats?.rating != null ? Number(profile.stats.rating).toFixed(1) : 'N/A', icon: Star },
    { label: 'Reviews', value: profile?.stats?.reviews_count ?? 0, icon: Briefcase },
    { label: 'Jobs done', value: profile?.stats?.jobs_done ?? 0, icon: UserCircle2 },
  ]
}

function CertificationCard({ certification }) {
  const title = firstDefined(
    certification?.certification_type_name,
    certification?.certification_name,
    certification?.name,
    certification?.title,
    'Certification'
  )
  const status = String(certification?.status || certification?.review_status || 'approved')
  const issuedAt = certification?.issued_at ? formatDate(certification.issued_at, { locale: 'en-GB' }) : null
  const expiresAt = certification?.expires_at ? formatDate(certification.expires_at, { locale: 'en-GB' }) : null

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm dark:bg-surface">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-text-1 truncate">{title}</p>
          {certification?.certification_number && (
            <p className="mt-1 text-[12px] text-text-4">No. {certification.certification_number}</p>
          )}
        </div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary capitalize">
          {formatStatusLabel(status)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-text-4">
        {issuedAt && <span>Issued {issuedAt}</span>}
        {expiresAt && <span>Expires {expiresAt}</span>}
      </div>

      {certification?.file_url && (
        <a
          href={certification.file_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-[12px] font-semibold text-primary hover:underline"
        >
          View file
        </a>
      )}
    </div>
  )
}

function ServiceCard({ service }) {
  const title = firstDefined(service?.title, service?.service_name, service?.name, 'Service')
  const description = firstDefined(service?.short_description, service?.brief_description, service?.description, 'No description provided.')
  const experience = formatExperienceLevel(firstDefined(service?.experience_level, service?.required_experience_level, service?.level, 'N/A'))
  const amount = firstDefined(service?.default_rate_amount, service?.price, service?.amount)
  const currency = firstDefined(service?.currency_code, 'NGN')

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm dark:bg-surface">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Building2 size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-text-1 truncate">{title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-text-3 line-clamp-3">{description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-mist px-2.5 py-1 text-[11px] font-semibold text-text-2">
              {experience}
            </span>
            {amount != null && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                {formatCurrencyCodeAmount(amount, currency)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PublicProfileDrawer({ isOpen, accountId, serviceId, onClose }) {
  const [activeTab, setActiveTab] = useState('profile')
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.profiles.public(accountId),
    queryFn: () => publicProfileService.getProfile(accountId),
    enabled: isOpen && Boolean(accountId),
    staleTime: 60 * 1000,
  })

  const profile = data?.profile ?? data ?? null
  const normalizedRole = String(
    profile?.account_type
    ?? profile?.role
    ?? profile?.user_type
    ?? ''
  ).toLowerCase()
  const isClientProfile = normalizedRole === 'client'
  const showProfessionalTabs = !isClientProfile
  const certificationsEndpoint = useMemo(() => resolveLinkedEndpoint(profile, [
    'certifications_endpoint',
    'certifications_url',
    'certifications_link',
    'links.certifications',
    'endpoints.certifications',
  ]), [profile])
  const embeddedCertifications = normalizeCollection(
    profile?.certifications
      ?? profile?.provider_certifications
      ?? profile?.certification_items
      ?? profile?.certification_snapshot
  )
  const embeddedServices = normalizeCollection(
    profile?.services
      ?? profile?.provider_services
      ?? profile?.service_snapshot
      ?? profile?.service_snapshot_items
      ?? profile?.services_snapshot
  )

  const { data: certificationsData, isLoading: certificationsLoading, isError: certificationsError } = useQuery({
    queryKey: queryKeys.profiles.certifications(accountId, certificationsEndpoint),
    queryFn: () => publicProfileService.getLinkedResource(certificationsEndpoint),
    select: (response) => normalizeCollection(response),
    enabled: isOpen && showProfessionalTabs && Boolean(accountId) && Boolean(certificationsEndpoint),
    staleTime: 60 * 1000,
  })

  const { data: publicServicesData, isLoading: servicesLoading, isError: servicesError } = useQuery({
    queryKey: queryKeys.profiles.publicServices(accountId),
    queryFn: () => publicProfileService.listServices({ artisan_account_id: accountId }),
    select: (response) => normalizeCollection(response).filter((service) => serviceBelongsToAccount(service, accountId)),
    enabled: isOpen && showProfessionalTabs && Boolean(accountId),
    staleTime: 60 * 1000,
  })

  const certifications = useMemo(() => {
    const linked = normalizeCollection(certificationsData)
    return linked.length ? linked : embeddedCertifications
  }, [certificationsData, embeddedCertifications])

  const services = useMemo(() => {
    const fromEndpoint = normalizeCollection(publicServicesData)
    if (fromEndpoint.length) return fromEndpoint
    return embeddedServices.filter((service) => serviceBelongsToAccount(service, accountId))
  }, [publicServicesData, embeddedServices, accountId])

  useEffect(() => {
    if (!isOpen) return
    setActiveTab('profile')
  }, [isOpen, accountId, serviceId])

  const avatarSrc = profile?.avatar_url
    ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=0A2318&color=4ADE80&bold=true&size=128`

  const stats = formatStats(profile)
  const contactVisible = Boolean(profile?.private_visible && profile?.contact)
  const tabCounts = {
    services: services.length,
    certifications: certifications.length,
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/35"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[71] w-full sm:w-[480px] bg-[var(--color-surface)] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Public profile"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <p className="text-[15px] font-bold text-text-1">Public profile</p>
                  <p className="text-[12px] text-text-4">From the public profile endpoint</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-3 hover:bg-mist"
                  aria-label="Close profile drawer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-20 animate-pulse rounded-2xl bg-mist" />
                    <div className="h-32 animate-pulse rounded-2xl bg-mist" />
                    <div className="h-24 animate-pulse rounded-2xl bg-mist" />
                  </div>
                ) : isError ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                    <p className="text-[14px] font-semibold text-text-1">Failed to load profile</p>
                    <p className="text-[12px] text-text-4">Try again or close the drawer.</p>
                  <Button variant="solid" onClick={() => refetch()} className="h-10 rounded-full px-5 text-[13px]">
                      Retry
                    </Button>
                  </div>
                ) : profile ? (
                  <div className="space-y-5">
                    <div className="rounded-3xl border border-border bg-white p-5 shadow-sm dark:bg-surface">
                      <div className="flex items-start gap-4">
                        <div className="relative h-18 w-18 flex-shrink-0 overflow-hidden rounded-2xl bg-mist">
                          <img src={avatarSrc} alt={profile?.name || 'Profile'} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-[18px] font-extrabold text-text-1">{profile?.name || 'Profile'}</h2>
                            {profile?.is_public && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">Public</span>}
                          </div>
                          <p className="mt-1 text-[13px] text-text-3">{profile?.role || 'Artisan'}</p>
                          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-text-4">
                            <MapPin size={12} />
                            <span>{[profile?.city?.name, profile?.country?.name].filter(Boolean).join(', ') || 'Location not available'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {[
                        { key: 'profile', label: 'Profile' },
                        ...(showProfessionalTabs ? [
                          { key: 'services', label: `Services (${tabCounts.services})` },
                          { key: 'certifications', label: `Certifications (${tabCounts.certifications})` },
                        ] : []),
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-semibold transition-colors ${activeTab === tab.key ? 'bg-primary text-white' : 'bg-mist text-text-3 hover:bg-primary/10 hover:text-primary'
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {activeTab === 'profile' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          {stats.map((stat) => {
                            const Icon = stat.icon
                            return (
                              <div key={stat.label} className="rounded-2xl border border-border bg-white p-4 dark:bg-surface">
                                <div className="flex items-center gap-2 text-text-4">
                                  <Icon size={13} />
                                  <span className="text-[11px] font-semibold">{stat.label}</span>
                                </div>
                                <p className="mt-2 text-[16px] font-bold text-text-1">{stat.value}</p>
                              </div>
                            )
                          })}
                        </div>

                        {profile?.bio && (
                          <div className="rounded-3xl border border-border bg-white p-5 dark:bg-surface">
                            <p className="text-[13px] font-bold text-text-1">About</p>
                            <p className="mt-2 text-[13px] leading-relaxed text-text-3">{profile.bio}</p>
                          </div>
                        )}

                        {profile?.company_name && (
                          <div className="rounded-3xl border border-border bg-white p-5 dark:bg-surface">
                            <p className="text-[13px] font-bold text-text-1">Company</p>
                            <p className="mt-2 text-[13px] text-text-3">{profile.company_name}</p>
                          </div>
                        )}

                        {contactVisible && (
                          <div className="rounded-3xl border border-border bg-white p-5 dark:bg-surface">
                            <p className="text-[13px] font-bold text-text-1">Contact details</p>
                            <div className="mt-3 space-y-3">
                              {profile.contact.email && (
                                <div className="flex items-center gap-2 text-[13px] text-text-3">
                                  <Mail size={14} className="text-text-4" />
                                  <span>{profile.contact.email}</span>
                                </div>
                              )}
                              {profile.contact.phone_number && (
                                <div className="flex items-center gap-2 text-[13px] text-text-3">
                                  <Phone size={14} className="text-text-4" />
                                  <span>{profile.contact.phone_number}</span>
                                </div>
                              )}
                              {profile.contact.location_text && (
                                <div className="flex items-center gap-2 text-[13px] text-text-3">
                                  <Globe size={14} className="text-text-4" />
                                  <span>{profile.contact.location_text}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'services' && (
                      <div className="space-y-4">
                        {servicesLoading ? (
                          <div className="space-y-3">
                            <div className="h-24 animate-pulse rounded-3xl bg-mist" />
                            <div className="h-24 animate-pulse rounded-3xl bg-mist" />
                          </div>
                        ) : servicesError && !services.length ? (
                          <p className="text-[13px] text-text-4">Unable to load services right now.</p>
                        ) : services.length ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-[13px] font-bold text-text-1">Services</p>
                              <Briefcase size={15} className="text-primary" />
                            </div>
                            {services.map((service, index) => (
                              <ServiceCard
                                key={service?.id ?? service?.service_id ?? service?.provider_service_id ?? index}
                                service={service}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-[13px] text-text-4">No services listed.</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'certifications' && (
                      <div className="rounded-3xl border border-border bg-white p-5 dark:bg-surface">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[13px] font-bold text-text-1">Certifications</p>
                            <p className="mt-1 text-[12px] text-text-4">Loaded from the linked certifications endpoint when available.</p>
                          </div>
                          <CheckCircle2 size={16} className="text-primary" />
                        </div>

                        {certificationsLoading ? (
                          <div className="mt-4 space-y-3">
                            <div className="h-20 animate-pulse rounded-2xl bg-mist" />
                            <div className="h-20 animate-pulse rounded-2xl bg-mist" />
                          </div>
                        ) : certificationsError ? (
                          <p className="mt-4 text-[13px] text-text-4">Unable to load certifications right now.</p>
                        ) : certifications.length ? (
                          <div className="mt-4 space-y-3">
                            {certifications.map((certification, index) => (
                              <CertificationCard
                                key={certification?.id ?? certification?.certification_number ?? index}
                                certification={certification}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="mt-4 text-[13px] text-text-4">No certifications listed.</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-[13px] text-text-4">
                    No profile data available.
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
