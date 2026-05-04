import { useCallback, useMemo, useState } from 'react'
import { Bookmark, Share2, Star, AlertCircle, RefreshCw } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/Button.jsx'
import { EmptyState } from '../../../shared/components/EmptyState.jsx'
import { storage } from '../../../services/storage.js'
import { hustlesService } from '../../hustles/hustles.service.js'
import { queryKeys } from '../../../services/query-keys.js'
import useUIStore from '../../../shared/store/ui.store.js'
import { getApiMessage } from '../../../shared/utils/apiResponse.js'
import HustlerHustleDetailPanel from '../components/HustlerHustleDetailPanel.jsx'
import MyBookingsPanel from '../../booking/components/MyBookingsPanel.jsx'

const TABS = [
  { key: 'applied', label: 'Applied' },
  { key: 'in_progress', label: 'In-progress' },
  // { key: 'pending_approval', label: 'Pending approval' },
  { key: 'completed', label: 'Completed' },
  { key: 'saved', label: 'Saved hustles' },
  { key: 'reviews', label: 'All reviews' },
]

const EMPTY_STATES = {
  applied: { title: 'No hustle applied', description: 'All hustles you have applied to will be displayed here' },
  in_progress: { title: 'No active jobs', description: 'Jobs currently in progress will be displayed here' },
  pending_approval: { title: 'No hustle pending approval', description: 'Jobs awaiting requester confirmation will be displayed here' },
  completed: { title: 'No hustle completed', description: 'All completed hustles will be displayed here' },
  saved: { title: 'No saved hustles', description: 'All hustles you have bookmarked will be displayed here' },
  reviews: { title: 'No reviews yet', description: 'Reviews from clients will appear here after you complete hustles' },
}

const LEVEL_STYLES = {
  entry: { label: 'Entry', cls: 'text-blue-600' },
  mid: { label: 'Intermediate', cls: 'text-amber-600' },
  senior: { label: 'Expert', cls: 'text-emerald-600' },
  beginner: { label: 'Beginner', cls: 'text-blue-600' },
  intermediate: { label: 'Intermediate', cls: 'text-amber-600' },
  expert: { label: 'Expert', cls: 'text-emerald-600' },
}

const JOB_STATUS_LABELS = {
  in_progress: 'In-progress',
  pending_approval: 'Pending',
  completed: 'Completed',
}

function formatRelativeTime(dateString) {
  if (!dateString) return 'Posted now'
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Posted now'
  if (mins < 60) return `Posted ${mins} minute${mins > 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Posted ${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `Posted ${days} day${days > 1 ? 's' : ''} ago`
}

function formatAmount(value, currency = 'NGN') {
  if (!value && value !== 0) return '—'
  return `${currency} ${Number(value).toLocaleString()}`
}

function formatDuration(minutes) {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`
}

function normalizeJobStatus(job) {
  const raw = String(job?.status || job?.job_status || '').toLowerCase()
  if (['completed', 'complete', 'done'].includes(raw)) return 'completed'
  if (['pending', 'pending_approval', 'awaiting_approval', 'awaiting_requester', 'awaiting_service_requester'].includes(raw)) return 'pending_approval'
  if (['in_progress', 'accepted', 'ongoing', 'active'].includes(raw)) return 'in_progress'
  return raw || 'in_progress'
}

function extractItems(response) {
  return response?.data?.data?.items ?? response?.data?.items ?? response?.items ?? []
}

function getJobsForActiveTab(jobs, activeTab) {
  const matchedJobs = jobs.filter((job) => normalizeJobStatus(job) === activeTab)
  if (matchedJobs.length > 0 || jobs.length === 0) return matchedJobs

  // The jobs endpoint is already queried per tab, but the API sometimes returns
  // non-aligned status labels like "pending" for active work. In that case, keep
  // the returned payload visible instead of emptying the UI.
  return jobs
}

function deriveCardData(item, type) {
  const source = item?.hustle || item || {}
  const hustleId = source.id || item?.hustle_id || item?.hustle_post_id || null
  const status = type === 'job' ? normalizeJobStatus(item) : item?.status || null
  const location = source.location_text || item?.service_location_text || item?.location_text || item?.city_name || null
  const expectedCompletionAt = item?.expected_completion_at || source.expected_completion_at || null

  return {
    hustleId,
    title: source.title || item?.hustle_title || item?.service_title || item?.job_title || 'Untitled hustle',
    description: source.description || item?.special_instructions || item?.timeline_notes || (location ? `Service location: ${location}` : 'No description available.'),
    createdAt: source.created_at || item?.created_at || item?.posted_at || item?.started_at,
    image: source.image_url || source.image || source.cover_image_url || null,
    level: source.required_experience_level || source.experience_level || item?.required_experience_level || item?.experience_level || 'entry',
    duration: source.duration_minutes || item?.expected_duration_minutes || item?.duration_minutes || null,
    amount: source.budget_amount || item?.provider_net_estimate || item?.total_amount_due || item?.base_amount || item?.offered_amount || null,
    currency: source.currency_code || item?.currency_code || 'NGN',
    location,
    expectedCompletionAt,
    status,
    canSave: Boolean(hustleId),
  }
}

function formatExpectedDate(value) {
  if (!value) return '—'
  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function JobMeta({ data }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div>
        <p className="text-[11px] text-text-4 mb-0.5">Location</p>
        <p className="text-[13px] font-semibold text-text-1 line-clamp-2">{data.location || '—'}</p>
      </div>
      <div>
        <p className="text-[11px] text-text-4 mb-0.5">Expected completion</p>
        <p className="text-[13px] font-semibold text-text-1">{formatExpectedDate(data.expectedCompletionAt)}</p>
      </div>
      <div>
        <p className="text-[11px] text-text-4 mb-0.5">Hustle duration</p>
        <p className="text-[13px] font-semibold text-text-1">{formatDuration(data.duration)}</p>
      </div>
      <div>
        <p className="text-[11px] text-text-4 mb-0.5">Amount</p>
        <p className="text-[13px] font-bold text-text-1">{formatAmount(data.amount, data.currency)}</p>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-mist dark:bg-white/5 mx-4 mt-4 rounded-xl" />
      <div className="px-4 pt-3 pb-4 space-y-3">
        <div className="h-4 bg-mist dark:bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-mist dark:bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-mist dark:bg-white/5 rounded w-full" />
        <div className="h-3 bg-mist dark:bg-white/5 rounded w-5/6" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="h-8 bg-mist dark:bg-white/5 rounded" />
          <div className="h-8 bg-mist dark:bg-white/5 rounded" />
          <div className="h-8 bg-mist dark:bg-white/5 rounded" />
        </div>
        <div className="h-11 bg-mist dark:bg-white/5 rounded-xl" />
      </div>
    </div>
  )
}

function ReviewItem({ review }) {
  return (
    <div className="bg-white dark:bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={review.reviewer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer_name || review.reviewer_first_name || 'C')}&background=0A2318&color=4ADE80&bold=true&size=64`}
          alt={review.reviewer_name || 'Reviewer'}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-text-1 truncate">
            {review.reviewer_name || `${review.reviewer_first_name || ''} ${review.reviewer_last_name || ''}`.trim() || 'Client'}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={12}
                className={i <= (review.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-border'}
              />
            ))}
            <span className="text-[12px] text-text-4 ml-1">{review.rating ? Number(review.rating).toFixed(1) : '—'}</span>
          </div>
        </div>
      </div>
      {review.hustle_title && <p className="text-[11px] font-semibold text-primary mb-2 truncate">{review.hustle_title}</p>}
      <p className="text-[13px] text-text-3 leading-relaxed line-clamp-3">{review.feedback_text || review.comment || review.review || '—'}</p>
    </div>
  )
}

function MyHustleCard({ item, type, onViewDetails, onToggleSave, isSaved }) {
  const data = deriveCardData(item, type)
  const level = LEVEL_STYLES[data.level] || LEVEL_STYLES.entry

  const handleShare = (event) => {
    event.stopPropagation()
    const target = data.hustleId ? `${window.location.origin}/hustles/${data.hustleId}` : window.location.href
    navigator.clipboard?.writeText(target)
  }

  const handleBookmark = (event) => {
    event.stopPropagation()
    if (!data.canSave) return
    onToggleSave?.(data.hustleId, isSaved)
  }

  return (
    <article className="bg-white dark:bg-surface border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative mx-4 mt-4 rounded-xl overflow-hidden h-44 bg-mist flex-shrink-0">
        {data.image ? (
          <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10">
            <span className="text-3xl font-black text-primary tracking-tight opacity-20">HUSTLE</span>
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5">
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center text-text-3 hover:bg-white dark:hover:bg-surface transition-all shadow-sm"
            aria-label="Share hustle"
          >
            <Share2 size={13} strokeWidth={2} />
          </button>
          {data.canSave && (
            <button
              onClick={handleBookmark}
              className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-sm ${isSaved ? 'bg-amber-50 text-amber-500' : 'bg-white/90 text-text-3 hover:bg-white dark:bg-white/5 dark:hover:bg-surface'
                }`}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark hustle'}
            >
              <Bookmark size={13} strokeWidth={2} className={isSaved ? 'fill-amber-500' : ''} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 px-4 pt-3 pb-4">
        {type === 'job' && data.status && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-mist text-text-2">
              {JOB_STATUS_LABELS[data.status] || data.status}
            </span>
          </div>
        )}
        <h5 className="font-bold text-text-1 leading-snug line-clamp-1 mb-0.5">{data.title}</h5>
        <p className="text-[12px] text-text-4 mb-2">{formatRelativeTime(data.createdAt)}</p>

        <div className="mb-3">
          <p className="text-[13px] font-semibold text-text-1 mb-1">Description:</p>
          <p className="text-[13px] text-text-3 leading-relaxed line-clamp-3">{data.description}</p>
        </div>

        <div className="flex-1" />

        {type === 'job' ? (
          <JobMeta data={data} />
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <p className="text-[11px] text-text-4 mb-0.5">Experience level:</p>
              <p className={`text-[13px] font-bold capitalize ${level.cls}`}>{level.label}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-4 mb-0.5">Hustle duration:</p>
              <p className="text-[13px] font-semibold text-text-1">{formatDuration(data.duration)}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-4 mb-0.5">Amount:</p>
              <p className="text-[13px] font-bold text-text-1">{formatAmount(data.amount, data.currency)}</p>
            </div>
          </div>
        )}

        <Button
          variant="solid"
          onClick={() => onViewDetails?.({ type, item })}
          className="w-full h-11 text-[13px] font-bold rounded-xl"
        >
          View more details
        </Button>
      </div>
    </article>
  )
}

export default function HustlerMyHustlesPage() {
  const [activeTab, setActiveTab] = useState('applied')
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedView, setSelectedView] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())
  const [bookingsPanelOpen, setBookingsPanelOpen] = useState(false)

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()
  const currentUser = storage.getUser()

  const isApplicationTab = activeTab === 'applied'
  const isJobTab = ['in_progress', 'pending_approval', 'completed'].includes(activeTab)
  const activeJobStatus = isJobTab ? activeTab : undefined

  const {
    data: applicationsData,
    isLoading: appsLoading,
    isError: appsError,
    refetch: refetchApps,
  } = useQuery({
    queryKey: queryKeys.hustles.applications({ status: 'applied' }),
    queryFn: () => hustlesService.getMyApplications({ status: 'applied' }),
    staleTime: 60 * 1000,
    enabled: isApplicationTab,
  })

  const {
    data: jobsData,
    isLoading: jobsLoading,
    isError: jobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: queryKeys.jobs.mine({ status: activeJobStatus }),
    queryFn: () => hustlesService.getJobs({ status: activeJobStatus }),
    staleTime: 60 * 1000,
    enabled: isJobTab,
  })

  const {
    data: savedData,
    isLoading: savedLoading,
    isError: savedError,
    refetch: refetchSaved,
  } = useQuery({
    queryKey: ['hustles', 'saved'],
    queryFn: () => hustlesService.list({ saved: true }),
    staleTime: 60 * 1000,
    enabled: activeTab === 'saved',
  })

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: queryKeys.jobs.reviews({ target_type: 'artisan', review_subject_account_id: currentUser?.id }),
    queryFn: () => hustlesService.getPublicReviews({ target_type: 'artisan', review_subject_account_id: currentUser?.id }),
    staleTime: 60 * 1000,
    enabled: activeTab === 'reviews' && Boolean(currentUser?.id),
  })

  const applications = extractItems(applicationsData)
  const jobs = extractItems(jobsData)
  const savedHustles = extractItems(savedData)
  const reviews = extractItems(reviewsData)

  const filteredJobs = useMemo(
    () => getJobsForActiveTab(jobs, activeTab),
    [jobs, activeTab]
  )

  const isLoading = isApplicationTab
    ? appsLoading
    : isJobTab
      ? jobsLoading
      : activeTab === 'saved'
        ? savedLoading
        : reviewsLoading

  const isError = isApplicationTab
    ? appsError
    : isJobTab
      ? jobsError
      : activeTab === 'saved'
        ? savedError
        : reviewsError

  const refetch = isApplicationTab
    ? refetchApps
    : isJobTab
      ? refetchJobs
      : activeTab === 'saved'
        ? refetchSaved
        : refetchReviews

  const handleViewDetails = useCallback((view) => {
    setSelectedView(view)
    setPanelOpen(true)
  }, [])

  const handleToggleSave = useCallback(async (hustleId, currentlySaved) => {
    try {
      if (currentlySaved) {
        const response = await hustlesService.unsaveHustle(hustleId)
        setSavedIds((prev) => {
          const next = new Set(prev)
          next.delete(hustleId)
          return next
        })
        toastSuccess(getApiMessage(response, 'Hustle removed from saved.'))
        if (activeTab === 'saved') queryClient.invalidateQueries({ queryKey: ['hustles', 'saved'] })
      } else {
        const response = await hustlesService.saveHustle(hustleId)
        setSavedIds((prev) => new Set([...prev, hustleId]))
        toastSuccess(getApiMessage(response, 'Hustle saved!'))
      }
    } catch {
      toastError('Failed to update saved status.')
    }
  }, [activeTab, queryClient, toastSuccess, toastError])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-extrabold text-text-1 tracking-tight">My hustles</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="solid"
            onClick={() => setBookingsPanelOpen(true)}
            className="w-fit h-10 px-5 text-[13px] font-bold rounded-full"
          >
            My booking
          </Button>
          <button
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-mist transition-colors"
            aria-label="Copy page link"
          >
            <Share2 size={16} strokeWidth={1.8} className="text-text-3" />
          </button>
        </div>
      </div>

      <div role="tablist" aria-label="Hustle filter tabs" className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 h-9 px-4 text-[13px] font-semibold rounded-full border transition-all whitespace-nowrap ${isActive
                ? 'bg-primary text-white border-transparent shadow-sm'
                : 'bg-white dark:bg-surface text-text-3 border-border hover:border-primary/40'
                }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <p className="text-[15px] font-bold text-text-1 mb-2">Failed to load hustles</p>
            <p className="text-[13px] text-text-4 mb-5">Something went wrong. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-[13px] font-bold rounded-full hover:bg-primary-sat transition-all"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        )}

        {!isError && isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!isError && !isLoading && activeTab === 'reviews' && (
          reviews.length === 0 ? (
            <EmptyState
              illustration="/images/pana.png"
              title={EMPTY_STATES.reviews.title}
              description={EMPTY_STATES.reviews.description}
              action={{ label: 'Continue hustling', onClick: () => navigate('/hustler') }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((review, index) => <ReviewItem key={review.id || index} review={review} />)}
            </div>
          )
        )}

        {!isError && !isLoading && activeTab === 'saved' && (
          savedHustles.length === 0 ? (
            <EmptyState
              illustration="/images/pana.png"
              title={EMPTY_STATES.saved.title}
              description={EMPTY_STATES.saved.description}
              action={{ label: 'Continue hustling', onClick: () => navigate('/hustler') }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedHustles.map((hustle) => (
                <MyHustleCard
                  key={hustle.id}
                  item={hustle}
                  type="saved"
                  isSaved
                  onViewDetails={handleViewDetails}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )
        )}

        {!isError && !isLoading && activeTab === 'applied' && (
          applications.length === 0 ? (
            <EmptyState
              illustration="/images/pana.png"
              title={EMPTY_STATES.applied.title}
              description={EMPTY_STATES.applied.description}
              action={{ label: 'Continue hustling', onClick: () => navigate('/hustler') }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {applications.map((application, index) => (
                <MyHustleCard
                  key={application.id || application.hustle_id || index}
                  item={application}
                  type="application"
                  isSaved={savedIds.has(deriveCardData(application, 'application').hustleId)}
                  onViewDetails={handleViewDetails}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )
        )}

        {!isError && !isLoading && isJobTab && (
          filteredJobs.length === 0 ? (
            <EmptyState
              illustration="/images/pana.png"
              title={EMPTY_STATES[activeTab].title}
              description={EMPTY_STATES[activeTab].description}
              action={{ label: 'Continue hustling', onClick: () => navigate('/hustler') }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredJobs.map((job, index) => (
                <MyHustleCard
                  key={job.id || index}
                  item={job}
                  type="job"
                  isSaved={savedIds.has(deriveCardData(job, 'job').hustleId)}
                  onViewDetails={handleViewDetails}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )
        )}
      </div>

      <HustlerHustleDetailPanel
        item={selectedView}
        isOpen={panelOpen}
        onClose={() => {
          setPanelOpen(false)
          setSelectedView(null)
        }}
      />

      <MyBookingsPanel isOpen={bookingsPanelOpen} onClose={() => setBookingsPanelOpen(false)} />
    </div>
  )
}
