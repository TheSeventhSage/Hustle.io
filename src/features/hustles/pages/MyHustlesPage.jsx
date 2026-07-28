import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { useMyBookings, useVerifyPayment } from '../../booking/booking.hooks.js'
import { useInitializeJobPayment, useVerifyJobPayment } from '../../../shared/hustles/jobs.hooks.js'
import ClientBookingCard from '../../booking/components/ClientBookingCard.jsx'
import ClientBookingDetailModal from '../../booking/components/ClientBookingDetailModal.jsx'
import useUIStore from '../../../shared/store/ui.store.js'
import { PAYMENT_SESSION_TYPES, getPaymentReferenceFromSearchParams, isCompletedPaymentStatus, reconcileStoredPayment, runPaymentFlow } from '../../../shared/utils/paymentFlow.js'
import { useDirectBookingPaymentCallback } from '../../booking/directBookingPayment.js'
// import { storage } from '../../../services/storage.js' // reserved — see booking reconciliation note below

// Tab definitions — "open" uses /hustles (my hustles), "bookings" uses /bookings, the rest use /jobs
const STATUS_TABS = [
  { key: 'all', label: 'All hustles', source: 'hustles' },
  { key: 'open', label: 'Created', source: 'hustles' },
  { key: 'bookings', label: 'Bookings', source: 'bookings' },
  { key: 'pending', label: 'Pending', source: 'jobs' },
  { key: 'in_progress', label: 'In-progress', source: 'jobs' },
  { key: 'completed', label: 'Completed', source: 'jobs' },
]

// Map tab key → status param to send to /jobs
const TAB_TO_JOB_STATUS = {
  pending: 'pending_approval',
  in_progress: 'in_progress',
  completed: 'completed',
}

const PAGE_SIZE = 12

function PaginationBar({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const windowSize = 7
  const start = Math.max(1, Math.min(page - Math.floor(windowSize / 2), totalPages - windowSize + 1))
  const end = Math.min(totalPages, start + windowSize - 1)
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index)

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="h-9 min-w-9 rounded-full border border-border px-3 text-[13px] font-semibold text-text-3 transition-all disabled:opacity-40"
      >
        Prev
      </button>
      {pages.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`h-9 min-w-9 rounded-full px-3 text-[13px] font-semibold transition-all ${value === page ? 'bg-primary text-white' : 'border border-border text-text-3'}`}
        >
          {value}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="h-9 min-w-9 rounded-full border border-border px-3 text-[13px] font-semibold text-text-3 transition-all disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}

export default function MyHustlesPage() {
  const {
    openDetailPanel, detailPanelOpen, selectedHustleId, closeDetailPanel,
    openCreateModal,
  } = useHustlesStore()

  const [searchParams, setSearchParams] = useSearchParams()
  const { toastSuccess, toastError, toastInfo } = useUIStore()
  const verifyBookingPayment = useVerifyPayment()
  const verifyJobPayment = useVerifyJobPayment()
  const pageSearch = searchParams.get('q')?.trim() || ''

  // Runs immediately when Paystack redirects back with ?reference=…
  // Verifies the direct booking payment and shows a toast with the result.
  useDirectBookingPaymentCallback({
    onSuccess: ({ bookingId }) => {
      setActiveTab('bookings')
      if (bookingId) {
        setSelectedBookingId(bookingId)
        setBookingDetailOpen(true)
      }
    },
  })

  const [activeTab, setActiveTab] = useState('all')
  const [jobDetailOpen, setJobDetailOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [bookingDetailOpen, setBookingDetailOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  const [page, setPage] = useState(1)

  const initializePayment = useInitializeJobPayment()

  const isJobTab = activeTab !== 'all' && activeTab !== 'open' && activeTab !== 'bookings'
  const isBookingsTab = activeTab === 'bookings'
  const jobStatusParam = TAB_TO_JOB_STATUS[activeTab]
  const hustleStatusParam = activeTab === 'open' ? 'open' : undefined

  // Created tab — existing /hustles endpoint
  const {
    data: hustles = [],
    isLoading: hustlesLoading,
    isError: hustlesError,
    refetch: refetchHustles,
  } = useMyHustles({ status: hustleStatusParam, q: pageSearch || undefined, page, per_page: PAGE_SIZE }, { enabled: !isJobTab && !isBookingsTab })

  // Bookings tab — /bookings endpoint
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch: refetchBookings,
  } = useMyBookings({ page, per_page: PAGE_SIZE }, { enabled: isBookingsTab })

  const allBookings = bookingsData?.all ?? []

  // Job tabs — /jobs endpoint
  const {
    data: jobsRaw = [],
    isLoading: jobsLoading,
    isError: jobsError,
    refetch: refetchJobs,
  } = useJobs({ status: jobStatusParam, q: pageSearch || undefined, page, per_page: PAGE_SIZE }, { enabled: isJobTab })

  const isLoading = isBookingsTab ? bookingsLoading : isJobTab ? jobsLoading : hustlesLoading
  const isError = isBookingsTab ? bookingsError : isJobTab ? jobsError : hustlesError
  const refetch = isBookingsTab ? refetchBookings : isJobTab ? refetchJobs : refetchHustles

  // For the Created tab, filter by status as before
  const hustleItems = hustles
  const selectedCreatedHustle = hustleItems.find((item) => item.id === selectedHustleId) ?? null

  // For job tabs, filter by normalized status to ensure correct tab display
  const normalizeJobStatus = (status, paymentStatus) => {
    const raw = String(status || '').toLowerCase()

    // Check if payment is pending/awaiting
    const isAwaitingPayment = !paymentStatus || paymentStatus === 'pending' || paymentStatus === 'awaiting_payment'

    if (['completed', 'complete', 'done'].includes(raw)) return 'completed'

    // Jobs with pending status OR jobs awaiting payment should show in pending tab
    if (['pending', 'pending_approval', 'awaiting_approval', 'closed', 'awaiting_payment'].includes(raw)) return 'pending'

    // If status is in_progress but payment is not approved, show in pending
    if (['in_progress', 'accepted', 'ongoing', 'active'].includes(raw) && isAwaitingPayment) return 'pending'

    if (['in_progress', 'accepted', 'ongoing', 'active'].includes(raw)) return 'in_progress'

    return raw
  }

  const jobItems = jobsRaw.filter(job => {
    const normalized = normalizeJobStatus(job.status, job.payment_status)
    // Strict filtering: only show jobs that match the active tab exactly
    return normalized === activeTab
  })

  // For bookings tab, use all bookings
  // For job tabs, use filtered job data
  // For created tab, use filtered hustles
  const displayItems = isBookingsTab ? allBookings : isJobTab ? jobItems : hustleItems

  const activeMeta = isBookingsTab
    ? bookingsData?.meta
    : isJobTab
      ? jobsRaw.meta
      : hustles.meta
  const currentPage = Number(activeMeta?.page ?? page) || page
  const totalPages = Number(activeMeta?.total_pages ?? 0) || 0
  const activeCount = Number(activeMeta?.total ?? displayItems.length) || displayItems.length

  useEffect(() => {
    setPage(1)
  }, [activeTab, pageSearch])

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

  const handleViewBookingDetails = (bookingId) => {
    setSelectedBookingId(bookingId)
    setBookingDetailOpen(true)
  }

  const handleCloseBookingDetail = () => {
    setBookingDetailOpen(false)
    setSelectedBookingId(null)
  }

  const startJobPayment = async (jobId) => {
    if (!jobId || initializePayment.isPending) return

    try {
      await runPaymentFlow({
        initializePayment: ({ forceNew, callbackUrl }) => initializePayment.mutateAsync({
          id: jobId,
          data: {
            ...(forceNew ? { force_new: true } : {}),
            ...(callbackUrl ? { callback_url: callbackUrl } : {}),
          },
        }),
        verifyPayment: (reference) => verifyJobPayment.mutateAsync(reference),
        sessionType: PAYMENT_SESSION_TYPES.hustle,
        includeCallbackUrl: true,
        allowRedirectFallback: true,
        recoverInlineErrorWithVerification: true,
        sessionData: ({ paymentData, reference }) => ({
          reference,
          jobId,
          paymentId: paymentData?.payment_id ?? paymentData?.id ?? null,
        }),
        returnUrl: `${window.location.origin}/my-hustles?tab=pending`,
        onAlreadyPaid: async () => {
          toastSuccess('Payment already completed.')
          refetch()
          setActiveTab('in_progress')
        },
        onPaymentSuccess: async ({ status }) => {
          if (isCompletedPaymentStatus(status)) {
            toastSuccess('Payment verified! The hustler can now begin work.')
          } else {
            toastError(`Payment status: ${status}. Please contact support if needed.`)
          }
          refetch()
          setActiveTab('in_progress')
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

  const handleMakePayment = (jobId) => {
    void startJobPayment(jobId)
  }

  // ── Payment Verification Callback ─────────────────────────────────────────
  useEffect(() => {
    const paymentRef = getPaymentReferenceFromSearchParams(searchParams)
    if (!paymentRef) return

    // NOTE: Direct booking verification (no ?tab= param) is now handled by
    // useDirectBookingPaymentCallback() from directBookingPayment.js.
    // The block below is kept for the old inline-payment flow that explicitly
    // passes ?tab=bookings in the callback URL.

    /* ── Previous implementation (superseded by useDirectBookingPaymentCallback) ──
    const hasBookingSession = Boolean(storage.payments.getSession(PAYMENT_SESSION_TYPES.booking))
    if (hasBookingSession || tab === 'bookings') { ... }
    ── end previous implementation ── */

    const tab = searchParams.get('tab')

    if (tab === 'bookings') {
      void reconcileStoredPayment({
        sessionType: PAYMENT_SESSION_TYPES.booking,
        searchParams,
        setSearchParams,
        verifyPayment: (reference) => verifyBookingPayment.mutateAsync(reference),
        onSuccess: async ({ pendingPayment, status }) => {
          if (isCompletedPaymentStatus(status)) {
            toastSuccess('Payment successful! The artisan can now begin work.')
          } else {
            toastError(`Payment status: ${status}. Please contact support if needed.`)
          }

          if (activeTab !== 'bookings') {
            setActiveTab('bookings')
          }

          if (pendingPayment?.bookingId) {
            setSelectedBookingId(pendingPayment.bookingId)
            setBookingDetailOpen(true)
          }
        },
        onError: async (error) => {
          toastError(error?.message ?? 'Payment verification failed. Please contact support.')
        },
      })
      return
    }

    void reconcileStoredPayment({
      sessionType: PAYMENT_SESSION_TYPES.hustle,
      searchParams,
      setSearchParams,
      verifyPayment: (reference) => verifyJobPayment.mutateAsync(reference),
      onSuccess: async ({ pendingPayment, status }) => {
        if (isCompletedPaymentStatus(status)) {
          toastSuccess('Payment successful! The hustler can now begin work.')
        } else {
          toastError(`Payment status: ${status}. Please contact support if needed.`)
        }

        if (activeTab !== 'pending') {
          setActiveTab('pending')
        }

        if (pendingPayment?.jobId) {
          setSelectedJobId(pendingPayment.jobId)
          setJobDetailOpen(true)
        }
      },
      onError: async (error) => {
        toastError(error?.message ?? 'Payment verification failed. Please contact support.')
      },
    })
    return
  }, [activeTab, searchParams, setSearchParams, toastError, toastSuccess, verifyBookingPayment, verifyJobPayment])

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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
              {isBookingsTab ? (
                displayItems.map(booking => (
                  <ClientBookingCard
                    key={booking.id}
                    booking={booking}
                    onViewDetails={handleViewBookingDetails}
                  />
                ))
              ) : isJobTab ? (
                displayItems.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onViewDetails={handleViewJobDetails}
                    onMakePayment={handleMakePayment}
                  />
                ))
              ) : (
                displayItems.map(hustle => (
                  <HustleCard
                    key={hustle.id}
                    hustle={hustle}
                    onViewDetails={handleViewHustleDetails}
                  />
                ))
              )}
            </div>
            <PaginationBar page={currentPage} totalPages={totalPages} onChange={setPage} />
          </>
        )
      )}

      <CreateHustleModal />

      <HustleDetailPanel
        isOpen={detailPanelOpen}
        onClose={closeDetailPanel}
        hustleId={selectedHustleId}
        hustle={selectedCreatedHustle}
        onCancelled={() => {
          void refetchHustles()
          void refetchJobs()
        }}
      />

      <JobDetailPanel
        isOpen={jobDetailOpen}
        onClose={handleCloseJobDetail}
        jobId={selectedJobId}
      />

      <ClientBookingDetailModal
        bookingId={selectedBookingId}
        isOpen={bookingDetailOpen}
        onClose={handleCloseBookingDetail}
      />
    </div>
  )
}
