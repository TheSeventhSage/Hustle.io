import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * ui.store.js — global UI state.
 * Toasts, sidebar open state, any app-level UI concerns.
 */

let toastId = 0

const useUIStore = create(
  devtools(
    (set, get) => ({
      // ── Toasts ────────────────────────────────────────
      toasts: [],

      toast({ message, type = 'info', title, duration = 5000, position = 'top-right' }) {
        const id = ++toastId
        set((state) => ({
          toasts: [...state.toasts, { id, message, type, title, duration, position }],
        }))
        if (duration > 0) {
          setTimeout(() => get().dismissToast(id), duration)
        }
        return id
      },

      dismissToast(id) {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      },

      clearToasts() {
        set({ toasts: [] })
      },

      // Convenience methods
      toastSuccess: (message, options = {}) => get().toast({
        message,
        type: 'success',
        title: options.title || 'Success',
        duration: options.duration ?? 5000,
        position: options.position
      }),
      toastError: (message, options = {}) => get().toast({
        message,
        type: 'error',
        title: options.title || 'Error',
        duration: options.duration ?? 7000,
        position: options.position
      }),
      toastWarning: (message, options = {}) => get().toast({
        message,
        type: 'warning',
        title: options.title || 'Warning',
        duration: options.duration ?? 5000,
        position: options.position
      }),
      toastInfo: (message, options = {}) => get().toast({
        message,
        type: 'info',
        title: options.title || 'Info',
        duration: options.duration ?? 5000,
        position: options.position
      }),

      // ── Sidebar ───────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    { name: 'UIStore' }
  )
)

export default useUIStore
