import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { hustlesService } from '../hustles.service.js'
import { queryKeys } from '../../../services/query-keys.js'
import { ApplicantDetailView } from './hustle-detail-panel/ApplicantDetailView'
import { JobDescriptionTab } from './hustle-detail-panel/JobDescriptionTab'
import { ApplicantsTab } from './hustle-detail-panel/ApplicantsTab'
import { formatDatePart, formatTimePart } from './hustle-detail-panel/hustleDetailPanel.utils.js'

// Map API hustle → JobDescriptionTab shape
function mapHustle(item, skills) {
  if (!item) return null
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    location: [item.location_text, item.city_name].filter(Boolean).join(', ') || '—',
    experienceLevel: item.required_experience_level ?? '—',
    duration: item.duration_minutes
      ? item.duration_minutes < 60
        ? `${item.duration_minutes} min`
        : `${Math.floor(item.duration_minutes / 60)}h${item.duration_minutes % 60 ? ` ${item.duration_minutes % 60}m` : ''}`
      : '—',
    amount: item.budget_amount ?? 0,
    preferredTime: item.preferred_time_start
      ? `${item.preferred_time_start}${item.preferred_time_end ? ` - ${item.preferred_time_end}` : ''}`
      : '—',
    preferredDate: item.preferred_date_start
      ? `${item.preferred_date_start}${item.preferred_date_end ? ` - ${item.preferred_date_end}` : ''}`
      : '—',
    skills: skills?.map(s => s.name ?? s) ?? [],
    images: item.images ?? [],
    attachments: item.attachments ?? [],
  }
}

// Map API application → ApplicantsTab shape
function mapApplicant(app) {
  return {
    id: app.id,
    name: app.artisan_name ?? `Artisan #${app.artisan_account_id}`,
    role: app.artisan_role ?? '',
    rating: app.artisan_rating ?? 0,
    hustlesCompleted: app.artisan_hustles_completed ?? 0,
    location: app.artisan_location ?? '',
    verified: app.artisan_verified ?? false,
    avatar: app.artisan_avatar ?? null,
    totalCost: app.offered_amount,
    currencyCode: app.currency_code ?? 'NGN',
    duration: app.timeline_notes ?? '—',
    preferredDate: formatDatePart(app.expected_completion_at),
    preferredTime: formatTimePart(app.expected_completion_at),
    // keep raw fields for decision actions
    _raw: app,
  }
}

export function HustleDetailPanel({
  isOpen,
  onClose,
  hustleId,
  // Optionally pass real data; falls back to API fetch
  hustle: hustleProp,
  applicants: applicantsProp,
}) {
  const [activeTab, setActiveTab] = useState('job') // 'job' | 'applicants'
  const [selectedApplicant, setSelectedApplicant] = useState(null)

  // GET /hustles/{id}
  const { data: hustleData, isLoading: hustleLoading } = useQuery({
    queryKey: queryKeys.hustles.detail(hustleId),
    queryFn: () => hustlesService.getById(hustleId),
    enabled: Boolean(hustleId) && isOpen && !hustleProp,
    staleTime: 60 * 1000,
  })

  // GET /hustles/{id}/applications — company/admin only
  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ['hustles', hustleId, 'applications'],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'}/hustles/${hustleId}/applications`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${(await import('../../../services/storage.js')).storage.getToken()}`,
          },
        }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    enabled: Boolean(hustleId) && isOpen && !applicantsProp,
    staleTime: 60 * 1000,
  })

  // Resolve hustle — prop takes priority, then API response
  const rawHustle = hustleProp ?? hustleData?.data?.item ?? hustleData?.data ?? null
  const rawSkills = hustleData?.data?.skills ?? []
  const hustle = rawHustle ? mapHustle(rawHustle, rawSkills) : null

  // Resolve applicants
  const rawApplicants = applicantsProp ?? applicationsData?.data?.items ?? applicationsData?.items ?? []
  const applicants = rawApplicants.map(mapApplicant)

  const isLoading = hustleLoading || appsLoading

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (selectedApplicant) setSelectedApplicant(null)
        else onClose?.()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, selectedApplicant])

  // Reset tab/applicant when panel opens
  useEffect(() => {
    if (isOpen) { setActiveTab('job'); setSelectedApplicant(null) }
  }, [isOpen, hustleId])

  const applicantCount = applicants.length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => { if (!selectedApplicant) onClose?.() }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-surface shadow-2xl w-full sm:w-[580px] lg:w-[620px]"
          >
            {selectedApplicant ? (
              /* ── Applicant detail view ── */
              <ApplicantDetailView
                hustleId={hustleId}
                applicant={selectedApplicant}
                onBack={() => setSelectedApplicant(null)}
                onClose={onClose}
              />
            ) : (
              <>
                {/* ── Panel header ── */}
                <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-7 py-4 border-b border-border bg-surface">
                  <div className="flex items-center gap-2">
                    <Share2 size={17} className="text-text-4 cursor-pointer hover:text-text-2" />
                    <span className="text-[15px] font-bold text-text-1">Hustle details</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4 hover:bg-mist transition-all"
                  >
                    <X size={17} />
                  </button>
                </div>

                {/* ── Title ── */}
                <div className="flex-shrink-0 px-5 sm:px-7 pt-5 pb-0">
                  <h1 className="text-[20px] font-extrabold text-text-1 mb-4">
                    {isLoading ? (
                      <div className="h-6 bg-mist rounded w-3/4 animate-pulse" />
                    ) : (
                      hustle?.title ?? '—'
                    )}
                  </h1>

                  {/* Tabs */}
                  <div className="flex gap-0 border-b border-border">
                    {[
                      { key: 'job', label: 'Job description' },
                      { key: 'applicants', label: `Applicants(${applicantCount})` },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative pb-3 mr-6 text-[13px] font-semibold transition-colors ${activeTab === tab.key
                          ? 'text-primary'
                          : 'text-text-4 hover:text-text-2'
                          }`}
                      >
                        {tab.label}
                        {activeTab === tab.key && (
                          <motion.div
                            layoutId="tab-indicator"
                            className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-full"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Scrollable tab content ── */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      {activeTab === 'job' ? (
                        isLoading ? (
                          <div className="px-5 sm:px-7 py-6 space-y-4">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="h-4 bg-mist rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                            ))}
                          </div>
                        ) : hustle ? (
                          <JobDescriptionTab hustle={hustle} />
                        ) : (
                          <div className="px-5 py-10 text-center text-[13px] text-text-4">
                            Hustle details not available.
                          </div>
                        )
                      ) : (
                        <ApplicantsTab
                          applicants={applicants}
                          onSelectApplicant={setSelectedApplicant}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
