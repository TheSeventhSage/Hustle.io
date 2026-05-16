import { useState } from 'react'
import { X, Bookmark, MoreHorizontal, MapPin, Clock, CheckCircle, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { hustlesService } from '../../hustles/hustles.service.js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useApplyToHustle } from '../../hustles/hustles.hooks.js'
import useUIStore from '../../../shared/store/ui.store.js'
import ProposalPanel from './ProposalPanel.jsx'
import { settingsService } from '../../../shared/api/settings.service.js'
import { useCityAccess } from '../../city-access/cityAccess.hooks.js'
import { getCityAccessForCity, hasActiveCityAccess } from '../../city-access/cityAccess.utils.js'
import { unwrapData } from '../../../shared/lib/api/response.js'

const LEVEL_STYLES = {
    entry: { label: 'Entry', cls: 'text-blue-600' },
    mid: { label: 'Intermediate', cls: 'text-amber-600' },
    senior: { label: 'Expert', cls: 'text-emerald-600' },
}

function formatAmount(v) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v)
}
function formatDuration(mins) {
    if (!mins) return '—'
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60), r = mins % 60
    return r ? `${h}h ${r}m` : `${h}h`
}

function formatAmountSafe(value, currencyCode = 'NGN') {
    if (value === null || value === undefined || value === '') return '—'

    const amount = Number(value)
    if (!Number.isFinite(amount)) return '—'

    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currencyCode || 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

function formatDurationSafe(mins) {
    const value = Number(mins)
    if (!Number.isFinite(value) || value <= 0) return '—'
    if (value < 60) return `${value} min`

    const h = Math.floor(value / 60)
    const r = value % 60
    return r ? `${h}h ${r}m` : `${h}h`
}

function formatPreferredDate(dateStr) {
    if (!dateStr) return '—'

    const date = new Date(`${dateStr}T00:00:00`)
    if (Number.isNaN(date.getTime())) return dateStr

    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function formatPreferredTime(time24) {
    if (!time24) return ''

    const [hours, minutes] = String(time24).split(':')
    const parsedHours = Number(hours)
    if (!Number.isFinite(parsedHours)) return String(time24)

    const period = parsedHours >= 12 ? 'PM' : 'AM'
    const hour12 = parsedHours === 0 ? 12 : parsedHours > 12 ? parsedHours - 12 : parsedHours
    return `${hour12}:${minutes} ${period}`
}

function formatPreferredTimeRange(startTime, endTime) {
    if (!startTime || !endTime) return '—'
    return `${formatPreferredTime(startTime)} - ${formatPreferredTime(endTime)}`
}

function joinUniqueParts(parts) {
    return [...new Set(parts.filter(Boolean).map((part) => String(part).trim()).filter(Boolean))]
}

function getHustleLocationLabel(hustle) {
    return joinUniqueParts([hustle?.location_text, hustle?.city_name]).join(', ') || '—'
}

function getRequesterLocationLabel(hustle) {
    return joinUniqueParts([hustle?.city_name, hustle?.country_name]).join(', ') || hustle?.location_text || '—'
}

function isKycVerified(kycStatus) {
    const raw = String(
        kycStatus?.submission?.status
        ?? kycStatus?.status
        ?? kycStatus?.review_status
        ?? kycStatus?.verification_status
        ?? kycStatus?.submission_status
        ?? ''
    ).toLowerCase()

    return ['verified', 'approved', 'active'].includes(raw)
}

function resolveCityId(hustle) {
    const raw = hustle?.city_id ?? hustle?.city?.id ?? hustle?.city?.city_id
    if (raw && typeof raw === 'object') {
        return raw.id ?? raw.city_id ?? null
    }
    return raw ?? null
}

export default function HustleDetailPanel({ hustleId, isOpen, onClose }) {
    const [tab, setTab] = useState('job')
    const [moreOpen, setMoreOpen] = useState(false)
    const [saved, setSaved] = useState(false)
    const [saveBanner, setSaveBanner] = useState(false)
    const [proposalOpen, setProposalOpen] = useState(false)
    const [applied, setApplied] = useState(false)
    const [submission, setSubmission] = useState(null)
    const [successModal, setSuccessModal] = useState(false)

    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { toastError, toastWarning } = useUIStore()
    const { mutate: applyToHustle, isPending: applyingDirect } = useApplyToHustle()

    // Fetch hustle detail — GET /hustles/{id}
    const { data: hustle, isLoading } = useQuery({
        queryKey: ['hustles', 'detail', hustleId],
        queryFn: () => hustlesService.getById(hustleId),
        enabled: Boolean(hustleId) && isOpen,
        select: (response) => {
            const payload = unwrapData(response)
            return payload?.item ?? payload ?? null
        },
    })

    const {
        data: kycStatus,
        isLoading: kycLoading,
        isError: kycError,
    } = useQuery({
        queryKey: ['kyc', 'status'],
        queryFn: settingsService.getKycStatus,
        enabled: isOpen,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    })

    const {
        data: cityAccessRows = [],
        isLoading: cityAccessLoading,
        isError: cityAccessError,
    } = useCityAccess({}, {
        enabled: isOpen,
        retry: 1,
    })

    const hustleCityId = resolveCityId(hustle)
    const hasAccessToHustleCity = !hustleCityId || hasActiveCityAccess(cityAccessRows, hustleCityId)
    const cityAccessRow = getCityAccessForCity(cityAccessRows, hustleCityId)
    const canApplyToHustle = isKycVerified(kycStatus) && hasAccessToHustleCity
    const isCheckingEligibility = kycLoading || cityAccessLoading
    const missingCityAccess = Boolean(hustleCityId) && !cityAccessLoading && !hasAccessToHustleCity

    const goToCitySubscription = () => {
        const params = new URLSearchParams({ section: 'my-subscription' })
        if (hustleCityId) params.set('city_id', String(hustleCityId))
        navigate(`/settings?${params.toString()}`)
    }

    const requireApplicationEligibility = () => {
        if (kycLoading) {
            toastWarning('Checking KYC status. Please wait.')
            return false
        }

        if (cityAccessLoading) {
            toastWarning('Checking city access. Please wait.')
            return false
        }

        if (kycError || !canApplyToHustle) {
            if (!isKycVerified(kycStatus)) {
                toastError('Your KYC must be verified before you can apply for a hustle.')
            } else if (cityAccessError) {
                toastError('Unable to confirm your city access. Please try again.')
            } else if (!hasAccessToHustleCity) {
                toastError('Subscribe to this hustle city before applying.')
            }
            return false
        }

        return true
    }

    const handleSave = () => {
        setSaved(true)
        setSaveBanner(true)
        setTimeout(() => setSaveBanner(false), 4000)
    }

    // Called when ProposalPanel successfully submits to API
    const handleProposalSubmit = (proposalData) => {
        setProposalOpen(false)
        setApplied(true)
        setSubmission(proposalData)
        setSuccessModal(true)
        queryClient.invalidateQueries({ queryKey: ['hustles', 'applications'] })
    }

    // "Apply without submitting a proposal" — POST /hustles/{id}/applications with minimal payload
    const handleApplyDirect = () => {
        if (!hustle || !requireApplicationEligibility()) return
        setMoreOpen(false)

        const payload = {
            pricing_model: hustle.payment_model || 'full_amount',
            offered_amount: parseFloat(hustle.budget_amount) || 0,
            currency_code: hustle.currency_code || 'NGN',
            expected_completion_at: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] + ' 23:59:00',
            timeline_notes: 'Applying without a custom proposal',
        }

        applyToHustle(
            { hustleId: hustle.id, data: payload },
            {
                onSuccess() {
                    setApplied(true)
                    setSubmission(payload)
                    setSuccessModal(true)
                    queryClient.invalidateQueries({ queryKey: ['hustles', 'applications'] })
                },
            }
        )
    }

    const level = LEVEL_STYLES[hustle?.required_experience_level] || LEVEL_STYLES.entry
    const requesterName = hustle?.posted_by_name
        || [hustle?.poster_first_name, hustle?.poster_last_name].filter(Boolean).join(' ')
        || hustle?.company_name
        || 'Requester'
    const hustleLocationLabel = getHustleLocationLabel(hustle)
    const requesterLocationLabel = getRequesterLocationLabel(hustle)
    const preferredDateLabel = formatPreferredDate(hustle?.preferred_date)
    const preferredTimeLabel = formatPreferredTimeRange(hustle?.preferred_start_time, hustle?.preferred_end_time)
    const hasPreferredSchedule = preferredDateLabel !== '—' || preferredTimeLabel !== '—'

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/30 z-40"
                            onClick={onClose}
                        />

                        <motion.div
                            key="panel"
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[560px] bg-white dark:bg-surface flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-3 sm:px-6 py-4 border-b border-border flex-shrink-0">
                                <span className="text-[15px] font-bold text-text-1">Hustle details</span>
                                <div className="flex items-center gap-2">

                                    {applied ? (
                                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[12px] font-bold rounded-full">Applied</span>
                                    ) : (
                                        <>
                                            {/* Submit a proposal — primary CTA */}
                                            <button
                                                onClick={() => {
                                                    if (!requireApplicationEligibility()) return
                                                    setMoreOpen(false)
                                                    setProposalOpen(true)
                                                }}
                                                disabled={isCheckingEligibility || missingCityAccess}
                                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white text-[12px] font-bold rounded-full hover:bg-primary-sat transition-all disabled:opacity-60"
                                            >
                                                {missingCityAccess ? 'City access required' : 'Submit a proposal'}
                                            </button>

                                            {/* More dropdown */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setMoreOpen(o => !o)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-mist transition-all"
                                                >
                                                    <MoreHorizontal size={15} className="text-text-3" />
                                                </button>

                                                <AnimatePresence>
                                                    {moreOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                            transition={{ duration: 0.12 }}
                                                            className="absolute top-10 right-0 bg-white dark:bg-surface border border-border rounded-2xl shadow-xl z-10 w-64 py-2"
                                                        >
                                                            <div className="flex items-center justify-between px-4 pb-3 border-b border-border mb-1">
                                                                <span className="text-[14px] font-bold text-text-1">More</span>
                                                                <button onClick={() => setMoreOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-mist">
                                                                    <X size={13} className="text-text-3" />
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    if (!requireApplicationEligibility()) return
                                                                    setMoreOpen(false)
                                                                    setProposalOpen(true)
                                                                }}
                                                                disabled={isCheckingEligibility || missingCityAccess}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-text-2 hover:bg-mist transition-colors text-left disabled:opacity-50"
                                                            >
                                                                <span className="w-4 h-4 rounded-full border-2 border-text-4 flex-shrink-0" />
                                                                Submit a proposal
                                                            </button>
                                                            <button
                                                                onClick={handleApplyDirect}
                                                                disabled={applyingDirect || isCheckingEligibility || missingCityAccess}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-text-2 hover:bg-mist transition-colors text-left disabled:opacity-50"
                                                            >
                                                                <span className="w-4 h-4 rounded-full border-2 border-text-4 flex-shrink-0" />
                                                                {applyingDirect ? 'Applying...' : 'Apply without submitting a proposal'}
                                                            </button>
                                                            {missingCityAccess && (
                                                                <button
                                                                    onClick={() => {
                                                                        setMoreOpen(false)
                                                                        goToCitySubscription()
                                                                    }}
                                                                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-primary hover:bg-mist transition-colors text-left"
                                                                >
                                                                    <MapPin size={15} />
                                                                    Subscribe to this city
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </>
                                    )}

                                    {/* Save */}
                                    <button
                                        onClick={handleSave}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${saved ? 'bg-amber-50 border-amber-300' : 'border-border hover:bg-mist'}`}
                                    >
                                        <Bookmark size={15} className={saved ? 'text-amber-500 fill-amber-500' : 'text-text-3'} />
                                    </button>

                                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-mist transition-all">
                                        <X size={15} className="text-text-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-5">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : !hustle ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <p className="text-[15px] font-bold text-text-1 mb-2">Hustle not found</p>
                                        <p className="text-[13px] text-text-4">This hustle may have been removed or is no longer available.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Save banner */}
                                        <AnimatePresence>
                                            {saveBanner && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                                    className="flex items-center gap-3 px-4 py-3 bg-primary rounded-xl mb-4"
                                                >
                                                    <CheckCircle size={16} className="text-white flex-shrink-0" />
                                                    <span className="text-[13px] font-semibold text-white flex-1">Job saved successfully</span>
                                                    <button className="text-white/70 text-[12px] font-semibold underline">Click here to view</button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Tabs (only after applying) */}
                                        {applied && (
                                            <div className="flex gap-6 border-b border-border mb-5">
                                                {[
                                                    { key: 'job', label: 'Job description' },
                                                    { key: 'submission', label: 'Your submission' },
                                                ].map(t => (
                                                    <button
                                                        key={t.key}
                                                        onClick={() => setTab(t.key)}
                                                        className={`pb-3 text-[13px] font-semibold transition-colors relative ${tab === t.key ? 'text-text-1' : 'text-text-4'}`}
                                                    >
                                                        {t.label}
                                                        {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Job description */}
                                        {tab === 'job' && (
                                            <>
                                                <h2 className="text-[20px] font-bold text-text-1 mb-4 leading-snug">{hustle.title}</h2>

                                                <div className="mb-4">
                                                    <p className="text-[13px] font-semibold text-text-2 mb-1">Description:</p>
                                                    <p className="text-[14px] text-text-3 leading-relaxed">{hustle.description}</p>
                                                </div>

                                                {hustleLocationLabel !== '—' && (
                                                    <div className="mb-5">
                                                        <p className="text-[12px] text-text-4 mb-1">Location</p>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin size={13} className="text-primary" />
                                                            <span className="text-[14px] font-semibold text-primary">{hustleLocationLabel}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {hustleCityId && (
                                                    <div className={`mb-5 rounded-xl border p-4 ${hasAccessToHustleCity ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className={`text-[13px] font-bold ${hasAccessToHustleCity ? 'text-green-800' : 'text-amber-900'}`}>
                                                                    {hasAccessToHustleCity ? 'City access active' : 'City subscription required'}
                                                                </p>
                                                                <p className={`mt-1 text-[12px] ${hasAccessToHustleCity ? 'text-green-700' : 'text-amber-700'}`}>
                                                                    {hasAccessToHustleCity
                                                                        ? `You can apply to hustles in ${hustle.city_name ?? 'this city'}.`
                                                                        : `Subscribe to ${hustle.city_name ?? 'this city'} before applying.`}
                                                                </p>
                                                                {cityAccessRow?.ends_at && hasAccessToHustleCity && (
                                                                    <p className="mt-1 text-[11px] text-green-700">
                                                                        Access ends {new Date(cityAccessRow.ends_at).toLocaleDateString()}.
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {!hasAccessToHustleCity && (
                                                                <button
                                                                    type="button"
                                                                    onClick={goToCitySubscription}
                                                                    className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[12px] font-bold text-white hover:bg-primary-sat"
                                                                >
                                                                    Subscribe
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Preferred Schedule Section - Highlighted if available */}
                                                {hasPreferredSchedule && (
                                                    <div className="mb-5 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Calendar size={16} className="text-primary" />
                                                            <p className="text-[13px] font-bold text-text-1">Preferred Schedule</p>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {preferredDateLabel !== '—' && (
                                                                <div>
                                                                    <p className="text-[11px] text-text-4 mb-1">Date</p>
                                                                    <p className="text-[13px] font-semibold text-primary">{preferredDateLabel}</p>
                                                                </div>
                                                            )}
                                                            {preferredTimeLabel !== '—' && (
                                                                <div>
                                                                    <p className="text-[11px] text-text-4 mb-1">Time Window</p>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock size={13} className="text-primary flex-shrink-0" />
                                                                        <p className="text-[13px] font-semibold text-primary">{preferredTimeLabel}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {hustle.timezone_name && (
                                                                <div className="col-span-1 sm:col-span-2">
                                                                    <p className="text-[11px] text-text-4 mb-1">Timezone</p>
                                                                    <p className="text-[12px] font-medium text-text-2">{hustle.timezone_name}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-3 gap-4 mb-5">
                                                    <div>
                                                        <p className="text-[12px] text-text-4 mb-1">Experience level</p>
                                                        <p className={`text-[14px] font-bold ${level.cls}`}>{level.label}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[12px] text-text-4 mb-1">Hustle Duration</p>
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={12} className="text-text-4" />
                                                            <p className="text-[14px] font-semibold text-text-1">{formatDurationSafe(hustle.duration_minutes)}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[12px] text-text-4 mb-1">Amount:</p>
                                                        <p className="text-[14px] font-bold text-text-1">{formatAmountSafe(hustle.budget_amount, hustle.currency_code)}</p>
                                                    </div>
                                                </div>

                                                {/* About the client — from API data only */}
                                                <div className="pt-4 border-t border-border">
                                                    <p className="text-[14px] font-bold text-text-1 mb-3">About the client</p>
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                            <span className="text-white text-[14px] font-bold">
                                                                {requesterName.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-[14px] font-bold text-text-1">{requesterName}</p>
                                                            {hustle?.poster_account_type && (
                                                                <p className="text-[12px] text-text-4 capitalize">{hustle.poster_account_type}</p>
                                                            )}
                                                            {hustle?.posted_by_name && hustle.posted_by_name !== requesterName && (
                                                                <p className="text-[12px] text-text-4">{hustle.posted_by_name}</p>
                                                            )}
                                                            {requesterLocationLabel !== '—' && (
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <MapPin size={11} className="text-text-4" />
                                                                    <span className="text-[12px] text-text-4">{requesterLocationLabel}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Submission tab */}
                                        {tab === 'submission' && submission && (
                                            <div>
                                                <div className="mb-5">
                                                    <p className="text-[12px] text-text-4 mb-1">Total Cost:</p>
                                                    <p className="text-[22px] font-bold text-text-1">
                                                        ₦ {Number(submission.offered_amount).toFixed(2)}
                                                        <span className="text-[14px] font-normal text-text-4 ml-1">
                                                            /{submission.pricing_model?.replace('_', ' ')}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="mb-4">
                                                    <p className="text-[12px] text-text-4 mb-1">Duration for Completion</p>
                                                    <p className="text-[15px] font-semibold text-text-1">{submission.timeline_notes || '—'}</p>
                                                </div>
                                                {submission.expected_completion_at && (
                                                    <div>
                                                        <p className="text-[12px] text-text-4 mb-1">Preferred date</p>
                                                        <p className="text-[14px] font-semibold text-text-1">{submission.expected_completion_at}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Proposal panel */}
            <ProposalPanel
                isOpen={proposalOpen}
                hustle={hustle}
                onClose={() => setProposalOpen(false)}
                onSubmit={handleProposalSubmit}
                canApply={canApplyToHustle}
                isCheckingKyc={isCheckingEligibility}
                eligibilityReason={
                    !isKycVerified(kycStatus)
                        ? 'Your KYC must be verified before you can submit a proposal for a hustle.'
                        : missingCityAccess
                            ? `Subscribe to ${hustle?.city_name ?? 'this city'} before submitting a proposal.`
                            : ''
                }
                onSubscribeCity={goToCitySubscription}
            />

            {/* Success modal */}
            <AnimatePresence>
                {successModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center px-4"
                    >
                        <div className="absolute inset-0 bg-black/40" onClick={() => setSuccessModal(false)} />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-[380px] px-8 py-10 flex flex-col items-center text-center"
                        >
                            <div className="relative w-20 h-20 mb-5">
                                <svg className="absolute inset-0" style={{ animation: 'spin-slow 6s linear infinite' }} width="80" height="80" viewBox="0 0 80 80">
                                    {[...Array(12)].map((_, i) => {
                                        const angle = (i / 12) * 2 * Math.PI - Math.PI / 2
                                        const cx = 40 + 36 * Math.cos(angle), cy = 40 + 36 * Math.sin(angle)
                                        return <circle key={i} cx={cx} cy={cy} r="3" fill="#22c55e" opacity={0.25 + (i / 12) * 0.75} />
                                    })}
                                </svg>
                                <div className="absolute inset-3 rounded-full bg-green-500 flex items-center justify-center">
                                    <CheckCircle size={28} className="text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                            <h3 className="text-[17px] font-extrabold text-text-1 mb-3 leading-snug">
                                Your proposal has been successfully submitted and is being reviewed
                            </h3>
                            <button
                                onClick={() => { setSuccessModal(false); setTab('submission') }}
                                className="w-full h-12 bg-primary text-white font-bold rounded-full text-[14px] hover:bg-primary-sat transition-all mt-2"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </>
    )
}
