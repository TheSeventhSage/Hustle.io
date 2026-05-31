import { X, MapPin, Clock, Calendar, MessageSquare, CreditCard, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/Button.jsx'
import { useBooking, useInitializePayment, useVerifyPayment } from '../booking.hooks.js'
import useUIStore from '../../../shared/store/ui.store.js'
import { messagesService } from '../../messages/messages.service.js'
import { hustlesService } from '../../hustles/hustles.service.js'
import { PAYMENT_SESSION_TYPES, isCompletedPaymentStatus, runPaymentFlow } from '../../../shared/utils/paymentFlow.js'

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
    awaiting_payment: { label: 'Awaiting Payment', cls: 'bg-[#CBCEC0] dark:bg-[#4A4D47] text-[#2F6B60] dark:text-[#6FA79D]' },
    paid: { label: 'Paid', cls: 'bg-green-100 text-green-700' },
    in_progress: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completed', cls: 'bg-gray-100 text-gray-700' },
}

const PAYMENT_STATUS_BADGE = {
    pending: { label: 'Payment Pending', cls: 'bg-amber-100 text-amber-700' },
    paid: { label: 'Paid', cls: 'bg-green-100 text-green-700' },
    approved: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
    failed: { label: 'Payment Failed', cls: 'bg-red-100 text-red-700' },
    refunded: { label: 'Refunded', cls: 'bg-blue-100 text-blue-700' },
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export default function ClientBookingDetailModal({ bookingId, isOpen, onClose }) {
    const { data: booking, isLoading, isError, refetch } = useBooking(bookingId)
    const initializePayment = useInitializePayment()
    const verifyPayment = useVerifyPayment()
    const { toastSuccess, toastError, toastInfo } = useUIStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const badge = STATUS_BADGE[booking?.status] || STATUS_BADGE.pending
    const paymentBadge = PAYMENT_STATUS_BADGE[booking?.payment_status] || PAYMENT_STATUS_BADGE.pending

    const messageMutation = useMutation({
        mutationFn: async () => {
            if (!booking?.artisan_account_id) {
                throw new Error('No artisan account was found for this booking.')
            }

            return messagesService.initiateConversation({
                participant_account_id: booking.artisan_account_id,
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

    const completeJobMutation = useMutation({
        mutationFn: async (jobId) => {
            return hustlesService.completeJob(jobId)
        },
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: ['bookings', 'mine'] })
            queryClient.invalidateQueries({ queryKey: ['bookings', 'detail', bookingId] })
            toastSuccess('Job completed successfully! Artisan has been credited.')
            refetch()
        },
        onError(err) {
            toastError(err?.message ?? 'Failed to complete job.')
        },
    })

    const handlePayment = async () => {
        if (!bookingId) return

        try {
            await runPaymentFlow({
                initializePayment: ({ forceNew, callbackUrl }) => initializePayment.mutateAsync({
                    id: bookingId,
                    data: {
                        ...(forceNew ? { force_new: true } : {}),
                        ...(callbackUrl ? { callback_url: callbackUrl } : {}),
                    },
                }),
                verifyPayment: (reference) => verifyPayment.mutateAsync(reference),
                sessionType: PAYMENT_SESSION_TYPES.booking,
                includeCallbackUrl: true,
                allowRedirectFallback: true,
                recoverInlineErrorWithVerification: true,
                sessionData: { bookingId },
                returnUrl: `${window.location.origin}/my-hustles?tab=bookings`,
                onAlreadyPaid: async () => {
                    toastSuccess('Payment already completed.')
                    queryClient.invalidateQueries({ queryKey: ['bookings', 'mine'] })
                    queryClient.invalidateQueries({ queryKey: ['bookings', 'detail', bookingId] })
                    refetch()
                },
                onPaymentSuccess: async ({ status }) => {
                    if (isCompletedPaymentStatus(status)) {
                        toastSuccess('Payment verified! The artisan can now begin work.')
                    } else {
                        toastError(`Payment status: ${status}. Please contact support if needed.`)
                    }

                    queryClient.invalidateQueries({ queryKey: ['bookings', 'mine'] })
                    queryClient.invalidateQueries({ queryKey: ['bookings', 'detail', bookingId] })
                    refetch()
                },
                onPaymentStatusMismatch: async ({ status }) => {
                    toastError(`Payment status: ${status}. Please contact support if needed.`)
                },
                onPaymentCancelled: async () => {
                    toastInfo('Payment was not completed. Please try making the payment again.')
                },
                onPaymentError: async (error) => {
                    toastError(error?.message ?? 'Payment failed.')
                },
                onVerificationError: async (error) => {
                    toastError(error?.message ?? 'Payment verification failed.')
                },
            })
        } catch {
            // Error feedback is handled inside the shared flow callbacks.
        }
    }

    const handleCompleteJob = () => {
        if (!booking?.job_id) {
            toastError('No job ID found for this booking.')
            return
        }
        completeJobMutation.mutate(booking.job_id)
    }

    const canMakePayment = booking?.status === 'awaiting_payment' && (booking?.payment_status === 'pending' || !booking?.payment_status)
    const canCompleteJob = (booking?.status === 'in_progress' || booking?.status === 'paid') && (booking?.payment_status === 'approved' || booking?.payment_status === 'paid')

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
                                            aria-label="Message artisan"
                                        >
                                            <MessageSquare size={14} className="text-text-3" />
                                        </button>
                                    )}
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
                                        {/* Status badges */}
                                        <div className="mb-3 flex items-center gap-2 flex-wrap">
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

                                        {/* Payment prompt for awaiting_payment */}
                                        {canMakePayment && (
                                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5">
                                                <div className="flex items-start gap-3">
                                                    <CreditCard className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-[14px] font-bold text-orange-900 mb-1">Payment Required</p>
                                                        <p className="text-[13px] text-orange-700">
                                                            The artisan has accepted your booking. Please complete payment to begin the service.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Completion prompt for in_progress */}
                                        {canCompleteJob && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-[14px] font-bold text-blue-900 mb-1">Ready to Complete?</p>
                                                        <p className="text-[13px] text-blue-700">
                                                            Once the work is finished, confirm completion to release payment to the artisan.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Amount display with breakdown */}
                                        {/* <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
                                            <p className="text-[13px] font-bold text-text-1 mb-3">Payment Breakdown</p>

                                            <div className="space-y-2.5 mb-3">
                                                {booking?.base_amount && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[13px] text-text-3">Base amount</span>
                                                        <span className="text-[13px] font-semibold text-text-1">
                                                            {formatAmount(booking.base_amount, booking?.currency_code || 'NGN')}
                                                        </span>
                                                    </div>
                                                )}

                                                {booking?.platform_service_fee_amount && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[13px] text-text-3">Platform service fee</span>
                                                        <span className="text-[13px] font-semibold text-text-1">
                                                            {formatAmount(booking.platform_service_fee_amount, booking?.currency_code || 'NGN')}
                                                        </span>
                                                    </div>
                                                )}

                                                {booking?.insurance_amount && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[13px] text-text-3">Insurance</span>
                                                        <span className="text-[13px] font-semibold text-text-1">
                                                            {formatAmount(booking.insurance_amount, booking?.currency_code || 'NGN')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="border-t border-primary/20 pt-3">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <p className="text-[12px] text-text-3 font-medium mb-1">Total amount</p>
                                                        <p className="text-[24px] font-bold text-primary">
                                                            {formatAmount(
                                                                booking?.total_amount_due || booking?.total_amount || booking?.amount,
                                                                booking?.currency_code || 'NGN'
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[12px] text-text-3 font-medium mb-1">Payment status</p>
                                                        <p className={`text-[14px] font-bold ${booking?.payment_status === 'approved' || booking?.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                                                            {paymentBadge.label}
                                                        </p>
                                                    </div>
                                                </div>

                                                {booking?.provider_net_estimate && (
                                                    <div className="bg-white/50 rounded-lg px-3 py-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[12px] text-text-3">Artisan earnings</span>
                                                            <span className="text-[13px] font-bold text-green-600">
                                                                {formatAmount(booking.provider_net_estimate, booking?.currency_code || 'NGN')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div> */}

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
                                                <>
                                                    <div>
                                                        <p className="text-[12px] text-text-4 mb-1">Scheduled time</p>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={13} className="text-text-4" />
                                                            <p className="text-[14px] font-semibold text-text-1">
                                                                {formatTime(booking.scheduled_start_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[12px] text-text-4 mb-1">Scheduled date</p>
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={13} className="text-teal-600" />
                                                            <p className="text-[14px] font-semibold text-teal-600">
                                                                {formatDate(booking.scheduled_start_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer actions */}
                            {!isLoading && !isError && (canMakePayment || canCompleteJob || booking) && (
                                <div className="px-6 py-4 border-t border-border flex-shrink-0">
                                    {canMakePayment ? (
                                        <Button
                                            variant="solid"
                                            onClick={handlePayment}
                                            isPending={initializePayment.isPending || verifyPayment.isPending}
                                            className="w-full h-11 text-[14px] font-bold rounded-full"
                                        >
                                            <CreditCard size={16} className="mr-2" />
                                            Make Payment
                                        </Button>
                                    ) : canCompleteJob ? (
                                        <Button
                                            variant="solid"
                                            onClick={handleCompleteJob}
                                            isPending={completeJobMutation.isPending}
                                            className="w-full h-11 text-[14px] font-bold rounded-full"
                                        >
                                            <CheckCircle2 size={16} className="mr-2" />
                                            Confirm Completion
                                        </Button>
                                    ) : booking?.status === 'awaiting_payment' ? (
                                        <Button
                                            variant="solid"
                                            onClick={handlePayment}
                                            isPending={initializePayment.isPending || verifyPayment.isPending}
                                            className="w-full h-11 text-[14px] font-bold rounded-full"
                                        >
                                            <CreditCard size={16} className="mr-2" />
                                            Make Payment
                                        </Button>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
