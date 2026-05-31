import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { logAuthDebug } from '../features/auth/authDebug.js'
import useAuthStore from '../features/auth/auth.store.js'
import { getDefaultAuthenticatedRoute } from '../features/auth/authRedirect.js'
import { isAllowedAccountRole } from '../features/auth/authRole.js'
import { storage } from '../services/storage.js'
import { LoginPreloader } from '../shared/components/LoginPreloader.jsx'

export default function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isRedirecting = useAuthStore((s) => s.isRedirecting)
  const user = useAuthStore((s) => s.user)
  const setCredentials = useAuthStore((s) => s.setCredentials)
  const setRedirecting = useAuthStore((s) => s.setRedirecting)
  const location = useLocation()
  const [showPreloader, setShowPreloader] = useState(false)

  const storedToken = storage.getToken()
  const storedUser = storage.getUser()
  const resolvedUser = user ?? storedUser
  const resolvedIsAuthenticated = isAuthenticated || Boolean(storedToken && storedUser)

  logAuthDebug('ProtectedRoute.render', {
    path: location.pathname,
    isAuthenticated,
    resolvedIsAuthenticated,
    role: resolvedUser?.role || null,
    allowedRoles: allowedRoles || null,
  })

  useEffect(() => {
    logAuthDebug('ProtectedRoute.resolve', {
      path: location.pathname,
      isAuthenticated,
      hasStoredToken: Boolean(storedToken),
      hasStoredUser: Boolean(storedUser),
      resolvedIsAuthenticated,
      role: resolvedUser?.role || null,
      allowedRoles: allowedRoles || null,
    })

    if (storedToken && storedUser && !isAuthenticated) {
      logAuthDebug('ProtectedRoute.hydrateFromStorage', {
        path: location.pathname,
        role: storedUser?.role || null,
      })
      setCredentials(storedUser, storedToken)
    }
  }, [allowedRoles, isAuthenticated, location.pathname, resolvedIsAuthenticated, resolvedUser?.role, setCredentials, storedToken, storedUser])

  // Show preloader when redirecting after login
  useEffect(() => {
    if (isRedirecting) {
      logAuthDebug('ProtectedRoute.showPreloader', { path: location.pathname })
      setShowPreloader(true)
    }
  }, [isRedirecting, location.pathname])

  const handlePreloaderComplete = () => {
    logAuthDebug('ProtectedRoute.preloaderComplete', { path: location.pathname })
    setShowPreloader(false)
    setRedirecting(false)
  }

  if (!resolvedIsAuthenticated) {
    logAuthDebug('ProtectedRoute.redirectToSignIn', { path: location.pathname })
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  if (allowedRoles && resolvedUser?.role && !isAllowedAccountRole(resolvedUser.role, allowedRoles)) {
    const fallback = getDefaultAuthenticatedRoute(resolvedUser.role)
    logAuthDebug('ProtectedRoute.redirectRoleMismatch', {
      path: location.pathname,
      role: resolvedUser.role,
      allowedRoles,
      fallback,
    })
    return <Navigate to={fallback} replace />
  }

  if (showPreloader) {
    return <LoginPreloader onComplete={handlePreloaderComplete} />
  }

  return children
}
