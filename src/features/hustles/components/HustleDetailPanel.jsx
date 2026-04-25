import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2 } from 'lucide-react'
import { MOCK_HUSTLE, MOCK_APPLICANTS } from './hustle-detail-panel/hustleDetailPanel.utils.js'
import { ApplicantDetailView } from './hustle-detail-panel/ApplicantDetailView'
import { JobDescriptionTab } from './hustle-detail-panel/JobDescriptionTab'
import { ApplicantsTab } from './hustle-detail-panel/ApplicantsTab'

export function HustleDetailPanel({
  isOpen,
  onClose,
  hustleId,
  // Optionally pass real data; falls back to mock
  hustle: hustleProp,
  applicants: applicantsProp,
}) {
  const hustle = hustleProp || MOCK_HUSTLE
  const applicants = applicantsProp || MOCK_APPLICANTS

  const [activeTab, setActiveTab] = useState('job') // 'job' | 'applicants'
  const [selectedApplicant, setSelectedApplicant] = useState(null)

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
                  <h1 className="text-[20px] font-extrabold text-text-1 mb-4">{hustle.title}</h1>

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
                        <JobDescriptionTab hustle={hustle} />
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
