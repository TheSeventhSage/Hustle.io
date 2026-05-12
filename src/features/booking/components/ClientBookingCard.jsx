import { Clock, MapPin, Calendar, AlertCircle } from 'lucide-react'
import { Button } from '../../../shared/components/Button.jsx'

function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(dateStr) {
    if (!dateStr) return '—'
    const t = new Date(dateStr)
    if (isNaN(t)) return '—'
    return t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatDuration(minutes) {
    if (!minutes) return '—'
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m ? `${h}h ${m}m` : `${h}h`
}

function formatAmount(value, currency = 'NGN') {
    if (!value && value !== 0) return '—'
    return `${currency} ${Number(value).toLocaleString()}`
}

const STATUS_CONFIG = {
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700', icon: Clock },
    awaiting_payment: { label: 'Awaiting Payment', cls: 'bg-[#CBCEC0] dark:bg-[#4A4D47] text-[#2F6B60] dark:text-[#6FA79D]', icon: AlertCircle },
    paid: { label: 'Paid', cls: 'bg-green-100 text-green-700', icon: Clock },
    in_progress: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700', icon: Clock },
    completed: { label: 'Completed', cls: 'bg-gray-100 text-gray-700', icon: Clock },
}

export default function ClientBookingCard({ booking, onViewDetails }) {
    const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
    const StatusIcon = statusConfig.icon

    return (
        <article className="bg-white dark:bg-surface border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            {/* Status Badge */}
            <div className="px-4 pt-4">
                <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${statusConfig.cls}`}>
                        <StatusIcon size={12} />
                        {statusConfig.label}
                    </span>
                    {booking.payment_status && (
                        <span className="text-[11px] text-text-4">
                            Payment: {booking.payment_status}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h5 className="font-bold text-text-1 leading-snug line-clamp-2 mb-2">
                    {booking.service_title || 'Booking'}
                </h5>

                {/* Description */}
                {booking.special_instructions && (
                    <p className="text-[13px] text-text-3 leading-relaxed line-clamp-2 mb-3">
                        {booking.special_instructions}
                    </p>
                )}
            </div>

            {/* Details Grid */}
            <div className="px-4 pb-4 space-y-3 flex-1">
                {/* Location */}
                {booking.service_location_text && (
                    <div>
                        <p className="text-[11px] text-text-4 mb-0.5">Location</p>
                        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-text-1">
                            <MapPin size={12} className="text-text-4" />
                            <span className="line-clamp-1">{booking.service_location_text}</span>
                        </div>
                    </div>
                )}

                {/* Scheduled Time & Duration */}
                <div className="grid grid-cols-2 gap-3">
                    {booking.scheduled_start_at && (
                        <div>
                            <p className="text-[11px] text-text-4 mb-0.5">Scheduled</p>
                            <div className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-teal-600" />
                                <p className="text-[13px] font-semibold text-teal-600">
                                    {formatDate(booking.scheduled_start_at)}
                                </p>
                            </div>
                            <p className="text-[12px] text-text-3 mt-0.5">
                                {formatTime(booking.scheduled_start_at)}
                            </p>
                        </div>
                    )}
                    <div>
                        <p className="text-[11px] text-text-4 mb-0.5">Duration</p>
                        <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-text-4" />
                            <p className="text-[13px] font-semibold text-text-1">
                                {formatDuration(booking.expected_duration_minutes)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Amount */}
                {booking.total_amount_due && (
                    <div>
                        <p className="text-[11px] text-text-4 mb-0.5">Total amount</p>
                        <p className="text-[15px] font-bold text-primary">
                            {formatAmount(booking.total_amount_due, booking.currency_code)}
                        </p>
                    </div>
                )}

                <div className="flex-1" />

                {/* Action Button */}
                <Button
                    variant="solid"
                    onClick={() => onViewDetails(booking.id)}
                    className="w-full h-10 text-[13px] font-bold rounded-xl mt-3"
                >
                    {booking.status === 'awaiting_payment' ? 'Make Payment' : 'View Details'}
                </Button>
            </div>
        </article>
    )
}
