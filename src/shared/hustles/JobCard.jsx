import { MapPin, Share2, Clock, Calendar, UserCircle2 } from 'lucide-react'
import { Button } from '../components/Button'

const STATUS_STYLES = {
    pending: { label: 'Pending', cls: 'bg-secondary/10 text-secondary-dark border-secondary/30' },
    awaiting_payment: { label: 'Awaiting Payment', cls: 'bg-secondary/10 text-secondary-dark border-secondary/30' },
    in_progress: { label: 'In Progress', cls: 'bg-primary/10 text-primary border-primary/30' },
    completed: { label: 'Completed', cls: 'bg-success-soft text-success border-success/30' },
    cancelled: { label: 'Cancelled', cls: 'bg-error-soft text-error border-error/30' },
}

function normalizeStatus(status, paymentStatus) {
    const raw = String(status || '').toLowerCase()

    // Check if payment is pending/awaiting
    const isAwaitingPayment = !paymentStatus || paymentStatus === 'pending' || paymentStatus === 'awaiting_payment'

    if (['completed', 'complete', 'done'].includes(raw)) return 'completed'
    if (['cancelled', 'canceled'].includes(raw)) return 'cancelled'

    // Show awaiting_payment status if payment is not approved
    if (['pending', 'pending_approval', 'awaiting_approval', 'awaiting_requester', 'awaiting_service_requester', 'awaiting_payment'].includes(raw) && isAwaitingPayment) {
        return 'awaiting_payment'
    }

    if (['pending', 'pending_approval', 'awaiting_approval', 'awaiting_requester', 'awaiting_service_requester'].includes(raw)) return 'pending'
    if (['in_progress', 'accepted', 'ongoing', 'active'].includes(raw)) return 'in_progress'

    return 'pending'
}

function formatRelativeTime(dateString) {
    if (!dateString) return 'Just now'
    const diff = Date.now() - new Date(dateString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 2) return 'Just now'
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
    const days = Math.floor(hrs / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
}

function formatAmount(value, currency = 'NGN') {
    if (!value && value !== 0) return '—'
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    }).format(value)
}

function formatDuration(minutes) {
    if (!minutes) return '—'
    if (minutes < 60) return `${minutes} min`
    const hrs = Math.floor(minutes / 60)
    const rem = minutes % 60
    return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`
}

function formatDateTime(dateString) {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const PAYMENT_STATUS_STYLES = {
    pending: { label: 'Payment Pending', cls: 'bg-secondary/10 text-secondary-dark' },
    approved: { label: 'Paid', cls: 'bg-primary/10 text-primary' },
    paid: { label: 'Paid', cls: 'bg-primary/10 text-primary' },
    failed: { label: 'Payment Failed', cls: 'bg-error-soft text-error' },
}

export function JobCard({ job, onViewDetails, onMakePayment }) {
    const {
        id,
        title,
        status,
        service_location_text,
        scheduled_start_at,
        expected_duration_minutes,
        timezone_name,
        payment_status,
        base_amount,
        total_amount_due,
        currency_code,
        created_at,
        category_id,
        // Consistent display fields returned by the list endpoints (see backend note).
        offered_amount,
        budget_amount,
        provider_net_estimate,
        amount,
        provider_name,
        artisan_name,
    } = job

    // Counterparty for a client's job is the provider/artisan doing the work.
    const counterpartyName = provider_name ?? artisan_name ?? null

    const normalizedStatus = normalizeStatus(status, payment_status)
    const statusStyle = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.pending
    const paymentStatusStyle = PAYMENT_STATUS_STYLES[payment_status] || PAYMENT_STATUS_STYLES.pending

    // Amount fallback chain per the backend list-field note.
    const displayAmount = offered_amount ?? budget_amount ?? provider_net_estimate ?? amount ?? total_amount_due ?? base_amount

    // Check if payment is required (awaiting_payment status or pending with unpaid status)
    const needsPayment = normalizedStatus === 'awaiting_payment' || (normalizedStatus === 'pending' && (!payment_status || payment_status === 'pending'))

    const handleShare = (e) => {
        e.stopPropagation()
        navigator.clipboard?.writeText(`${window.location.origin}/jobs/${id}`)
    }

    const handleMakePayment = (e) => {
        e.stopPropagation()
        onMakePayment?.(id)
    }

    return (
        <article className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            {/* ── Top row ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 pt-3 pb-0">
                <p className="text-base font-semibold text-text-4">{formatRelativeTime(created_at)}</p>
                <span className={`text-sm font-bold px-2.5 py-1 rounded-full border ${statusStyle.cls}`}>
                    {statusStyle.label}
                </span>
            </div>

            {/* ── Cover placeholder ────────────────────────────────── */}
            <div className="relative mx-4 mt-2.5 rounded-xl overflow-hidden h-44 bg-mist flex-shrink-0">
                <div className="w-full h-full flex items-center justify-center bg-primary/5 dark:bg-primary-light/10">
                    <span className="text-3xl font-black text-primary tracking-tight opacity-20">JOB</span>
                </div>
                <button
                    onClick={handleShare}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface/90 backdrop-blur-sm flex items-center justify-center text-text-3 hover:bg-surface transition-all shadow-sm"
                    aria-label="Share job"
                >
                    <Share2 size={13} strokeWidth={2} />
                </button>
                {category_id && (
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-primary/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-white">
                        Job #{id}
                    </span>
                )}
            </div>

            {/* ── Card body ────────────────────────────────────────── */}
            <div className="flex flex-col flex-1 px-4 pt-3 pb-4">
                {/* Title */}
                <h5 className="text-lg font-bold text-text-1 leading-snug line-clamp-1 mb-1.5">{title || 'Untitled Job'}</h5>

                {/* Provider (counterparty) */}
                {counterpartyName && (
                    <div className="flex items-center gap-1.5 mb-2.5">
                        <UserCircle2 size={14} className="text-text-4 flex-shrink-0" />
                        <span className="text-sm text-text-3 truncate">{counterpartyName}</span>
                    </div>
                )}

                {/* Location */}
                {service_location_text && (
                    <div className="flex items-center gap-1.5 mb-3">
                        <MapPin size={14} className="text-text-4 flex-shrink-0" />
                        <span className="text-sm text-text-4 truncate">{service_location_text}</span>
                    </div>
                )}

                {/* Scheduled start */}
                {scheduled_start_at && (
                    <div className="flex items-center gap-1.5 mb-3">
                        <Calendar size={14} className="text-text-4 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-text-4">Scheduled start:</p>
                            <p className="text-sm font-semibold text-text-1">{formatDateTime(scheduled_start_at)}</p>
                        </div>
                    </div>
                )}

                <div className="flex-1" />

                {/* Meta row */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <p className="text-text-4 text-sm mb-0.5">Duration</p>
                        <div className="flex items-center gap-1">
                            <Clock size={13} className="text-text-4" />
                            <p className="font-semibold text-text-1 text-base">{formatDuration(expected_duration_minutes)}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-primary text-sm mb-0.5 font-semibold">Total amount paid</p>
                        <p className="font-bold text-primary text-base">{formatAmount(displayAmount, currency_code)}</p>
                    </div>
                </div>

                {/* Timezone and Payment Status */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    {timezone_name && (
                        <div>
                            <p className="text-xs text-text-4 mb-0.5">Timezone</p>
                            <p className="text-sm font-semibold text-text-1">{timezone_name}</p>
                        </div>
                    )}
                    {payment_status && (
                        <div>
                            <p className="text-xs text-text-4 mb-0.5">Payment</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${paymentStatusStyle.cls}`}>
                                {paymentStatusStyle.label}
                            </span>
                        </div>
                    )}
                </div>

                {/* CTA */}
                {needsPayment ? (
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="solid"
                            onClick={handleMakePayment}
                            className="w-full h-11 text-sm font-bold rounded-xl bg-primary hover:bg-primary-sat"
                        >
                            Make Payment
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onViewDetails?.(id)}
                            className="w-full h-11 text-sm font-bold rounded-xl"
                        >
                            View Details
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="solid"
                        onClick={() => onViewDetails?.(id)}
                        className="w-full h-11 text-base font-bold rounded-xl"
                    >
                        View job details
                    </Button>
                )}
            </div>
        </article>
    )
}
