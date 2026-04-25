import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuthStore from '../features/auth/auth.store.js'
import { storage } from '../services/storage.js'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setCredentials = useAuthStore((s) => s.setCredentials)
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if we have token and user in storage but not in store
    const token = storage.getToken()
    const user = storage.getUser()

    if (token && user && !isAuthenticated) {
      // Restore credentials to store
      setCredentials(user, token)
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

  return children
}
