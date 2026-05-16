import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from '../features/auth/auth.store.js'
import { storage } from '../services/storage.js'

export default function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const setCredentials = useAuthStore((s) => s.setCredentials)
  const location = useLocation()

  const storedToken = storage.getToken()
  const storedUser = storage.getUser()
  const resolvedUser = user ?? storedUser
  const resolvedIsAuthenticated = isAuthenticated || Boolean(storedToken && storedUser)

  useEffect(() => {
    if (storedToken && storedUser && !isAuthenticated) {
      setCredentials(storedUser, storedToken)
    }
  }, [isAuthenticated, setCredentials, storedToken, storedUser])

  if (!resolvedIsAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  if (allowedRoles && resolvedUser?.role && !allowedRoles.includes(resolvedUser.role)) {
    const fallback = resolvedUser.role === 'artisan' ? '/hustler' : '/feed'
    return <Navigate to={fallback} replace />
  }

  return children
}
