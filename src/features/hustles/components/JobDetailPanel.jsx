import { X, MapPin, Clock, Calendar, DollarSign, User, Briefcase, AlertCircle, CheckCircle, MapPinned } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../../../shared/components/Button'
import { ReviewPanel } from '../../../shared/hustles/ReviewPanel'
import { hustlesService } from '../hustles.service'
import { queryKeys } from '../../../services/query-keys'
import { useCompleteJob, useSubmitJobReview } from '../hustles.hooks'
import useUIStore from '../../../shared/store/ui.store'
import { storage } from '../../../services/storage'
import { initializePaystackPayment, makePaymentReference } from '../../../shared/utils/paystack'

const STATUS_STYLES = {
    pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
    in_progress: { label: 'In Progress', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
    completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-600 border-red-200' },
}

function normalizeStatus(status) {
    const raw = String(status || '').toLowerCase()
    if (['completed', 'complete', 'done'].includes(raw)) return 'completed'
    if (['pending', 'pending_approval', 'awaiting_approval', 'awaiting_requester', 'awaiting_service_requester'].includes(raw)) return 'pending'
    if (['in_progress', 'accepted', 'ongoing', 'active'].includes(raw)) return 'in_progress'
    if (['cancelled', 'canceled'].includes(raw)) return 'cancelled'
    return 'pending'
}

function formatAmount(value, currency = 'NGN') {
    if (!value && value !== 0) return '—'
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(value)
}

function formatDuration(minutes) {
    if (!minutes) return '—'
    if (minutes < 60) return `${minutes} minutes`
    const hrs = Math.floor(minutes / 60)
    const rem = minutes % 60
    return rem > 0 ? `${hrs} hour${hrs > 1 ? 's' : ''} ${rem} min` : `${hrs} hour${hrs > 1 ? 's' : ''}`
}

function formatDateTime(dateString) {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function InfoRow({ icon: Icon, label, value, valueClassName = 'text-text-1' }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
            <div className="w-10 h-10 rounded-lg bg-mist flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-text-3" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-base text-text-4 mb-0.5">{label}</p>
                <p className={`text-base font-semibold ${valueClassName}`}>{value}</p>
            </div>
        </div>
    )
}

export function JobDetailPanel({ isOpen, onClose, jobId }) {
    const [reviewPanelOpen, setReviewPanelOpen] = useState(false)
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false)
    const [launchingPayment, setLaunchingPayment] = useState(false)
    const [finalisingCompletion, setFinalisingCompletion] = useState(false)
    const { toastInfo, toastError } = useUIStore()

    const {
        data: jobData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: queryKeys.jobs.detail(jobId),
        queryFn: () => hustlesService.getJobById(jobId),
        enabled: Boolean(jobId) && isOpen,
        staleTime: 60 * 1000,
    })

    const completeJobMutation = useCompleteJob()
    const submitReviewMutation = useSubmitJobReview()

    const job = jobData?.data?.item || jobData?.data || jobData?.item || null

    const handleCompleteJob = async () => {
        if (!job?.id) return
        // Show payment confirmation modal
        setShowPaymentConfirm(true)
    }

    const handleProceedWithPayment = async () => {
        if (!job?.id) return

        const user = storage.getUser()
        const email = user?.email || `user.${user?.id || 'customer'}@hustle.local`
        const amount = Math.round(Number(job.total_amount_due || 0) * 100) // Convert to kobo

        if (!amount || amount < 100) {
            toastError('Invalid payment amount.')
            return
        }

        try {
            setLaunchingPayment(true)
            setShowPaymentConfirm(false)

            await initializePaystackPayment({
                email,
                amount,
                currency: job.currency_code || 'NGN',
                reference: makePaymentReference('job_complete', job.id),
                metadata: {
                    job_id: String(job.id),
                    artisan_account_id: String(job.artisan_account_id || ''),
                    client_account_id: String(job.client_account_id || ''),
                    source: 'job_completion_payment',
                },
                onSuccess: async () => {
                    setFinalisingCompletion(true)
                    try {
                        await completeJobMutation.mutateAsync(job.id)
                        setFinalisingCompletion(false)
                        setLaunchingPayment(false)
                        // Open review panel after successful completion
                        setReviewPanelOpen(true)
                    } catch (error) {
                        setFinalisingCompletion(false)
                        setLaunchingPayment(false)
                        // Error is handled by the mutation hook
                    }
                },
                onCancel: () => {
                    setLaunchingPayment(false)
                    toastInfo('Payment cancelled.')
                },
            })
        } catch (error) {
            setLaunchingPayment(false)
            toastError(error.message || 'Unable to open payment gateway.')
        }
    }

    const handleSubmitReview = async ({ rating, feedback }) => {
        if (!job?.artisan_account_id) return

        try {
            await submitReviewMutation.mutateAsync({
                jobId: job.id,
                targetType: 'artisan',
                reviewSubjectAccountId: job.artisan_account_id,
                rating,
                feedbackText: feedback,
            })
            setReviewPanelOpen(false)
            onClose()
        } catch (error) {
            // Error is handled by the mutation hook
        }
    }

    const handleTrackHustler = () => {
        toastInfo('Tracking feature coming soon!')
    }

    if (!isOpen) return null

    const normalizedStatus = job ? normalizeStatus(job.status) : 'pending'
    const statusStyle = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.pending
    const canComplete = job && normalizedStatus === 'in_progress'
    const isCompleted = normalizedStatus === 'completed'

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-surface p-2 shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-bold text-text-1">Job Details</h2>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-lg hover:bg-mist transition-colors flex items-center justify-center"
                        aria-label="Close panel"
                    >
                        <X size={20} className="text-text-3" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {isError && (
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                <AlertCircle size={24} className="text-red-500" />
                            </div>
                            <p className="text-sm font-bold text-text-1 mb-2">Failed to load job details</p>
                            <p className="text-sm text-text-4">Please try again later.</p>
                        </div>
                    )}

                    {!isLoading && !isError && job && (
                        <div className="p-6 space-y-6">
                            {/* Finalising Completion Banner */}
                            {finalisingCompletion && (
                                <div className="px-4 py-3 bg-mist border border-border rounded-xl">
                                    <p className="text-[13px] font-semibold text-text-2">
                                        Payment received. Finalising job completion...
                                    </p>
                                </div>
                            )}

                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border ${statusStyle.cls}`}>
                                    {statusStyle.label}
                                </span>
                                <span className="text-sm text-text-4">Job #{job.id}</span>
                            </div>

                            {/* Title */}
                            <div>
                                <h3 className="text-2xl font-bold text-text-1 mb-1">{job.title || 'Untitled Job'}</h3>
                                <p className="text-base text-text-4">Created {formatDateTime(job.created_at)}</p>
                            </div>

                            {/* Job Information */}
                            <div className="bg-white dark:bg-surface p-2 rounded-xl border border-border overflow-hidden">
                                <InfoRow
                                    icon={MapPin}
                                    label="Service Location"
                                    value={job.service_location_text || job.city_id || '—'}
                                />
                                <InfoRow
                                    icon={Calendar}
                                    label="Scheduled Start"
                                    value={formatDateTime(job.scheduled_start_at)}
                                />
                                <InfoRow
                                    icon={Clock}
                                    label="Expected Duration"
                                    value={formatDuration(job.expected_duration_minutes)}
                                />
                                {job.expected_completion_at && (
                                    <InfoRow
                                        icon={Calendar}
                                        label="Expected Completion"
                                        value={formatDateTime(job.expected_completion_at)}
                                    />
                                )}
                                <InfoRow
                                    icon={DollarSign}
                                    label="Total Amount Due"
                                    value={formatAmount(job.total_amount_due, job.currency_code)}
                                    valueClassName="text-primary font-bold"
                                />
                            </div>

                            {/* Participant Information */}
                            <div className="bg-white dark:bg-surface p-2 rounded-xl border border-border overflow-hidden">
                                <div className="px-4 py-3 border-b border-border">
                                    <h4 className="text-sm font-bold text-text-1">Participants</h4>
                                </div>
                                {job.client_account_id && (
                                    <InfoRow
                                        icon={User}
                                        label="Client"
                                        value={`Account #${job.client_account_id}`}
                                    />
                                )}
                                {job.artisan_account_id && (
                                    <InfoRow
                                        icon={Briefcase}
                                        label="Artisan"
                                        value={`Account #${job.artisan_account_id}`}
                                    />
                                )}
                                {job.company_account_id && (
                                    <InfoRow
                                        icon={Briefcase}
                                        label="Company"
                                        value={`Account #${job.company_account_id}`}
                                    />
                                )}
                            </div>

                            {/* Completion Information */}
                            {(job.marked_completed_at || job.actual_completed_at) && (
                                <div className="bg-white dark:bg-surface rounded-xl border border-border p-4">
                                    <h4 className="text-sm font-bold text-text-1 mb-3">Completion Details</h4>
                                    {job.marked_completed_at && (
                                        <p className="text-sm text-text-3 mb-1">
                                            Marked complete: {formatDateTime(job.marked_completed_at)}
                                        </p>
                                    )}
                                    {job.actual_completed_at && (
                                        <p className="text-sm text-text-3">
                                            Actually completed: {formatDateTime(job.actual_completed_at)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Booking Reference */}
                            {job.booking_id && (
                                <div className="bg-mist rounded-xl p-4">
                                    <p className="text-sm text-text-4 mb-1">Booking Reference</p>
                                    <p className="text-sm font-semibold text-text-1">Booking #{job.booking_id}</p>
                                </div>
                            )}

                            {/* Hustle Post Reference */}
                            {job.hustle_post_id && (
                                <div className="bg-mist rounded-xl p-4">
                                    <p className="text-sm text-text-4 mb-1">Hustle Post Reference</p>
                                    <p className="text-sm font-semibold text-text-1">Hustle #{job.hustle_post_id}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {!isLoading && !isError && job && (
                    <div className="px-6 py-4 border-t border-border space-y-3">
                        {/* Complete Job Button - Only show for in-progress jobs */}
                        {canComplete && (
                            <Button
                                variant="solid"
                                onClick={handleCompleteJob}
                                disabled={completeJobMutation.isPending || launchingPayment || finalisingCompletion}
                                className="w-full h-11 font-bold rounded-xl flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} />
                                {finalisingCompletion ? 'Completing...' : 'Mark as Complete'}
                            </Button>
                        )}

                        {/* Track Hustler Button - Show for in-progress jobs */}
                        {normalizedStatus === 'in_progress' && job.artisan_account_id && (
                            <Button
                                variant="outline"
                                onClick={handleTrackHustler}
                                className="w-full h-11 font-bold rounded-xl flex items-center justify-center gap-2"
                            >
                                <MapPinned size={18} />
                                Track Hustler Location
                            </Button>
                        )}

                        {/* Close Button */}
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="w-full h-11 font-bold rounded-xl"
                        >
                            Close
                        </Button>
                    </div>
                )}
            </div>

            {/* Payment Confirmation Modal */}
            {showPaymentConfirm && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={() => !launchingPayment && setShowPaymentConfirm(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-surface rounded-3xl border border-border shadow-2xl w-full max-w-md p-6">
                            <h3 className="text-[18px] font-bold text-text-1 mb-4">Complete Job Payment</h3>
                            <p className="text-[13px] text-text-3 mb-4 leading-relaxed">
                                You are about to complete this job and process payment for{' '}
                                <strong className="text-text-1">{formatAmount(job?.total_amount_due, job?.currency_code)}</strong>.
                                You will be redirected to Paystack to complete this payment.
                            </p>
                            <p className="text-[12px] text-text-4 mb-6 leading-relaxed">
                                After successful payment, the job will be marked as complete and you'll be able to leave a review for the service provider.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPaymentConfirm(false)}
                                    disabled={launchingPayment}
                                    className="w-full h-11 text-[14px]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleProceedWithPayment}
                                    disabled={launchingPayment}
                                    className="w-full h-11 text-[14px]"
                                >
                                    {launchingPayment ? 'Opening...' : 'Proceed to Payment'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Review Panel */}
            <ReviewPanel
                isOpen={reviewPanelOpen}
                onClose={() => setReviewPanelOpen(false)}
                onSubmit={handleSubmitReview}
                targetName={job?.artisan_account_id ? `Artisan #${job.artisan_account_id}` : 'Service Provider'}
                isSubmitting={submitReviewMutation.isPending}
            />
        </>
    )
}
