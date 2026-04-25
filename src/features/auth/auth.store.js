import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { storage } from '../../services/storage.js'

/**
 * auth.store.js — client-side auth state.
 * Server state (profile data) lives in TanStack Query.
 * This store owns: session, role, token presence.
 */

const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ── State ────────────────────────────────────────
        user: null,   // { id, email, name, role, avatarUrl }
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isRedirecting: false,  // Flag to prevent UI flicker during post-login redirect
        error: null,

        // ── Actions ──────────────────────────────────────
        setCredentials(user, token) {
          storage.setToken(token)
          storage.setUser(user)
          set({ user, token, isAuthenticated: true, error: null })
        },

        setUser(user) {
          storage.setUser(user)
          set({ user })
        },

        setLoading(isLoading) {
          set({ isLoading })
        },

        setRedirecting(isRedirecting) {
          set({ isRedirecting })
        },

        setError(error) {
          set({ error, isLoading: false })
        },

        logout() {
          storage.clearAll()
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          })
        },

        // ── Selectors (derived) ──────────────────────────
        get role() {
          return get().user?.role ?? null  // 'creator' | 'hustler' | null
        },

        get isCreator() {
          return get().user?.role === 'creator'
        },

        get isHustler() {
          return get().user?.role === 'hustler'
        },
      }),
      {
        name: 'hustle_auth',
        // Only persist the minimum needed to restore session
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
        // Ensure isRedirecting is always false on hydration
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.isRedirecting = false
          }
        },
      }
    ),
    { name: 'AuthStore' }
  )
)

export default useAuthStore
