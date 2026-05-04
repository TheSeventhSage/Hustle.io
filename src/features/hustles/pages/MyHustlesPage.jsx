import { useState } from 'react'
import { Plus, AlertCircle, RefreshCw } from 'lucide-react'
import { EmptyState } from '../../../shared/components/EmptyState.jsx'
import { HustleCard } from '../components/HustleCard.jsx'
import { JobCard } from '../../../shared/hustles/JobCard.jsx'
import { HustleDetailPanel } from '../components/HustleDetailPanel.jsx'
import { JobDetailPanel } from '../components/JobDetailPanel.jsx'
import { CreateHustleModal } from '../components/CreateHustleModal.jsx'
import useHustlesStore from '../hustles.store.js'
import { Button } from '../../../shared/components/Button.jsx'
import { useMyHustles, useJobs } from '../hustles.hooks.js'

// Tab definitions — "open" uses /hustles (my hustles), the rest use /jobs
const STATUS_TABS = [
  { key: 'open', label: 'Created', source: 'hustles' },
  { key: 'in_progress', label: 'In-progress', source: 'jobs' },
  { key: 'closed', label: 'Pending approval', source: 'jobs' },
  { key: 'completed', label: 'Completed', source: 'jobs' },
]

// Map tab key → status param to send to /jobs
const TAB_TO_JOB_STATUS = {
  in_progress: 'in_progress',
  closed: 'pending_approval',
  completed: 'completed',
}

export default function MyHustlesPage() {
  const {
    openDetailPanel, detailPanelOpen, selectedHustleId, closeDetailPanel,
    openCreateModal,
  } = useHustlesStore()

  const [activeTab, setActiveTab] = useState('open')
  const [jobDetailOpen, setJobDetailOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState(null)

  const isJobTab = activeTab !== 'open'
  const jobStatusParam = TAB_TO_JOB_STATUS[activeTab]

  // Created tab — existing /hustles endpoint
  const {
    data: hustles = [],
    isLoading: hustlesLoading,
    isError: hustlesError,
    refetch: refetchHustles,
  } = useMyHustles({}, { enabled: !isJobTab })

  // Job tabs — /jobs endpoint
  const {
    data: jobsRaw = [],
    isLoading: jobsLoading,
    isError: jobsError,
    refetch: refetchJobs,
  } = useJobs({ status: jobStatusParam }, { enabled: isJobTab })

  const isLoading = isJobTab ? jobsLoading : hustlesLoading
  const isError = isJobTab ? jobsError : hustlesError
  const refetch = isJobTab ? refetchJobs : refetchHustles

  // For the Created tab, filter by status as before
  const createdItems = hustles.filter(h => h.status === 'open')

  // For job tabs, filter by normalized status to ensure correct tab display
  const normalizeJobStatus = (status) => {
    const raw = String(status || '').toLowerCase()
    if (['completed', 'complete', 'done'].includes(raw)) return 'completed'
    if (['pending', 'pending_approval', 'awaiting_approval', 'awaiting_requester', 'awaiting_service_requester', 'closed'].includes(raw)) return 'closed'
    if (['in_progress', 'accepted', 'ongoing', 'active'].includes(raw)) return 'in_progress'
    return raw
  }

  const jobItems = jobsRaw.filter(job => {
    const normalized = normalizeJobStatus(job.status)
    return normalized === activeTab
  })

  // For job tabs, use filtered job data
  const displayItems = isJobTab ? jobItems : createdItems

  // Tab counts — only accurate for the active tab (we don't pre-fetch all tabs)
  const activeCount = displayItems.length

  const handleViewHustleDetails = (hustleId) => {
    if (hustleId) openDetailPanel(hustleId)
  }

  const handleViewJobDetails = (jobId) => {
    setSelectedJobId(jobId)
    setJobDetailOpen(true)
  }

  const handleCloseJobDetail = () => {
    setJobDetailOpen(false)
    setSelectedJobId(null)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-text-1 tracking-tight">My hustles</h1>
        <Button
          variant="solid"
          onClick={openCreateModal}
          className="flex items-center gap-2 w-fit h-10 sm:h-11 px-4 sm:px-5 active:scale-95 text-white font-bold rounded-full transition-all shadow-sm"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span className="hidden sm:inline">Create a hustle</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {STATUS_TABS.map(tab => {
          const isActive = activeTab === tab.key
          return (
            <Button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              variant="primary"
              className={`w-fit text-[14px] flex-shrink-0 h-9 px-4 font-semibold rounded-full border transition-all whitespace-nowrap ${isActive
                ? 'bg-primary text-white border-transparent shadow-sm'
                : 'bg-surface text-text-3 border-border hover:border-primary-light/70'
                }`}
            >
              {tab.label}{isActive ? ` (${activeCount})` : ''}
            </Button>
          )
        })}
      </div>

      {/* Error state */}
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

      {/* Loading state */}
      {!isError && isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      {!isError && !isLoading && (
        displayItems.length === 0 ? (
          <EmptyState
            illustration="/images/pana.png"
            title={`No hustle ${STATUS_TABS.find(t => t.key === activeTab)?.label?.toLowerCase() || ''}`}
            description="All hustles created will be displayed here"
            action={{ label: 'Create a hustle', onClick: openCreateModal }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
            {isJobTab ? (
              // Render JobCard for job tabs
              displayItems.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={handleViewJobDetails}
                />
              ))
            ) : (
              // Render HustleCard for Created tab
              displayItems.map(hustle => (
                <HustleCard
                  key={hustle.id}
                  hustle={hustle}
                  onViewDetails={handleViewHustleDetails}
                />
              ))
            )}
          </div>
        )
      )}

      <CreateHustleModal />

      <HustleDetailPanel
        isOpen={detailPanelOpen}
        onClose={closeDetailPanel}
        hustleId={selectedHustleId}
      />

      <JobDetailPanel
        isOpen={jobDetailOpen}
        onClose={handleCloseJobDetail}
        jobId={selectedJobId}
      />
    </div>
  )
}
