import { Outlet, Navigate } from 'react-router-dom'
import useAuthStore from '../../features/auth/auth.store.js'

/**
 * AuthLayout — wraps all unauthenticated routes.
 * Pages that want full-bleed control (SignIn, SignUp) render their own
 * two-column layout and simply fill the <Outlet />.
 * The layout itself just provides the redirect guard + a neutral container.
 */
export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'var(--ff-body)' }}>
      <Outlet />
    </div>
  )
}
