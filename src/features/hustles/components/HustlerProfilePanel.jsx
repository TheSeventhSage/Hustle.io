import { useState } from 'react'
import { X, MapPin, Star, ChevronLeft, RefreshCw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { VerifiedBadge } from './VerifiedBadge'
import { Button } from '../../../shared/components/Button'
import { ShareDropdown } from './ShareDropdown.jsx'
import { MoreActionsDropdown } from './MoreActionsDropdown.jsx'
import { BookHustlerPanel } from './BookHustlerPanel.jsx'
import useUIStore from '../../../shared/store/ui.store.js'
import { apiClient } from '../../../services/api.client.js'

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

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
    return <div className={`bg-mist dark:bg-white/5 rounded animate-pulse ${className}`} />
}

// ── Service detail sub-view ───────────────────────────────────────────────────
function ServiceDetailView({ service, onBack }) {
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

    // GET /services/{id} — full detail + skills + reviews
    const { data: serviceDetail, isLoading: detailLoading } = useQuery({
        queryKey: ['services', 'detail', serviceId],
        queryFn: async () => {
            const res = await apiClient(`/services/${serviceId}`)
            return res
        },
        enabled: Boolean(serviceId),
        staleTime: 5 * 60 * 1000,
    })

    // GET /reviews?target_type=artisan&review_subject_account_id={artisanId}
    const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
        queryKey: ['reviews', 'artisan', artisanId],
        queryFn: async () => {
            const res = await apiClient(`/reviews?target_type=artisan&review_subject_account_id=${artisanId}`)
            return res
        },
        enabled: Boolean(artisanId),
        staleTime: 5 * 60 * 1000,
    })

    // Resolve data — apiClient returns { data: <envelope>, error }
    const detail = serviceDetail?.data?.data?.item ?? serviceDetail?.data?.item ?? null
    const skills = serviceDetail?.data?.data?.skills ?? serviceDetail?.data?.skills ?? []
    const latestReviews = serviceDetail?.data?.data?.reviews ?? serviceDetail?.data?.reviews ?? []
    const allReviews = reviewsData?.data?.data?.items ?? reviewsData?.data?.items ?? latestReviews

    // Artisan display info — prefer detail, fall back to card props
    const raw = hustler._raw ?? {}
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

    // Service detail sub-view
    if (selectedService) {
        return <ServiceDetailView service={selectedService} onBack={() => setSelectedService(null)} />
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
                                <>
                                    <h4 className="text-[15px] font-bold text-text-1 mb-3">
                                        About {displayName}
                                    </h4>
                                    <p className="text-[13px] text-text-3 leading-relaxed mb-5">
                                        {detail?.short_description ?? raw.short_description ?? 'No description available.'}
                                    </p>

                                    {skills.length > 0 && (
                                        <>
                                            <h4 className="text-[15px] font-bold text-text-1 mb-3">Skills &amp; Expertise</h4>
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {skills.map((sk, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-mist text-text-2 text-[12px] font-medium rounded-lg">
                                                        {sk.name ?? sk}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    <h4 className="text-[15px] font-bold text-text-1 mb-3">Category</h4>
                                    <p className="text-[13px] text-text-3 mb-5">
                                        {detail?.category_name ?? raw.category_name ?? '—'}
                                    </p>

                                    <h4 className="text-[15px] font-bold text-text-1 mb-3">Experience Level</h4>
                                    <p className="text-[13px] text-text-3 capitalize">
                                        {detail?.experience_level ?? raw.experience_level ?? '—'}
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── Services ── */}
                    {activeTab === 'services' && (
                        <div className="p-6 bg-surface">
                            {detailLoading ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(i => (
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
                                /* The current service is the only one we have from the list endpoint.
                                   Show it as a single card. If the detail endpoint returns more, they'd appear here. */
                                <div className="grid grid-cols-2 gap-4">
                                    {[detail ?? raw].filter(Boolean).map((svc, i) => (
                                        <div
                                            key={svc.id ?? i}
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
                                                    onClick={() => setSelectedService({ ...svc, skills })}
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
