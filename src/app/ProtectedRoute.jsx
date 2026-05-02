import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuthStore from '../features/auth/auth.store.js'
import { storage } from '../services/storage.js'

export default function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const setCredentials = useAuthStore((s) => s.setCredentials)
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const token = storage.getToken()
    const storedUser = storage.getUser()

    if (token && storedUser && !isAuthenticated) {
      setCredentials(storedUser, token)
    }

    setIsChecking(false)
  }, [isAuthenticated, setCredentials])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  // Role check — redirect based on role
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Artisans go to their home, everyone else goes to feed
    const fallback = user.role === 'artisan' ? '/hustler' : '/feed'
    return <Navigate to={fallback} replace />
  }

  return children
}
