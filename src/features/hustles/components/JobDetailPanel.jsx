import { X, MapPin, Clock, Calendar, User, Briefcase, AlertCircle, CheckCircle, MapPinned } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../../../shared/components/Button'
import Image from '../../../shared/components/Image'
import { ReviewPanel } from '../../../shared/hustles/ReviewPanel'
import { jobsService } from '../../../shared/hustles/jobs.service'
import { publicProfileService } from '../../../shared/api/publicProfile.service.js'
import { queryKeys } from '../../../services/query-keys'
import { useCompleteJob, useSubmitJobReview } from '../hustles.hooks'
import useUIStore from '../../../shared/store/ui.store'
import {
    formatCurrencyDisplay as sharedFormatCurrencyDisplay,
    formatDateTime as sharedFormatDateTime,
    formatDurationMinutes as sharedFormatDurationMinutes,
} from '../../../shared/lib/format.js'
import {
    firstDefined as sharedFirstDefined,
    getProfileDisplayName as sharedGetProfileDisplayName,
    getProfileLocation as sharedGetProfileLocation,
} from '../../../shared/lib/normalize.js'
import { unwrapItem as sharedUnwrapItem } from '../../../shared/lib/api/response.js'


const STATUS_STYLES = {
    pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
    awaiting_payment: { label: 'Awaiting Payment', cls: 'bg-[#CBCEC0] dark:bg-[#4A4D47] text-[#2F6B60] dark:text-[#6FA79D] border-[#A8ABA0] dark:border-[#2F322D]' },
    in_progress: { label: 'In Progress', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
    completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-600 border-red-200' },
}

function normalizeStatus(status) {
    const raw = String(status || '').toLowerCase()
    if (['completed', 'complete', 'done'].includes(raw)) return 'completed'
    if (['awaiting_payment'].includes(raw)) return 'awaiting_payment'
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

function firstDefined(...values) {
    return values.find(value => value !== undefined && value !== null && value !== '')
}

function getProfileName(profile, fallbackLabel) {
    return firstDefined(
        profile?.name,
        [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim(),
        profile?.display_name,
        profile?.company_name,
        fallbackLabel
    )
}

function getProfileLocation(profile) {
    return firstDefined(
        profile?.location_text,
        profile?.city_name,
        profile?.country_name,
        profile?.address,
        'Location not provided'
    )
}

function ParticipantCard({ title, profile, fallbackId }) {
    const displayName = sharedGetProfileDisplayName(profile, `Account #${fallbackId}`)
    const role = sharedFirstDefined(profile?.account_type, profile?.role, profile?.user_type, title)
    // const email = sharedFirstDefined(profile?.contact.email, profile?.contact_email)
    // const phone = sharedFirstDefined(profile?.phone_number, profile?.phone, profile?.contact_phone)
    const location = sharedGetProfileLocation(profile)

    return (
        <div className="border-b border-border px-4 py-4 last:border-0">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-mist">
                    <Image src={profile?.avatar_url} size={`100%`} className="text-text-3 rounded-lg object-cover h-full" />
                </div>
                <div className="min-w-0 flex-1">
                    {/* <p className="text-xs font-bold uppercase tracking-wide text-text-4">{title}</p> */}
                    <p className=" text-base font-semibold text-text-1">{displayName}</p>
                    <p className="mt-1 text-sm capitalize text-text-4">{String(role).replaceAll('_', ' ')}</p>
                    <div className="mt-1 grid grid-cols-1 gap-2 text-sm text-text-3">
                        <p className="text-[14px] text-text-4">Location: {location}</p>
                        {/* {email && <p>Email: {email}</p>}
                        {phone && <p>Phone: {phone}</p>} */}
                    </div>
                    {profile?.bio && (
                        <p className="mt-1 text-[14px] leading-relaxed text-text-3">Bio: {profile.bio}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

function PaymentBreakdown({ job }) {
    const currency = job.currency_code || 'NGN'

    return (
        <div className="bg-white dark:bg-surface rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
                <h4 className="text-sm font-bold text-text-1">Payment Breakdown</h4>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-text-3">Base amount</span>
                    <span className="text-sm font-semibold text-text-1">{sharedFormatCurrencyDisplay(job.base_amount, currency)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-text-3">Platform service fee</span>
                    <span className="text-sm font-semibold text-text-1">{sharedFormatCurrencyDisplay(job.platform_service_fee_amount, currency)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-text-3">Insurance</span>
                    <span className="text-sm font-semibold text-text-1">{sharedFormatCurrencyDisplay(job.insurance_amount, currency)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                    <span className="text-sm font-bold text-text-1">Total amount due</span>
                    <span className="text-lg font-bold text-primary">{sharedFormatCurrencyDisplay(job.total_amount_due, currency)}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 border-t border-border pt-3 sm:grid-cols-2">
                    <div>
                        <p className="text-xs text-text-4 mb-1">Provider net estimate</p>
                        <p className="text-sm font-semibold text-text-1">{sharedFormatCurrencyDisplay(job.provider_net_estimate, currency)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-text-4 mb-1">Payment status</p>
                        <p className="text-sm font-semibold capitalize text-text-1">{job.payment_status || 'pending'}</p>
                    </div>
                </div>
                {job.payment_gateway_reference && (
                    <div className="border-t border-border pt-3">
                        <p className="text-xs text-text-4 mb-1">Payment reference</p>
                        <p className="break-all text-sm font-semibold text-text-1">{job.payment_gateway_reference}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export function JobDetailPanel({ isOpen, onClose, jobId }) {
    const [reviewPanelOpen, setReviewPanelOpen] = useState(false)
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
    const { toastInfo, toastError } = useUIStore()

    const {
        data: jobData,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: queryKeys.jobs.detail(jobId),
        queryFn: () => jobsService.getJobById(jobId),
        select: (response) => sharedUnwrapItem(response),
        enabled: Boolean(jobId) && isOpen,
        staleTime: 60 * 1000,
        retry: 1,
    })

    const job = jobData ?? null
    const clientAccountId = job?.client_account_id ?? job?.posted_by_account_id ?? null
    const artisanAccountId = job?.artisan_account_id ?? job?.provider_account_id ?? null

    const { data: clientProfile } = useQuery({
        queryKey: queryKeys.profiles.public(clientAccountId),
        queryFn: () => publicProfileService.getProfile(clientAccountId),
        enabled: Boolean(isOpen) && Boolean(clientAccountId),
        staleTime: 60 * 1000,
        retry: 1,
    })

    const { data: artisanProfile } = useQuery({
        queryKey: queryKeys.profiles.public(artisanAccountId),
        queryFn: () => publicProfileService.getProfile(artisanAccountId),
        enabled: Boolean(isOpen) && Boolean(artisanAccountId),
        staleTime: 60 * 1000,
        retry: 1,
    })

    const completeJobMutation = useCompleteJob()
    const submitReviewMutation = useSubmitJobReview()

    const handleCompleteJob = async () => {
        if (!job?.id) return
        // Show confirmation modal
        setShowCompleteConfirm(true)
    }

    const confirmCompleteJob = async () => {
        if (!job?.id) return

        try {
            await completeJobMutation.mutateAsync(job.id)
            setShowCompleteConfirm(false)
            // Open review panel after successful completion
            setReviewPanelOpen(true)
        } catch (error) {
            setShowCompleteConfirm(false)
            // Error is handled by the mutation hook
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
                            <p className="text-sm text-text-4 mb-4">{error?.message || 'Please try again later.'}</p>
                            <Button
                                variant="solid"
                                onClick={() => refetch()}
                                className="px-4 py-2 text-sm font-bold rounded-lg"
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    {!isLoading && !isError && job && (
                        <div className="p-6 space-y-6">
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
                                <p className="text-base text-text-4">Created {sharedFormatDateTime(job.created_at)}</p>
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
                                    value={sharedFormatDateTime(job.scheduled_start_at)}
                                />
                                <InfoRow
                                    icon={Clock}
                                    label="Expected Duration"
                                    value={sharedFormatDurationMinutes(job.expected_duration_minutes)}
                                />
                                {job.expected_completion_at && (
                                    <InfoRow
                                        icon={Calendar}
                                        label="Expected Completion"
                                        value={sharedFormatDateTime(job.expected_completion_at)}
                                    />
                                )}
                            </div>

                            <PaymentBreakdown job={job} />

                            {/* Participant Information */}
                            <div className="bg-white dark:bg-surface p-2 rounded-xl border border-border overflow-hidden">
                                <div className="px-4 py-3 border-b border-border">
                                    <h4 className="text-sm font-bold text-text-1">Participants</h4>
                                </div>
                                {clientAccountId && (
                                    <ParticipantCard
                                        icon={User}
                                        title="Client"
                                        profile={clientProfile?.profile ?? clientProfile ?? null}
                                        fallbackId={clientAccountId}
                                    />
                                )}
                                {artisanAccountId && (
                                    <ParticipantCard
                                        icon={Briefcase}
                                        title="Artisan"
                                        profile={artisanProfile?.profile ?? artisanProfile ?? null}
                                        fallbackId={artisanAccountId}
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
                                            Marked complete: {sharedFormatDateTime(job.marked_completed_at)}
                                        </p>
                                    )}
                                    {job.actual_completed_at && (
                                        <p className="text-sm text-text-3">
                                            Actually completed: {sharedFormatDateTime(job.actual_completed_at)}
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
                                disabled={completeJobMutation.isPending}
                                className="w-full h-11 font-bold rounded-xl flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} />
                                {completeJobMutation.isPending ? 'Completing...' : 'Mark as Complete'}
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

            {/* Completion Confirmation Modal */}
            {showCompleteConfirm && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
                        onClick={() => !completeJobMutation.isPending && setShowCompleteConfirm(false)}
                    />
                    <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
                        <div className="bg-surface rounded-3xl border border-border shadow-2xl w-full max-w-md p-6">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
                                <CheckCircle size={24} className="text-green-600" />
                            </div>
                            <h3 className="text-[18px] font-bold text-text-1 text-center mb-2">
                                Mark Job as Complete?
                            </h3>
                            <p className="text-[14px] text-text-3 text-center mb-6 leading-relaxed">
                                This job will be marked as completed and the hustler will be credited with their earnings.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCompleteConfirm(false)}
                                    disabled={completeJobMutation.isPending}
                                    className="flex-1 h-11 text-[14px] font-bold rounded-full"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="solid"
                                    onClick={confirmCompleteJob}
                                    disabled={completeJobMutation.isPending}
                                    className="flex-1 h-11 text-[14px] font-bold rounded-full"
                                >
                                    {completeJobMutation.isPending ? 'Completing...' : 'Confirm'}
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
