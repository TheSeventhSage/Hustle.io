import { X, MapPin, Clock, Bookmark, Share2, Calendar, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/Button.jsx'
import { useBooking, useConfirmBooking } from '../booking.hooks.js'
import useUIStore from '../../../shared/store/ui.store.js'
import { messagesService } from '../../messages/messages.service.js'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    })
}

function formatTime(dateStr) {
    if (!dateStr) return '—'
    const t = new Date(dateStr)
    if (isNaN(t)) return '—'
    return t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()
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

function resolveConversationId(response) {
    return (
        response?.data?.conversation?.id
        ?? response?.data?.item?.id
        ?? response?.data?.id
        ?? response?.conversation?.id
        ?? response?.item?.id
        ?? null
    )
}

const STATUS_BADGE = {
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
    confirmed: { label: 'Confirmed', cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700' },
}

const PAYMENT_STATUS_BADGE = {
    pending: { label: 'Payment Pending', cls: 'bg-amber-100 text-amber-700' },
    paid: { label: 'Paid', cls: 'bg-green-100 text-green-700' },
    failed: { label: 'Payment Failed', cls: 'bg-red-100 text-red-700' },
    refunded: { label: 'Refunded', cls: 'bg-blue-100 text-blue-700' },
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export default function BookingDetailModal({ bookingId, isOpen, onClose, onReject }) {
    const { data: booking, isLoading, isError, refetch } = useBooking(bookingId)
    const { mutate: confirm, isPending: confirming } = useConfirmBooking()
    const { toastSuccess } = useUIStore()
    const navigate = useNavigate()

    const badge = STATUS_BADGE[booking?.status] ?? STATUS_BADGE.pending
    const paymentBadge = PAYMENT_STATUS_BADGE[booking?.payment_status] ?? PAYMENT_STATUS_BADGE.pending

    const messageMutation = useMutation({
        mutationFn: async () => {
            if (!booking?.client_account_id) {
                throw new Error('No client account was found for this booking.')
            }

            return messagesService.initiateConversation({
                participant_account_id: booking.client_account_id,
                conversation_type: 'direct',
                booking_id: booking.id,
            })
        },
        onSuccess(response) {
            const conversationId = resolveConversationId(response)
            if (!conversationId) return
            toastSuccess('Conversation opened.')
            navigate(`/messages/${conversationId}`)
            onClose()
        },
    })

    const handleAccept = () => {
        confirm(bookingId, { onSuccess: () => onClose() })
    }

    const handleShare = () => {
        navigator.clipboard?.writeText(`${window.location.origin}/bookings/${bookingId}`)
        toastSuccess('Link copied to clipboard!')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="detail-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        key="detail-modal"
                        role="dialog"
                        aria-label="Booking details"
                        aria-modal="true"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-[600px] max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                                <span className="text-[15px] font-bold text-text-1">Booking details</span>
                                <div className="flex items-center gap-2">
                                    {booking?.status !== 'pending' && (
                                        <button
                                            onClick={() => messageMutation.mutate()}
                                            disabled={messageMutation.isPending}
                                            className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-mist transition-all disabled:opacity-60"
                                            aria-label="Message client"
                                        >
                                            <MessageSquare size={14} className="text-text-3" />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleShare}
                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-mist transition-all"
                                        aria-label="Share"
                                    >
                                        <Share2 size={14} className="text-text-3" />
                                    </button>
                                    <button
                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-mist transition-all"
                                        aria-label="Bookmark"
                                    >
                                        <Bookmark size={14} className="text-text-3" />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-mist transition-all"
                                        aria-label="Close"
                                    >
                                        <X size={15} className="text-text-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-5">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : isError ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <p className="text-[15px] font-bold text-text-1 mb-2">Failed to load booking</p>
                                        <button
                                            onClick={() => refetch()}
                                            className="px-5 py-2.5 bg-primary text-white text-[13px] font-bold rounded-full"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Status badge */}
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold ${badge.cls}`}>
                                                {badge.label}
                                            </span>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold ${paymentBadge.cls}`}>
                                                {paymentBadge.label}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-[22px] font-bold text-text-1 mb-4 leading-snug">
                                            {booking?.service_title || 'Booking details'}
                                        </h2>

                                        {/* Price display - Your earnings */}
                                        {/* <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[12px] text-text-3 font-medium mb-1">Your earnings</p>
                                                    <p className="text-[24px] font-bold text-primary">
                                                        {formatAmount(
                                                            booking?.provider_net_estimate || booking?.provider_net || booking?.net_amount || booking?.amount,
                                                            booking?.currency_code || 'NGN'
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[12px] text-text-3 font-medium mb-1">Payment status</p>
                                                    <p className={`text-[14px] font-bold ${booking?.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {paymentBadge.label}
                                                    </p>
                                                </div>
                                            </div>
                                        </div> */}

                                        {/* Tab bar (static — only Job description for now) */}
                                        <div className="flex gap-6 border-b border-border mb-5">
                                            <span className="pb-3 text-[13px] font-semibold text-text-1 relative">
                                                Job description
                                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                                            </span>
                                        </div>

                                        {/* Description */}
                                        {booking?.special_instructions && (
                                            <div className="mb-5">
                                                <p className="text-[13px] font-semibold text-text-2 mb-1">Description:</p>
                                                <p className="text-[14px] text-text-3 leading-relaxed">
                                                    {booking.special_instructions}
                                                </p>
                                            </div>
                                        )}

                                        {/* Location */}
                                        {booking?.service_location_text && (
                                            <div className="mb-5">
                                                <p className="text-[12px] text-text-4 mb-1">Location</p>
                                                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-teal-600">
                                                    <MapPin size={13} />
                                                    {booking.service_location_text}
                                                </div>
                                            </div>
                                        )}

                                        {/* Metadata grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 mb-5">
                                            <div>
                                                <p className="text-[12px] text-text-4 mb-1">Booking mode</p>
                                                <p className="text-[14px] font-semibold text-text-1 capitalize">
                                                    {booking?.booking_mode === 'come_now' ? 'Come now' : 'Scheduled'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[12px] text-text-4 mb-1">Duration</p>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={13} className="text-text-4" />
                                                    <p className="text-[14px] font-semibold text-text-1">
                                                        {formatDuration(booking?.expected_duration_minutes)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[12px] text-text-4 mb-1">Timezone</p>
                                                <p className="text-[14px] font-semibold text-text-1">
                                                    {booking?.timezone_name || '—'}
                                                </p>
                                            </div>
                                            {booking?.scheduled_start_at && (
                                                <div>
                                                    <p className="text-[12px] text-text-4 mb-1">Scheduled time</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={13} className="text-text-4" />
                                                        <p className="text-[14px] font-semibold text-text-1">
                                                            {formatTime(booking.scheduled_start_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {booking?.scheduled_start_at && (
                                                <div>
                                                    <p className="text-[12px] text-text-4 mb-1">Scheduled date</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={13} className="text-teal-600" />
                                                        <p className="text-[14px] font-semibold text-teal-600">
                                                            {formatDate(booking.scheduled_start_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {booking?.requested_at && (
                                                <div>
                                                    <p className="text-[12px] text-text-4 mb-1">Requested</p>
                                                    <p className="text-[14px] font-semibold text-text-1">
                                                        {formatDate(booking.requested_at)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer actions — only for pending bookings */}
                            {!isLoading && !isError && booking?.status === 'pending' && (
                                <div className="flex gap-3 px-6 py-4 border-t border-border flex-shrink-0">
                                    <Button
                                        variant="solid"
                                        onClick={handleAccept}
                                        isPending={confirming}
                                        className="flex-1 h-11 text-[14px] font-bold rounded-full"
                                    >
                                        Accept booking
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => { onClose(); onReject(bookingId) }}
                                        className="flex-1 h-11 text-[14px] font-bold rounded-full border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                        Reject booking
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
