import { useState } from 'react'
import { Plus } from 'lucide-react'
import { EmptyState } from '../../../shared/components/EmptyState.jsx'
import { HustleCard } from '../components/HustleCard.jsx'
import { HustleDetailPanel } from '../components/HustleDetailPanel.jsx'
import { CreateHustleModal } from '../components/CreateHustleModal.jsx'
import useHustlesStore from '../hustles.store.js'
import { Button } from '../../../shared/components/Button.jsx'
import { useMyHustles } from '../hustles.hooks.js'

// API status values mapped to tab labels
const STATUS_TABS = [
  { key: 'open', label: 'Created', status: 'open' },
  { key: 'in_progress', label: 'In-progress', status: 'in_progress' },
  { key: 'closed', label: 'Pending approval', status: 'closed' },
  { key: 'completed', label: 'Completed', status: 'completed' },
]

export default function MyHustlesPage() {
  const {
    openDetailPanel, detailPanelOpen, selectedHustleId, closeDetailPanel,
    openCreateModal,
  } = useHustlesStore()

  const [activeTab, setActiveTab] = useState('open')
  const { data: hustles = [], isLoading } = useMyHustles()

  const filtered = hustles.filter(h => h.status === activeTab)
  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.status] = hustles.filter(h => h.status === tab.status).length
    return acc
  }, {})

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

      <div className="flex gap-2 mb-6 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {STATUS_TABS.map(tab => {
          const isActive = activeTab === tab.status
          return (
            <Button
              key={tab.key}
              onClick={() => setActiveTab(tab.status)}
              variant="primary"
              className={`w-fit text-[14px] flex-shrink-0 h-9 px-4 font-semibold rounded-full border transition-all whitespace-nowrap ${isActive
                ? 'bg-primary text-white border-transparent shadow-sm'
                : 'bg-surface text-text-3 border-border hover:border-primary-light/70'
                }`}
            >
              {tab.label} ({counts[tab.status] ?? 0})
            </Button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          illustration="/images/pana.png"
          title={`No hustle ${STATUS_TABS.find(t => t.status === activeTab)?.label?.toLowerCase() || ''}`}
          description="All hustles created will be displayed here"
          action={{ label: 'Create a hustle', onClick: openCreateModal }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filtered.map(hustle => (
            <HustleCard key={hustle.id} hustle={hustle} onViewDetails={openDetailPanel} />
          ))}
        </div>
      )}

      <CreateHustleModal />

      <HustleDetailPanel
        isOpen={detailPanelOpen}
        onClose={closeDetailPanel}
        hustleId={selectedHustleId}
      />
    </div>
  )
}
