import { useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { logAuthDebug } from '../../features/auth/authDebug.js'
import { getDefaultAuthenticatedRoute } from '../../features/auth/authRedirect.js'
import { authService } from '../../features/auth/auth.service.js'
import useAuthStore from '../../features/auth/auth.store.js'
import { storage } from '../../services/storage.js'

/**
 * AuthLayout — wraps all unauthenticated routes.
 * Pages that want full-bleed control (SignIn, SignUp) render their own
 * two-column layout and simply fill the <Outlet />.
 * The layout itself just provides the redirect guard + a neutral container.
 */
export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const setCredentials = useAuthStore((s) => s.setCredentials)
  const logout = useAuthStore((s) => s.logout)

  const storedToken = storage.getToken()
  const persistedAuthState = storage.getAuthState()?.state ?? null
  const storedUser = storage.getUser() ?? persistedAuthState?.user ?? null
  const resolvedUser = user ?? storedUser
  const hasStoredSession = Boolean(storedToken && storedUser)
  const shouldFetchStoredProfile = Boolean(storedToken && !storedUser && !isAuthenticated)

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      if (isAuthenticated || !storedToken) return

      if (storedUser) {
        logAuthDebug('AuthLayout.restoreFromStorage', {
          role: storedUser?.role || null,
          email: storedUser?.email || null,
        })
        setCredentials(storedUser, storedToken)
        return
      }

      logAuthDebug('AuthLayout.restoreFromToken.start')

      try {
        const result = await authService.getMe()
        if (cancelled) return

        if (result?.user) {
          logAuthDebug('AuthLayout.restoreFromToken.success', {
            role: result.user?.role || null,
            email: result.user?.email || null,
          })
          setCredentials(result.user, storedToken)
          return
        }

        logAuthDebug('AuthLayout.restoreFromToken.empty')
        logout()
      } catch (error) {
        if (cancelled) return

        logAuthDebug('AuthLayout.restoreFromToken.error', {
          message: error?.message || 'Failed to restore stored session',
          status: error?.status ?? null,
        })
        logout()
      }
    }

    restoreSession()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, logout, setCredentials, storedToken, storedUser])

  if (isAuthenticated || hasStoredSession) {
    return <Navigate to={getDefaultAuthenticatedRoute(resolvedUser?.role)} replace />
  }

  if (shouldFetchStoredProfile) {
    return (
      <div style={{ minHeight: '100vh', fontFamily: 'var(--ff-body)', display: 'grid', placeItems: 'center' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-text-3)' }}>Restoring your session...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'var(--ff-body)' }}>
      <Outlet />
    </div>
  )
}
