import { useMemo, useState } from 'react'
import { X, MapPin, Star, ChevronLeft, RefreshCw, BriefcaseBusiness, Clock3, Layers3, ShieldCheck, Sparkles, UserCircle2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { VerifiedBadge } from './VerifiedBadge'
import { Button } from '../../../shared/components/Button'
import { ShareDropdown } from './ShareDropdown.jsx'
import { MoreActionsDropdown } from './MoreActionsDropdown.jsx'
import { BookHustlerPanel } from './BookHustlerPanel.jsx'
import { publicProfileService } from '../../../shared/api/publicProfile.service.js'
import { hustlesService } from '../hustles.service.js'
import { queryKeys } from '../../../services/query-keys.js'
import useUIStore from '../../../shared/store/ui.store.js'
import { formatDate, formatExperienceLevel as sharedFormatExperienceLevel, formatRelativeTime as sharedFormatRelativeTime, formatServiceRate as sharedFormatServiceRate } from '../../../shared/lib/format.js'
import { normalizeArtisanServicesPayload } from '../../../shared/lib/publicServices.js'
import { firstDefined as sharedFirstDefined, normalizeCollection as sharedNormalizeCollection, resolveLinkedEndpoint as sharedResolveLinkedEndpoint } from '../../../shared/lib/normalize.js'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatRate(amount, currency, model) {
    if (!amount) return '—'
    const suffix = model === 'per_hour' ? '/hr' : '/service'
    return sharedFormatServiceRate(amount, currency, model)
}

function formatRelativeTime(dateStr) {
    return sharedFormatRelativeTime(dateStr)
}

function normalizeList(payload) {
    return sharedNormalizeCollection(payload)
}

function resolveEndpoint(profile, candidates = []) {
    return sharedResolveLinkedEndpoint(profile, candidates)
}

function firstDefined(...values) {
    return sharedFirstDefined(...values)
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
    const serviceAccountId = service?.artisan_account_id ?? service?.provider_account_id ?? service?.artisan_id ?? 'service'
    const { data: serviceDetailData } = useQuery({
        queryKey: queryKeys.profiles.serviceDetail(serviceAccountId, service?.id),
        queryFn: () => publicProfileService.getService(service.id),
        enabled: Boolean(service?.id),
        staleTime: 5 * 60 * 1000,
    })
    const detail = serviceDetailData?.item ?? serviceDetailData?.service ?? serviceDetailData ?? service ?? null
    const detailSkills = normalizeList(serviceDetailData?.skills ?? detail?.skills ?? service?.skills)
    const detailReviews = normalizeList(serviceDetailData?.reviews ?? detail?.reviews)
    const providerName = `${detail?.first_name ?? ''} ${detail?.last_name ?? ''}`.trim() || detail?.providerName || 'Service provider'
    const pricingTopic = getPricingDisplayLabel(detail?.pricing_display_type ?? detail?.pricing_model_default)
    const experienceTopic = getExperienceLabel(detail?.experience_level)
    const locationTopic = formatCoverageLocation(detail)
    const availabilityTopic = Number(detail?.is_active ?? 1) === 1 ? 'Available for bookings' : 'Currently unavailable'
    const reviewCountValue = Number(detail?.review_count ?? detailReviews.length ?? 0)
    const averageRatingValue = detail?.average_rating
        ? Number(detail.average_rating).toFixed(1)
        : reviewCountValue > 0
            ? (detailReviews.reduce((sum, review) => sum + Number(review?.rating ?? 0), 0) / reviewCountValue).toFixed(1)
            : 'New'
    const baseRateValue = detail?.default_rate_amount
        ? formatRate(detail.default_rate_amount, detail.currency_code, detail.pricing_model_default)
        : 'Not specified'
    const priceRangeValue = detail?.rate_max_amount
        ? `${formatRate(detail.rate_min_amount ?? detail.default_rate_amount, detail.currency_code, detail.pricing_model_default)} to ${formatRate(detail.rate_max_amount, detail.currency_code, detail.pricing_model_default)}`
        : detail?.rate_min_amount
            ? formatRate(detail.rate_min_amount, detail.currency_code, detail.pricing_model_default)
            : baseRateValue
    const currencyTopic = detail?.currency_code ?? 'Not specified'
    const coordinatesTopic = detail?.has_coordinates && detail?.latitude && detail?.longitude
        ? `${detail.latitude}, ${detail.longitude}`
        : 'Not specified'
    const pricingNote = detail?.price_note ?? 'No extra pricing note was added by the provider.'

    // Build the hustler shape BookHustlerPanel expects:
    // it uses hustler.id as provider_service_id
    const hustlerForBooking = { id: detail?.id ?? service?.id, _raw: detail }

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
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-text-4">Service Summary</p>
                    <div className="flex items-start justify-between mb-4">
                        <h2 className="text-[20px] font-bold text-text-1 flex-1 pr-4">{detail?.title ?? service?.title}</h2>
                        <div className="text-right flex-shrink-0">
                            <p className="text-[16px] font-bold text-text-1">
                                {detail?.priceLabel ?? formatRate(detail?.default_rate_amount, detail?.currency_code, detail?.pricing_model_default)}
                            </p>
                        </div>
                    </div>

                    <div className="mb-5 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-mist px-3 py-1.5 text-[12px] font-semibold text-text-2">
                            <BriefcaseBusiness size={13} className="text-primary" />
                            {detail?.category_name ?? detail?.categoryName ?? 'General service'}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-mist px-3 py-1.5 text-[12px] font-semibold text-text-2">
                            <Star size={13} className="fill-[var(--color-secondary)] text-[var(--color-secondary)]" />
                            {averageRatingValue} rating
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-mist px-3 py-1.5 text-[12px] font-semibold text-text-2">
                            <Layers3 size={13} className="text-primary" />
                            {reviewCountValue} review{reviewCountValue === 1 ? '' : 's'}
                        </span>
                    </div>

                    {(detail?.image_url || detail?.image) && (
                        <div className="rounded-xl overflow-hidden h-52 mb-5">
                            <img src={detail?.image_url ?? detail?.image} alt={detail?.title ?? service?.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {(detail?.short_description || detail?.description) && (
                        <div className="mb-5 rounded-2xl border border-border bg-white p-4 shadow-sm dark:bg-surface">
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-text-4">About this service</p>
                            <p className="mt-3 text-[14px] leading-7 text-text-3">
                                {detail?.short_description ?? detail?.description}
                            </p>
                        </div>
                    )}

                    <div className="mb-5">
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-text-4">Service Topics</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <OverviewField
                                label="Category"
                                value={detail?.category_name ?? detail?.categoryName ?? 'Not specified'}
                                note="The main service category."
                            />
                            <OverviewField
                                label="Experience"
                                value={experienceTopic}
                                note="The level attached to this listing."
                            />
                            {/* <OverviewField
                                label="Pricing model"
                                value={pricingTopic}
                                note="How the price is presented to clients."
                            /> */}
                            <OverviewField
                                label="Base rate"
                                value={baseRateValue}
                                note="The default amount returned for the service."
                            />
                            {/* <OverviewField
                                label="Price range"
                                value={priceRangeValue}
                                note="The minimum to maximum amount if a range exists."
                            /> */}
                            <OverviewField
                                label="Currency"
                                value={currencyTopic}
                                note="The billing currency attached to the service."
                            />
                            <OverviewField
                                label="Availability"
                                value={availabilityTopic}
                                note="Current booking status."
                            />
                            <OverviewField
                                label="Coverage"
                                value={locationTopic}
                                note="Where the service is offered."
                            />
                            <OverviewField
                                label="Published"
                                value={detail?.posted_at ? formatDate(detail.posted_at) : 'Not specified'}
                                note="When this listing went live."
                            />
                            {/* <OverviewField
                                label="Coordinates"
                                value={coordinatesTopic}
                                note="Precise location data when the provider shares it."
                            /> */}
                        </div>
                    </div>

                    {/* <div className="mb-5 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-mist/70 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-text-4">Pricing Notes</p>
                            <p className="mt-2 text-[16px] font-bold text-text-1">{pricingTopic}</p>
                            <p className="mt-2 text-[13px] leading-6 text-text-3">{pricingNote}</p>
                        </div>

                        <div className="rounded-2xl border border-border bg-mist/70 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-text-4">Provider Profile</p>
                            <p className="mt-2 text-[16px] font-bold text-text-1">{providerName}</p>
                            <p className="mt-2 text-[13px] leading-6 text-text-3">
                                {detail?.bio ?? hustlerProfile?.bio ?? 'No provider bio was returned for this service yet.'}
                            </p>
                        </div>
                    </div> */}

                    <div className="mb-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-text-4 mb-3">Skills Included</p>
                        {detailSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {detailSkills.map((sk, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-mist border border-border rounded-full text-[12px] font-semibold text-text-2">
                                        {sk.name ?? sk}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="rounded-2xl border border-dashed border-border bg-mist/50 px-4 py-3 text-[13px] text-text-4">
                                No specific skill tags were returned for this service.
                            </p>
                        )}
                    </div>

                    <div className="mb-5">
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-text-4">Client Reviews</p>
                        {detailReviews.length > 0 ? (
                            <div className="space-y-3">
                                {detailReviews.map((review, index) => (
                                    <article key={review?.id ?? index} className="rounded-2xl border border-border bg-white p-4 shadow-sm dark:bg-surface">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-[12px] font-bold text-text-1">
                                                <Star size={12} className="fill-[var(--color-secondary)] text-[var(--color-secondary)]" />
                                                {Number(review?.rating ?? 0).toFixed(1)}
                                            </div>
                                            <div className="text-[11px] text-text-4">
                                                {review?.created_at ? formatDate(review.created_at) : 'Recent review'}
                                            </div>
                                        </div>
                                        <p className="mt-3 text-[13px] leading-6 text-text-3">
                                            {review?.feedback_text ?? review?.comment ?? 'No written review was provided.'}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[13px] text-text-4">No reviews were returned for this service.</p>
                        )}
                    </div>

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
    // Server-supplied endpoint for the provider's full services list. Prefer it
    // over reconstructing the path so the complete catalog is driven by the API
    // contract, not one representative service.
    const servicesEndpoint = hustler.servicesEndpoint ?? raw.services_endpoint ?? null

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
        select: (response) => sharedNormalizeCollection(response),
        enabled: Boolean(artisanId) && Boolean(certificationsEndpoint),
        staleTime: 5 * 60 * 1000,
    })

    const { data: artisanServicesData, isLoading: servicesLoading, isError: servicesError } = useQuery({
        queryKey: queryKeys.marketplace.artisanServices(artisanId, { endpoint: servicesEndpoint ?? undefined, per_page: 24 }),
        queryFn: () => (servicesEndpoint
            ? publicProfileService.getArtisanServicesByEndpoint(servicesEndpoint, { per_page: 24 })
            : publicProfileService.getArtisanServices(artisanId, { per_page: 24 })),
        select: (response) => normalizeArtisanServicesPayload(response),
        enabled: Boolean(artisanId) || Boolean(servicesEndpoint),
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
        queryKey: queryKeys.profiles.reviews(artisanId),
        queryFn: () => hustlesService.getPublicReviews({
            target_type: 'artisan',
            review_subject_account_id: artisanId,
        }),
        select: (response) => sharedNormalizeCollection(response),
        enabled: Boolean(artisanId),
        staleTime: 5 * 60 * 1000,
    })

    const detail = serviceDetail?.item ?? serviceDetail?.service ?? serviceDetail ?? null
    const skills = normalizeList(serviceDetail?.skills ?? detail?.skills)
    const latestReviews = normalizeList(serviceDetail?.reviews ?? detail?.reviews)
    const allReviews = sharedNormalizeCollection(reviewsData?.length ? reviewsData : latestReviews)
    const certifications = useMemo(() => {
        const list = normalizeList(certificationsData)
        return list.length ? list : normalizeList(hustlerProfile?.certifications ?? hustlerProfile?.provider_certifications ?? hustlerProfile?.certification_items ?? hustlerProfile?.certification_snapshot)
    }, [certificationsData, hustlerProfile])
    const services = useMemo(() => {
        const list = normalizeList(artisanServicesData?.items)

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
    }, [artisanServicesData?.items, hustlerProfile, artisanId])
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
                                        <p className="mt-1 text-[12px] text-text-4">More services from this hustler loaded from the artisan services endpoint.</p>
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
                                                    {(svc.image_url || svc.image) ? (
                                                        <img src={svc.image_url ?? svc.image} alt={svc.title} className="w-full h-32 object-cover" />
                                                    ) : (
                                                        <div className="w-full h-32 bg-mist flex items-center justify-center">
                                                            <span className="text-xl font-black text-primary opacity-20">HUSTLE</span>
                                                        </div>
                                                    )}
                                                    <div className="p-3">
                                                        <h5 className="text-[14px] font-bold text-text-1 mb-1">{svc.title}</h5>
                                                        <p className="text-[13px] font-semibold text-primary-sat mb-2">
                                                            {svc.priceLabel ?? formatRate(svc.default_rate_amount, svc.currency_code, svc.pricing_model_default)}
                                                        </p>
                                                        <p className="text-[11px] text-text-4 leading-relaxed mb-3 line-clamp-2">
                                                            {svc.description ?? svc.short_description ?? ''}
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



