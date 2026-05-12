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
import { useInitializeJobPayment } from '../../../shared/hustles/jobs.hooks.js'
import ClientBookingCard from '../../booking/components/ClientBookingCard.jsx'
import ClientBookingDetailModal from '../../booking/components/ClientBookingDetailModal.jsx'
import useUIStore from '../../../shared/store/ui.store.js'

// Tab definitions — "open" uses /hustles (my hustles), "bookings" uses /bookings, the rest use /jobs
const STATUS_TABS = [
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

export default function MyHustlesPage() {
  const {
    openDetailPanel, detailPanelOpen, selectedHustleId, closeDetailPanel,
    openCreateModal,
  } = useHustlesStore()

  const [searchParams, setSearchParams] = useSearchParams()
  const { toastSuccess, toastError } = useUIStore()
  const { mutate: verifyPayment } = useVerifyPayment()
  const pageSearch = searchParams.get('q')?.trim() || ''

  const [activeTab, setActiveTab] = useState('open')
  const [jobDetailOpen, setJobDetailOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [bookingDetailOpen, setBookingDetailOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState(null)

  const { mutate: initializePayment, isPending: initializingPayment } = useInitializeJobPayment()

  const isJobTab = activeTab !== 'open' && activeTab !== 'bookings'
  const isBookingsTab = activeTab === 'bookings'
  const jobStatusParam = TAB_TO_JOB_STATUS[activeTab]

  // Created tab — existing /hustles endpoint
  const {
    data: hustles = [],
    isLoading: hustlesLoading,
    isError: hustlesError,
    refetch: refetchHustles,
  } = useMyHustles({ status: 'open', q: pageSearch || undefined, per_page: 20 }, { enabled: !isJobTab && !isBookingsTab })

  // Bookings tab — /bookings endpoint
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch: refetchBookings,
  } = useMyBookings({ q: pageSearch || undefined }, { enabled: isBookingsTab })

  const allBookings = bookingsData?.all ?? []

  // Job tabs — /jobs endpoint
  const {
    data: jobsRaw = [],
    isLoading: jobsLoading,
    isError: jobsError,
    refetch: refetchJobs,
  } = useJobs({ status: jobStatusParam, q: pageSearch || undefined }, { enabled: isJobTab })

  const isLoading = isBookingsTab ? bookingsLoading : isJobTab ? jobsLoading : hustlesLoading
  const isError = isBookingsTab ? bookingsError : isJobTab ? jobsError : hustlesError
  const refetch = isBookingsTab ? refetchBookings : isJobTab ? refetchJobs : refetchHustles

  // For the Created tab, filter by status as before
  const createdItems = hustles

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
  const displayItems = isBookingsTab ? allBookings : isJobTab ? jobItems : createdItems

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

  const handleViewBookingDetails = (bookingId) => {
    setSelectedBookingId(bookingId)
    setBookingDetailOpen(true)
  }

  const handleCloseBookingDetail = () => {
    setBookingDetailOpen(false)
    setSelectedBookingId(null)
  }

  const handleMakePayment = (jobId) => {
    if (!jobId || initializingPayment) return

    initializePayment(jobId, {
      onSuccess: async (paymentResponse) => {
        const paymentData = paymentResponse?.data?.data || paymentResponse?.data
        const accessCode = paymentData?.access_code
        const reference = paymentData?.reference

        if (!accessCode || !reference) {
          toastError('Payment initialization failed. Missing payment details.')
          return
        }

        // Store payment info for verification
        localStorage.setItem('pending_hustle_payment', JSON.stringify({
          reference,
          jobId,
          timestamp: Date.now()
        }))

        // Use Paystack Inline JS (popup) instead of redirect
        try {
          // Check if PaystackPop is loaded
          if (typeof window.PaystackPop === 'undefined') {
            // Fallback to redirect if Paystack Inline JS is not loaded
            const authUrl = paymentData?.authorization_url
            if (authUrl) {
              const returnUrl = `${window.location.origin}/my-hustles?tab=pending&payment_ref=${reference}`
              window.location.href = `${authUrl}&callback_url=${encodeURIComponent(returnUrl)}`
            } else {
              toastError('Payment initialization failed. Missing payment URL.')
            }
            return
          }

          const popup = new window.PaystackPop()
          popup.resumeTransaction(accessCode, {
            onSuccess: (transaction) => {
              // Payment successful
              toastSuccess('Payment successful! Verifying...')

              // Verify payment
              verifyPayment(reference, {
                onSuccess: (verifyResponse) => {
                  const status = verifyResponse?.data?.data?.status || verifyResponse?.data?.status
                  if (status === 'approved' || status === 'paid' || status === 'success') {
                    toastSuccess('Payment verified! The hustler can now begin work.')
                  } else {
                    toastError(`Payment status: ${status}. Please contact support if needed.`)
                  }

                  // Clean up and refresh
                  localStorage.removeItem('pending_hustle_payment')
                  refetch()

                  // Switch to in-progress tab to show the updated job
                  setActiveTab('in_progress')
                },
                onError: (err) => {
                  toastError(err?.message ?? 'Payment verification failed.')
                  localStorage.removeItem('pending_hustle_payment')
                },
              })
            },
            onCancel: () => {
              toastError('Payment cancelled.')
              localStorage.removeItem('pending_hustle_payment')
            },
            onError: (error) => {
              toastError(error?.message ?? 'Payment failed.')
              localStorage.removeItem('pending_hustle_payment')
            },
          })
        } catch (error) {
          console.error('Paystack popup error:', error)
          // Fallback to redirect
          const authUrl = paymentData?.authorization_url
          if (authUrl) {
            const returnUrl = `${window.location.origin}/my-hustles?tab=pending&payment_ref=${reference}`
            window.location.href = `${authUrl}&callback_url=${encodeURIComponent(returnUrl)}`
          } else {
            toastError('Payment initialization failed.')
            localStorage.removeItem('pending_hustle_payment')
          }
        }
      },
      onError: (err) => {
        toastError(err?.message ?? 'Failed to initialize payment.')
      },
    })
  }

  // ── Payment Verification Callback ─────────────────────────────────────────
  useEffect(() => {
    // Paystack can return either 'reference' or 'trxref' parameter
    const paymentRef = searchParams.get('payment_ref') || searchParams.get('reference') || searchParams.get('trxref')
    const tab = searchParams.get('tab')

    // Check for hustle payment first
    const pendingHustlePaymentStr = localStorage.getItem('pending_hustle_payment')
    if (paymentRef && pendingHustlePaymentStr) {
      let pendingPayment
      try {
        pendingPayment = JSON.parse(pendingHustlePaymentStr)
      } catch (err) {
        console.error('Failed to parse pending hustle payment:', err)
        localStorage.removeItem('pending_hustle_payment')
        searchParams.delete('payment_ref')
        searchParams.delete('reference')
        searchParams.delete('trxref')
        setSearchParams(searchParams, { replace: true })
        return
      }

      // Verify the reference matches
      if (pendingPayment.reference !== paymentRef) {
        toastError('Payment reference mismatch.')
        localStorage.removeItem('pending_hustle_payment')
        searchParams.delete('payment_ref')
        searchParams.delete('reference')
        searchParams.delete('trxref')
        setSearchParams(searchParams, { replace: true })
        return
      }

      // Check if payment is too old (e.g., more than 1 hour)
      const ONE_HOUR = 60 * 60 * 1000
      if (Date.now() - pendingPayment.timestamp > ONE_HOUR) {
        toastError('Payment session expired. Please try again.')
        localStorage.removeItem('pending_hustle_payment')
        searchParams.delete('payment_ref')
        searchParams.delete('reference')
        searchParams.delete('trxref')
        setSearchParams(searchParams, { replace: true })
        return
      }

      // Verify the payment
      verifyPayment(paymentRef, {
        onSuccess: (response) => {
          const status = response?.data?.data?.status || response?.data?.status
          if (status === 'approved' || status === 'paid' || status === 'success') {
            toastSuccess('Payment successful! The hustler can now begin work.')
          } else {
            toastError(`Payment status: ${status}. Please contact support if needed.`)
          }

          // Clean up
          localStorage.removeItem('pending_hustle_payment')
          searchParams.delete('payment_ref')
          searchParams.delete('reference')
          searchParams.delete('trxref')
          setSearchParams(searchParams, { replace: true })

          // Switch to pending tab to show the job
          if (activeTab !== 'pending') {
            setActiveTab('pending')
          }

          // Optionally open the job detail modal
          if (pendingPayment.jobId) {
            setSelectedJobId(pendingPayment.jobId)
            setJobDetailOpen(true)
          }
        },
        onError: (err) => {
          toastError(err?.message ?? 'Payment verification failed. Please contact support.')

          // Clean up
          localStorage.removeItem('pending_hustle_payment')
          searchParams.delete('payment_ref')
          searchParams.delete('reference')
          searchParams.delete('trxref')
          setSearchParams(searchParams, { replace: true })
        },
      })

      return
    }

    // Handle booking payment verification (existing logic)
    // Only process if we have a payment reference and we're on the bookings tab
    if (!paymentRef || tab !== 'bookings') return

    // Retrieve pending payment info from localStorage
    const pendingPaymentStr = localStorage.getItem('pending_payment')
    if (!pendingPaymentStr) {
      // No pending payment found, might be a stale URL
      // Clean up URL params
      searchParams.delete('payment_ref')
      searchParams.delete('reference')
      searchParams.delete('trxref')
      setSearchParams(searchParams, { replace: true })
      return
    }

    let pendingPayment
    try {
      pendingPayment = JSON.parse(pendingPaymentStr)
    } catch (err) {
      console.error('Failed to parse pending payment:', err)
      localStorage.removeItem('pending_payment')
      searchParams.delete('payment_ref')
      searchParams.delete('reference')
      searchParams.delete('trxref')
      setSearchParams(searchParams, { replace: true })
      return
    }

    // Verify the reference matches
    if (pendingPayment.reference !== paymentRef) {
      toastError('Payment reference mismatch.')
      localStorage.removeItem('pending_payment')
      searchParams.delete('payment_ref')
      searchParams.delete('reference')
      searchParams.delete('trxref')
      setSearchParams(searchParams, { replace: true })
      return
    }

    // Check if payment is too old (e.g., more than 1 hour)
    const ONE_HOUR = 60 * 60 * 1000
    if (Date.now() - pendingPayment.timestamp > ONE_HOUR) {
      toastError('Payment session expired. Please try again.')
      localStorage.removeItem('pending_payment')
      searchParams.delete('payment_ref')
      searchParams.delete('reference')
      searchParams.delete('trxref')
      setSearchParams(searchParams, { replace: true })
      return
    }

    // Verify the payment
    verifyPayment(paymentRef, {
      onSuccess: (response) => {
        const status = response?.data?.data?.status || response?.data?.status
        if (status === 'approved' || status === 'paid' || status === 'success') {
          toastSuccess('Payment successful! The artisan can now begin work.')
        } else {
          toastError(`Payment status: ${status}. Please contact support if needed.`)
        }

        // Clean up
        localStorage.removeItem('pending_payment')
        searchParams.delete('payment_ref')
        searchParams.delete('reference')
        searchParams.delete('trxref')
        setSearchParams(searchParams, { replace: true })

        // Optionally open the booking detail modal
        if (pendingPayment.bookingId) {
          setSelectedBookingId(pendingPayment.bookingId)
          setBookingDetailOpen(true)
        }
      },
      onError: (err) => {
        toastError(err?.message ?? 'Payment verification failed. Please contact support.')

        // Clean up
        localStorage.removeItem('pending_payment')
        searchParams.delete('payment_ref')
        searchParams.delete('reference')
        searchParams.delete('trxref')
        setSearchParams(searchParams, { replace: true })
      },
    })

    // Set active tab to bookings if not already
    if (activeTab !== 'bookings') {
      setActiveTab('bookings')
    }
  }, [searchParams, setSearchParams, verifyPayment, toastSuccess, toastError, activeTab])

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
            {isBookingsTab ? (
              // Render BookingCard for bookings tab
              displayItems.map(booking => (
                <ClientBookingCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewBookingDetails}
                />
              ))
            ) : isJobTab ? (
              // Render JobCard for job tabs
              displayItems.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={handleViewJobDetails}
                  onMakePayment={handleMakePayment}
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

      <ClientBookingDetailModal
        bookingId={selectedBookingId}
        isOpen={bookingDetailOpen}
        onClose={handleCloseBookingDetail}
      />
    </div>
  )
}
