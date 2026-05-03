import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Bookmark, Share2, MapPin, Star, Clock3, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { hustlesService } from '../../hustles/hustles.service.js'
import { messagesService } from '../../messages/messages.service.js'
import { queryKeys } from '../../../services/query-keys.js'
import useUIStore from '../../../shared/store/ui.store.js'
import { getApiMessage } from '../../../shared/utils/apiResponse.js'

const LEVEL_STYLES = {
  entry: { label: 'Entry', cls: 'text-blue-600' },
  mid: { label: 'Intermediate', cls: 'text-amber-600' },
  senior: { label: 'Expert', cls: 'text-emerald-600' },
  beginner: { label: 'Beginner', cls: 'text-blue-600' },
  intermediate: { label: 'Intermediate', cls: 'text-amber-600' },
  expert: { label: 'Expert', cls: 'text-emerald-600' },
}

const STATUS_BADGE = {
  applied: { label: 'Applied', cls: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'In-progress', cls: 'bg-blue-100 text-blue-700' },
  pending_approval: { label: 'Pending', cls: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-700' },
}

function normalizeJobStatus(job) {
  const raw = String(job?.status || job?.job_status || '').toLowerCase()
  if (['completed', 'complete', 'done'].includes(raw)) return 'completed'
  if (['pending', 'pending_approval', 'awaiting_approval', 'awaiting_requester', 'awaiting_service_requester'].includes(raw)) return 'pending_approval'
  if (['in_progress', 'accepted', 'ongoing', 'active'].includes(raw)) return 'in_progress'
  return raw || 'in_progress'
}

function formatAmount(value, currency = 'NGN') {
  if (!value && value !== 0) return '—'
  return `${currency} ${Number(value).toLocaleString()}`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatTime(dateStr) {
  if (!dateStr) return '—'
  const date = dateStr.includes('T') || dateStr.includes(' ') ? new Date(dateStr.replace(' ', 'T')) : new Date(`1970-01-01T${dateStr}`)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()
}

function formatDuration(minutes) {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes} mins`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`
}

function formatPricingModel(model) {
  if (!model) return 'per service'
  if (model === 'full_amount') return 'per service'
  return model.replace(/_/g, ' ')
}

function deriveHustleId(item) {
  const source = item?.item?.hustle || item?.item || {}
  return source.id || item?.item?.hustle_id || item?.item?.hustle_post_id || null
}

function deriveJobId(item) {
  return item?.item?.id || null
}

function deriveConversationParticipantId(detail) {
  return (
    detail?.company_account_id
    ?? detail?.client_account_id
    ?? detail?.requester_account_id
    ?? detail?.owner_account_id
    ?? detail?.hustle?.company_account_id
    ?? detail?.hustle?.client_account_id
    ?? null
  )
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

function JobDescriptionTab({ detail }) {
  const level = LEVEL_STYLES[detail.required_experience_level || detail.experience_level] || LEVEL_STYLES.entry

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[13px] font-semibold text-text-2 mb-1">Description:</p>
        <p className="text-[14px] text-text-3 leading-relaxed">{detail.description || detail.special_instructions || detail.timeline_notes || (detail.service_location_text ? `Service location: ${detail.service_location_text}` : '—')}</p>
      </div>

      {(detail.location_text || detail.service_location_text || detail.city_name) && (
        <div>
          <p className="text-[12px] text-text-4 mb-1">Location</p>
          <div className="flex items-center gap-1.5 text-[14px] font-semibold text-primary">
            <MapPin size={13} />
            <span>{[detail.location_text || detail.service_location_text, detail.city_name].filter(Boolean).join(', ')}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
        <div>
          <p className="text-[12px] text-text-4 mb-1">Experience level</p>
          <p className={`text-[14px] font-bold capitalize ${level.cls}`}>{level.label}</p>
        </div>
        <div>
          <p className="text-[12px] text-text-4 mb-1">Hustle duration</p>
          <p className="text-[14px] font-semibold text-text-1">{formatDuration(detail.duration_minutes || detail.expected_duration_minutes)}</p>
        </div>
        <div>
          <p className="text-[12px] text-text-4 mb-1">Amount</p>
          <p className="text-[14px] font-bold text-text-1">{formatAmount(detail.budget_amount || detail.base_amount || detail.total_amount_due, detail.currency_code || 'NGN')}</p>
        </div>
      </div>

      {detail.skills?.length > 0 && (
        <div>
          <p className="text-[14px] font-bold text-text-1 mb-3">Skills &amp; expertise</p>
          <div className="flex flex-wrap gap-2">
            {detail.skills.map((skill, index) => (
              <span
                key={skill.id || index}
                className="px-3 py-1.5 bg-mist border border-border rounded-full text-[12px] font-semibold text-text-2"
              >
                {skill.name || skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-border">
        <p className="text-[14px] font-bold text-text-1 mb-3">About the requester</p>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[14px]">
              {(detail.company_name || detail.client_name || 'R').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-text-1">{detail.company_name || detail.client_name || 'Requester'}</p>
            {detail.company_location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={11} className="text-text-4" />
                <span className="text-[12px] text-text-4">{detail.company_location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SubmissionTab({ application }) {
  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-mist flex items-center justify-center mb-4">
          <Clock3 size={34} strokeWidth={1.4} className="text-text-4" />
        </div>
        <p className="text-[14px] font-semibold text-text-3">Your application is being reviewed</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12px] text-text-4 mb-1">Total cost</p>
        <p className="text-[24px] font-bold text-text-1 leading-tight">
          {formatAmount(application.offered_amount, application.currency_code || 'NGN')}
          <span className="text-[14px] font-normal text-text-4 ml-1">/{formatPricingModel(application.pricing_model)}</span>
        </p>
      </div>

      {application.timeline_notes && (
        <div>
          <p className="text-[12px] text-text-4 mb-1">Duration for completion</p>
          <p className="text-[15px] font-semibold text-text-1">{application.timeline_notes}</p>
        </div>
      )}

      {application.expected_completion_at && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[12px] text-text-4 mb-1">Expected completion date</p>
            <p className="text-[14px] font-semibold text-text-1">{formatDate(application.expected_completion_at)}</p>
          </div>
          <div>
            <p className="text-[12px] text-text-4 mb-1">Expected completion time</p>
            <p className="text-[14px] font-semibold text-text-1">{formatTime(application.expected_completion_at)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function JobProgressTab({ detail, status }) {
  const amount = detail.provider_net_estimate || detail.base_amount || detail.total_amount_due
  const startedOn = detail.started_at || detail.created_at

  return (
    <div className="space-y-6">
      {status === 'pending_approval' && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-[13px] text-purple-700">
          This job is pending. It has been created and is awaiting the next step in the workflow.
        </div>
      )}

      {status === 'completed' && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-700">
          This hustle has been completed successfully.
        </div>
      )}

      <div>
        <p className="text-[12px] text-text-4 mb-1">Total cost</p>
        <p className="text-[24px] font-bold text-text-1 leading-tight">
          {formatAmount(amount, detail.currency_code || 'NGN')}
          <span className="text-[14px] font-normal text-text-4 ml-1">/{formatPricingModel(detail.pricing_model)}</span>
        </p>
      </div>

      <div>
        <p className="text-[12px] text-text-4 mb-1">Duration for completion</p>
        <p className="text-[15px] font-semibold text-text-1">{formatDuration(detail.duration_minutes || detail.expected_duration_minutes)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[12px] text-text-4 mb-1">Expected completion date</p>
          <p className="text-[14px] font-semibold text-text-1">{formatDate(detail.expected_completion_at || detail.scheduled_start_at || detail.started_at || detail.created_at)}</p>
        </div>
        <div>
          <p className="text-[12px] text-text-4 mb-1">Expected completion time</p>
          <p className="text-[14px] font-semibold text-text-1">{formatTime(detail.expected_completion_at || detail.scheduled_start_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-mist px-4 py-4">
          <p className="text-[12px] text-text-4 mb-1">Started on</p>
          <p className="text-[14px] font-bold text-text-1">{formatDate(startedOn)}</p>
        </div>
        {detail.completed_at && (
          <div className="rounded-2xl bg-mist px-4 py-4">
            <p className="text-[12px] text-text-4 mb-1">Completed on</p>
            <p className="text-[14px] font-bold text-text-1">{formatDate(detail.completed_at)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HustlerHustleDetailPanel({ item, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('job')
  const [saved, setSaved] = useState(false)
  const closeButtonRef = useRef(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { toastSuccess, toastError } = useUIStore()

  const itemType = item?.type || null
  const rawItem = item?.item || null
  const hustleId = deriveHustleId(item)
  const jobId = deriveJobId(item)
  const canSave = Boolean(hustleId)

  const { data: hustleDetail, isLoading: hustleLoading, isError: hustleError, refetch: refetchHustle } = useQuery({
    queryKey: queryKeys.hustles.detail(hustleId),
    queryFn: () => hustlesService.getById(hustleId),
    enabled: Boolean(hustleId) && isOpen && itemType !== 'job',
    staleTime: 60 * 1000,
  })

  const { data: jobDetail, isLoading: jobLoading, isError: jobError, refetch: refetchJob } = useQuery({
    queryKey: queryKeys.jobs.detail(jobId),
    queryFn: () => hustlesService.getJobById(jobId),
    enabled: Boolean(jobId) && isOpen && itemType === 'job',
    staleTime: 60 * 1000,
  })

  const hustle = hustleDetail?.data?.item ?? hustleDetail?.data ?? rawItem?.hustle ?? rawItem ?? null
  const job = jobDetail?.data?.item ?? jobDetail?.data ?? rawItem ?? null

  const detail = useMemo(() => {
    if (itemType === 'job') return { ...(hustle || {}), ...(job || {}) }
    return { ...(rawItem || {}), ...(hustle || {}) }
  }, [itemType, rawItem, hustle, job])

  const isLoading = itemType === 'job' ? jobLoading : hustleLoading
  const isError = itemType === 'job' ? jobError : hustleError
  const refetch = itemType === 'job' ? refetchJob : refetchHustle

  const status = itemType === 'job' ? normalizeJobStatus(detail) : rawItem?.status || 'applied'
  const badge = STATUS_BADGE[status] || STATUS_BADGE.applied
  const application = itemType === 'application' ? rawItem : null
  const conversationParticipantId = itemType === 'job' ? deriveConversationParticipantId(detail) : null

  useEffect(() => {
    if (isOpen) {
      setActiveTab('job')
    }
  }, [isOpen, itemType, hustleId, jobId])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSave = async () => {
    if (!canSave) return
    try {
      if (saved) {
        const response = await hustlesService.unsaveHustle(hustleId)
        setSaved(false)
        toastSuccess(getApiMessage(response, 'Hustle removed from saved.'))
      } else {
        const response = await hustlesService.saveHustle(hustleId)
        setSaved(true)
        toastSuccess(getApiMessage(response, 'Hustle saved!'))
      }
    } catch {
      toastError('Failed to update saved status.')
    }
  }

  const handleShare = () => {
    const target = hustleId ? `${window.location.origin}/hustles/${hustleId}` : window.location.href
    navigator.clipboard?.writeText(target)
    toastSuccess('Link copied to clipboard!')
  }

  const initiateConversationMutation = useMutation({
    mutationFn: () => {
      if (!conversationParticipantId) {
        throw new Error('No client account was found for this job.')
      }

      return messagesService.initiateConversation({
        participant_account_id: conversationParticipantId,
        conversation_type: 'direct',
        job_id: jobId,
      })
    },
    onSuccess(response) {
      const conversationId = resolveConversationId(response)
      if (!conversationId) {
        toastError('Conversation created, but no conversation id was returned.')
        return
      }

      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversations', 'thread', conversationId] })
      toastSuccess('Conversation opened.')
      onClose()
      navigate(`/messages/${conversationId}`)
    },
    onError(error) {
      toastError(error.message ?? 'Failed to open messages.')
    },
  })

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={onClose}
            />

            <motion.div
              key="panel"
              role="dialog"
              aria-label="Hustle details"
              aria-modal="true"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[560px] bg-white dark:bg-surface flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border flex-shrink-0">
                <span className="text-[15px] font-bold text-text-1">Hustle details</span>
                <div className="flex items-center gap-2">
                  {itemType === 'job' && (
                    <button
                      onClick={() => initiateConversationMutation.mutate()}
                      disabled={initiateConversationMutation.isPending || !conversationParticipantId}
                      className="px-4 py-2 bg-white dark:bg-transparent border border-border text-[13px] font-bold rounded-full hover:bg-mist transition-all disabled:opacity-60 flex items-center gap-2"
                      aria-label="Message client"
                    >
                      {initiateConversationMutation.isPending ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <MessageSquare size={14} />
                      )}
                      Message
                    </button>
                  )}
                  {canSave && (
                    <button
                      onClick={handleSave}
                      className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${saved ? 'bg-amber-50 border-amber-300' : 'border-border hover:bg-mist'
                        }`}
                      aria-label={saved ? 'Remove bookmark' : 'Bookmark hustle'}
                    >
                      <Bookmark size={15} className={saved ? 'text-amber-500 fill-amber-500' : 'text-text-3'} />
                    </button>
                  )}
                  <button
                    onClick={handleShare}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-mist transition-all"
                    aria-label="Share hustle"
                  >
                    <Share2 size={15} className="text-text-3" />
                  </button>
                  <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-mist transition-all"
                    aria-label="Close panel"
                  >
                    <X size={15} className="text-text-3" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : isError ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-[15px] font-bold text-text-1 mb-2">Failed to load hustle</p>
                    <p className="text-[13px] text-text-4 mb-4">Something went wrong.</p>
                    <button
                      onClick={() => refetch()}
                      className="px-5 py-2.5 bg-primary text-white text-[13px] font-bold rounded-full hover:bg-primary-sat transition-all"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>

                    {status === 'pending_approval' && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-purple-100 text-purple-700">
                          Awaiting service requester to complete their side of the flow
                        </span>
                      </div>
                    )}

                    <h2 className="text-[20px] font-bold text-text-1 mb-4 leading-snug">{detail.title || detail.hustle_title || detail.service_title || '—'}</h2>

                    <div className="flex gap-6 border-b border-border mb-5">
                      {[
                        { key: 'job', label: 'Job description' },
                        { key: 'details', label: itemType === 'job' ? 'Job details' : 'Your submission' },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`pb-3 text-[13px] font-semibold transition-colors relative ${activeTab === tab.key ? 'text-text-1' : 'text-text-4 hover:text-text-2'
                            }`}
                        >
                          {tab.label}
                          {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />}
                        </button>
                      ))}
                    </div>

                    {activeTab === 'job' && <JobDescriptionTab detail={detail} />}
                    {activeTab === 'details' && itemType === 'job' && <JobProgressTab detail={detail} status={status} />}
                    {activeTab === 'details' && itemType !== 'job' && <SubmissionTab application={application} />}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  )
}
