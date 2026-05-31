import { useState, useEffect, useMemo } from 'react'
import { X, Bell, Clock, MessageSquare, MapPin, UserCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueries } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/Button.jsx'
import useUIStore from '../../../shared/store/ui.store.js'
import { useMyBookings } from '../booking.hooks.js'
import BookingDetailModal from './BookingDetailModal.jsx'
import RejectBookingModal from './RejectBookingModal.jsx'
import { messagesService } from '../../messages/messages.service.js'
import { publicProfileService } from '../../../shared/api/publicProfile.service.js'
import { queryKeys } from '../../../services/query-keys.js'
import { getProfileDisplayName, getProfileLocation } from '../../../shared/lib/normalize.js'
import { PublicProfileDrawer } from '../../hustles/components/hustle-detail-panel/PublicProfileDrawer.jsx'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatRelativeTime(dateString) {
    if (!dateString) return ''
    const diff = Date.now() - new Date(dateString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 2) return 'Just now'
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
    const days = Math.floor(hrs / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
}

function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatDuration(minutes) {
    if (!minutes) return '—'
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m ? `${h}h ${m}m` : `${h}h`
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

function BookingClientPreview({ booking, profile, onOpenProfile }) {
    const clientAccountId = booking?.client_account_id
    const displayName = getProfileDisplayName(profile, booking?.client_name || `Client #${clientAccountId}`)
    const location = profile ? getProfileLocation(profile) : null
    const avatarSrc = profile?.avatar_url
        ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Client')}&background=E8F0EC&color=0A2318&bold=true&size=96`

    return (
        <div className="mb-3 rounded-xl border border-border bg-mist/60 px-3 py-3">
            <div className="flex items-start gap-3">
                <img src={avatarSrc} alt={displayName} className="h-10 w-10 rounded-full object-cover flex-shrink-0 bg-white" />
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-4">Client</p>
                            <p className="truncate text-[13px] font-bold text-text-1">{displayName}</p>
                        </div>
                        {clientAccountId ? (
                            <button
                                type="button"
                                onClick={() => onOpenProfile(clientAccountId)}
                                className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-white px-3 text-[12px] font-semibold text-text-2 hover:bg-mist"
                            >
                                <UserCircle2 size={13} /> View
                            </button>
                        ) : null}
                    </div>
                    {location ? (
                        <div className="mt-1 flex items-center gap-1 text-[12px] text-text-4">
                            <MapPin size={12} />
                            <span className="truncate">{location}</span>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

// ── Pending booking card ──────────────────────────────────────────────────────
function PendingBookingCard({ booking, clientProfile, onOpenProfile, onViewDetails, onAccept, onReject, isAccepting, isRejecting }) {
    return (
        <div className="bg-white dark:bg-surface border border-border rounded-2xl p-4 mb-3">
            <BookingClientPreview booking={booking} profile={clientProfile} onOpenProfile={onOpenProfile} />
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-mist dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Bell size={18} strokeWidth={1.5} className="text-text-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <button
                            onClick={() => onViewDetails(booking)}
                            className="text-[14px] font-bold text-text-1 hover:text-primary transition-colors text-left leading-snug"
                        >
                            {booking.service_title || 'Booking request'}
                        </button>
                        <span className="text-[11px] text-text-4 flex-shrink-0 mt-0.5">
                            {formatRelativeTime(booking.requested_at || booking.created_at)}
                        </span>
                    </div>
                    <p className="text-[12px] text-text-3 mt-0.5 line-clamp-2">
                        {booking.special_instructions || 'A client wants to book you — click to view more details'}
                    </p>
                </div>
            </div>

            <div className="flex gap-2 mt-2">
                <Button
                    variant="solid"
                    onClick={() => onAccept(booking)}
                    isPending={isAccepting}
                    className="flex-1 h-9 text-[13px] font-bold rounded-full"
                >
                    Accept booking
                </Button>
                <Button
                    variant="outline"
                    onClick={() => onReject(booking)}
                    isPending={isRejecting}
                    className="flex-1 h-9 text-[13px] font-bold rounded-full border-red-300 text-red-600 hover:bg-red-50"
                >
                    Reject booking
                </Button>
            </div>
        </div>
    )
}

// ── Accepted booking card ─────────────────────────────────────────────────────
function AcceptedBookingCard({ booking, clientProfile, onOpenProfile, onViewDetails, onMessage, isMessaging }) {
    const isPaid = booking.status === 'paid' || booking.payment_status === 'approved' || booking.payment_status === 'paid'

    return (
        <div className="bg-white dark:bg-surface border border-border rounded-2xl p-4 mb-3">
            <BookingClientPreview booking={booking} profile={clientProfile} onOpenProfile={onOpenProfile} />
            <div className="flex items-start justify-between gap-3 mb-1">
                <h4 className="text-[15px] font-bold text-text-1">
                    {booking.service_title || 'Booking'}
                </h4>
                <button
                    onClick={() => onMessage(booking)}
                    disabled={isMessaging}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-mist transition-all disabled:opacity-60"
                    aria-label="Message client"
                >
                    <MessageSquare size={15} className="text-text-3" />
                </button>
            </div>

            {/* Note for paid bookings */}
            {isPaid && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-[12px] font-semibold text-blue-900 mb-1">💰 Payment Received</p>
                    <p className="text-[11px] text-blue-700">
                        This booking has been paid. Check the <span className="font-bold">In-progress</span> tab for more details.
                    </p>
                </div>
            )}

            {booking.special_instructions && (
                <div className="mb-3">
                    <p className="text-[13px] font-semibold text-text-2 mb-1">Description:</p>
                    <p className="text-[13px] text-text-3 leading-relaxed line-clamp-3">
                        {booking.special_instructions}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                    <p className="text-[11px] text-text-4 mb-0.5">Mode:</p>
                    <p className="text-[13px] font-semibold text-text-1 capitalize">
                        {booking.booking_mode === 'come_now' ? 'Come now' : 'Scheduled'}
                    </p>
                </div>
                <div>
                    <p className="text-[11px] text-text-4 mb-0.5">Duration:</p>
                    <p className="text-[13px] font-semibold text-text-1">
                        {formatDuration(booking.expected_duration_minutes)}
                    </p>
                </div>
                <div>
                    <p className="text-[11px] text-text-4 mb-0.5">Date:</p>
                    <p className="text-[13px] font-semibold text-teal-600">
                        {formatDate(booking.scheduled_start_at)}
                    </p>
                </div>
            </div>

            <Button
                variant="solid"
                onClick={() => onViewDetails(booking)}
                className="w-full h-10 text-[13px] font-bold rounded-full"
            >
                View more details
            </Button>
        </div>
    )
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function MyBookingsPanel({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('pending')

    // Detail modal state
    const [detailBooking, setDetailBooking] = useState(null)

    // Reject modal state
    const [rejectBooking, setRejectBooking] = useState(null)
    const [clientProfileAccountId, setClientProfileAccountId] = useState(null)

    const navigate = useNavigate()
    const { data, isLoading, isError, refetch } = useMyBookings()
    const { toastSuccess, toastError } = useUIStore()

    const pendingBookings = data?.pending ?? []
    const acceptedBookings = data?.accepted ?? []
    const clientAccountIds = useMemo(() => {
        const ids = [...pendingBookings, ...acceptedBookings]
            .map((booking) => booking?.client_account_id)
            .filter(Boolean)
            .map((id) => String(id))

        return [...new Set(ids)]
    }, [pendingBookings, acceptedBookings])

    const clientProfileQueries = useQueries({
        queries: clientAccountIds.map((accountId) => ({
            queryKey: queryKeys.profiles.public(accountId),
            queryFn: () => publicProfileService.getProfile(accountId),
            enabled: isOpen && Boolean(accountId),
            staleTime: 5 * 60 * 1000,
            retry: 1,
        })),
    })

    const clientProfilesByAccountId = useMemo(() => {
        return clientAccountIds.reduce((acc, accountId, index) => {
            const profile = clientProfileQueries[index]?.data?.profile ?? clientProfileQueries[index]?.data ?? null
            if (profile) acc[String(accountId)] = profile
            return acc
        }, {})
    }, [clientAccountIds, clientProfileQueries])

    const messageBookingMutation = useMutation({
        mutationFn: async (booking) => {
            const participantAccountId = booking?.client_account_id
            if (!participantAccountId) {
                throw new Error('No client account was found for this booking.')
            }

            return messagesService.initiateConversation({
                participant_account_id: participantAccountId,
                conversation_type: 'direct',
                booking_id: booking.id,
            })
        },
        onSuccess(response) {
            const conversationId = resolveConversationId(response)
            if (!conversationId) {
                toastError('Conversation opened, but no conversation id was returned.')
                return
            }

            toastSuccess('Conversation opened.')
            navigate(`/messages/${conversationId}`)
        },
        onError(error) {
            toastError(error?.message ?? 'Failed to open messages.')
        },
    })

    // Prevent body scroll while panel is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    // Reset modals when panel closes
    useEffect(() => {
        if (!isOpen) {
            setDetailBooking(null)
            setRejectBooking(null)
            setClientProfileAccountId(null)
        }
    }, [isOpen])

    const handleViewDetails = (booking) => setDetailBooking(booking)
    const handleOpenReject = (booking) => setRejectBooking(booking)
    const handleMessage = (booking) => messageBookingMutation.mutate(booking)
    const handleOpenClientProfile = (accountId) => setClientProfileAccountId(accountId)

    // "Accept booking" on the card opens the detail modal — the actual confirm
    // API call happens inside BookingDetailModal's footer button
    const handleAccept = (booking) => setDetailBooking(booking)

    // When "Reject" is clicked from inside the detail modal, close detail and open reject
    const handleRejectFromDetail = (bookingId) => {
        const booking = [...pendingBookings, ...acceptedBookings].find(b => b.id === bookingId)
        setDetailBooking(null)
        if (booking) setRejectBooking(booking)
    }

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="panel-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/30 z-40"
                            onClick={onClose}
                        />

                        {/* Slide-in panel */}
                        <motion.div
                            key="bookings-panel"
                            role="dialog"
                            aria-label="My bookings"
                            aria-modal="true"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[560px] bg-white dark:bg-surface flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                                <span className="text-[16px] font-bold text-text-1">My bookings</span>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-mist transition-all"
                                    aria-label="Close panel"
                                >
                                    <X size={15} className="text-text-3" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-border px-6 flex-shrink-0">
                                {[
                                    {
                                        key: 'pending',
                                        label: `Pending bookings${pendingBookings.length ? ` (${pendingBookings.length})` : ''}`,
                                    },
                                    { key: 'accepted', label: 'Accepted bookings' },
                                ].map(t => (
                                    <button
                                        key={t.key}
                                        onClick={() => setActiveTab(t.key)}
                                        className={`pb-3 pt-3 mr-6 text-[13px] font-semibold transition-colors relative whitespace-nowrap ${activeTab === t.key ? 'text-text-1' : 'text-text-4 hover:text-text-2'
                                            }`}
                                    >
                                        {t.label}
                                        {activeTab === t.key && (
                                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : isError ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <p className="text-[15px] font-bold text-text-1 mb-2">Failed to load bookings</p>
                                        <button
                                            onClick={() => refetch()}
                                            className="px-5 py-2.5 bg-primary text-white text-[13px] font-bold rounded-full hover:bg-primary-sat transition-all"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                ) : activeTab === 'pending' ? (
                                    pendingBookings.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-16 h-16 rounded-full bg-mist dark:bg-white/5 flex items-center justify-center mb-4">
                                                <Bell size={28} strokeWidth={1.5} className="text-text-4" />
                                            </div>
                                            <p className="text-[15px] font-bold text-text-1 mb-1">No pending bookings</p>
                                            <p className="text-[13px] text-text-4">Booking requests from clients will appear here</p>
                                        </div>
                                    ) : (
                                        pendingBookings.map(booking => (
                                            <PendingBookingCard
                                                key={booking.id}
                                                booking={booking}
                                                clientProfile={clientProfilesByAccountId[String(booking?.client_account_id)] ?? null}
                                                onOpenProfile={handleOpenClientProfile}
                                                onViewDetails={handleViewDetails}
                                                onAccept={handleAccept}
                                                onReject={handleOpenReject}
                                                isAccepting={false}
                                                isRejecting={false}
                                            />
                                        ))
                                    )
                                ) : (
                                    acceptedBookings.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-16 h-16 rounded-full bg-mist dark:bg-white/5 flex items-center justify-center mb-4">
                                                <Clock size={28} strokeWidth={1.5} className="text-text-4" />
                                            </div>
                                            <p className="text-[15px] font-bold text-text-1 mb-1">No accepted bookings</p>
                                            <p className="text-[13px] text-text-4">Bookings you have accepted will appear here</p>
                                        </div>
                                    ) : (
                                        acceptedBookings.map(booking => (
                                            <AcceptedBookingCard
                                                key={booking.id}
                                                booking={booking}
                                                clientProfile={clientProfilesByAccountId[String(booking?.client_account_id)] ?? null}
                                                onOpenProfile={handleOpenClientProfile}
                                                onViewDetails={handleViewDetails}
                                                onMessage={handleMessage}
                                                isMessaging={messageBookingMutation.isPending}
                                            />
                                        ))
                                    )
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Booking Detail Modal ─────────────────────────────────────── */}
            <BookingDetailModal
                bookingId={detailBooking?.id ?? null}
                isOpen={Boolean(detailBooking)}
                onClose={() => setDetailBooking(null)}
                onReject={handleRejectFromDetail}
            />

            {/* ── Reject Booking Modal ─────────────────────────────────────── */}
            <RejectBookingModal
                bookingId={rejectBooking?.id ?? null}
                bookingTitle={rejectBooking?.service_title ?? ''}
                isOpen={Boolean(rejectBooking)}
                onClose={() => setRejectBooking(null)}
            />
            <PublicProfileDrawer
                isOpen={Boolean(clientProfileAccountId)}
                accountId={clientProfileAccountId}
                serviceId={null}
                onClose={() => setClientProfileAccountId(null)}
            />
        </>
    )
}
