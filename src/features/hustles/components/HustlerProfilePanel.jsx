import { useMemo, useState } from 'react'
import { X, MapPin, Star, ChevronLeft, RefreshCw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { VerifiedBadge } from './VerifiedBadge'
import { Button } from '../../../shared/components/Button'
import { ShareDropdown } from './ShareDropdown.jsx'
import { MoreActionsDropdown } from './MoreActionsDropdown.jsx'
import { BookHustlerPanel } from './BookHustlerPanel.jsx'
import { publicProfileService } from '../../../shared/api/publicProfile.service.js'
import { queryKeys } from '../../../services/query-keys.js'
import { storage } from '../../../services/storage.js'
import useUIStore from '../../../shared/store/ui.store.js'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatRate(amount, currency, model) {
    if (!amount) return '—'
    const suffix = model === 'per_hour' ? '/hr' : '/service'
    return `${currency ?? 'GHS'} ${Number(amount).toLocaleString()}${suffix}`
}

function formatRelativeTime(dateStr) {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days < 1) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days} days ago`
    const months = Math.floor(days / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
}

function normalizeList(payload) {
    if (Array.isArray(payload)) return payload
    const candidate = payload?.items ?? payload?.docs ?? payload?.data?.items ?? payload?.data?.docs ?? payload?.data ?? []
    return Array.isArray(candidate) ? candidate : []
}

function resolveEndpoint(profile, candidates = []) {
    for (const candidate of candidates) {
        const value = candidate.split('.').reduce((acc, key) => acc?.[key], profile)
        if (typeof value === 'string' && value.trim()) return value
        if (value && typeof value === 'object') {
            const nested = value.endpoint ?? value.url ?? value.href ?? value.path ?? value.uri
            if (typeof nested === 'string' && nested.trim()) return nested
        }
    }
    return null
}

function firstDefined(...values) {
    return values.find(value => value !== undefined && value !== null && value !== '')
}

function getExperienceLabel(value) {
    const raw = String(value || '').toLowerCase()
    if (raw === 'entry' || raw === 'beginner') return 'Beginner'
    if (raw === 'mid' || raw === 'intermediate') return 'Intermediate'
    if (raw === 'senior' || raw === 'advanced') return 'Advanced'
    return value ? String(value) : '—'
}

function getPricingDisplayLabel(value) {
    const raw = String(value || '').toLowerCase()
    if (raw === 'starting_from') return 'Starting from'
    if (raw === 'fixed' || raw === 'full_amount') return 'Fixed price'
    if (raw === 'range') return 'Price range'
    return value ? String(value).replaceAll('_', ' ') : 'Service rate'
}

function formatCoverageLocation(service = {}) {
    const location = firstDefined(service?.location_text, service?.city_name, '')
    const country = firstDefined(service?.country_name, '')
    if (location && country) return `${location}, ${country}`
    return location || country || 'Not specified'
}

function formatPricingSummary(service = {}) {
    const label = getPricingDisplayLabel(service?.pricing_display_type ?? service?.pricing_model_default);

    return `${label}`;
}

function OverviewField({ label, value, note }) {
    return (
        <div className="rounded-2xl bg-mist px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-4">{label}</p>
            <p className="mt-1 text-[13px] font-semibold text-text-1">{value}</p>
            {note && <p className="mt-1 text-[11px] leading-relaxed text-text-4">{note}</p>}
        </div>
    )
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
    const issuedAt = certification?.issued_at ? new Date(certification.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null
    const expiresAt = certification?.expires_at ? new Date(certification.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null

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
                    {status.replaceAll('_', ' ')}
                </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-text-4">
                {issuedAt && <span>Issued {issuedAt}</span>}
                {expiresAt && <span>Expires {expiresAt}</span>}
            </div>
        </div>
    )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
    return <div className={`bg-mist dark:bg-white/5 rounded animate-pulse ${className}`} />
}

// ── Service detail sub-view ───────────────────────────────────────────────────
function ServiceDetailView({ service, hustlerProfile, onBack }) {
    const [bookingOpen, setBookingOpen] = useState(false)

    // Build the hustler shape BookHustlerPanel expects:
    // it uses hustler.id as provider_service_id
    const hustlerForBooking = { id: service.id, _raw: service }

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onBack} />
            <div className="fixed inset-y-0 right-0 w-full sm:w-[600px] bg-mist shadow-2xl z-50 flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-border">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-1 hover:bg-mist rounded-lg transition-colors">
                            <ChevronLeft size={20} className="text-text-1" />
                        </button>
                        <h3 className="text-[15px] font-bold text-text-1">Service Details</h3>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-surface p-6">
                    <div className="flex items-start justify-between mb-4">
                        <h2 className="text-[20px] font-bold text-text-1 flex-1 pr-4">{service.title}</h2>
                        <div className="text-right flex-shrink-0">
                            <p className="text-[16px] font-bold text-text-1">
                                {formatRate(service.default_rate_amount, service.currency_code, service.pricing_model_default)}
                            </p>
                        </div>
                    </div>

                    {service.image_url && (
                        <div className="rounded-xl overflow-hidden h-52 mb-5">
                            <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {service.short_description && (
                        <p className="text-[14px] text-text-3 leading-relaxed mb-5">
                            {service.short_description}
                        </p>
                    )}

                    {service.skills?.length > 0 && (
                        <div className="mb-5">
                            <p className="text-[13px] font-bold text-text-1 mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {service.skills.map((sk, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-mist border border-border rounded-full text-[12px] font-semibold text-text-2">
                                        {sk.name ?? sk}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button
                        variant="primary"
                        className="w-full mt-4"
                        onClick={() => setBookingOpen(true)}
                    >
                        Book this service
                    </Button>
                </div>
            </div>

            {/* BookHustlerPanel — slides in on top */}
            <BookHustlerPanel
                isOpen={bookingOpen}
                onClose={() => setBookingOpen(false)}
                onBack={() => setBookingOpen(false)}
                hustler={hustlerForBooking}
                hustlerProfile={hustlerProfile}
            />
        </>
    )
}

// ── Main panel ────────────────────────────────────────────────────────────────
/**
 * HustlerProfilePanel
 * Receives the raw service object from FeedPage (via toServiceCard._raw).
 * Fetches full detail from GET /services/{id} and reviews from GET /reviews.
 */
export function HustlerProfilePanel({ hustler, onClose }) {
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedService, setSelectedService] = useState(null)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportReason, setReportReason] = useState('')
    const { toastSuccess } = useUIStore()

    if (!hustler) return null

    // The service id comes from the card
    const serviceId = hustler.id
    const artisanId = hustler.artisanId ?? hustler._raw?.artisan_account_id
    const raw = hustler._raw ?? {}

    const { data: publicProfileData } = useQuery({
        queryKey: queryKeys.profiles.public(artisanId),
        queryFn: () => publicProfileService.getProfile(artisanId),
        enabled: Boolean(artisanId),
        staleTime: 5 * 60 * 1000,
    })

    const hustlerProfile = publicProfileData?.profile ?? publicProfileData ?? null
    const certificationsEndpoint = useMemo(() => resolveEndpoint(hustlerProfile, [
        'certifications_endpoint',
        'certifications_url',
        'certifications_link',
        'links.certifications',
        'endpoints.certifications',
    ]), [hustlerProfile])
    const { data: certificationsData, isLoading: certificationsLoading, isError: certificationsError } = useQuery({
        queryKey: queryKeys.profiles.certifications(artisanId, certificationsEndpoint),
        queryFn: () => publicProfileService.getLinkedResource(certificationsEndpoint),
        enabled: Boolean(artisanId) && Boolean(certificationsEndpoint),
        staleTime: 5 * 60 * 1000,
    })

    const { data: servicesData, isLoading: servicesLoading, isError: servicesError } = useQuery({
        queryKey: queryKeys.profiles.publicServices(artisanId),
        queryFn: () => publicProfileService.listServices(),
        enabled: Boolean(artisanId),
        staleTime: 5 * 60 * 1000,
    })

    // GET /services/{id} — full detail + skills + reviews
    const { data: serviceDetail, isLoading: detailLoading } = useQuery({
        queryKey: queryKeys.profiles.serviceDetail(artisanId, serviceId),
        queryFn: () => publicProfileService.getService(serviceId),
        enabled: Boolean(serviceId),
        staleTime: 5 * 60 * 1000,
    })

    // GET /reviews?target_type=artisan&review_subject_account_id={artisanId}
    const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
        queryKey: ['reviews', 'artisan', artisanId],
        queryFn: async () => {
            const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
            const token = storage.getToken()
            const response = await fetch(`${baseURL}/reviews?target_type=artisan&review_subject_account_id=${artisanId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return response.json()
        },
        enabled: Boolean(artisanId),
        staleTime: 5 * 60 * 1000,
    })

    const detail = serviceDetail?.item ?? serviceDetail?.data?.item ?? serviceDetail?.service ?? serviceDetail ?? null
    const skills = normalizeList(serviceDetail?.skills ?? detail?.skills)
    const latestReviews = normalizeList(serviceDetail?.reviews ?? detail?.reviews)
    const allReviews = normalizeList(reviewsData?.data?.data?.items ?? reviewsData?.data?.items ?? latestReviews)
    const certifications = useMemo(() => {
        const list = normalizeList(certificationsData)
        return list.length ? list : normalizeList(hustlerProfile?.certifications ?? hustlerProfile?.provider_certifications ?? hustlerProfile?.certification_items ?? hustlerProfile?.certification_snapshot)
    }, [certificationsData, hustlerProfile])
    const services = useMemo(() => {
        const list = normalizeList(servicesData).filter(service => String(firstDefined(
            service?.artisan_account_id,
            service?.provider_account_id,
            service?.artisan_id,
            service?.account_id
        ) ?? '') === String(artisanId))

        if (list.length) return list

        return normalizeList(
            hustlerProfile?.services
            ?? hustlerProfile?.provider_services
            ?? hustlerProfile?.service_snapshot
            ?? hustlerProfile?.service_snapshot_items
            ?? hustlerProfile?.services_snapshot
        ).filter(service => String(firstDefined(
            service?.artisan_account_id,
            service?.provider_account_id,
            service?.artisan_id,
            service?.account_id,
            artisanId
        ) ?? '') === String(artisanId))
    }, [servicesData, hustlerProfile, artisanId])
    const otherServices = useMemo(() => (
        services.filter(service => String(service?.id ?? service?.service_id ?? service?.provider_service_id ?? '') !== String(serviceId))
    ), [services, serviceId])

    // Artisan display info — prefer detail, fall back to card props
    const displayName = detail
        ? `${detail.first_name ?? ''} ${detail.last_name ?? ''}`.trim() || detail.title
        : hustler.name
    const displayRate = formatRate(
        detail?.default_rate_amount ?? raw.default_rate_amount,
        detail?.currency_code ?? raw.currency_code,
        detail?.pricing_model_default ?? raw.pricing_model_default,
    )
    const displayRating = Number(detail?.average_rating ?? raw.average_rating ?? hustler.rating ?? 0).toFixed(1)
    const reviewCount = detail?.review_count ?? raw.review_count ?? hustler.reviews ?? 0
    const displayLocation = detail?.city_name ?? raw.city_name ?? hustler.location ?? ''
    const avatarSrc = hustler.avatar
        ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0A2318&color=4ADE80&bold=true&size=128`
    const profileForBooking = useMemo(() => ({
        ...hustlerProfile,
        certifications,
        services,
    }), [hustlerProfile, certifications, services])

    // Service detail sub-view
    if (selectedService) {
        return <ServiceDetailView service={selectedService} hustlerProfile={profileForBooking} onBack={() => setSelectedService(null)} />
    }

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-[600px] bg-mist shadow-2xl z-50 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-surface border-b border-border">
                    <h3 className="text-[15px] font-bold text-text-1">Details</h3>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="solid"
                            className="h-9 px-5 text-[13px] w-fit"
                            onClick={() => setShowBookingModal(true)}
                        >
                            Book hustler
                        </Button>
                        <ShareDropdown hustlerId={serviceId} hustlerName={displayName} />
                        <MoreActionsDropdown
                            onShare={() => {
                                navigator.clipboard?.writeText(`${window.location.origin}/services/${serviceId}`)
                                toastSuccess('Link copied!')
                            }}
                            onHide={() => toastSuccess('Hustler hidden')}
                            onReport={() => setShowReportModal(true)}
                        />
                        <button onClick={onClose} className="p-2 hover:bg-mist rounded-lg transition-colors">
                            <X size={20} className="text-text-1" />
                        </button>
                    </div>
                </div>

                {/* Profile header */}
                <div className="px-6 py-5 bg-surface border-b border-border">
                    {detailLoading ? (
                        <div className="flex gap-4">
                            <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-56" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row items-start gap-4">
                            <div className="flex gap-4 flex-1 min-w-0">
                                <div className="relative h-fit flex-shrink-0">
                                    <img
                                        src={avatarSrc}
                                        alt={displayName}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <span className="absolute -bottom-1 -right-1">
                                        <VerifiedBadge size={18} />
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-[16px] font-bold text-text-1 mb-1">{displayName}</h2>
                                    <p className="text-[13px] text-text-3 mb-1.5 truncate">
                                        {skills.length > 0
                                            ? skills.map(s => s.name ?? s).join(' | ')
                                            : raw.category_name ?? ''}
                                    </p>
                                    {displayLocation && (
                                        <div className="flex items-center gap-1.5 text-[12px] text-text-4">
                                            <MapPin size={12} strokeWidth={2} />
                                            <span>{displayLocation}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-[14px] font-bold text-text-1 mb-1">{displayRate}</p>
                                <div className="flex items-center gap-1 justify-end mb-1.5">
                                    <Star size={13} className="text-secondary fill-secondary" />
                                    <span className="text-[13px] font-semibold text-text-1">{displayRating}</span>
                                    <span className="text-[11px] text-text-4">({reviewCount} reviews)</span>
                                </div>
                                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#16A34A] justify-end">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-light" />
                                    Available now
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex bg-surface border-b border-border px-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {[
                        { key: 'overview', label: 'Overview' },
                        { key: 'services', label: 'Services' },
                        { key: 'history', label: 'Hustles history' },
                        { key: 'reviews', label: 'Reviews' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-3 text-[13px] font-semibold transition-colors relative whitespace-nowrap flex-shrink-0 ${activeTab === tab.key ? 'text-primary-sat' : 'text-text-4 hover:text-text-3'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.key && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-sat" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto">

                    {/* ── Overview ── */}
                    {activeTab === 'overview' && (
                        <div className="p-6 bg-surface">
                            {detailLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-3 w-full" />)}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="rounded-3xl border border-border bg-white p-5 dark:bg-surface">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-bold text-text-1 uppercase tracking-wide">Service overview</p>
                                                <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-text-4">Title</p>
                                                <h4 className="mt-1 text-[18px] font-extrabold text-text-1">
                                                    {detail?.title ?? raw.title ?? 'Service'}
                                                </h4>
                                                <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-text-4">Description</p>
                                                <p className="mt-2 text-[13px] text-text-3 leading-relaxed">
                                                    {detail?.short_description ?? raw.short_description ?? detail?.description ?? raw.description ?? 'No description available.'}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-[11px] text-text-4">
                                                    {formatPricingSummary(detail ?? raw)}
                                                </p>
                                                <p className="text-[14px] font-bold text-primary">
                                                    {formatRate(
                                                        detail?.default_rate_amount ?? raw.default_rate_amount,
                                                        detail?.currency_code ?? raw.currency_code,
                                                        detail?.pricing_model_default ?? raw.pricing_model_default
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <OverviewField
                                                label="Category"
                                                value={detail?.category_name ?? raw.category_name ?? 'Not specified'}
                                                note="The type of service this hustler is offering."
                                            />
                                            <OverviewField
                                                label="Experience level"
                                                value={getExperienceLabel(detail?.experience_level ?? raw.experience_level)}
                                                note="The experience level attached to this service."
                                            />
                                            <OverviewField
                                                label="Available in"
                                                value={formatCoverageLocation(detail ?? raw)}
                                                note="The locations listed for this service."
                                            />
                                            {/* <OverviewField
                                                label="Pricing"
                                                value={`${formatPricingSummary(detail ?? raw)} ${formatRate(
                                                    detail?.default_rate_amount ?? raw.default_rate_amount,
                                                    detail?.currency_code ?? raw.currency_code,
                                                    detail?.pricing_model_default ?? raw.pricing_model_default
                                                )}`}
                                                note="How this service price is presented to clients."
                                            /> */}
                                        </div>

                                        {skills.length > 0 && (
                                            <div className="mt-5">
                                                <p className="text-[12px] font-bold uppercase tracking-wide text-text-4">Service skills</p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {skills.map((sk, i) => (
                                                        <span key={i} className="rounded-lg bg-mist px-3 py-1.5 text-[12px] font-medium text-text-2">
                                                            {sk.name ?? sk}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-3xl border border-border bg-white p-5 dark:bg-surface">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[13px] font-bold text-text-1">About hustler</p>
                                                <p className="mt-1 text-[12px] text-text-4">Details about the person providing this service.</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[13px] font-semibold text-text-1">{displayName}</p>
                                                <p className="mt-1 text-[11px] text-text-4">{displayRating} rating from {reviewCount} review{Number(reviewCount) === 1 ? '' : 's'}</p>
                                            </div>
                                        </div>

                                        <p className="mt-4 text-[13px] leading-relaxed text-text-3">
                                            {hustlerProfile?.bio ?? 'No bio available.'}
                                        </p>

                                        {hustlerProfile?.company_name && (
                                            <div className="mt-4 rounded-2xl bg-mist px-4 py-3">
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-text-4">Company</p>
                                                <p className="mt-1 text-[13px] font-semibold text-text-1">{hustlerProfile.company_name}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-3xl border border-border bg-white p-5 dark:bg-surface">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-[13px] font-bold text-text-1">Certifications</p>
                                                <p className="mt-1 text-[12px] text-text-4">Loaded from the linked certifications endpoint when available.</p>
                                            </div>
                                            <span className="text-[11px] font-semibold text-primary">{certifications.length}</span>
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
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Services ── */}
                    {activeTab === 'services' && (
                        <div className="p-6 bg-surface space-y-4">
                            {servicesLoading ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {[1, 2].map(i => (
                                        <div key={i} className="rounded-xl overflow-hidden border border-border">
                                            <Skeleton className="h-32 w-full rounded-none" />
                                            <div className="p-3 space-y-2">
                                                <Skeleton className="h-3 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                                <Skeleton className="h-8 w-full rounded-lg" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[14px] font-bold text-text-1">Other services</p>
                                        <p className="mt-1 text-[12px] text-text-4">More services from this hustler loaded from the public services endpoint.</p>
                                    </div>

                                    {servicesError ? (
                                        <p className="text-[13px] text-text-4">Unable to load services right now.</p>
                                    ) : otherServices.length === 0 ? (
                                        <p className="text-[13px] text-text-4">No other services available.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            {otherServices.map((svc, i) => (
                                                <div
                                                    key={svc?.id ?? svc?.service_id ?? svc?.provider_service_id ?? i}
                                                    className="bg-surface border border-border rounded-xl overflow-hidden"
                                                >
                                                    {svc.image_url ? (
                                                        <img src={svc.image_url} alt={svc.title} className="w-full h-32 object-cover" />
                                                    ) : (
                                                        <div className="w-full h-32 bg-mist flex items-center justify-center">
                                                            <span className="text-xl font-black text-primary opacity-20">HUSTLE</span>
                                                        </div>
                                                    )}
                                                    <div className="p-3">
                                                        <h5 className="text-[14px] font-bold text-text-1 mb-1">{svc.title}</h5>
                                                        <p className="text-[13px] font-semibold text-primary-sat mb-2">
                                                            {formatRate(svc.default_rate_amount, svc.currency_code, svc.pricing_model_default)}
                                                        </p>
                                                        <p className="text-[11px] text-text-4 leading-relaxed mb-3 line-clamp-2">
                                                            {svc.short_description ?? ''}
                                                        </p>
                                                        <button
                                                            onClick={() => setSelectedService({ ...svc, skills: svc.skills ?? [] })}
                                                            className="w-full h-8 bg-primary-sat hover:bg-primary-btn text-white text-[12px] font-semibold rounded-lg transition-colors"
                                                        >
                                                            View service
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Hustles history ── */}
                    {activeTab === 'history' && (
                        <div className="p-6 bg-surface flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-14 h-14 rounded-full bg-mist flex items-center justify-center mb-4">
                                <RefreshCw size={22} strokeWidth={1.5} className="text-text-4" />
                            </div>
                            <p className="text-[14px] font-semibold text-text-1 mb-1">No hustles history</p>
                            <p className="text-[13px] text-text-4">Completed hustles will appear here</p>
                        </div>
                    )}

                    {/* ── Reviews ── */}
                    {activeTab === 'reviews' && (
                        <div className="p-6 bg-surface space-y-4">
                            {reviewsLoading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="border border-border rounded-xl p-4 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-5/6" />
                                    </div>
                                ))
                            ) : allReviews.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-14 h-14 rounded-full bg-mist flex items-center justify-center mb-4">
                                        <Star size={22} strokeWidth={1.5} className="text-text-4" />
                                    </div>
                                    <p className="text-[14px] font-semibold text-text-1 mb-1">No reviews yet</p>
                                    <p className="text-[13px] text-text-4">Reviews will appear here after completed hustles</p>
                                </div>
                            ) : (
                                allReviews.map((review, i) => (
                                    <div key={review.id ?? i} className="bg-mist border border-border rounded-xl p-4">
                                        {review.hustle_title && (
                                            <h5 className="text-[14px] font-bold text-text-1 mb-2">{review.hustle_title}</h5>
                                        )}
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[13px] font-semibold text-text-2">
                                                {review.reviewer_name ?? review.reviewer_first_name
                                                    ? `${review.reviewer_first_name ?? ''} ${review.reviewer_last_name ?? ''}`.trim()
                                                    : 'Client'}
                                            </p>
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, idx) => (
                                                    <Star
                                                        key={idx}
                                                        size={12}
                                                        className={idx < (review.rating ?? 0)
                                                            ? 'text-secondary fill-secondary'
                                                            : 'text-text-4'}
                                                    />
                                                ))}
                                                <span className="text-[12px] font-semibold text-text-1 ml-1">
                                                    {Number(review.rating ?? 0).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                        {review.created_at && (
                                            <p className="text-[11px] text-text-4 mb-2">
                                                {formatRelativeTime(review.created_at)}
                                            </p>
                                        )}
                                        <p className="text-[12px] text-text-3 leading-relaxed">
                                            {review.feedback_text ?? review.comment ?? '—'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Panel */}
            <BookHustlerPanel
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                onBack={() => setShowBookingModal(false)}
                hustler={{ ...hustler, name: displayName }}
                hustlerProfile={profileForBooking}
            />

            {/* Report Modal */}
            {showReportModal && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setShowReportModal(false)} />
                    <div className="fixed top-20 right-6 w-[340px] bg-surface shadow-2xl z-[70] rounded-2xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <h4 className="text-[15px] font-bold text-text-1">Reason for report</h4>
                            <button onClick={() => setShowReportModal(false)} className="p-1.5 hover:bg-mist rounded-lg transition-colors">
                                <X size={18} className="text-text-1" />
                            </button>
                        </div>
                        <div className="p-5">
                            <label className="block text-[13px] font-medium text-text-3 mb-2">Enter reason</label>
                            <textarea
                                value={reportReason}
                                onChange={e => setReportReason(e.target.value)}
                                placeholder="Write something"
                                className="w-full h-28 px-4 py-3 border border-border rounded-xl text-[14px] text-text-1 placeholder:text-text-4 focus:outline-none focus:border-primary-sat resize-none mb-4"
                            />
                            <Button
                                variant="solid"
                                className="w-full"
                                disabled={!reportReason.trim()}
                                onClick={() => {
                                    toastSuccess('Report submitted successfully')
                                    setShowReportModal(false)
                                    setReportReason('')
                                }}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}



