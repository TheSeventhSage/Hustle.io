import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { storage } from '../../services/storage.js'
import { logAuthDebug } from './authDebug.js'
import { mergeStoredUser } from './authUser.js'

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
          const mergedUser = mergeStoredUser(user)
          logAuthDebug('authStore.setCredentials.start', {
            role: mergedUser?.role || null,
            email: mergedUser?.email || null,
            hasToken: Boolean(token),
          })
          storage.setToken(token)
          storage.setUser(mergedUser)
          storage.setAuthState({
            user: mergedUser,
            token,
            isAuthenticated: true,
          })
          logAuthDebug('authStore.setCredentials.complete', {
            role: mergedUser?.role || null,
            email: mergedUser?.email || null,
            hasToken: Boolean(token),
          })
          set({ user: mergedUser, token, isAuthenticated: true, error: null })
        },

        setUser(user) {
          const mergedUser = mergeStoredUser(user)
          const currentState = get()
          logAuthDebug('authStore.setUser', {
            role: mergedUser?.role || null,
            email: mergedUser?.email || null,
            isAuthenticated: currentState.isAuthenticated,
          })
          storage.setUser(mergedUser)
          storage.setAuthState({
            user: mergedUser,
            token: currentState.token,
            isAuthenticated: currentState.isAuthenticated,
          })
          set({ user: mergedUser })
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
          logAuthDebug('authStore.logout.start')
          storage.clearAll()
          logAuthDebug('authStore.logout.complete')
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
          return get().user?.role === 'client' || get().user?.role === 'company'
        },

        get isHustler() {
          return get().user?.role === 'artisan'
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
            logAuthDebug('authStore.rehydrate', {
              hasUser: Boolean(state.user),
              role: state.user?.role || null,
              isAuthenticated: state.isAuthenticated,
            })
          }
        },
      }
    ),
    { name: 'AuthStore' }
  )
)

export default useAuthStore
