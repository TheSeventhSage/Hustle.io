import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { HUSTLE_STATES } from './machines/hustle.machine.js'

const useHustlesStore = create(
  devtools(
    (set, get) => ({
      // ── My Hustles tab ───────────────────────────────
      activeTab: HUSTLE_STATES.ACTIVE,
      setActiveTab: (tab) => set({ activeTab: tab }),

      // ── Feed search & filters ────────────────────────
      search: '',
      setSearch: (search) => set({ search }),

      filters: {
        sortBy:      'all',       // 'all' | 'nearest' | 'newly_posted' | 'available_now'
        skillLevel:  null,        // null | 'beginner' | 'intermediate' | 'expert'
        location:    '',
        category:    null,
        minBudget:   '',
        maxBudget:   '',
        availFrom:   '',
        availTo:     '',
        rating:      null,        // null | 1 | 2 | 3 | 4 | 5
        verified:    'all',       // 'all' | 'verified' | 'unverified'
      },

      setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value } })),

      resetFilters: () =>
        set({
          search: '',
          filters: {
            sortBy: 'all', skillLevel: null, location: '',
            category: null, minBudget: '', maxBudget: '',
            availFrom: '', availTo: '', rating: null, verified: 'all',
          },
        }),

      // ── Detail panel ─────────────────────────────────
      selectedHustleId: null,
      detailPanelOpen:  false,

      openDetailPanel:  (id) => set({ selectedHustleId: id, detailPanelOpen: true }),
      closeDetailPanel: ()   => set({ detailPanelOpen: false, selectedHustleId: null }),
      setSelectedHustleId: (id) => set({ selectedHustleId: id }),

      // ── Create modal ─────────────────────────────────
      createModalOpen:  false,
      openCreateModal:  ()  => set({ createModalOpen: true }),
      closeCreateModal: ()  => set({ createModalOpen: false }),

      // ── Draft (create hustle form) ───────────────────
      formDraft: null,
      saveDraft:  (draft) => set({ formDraft: draft }),
      clearDraft: ()      => set({ formDraft: null }),
    }),
    { name: 'HustlesStore' }
  )
)

export default useHustlesStore
