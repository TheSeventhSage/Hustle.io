import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from './auth.service.js'
import { logAuthDebug } from './authDebug.js'
import { getAllowedAuthRedirect } from './authRedirect.js'
import useAuthStore from './auth.store.js'
import useUIStore from '../../shared/store/ui.store.js'
import { queryKeys } from '../../services/query-keys.js'
import { storage } from '../../services/storage.js'

// ── Queries ──────────────────────────────────────────────

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authService.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min
  })
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: authService.getCountries,
    staleTime: Infinity, // Countries don't change often
  })
}

// ── Mutations ─────────────────────────────────────────────

export function useSignUp() {
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: authService.signUp,
    onSuccess(data) {
      toastSuccess(data.message || 'Account created! Please verify your email.')
    },
    onError(err) {
      const message = err.message ?? 'Sign up failed. Please try again.'
      toastError(message)
    },
  })
}

export function useSignIn() {
  const { setCredentials, setRedirecting } = useAuthStore()
  const { toastSuccess, toastError } = useUIStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      logAuthDebug('useSignIn.mutationFn.start', { email: data?.email || null })
      const result = await authService.signIn(data)
      logAuthDebug('useSignIn.mutationFn.success', {
        role: result?.user?.role || null,
        email: result?.user?.email || null,
        hasToken: Boolean(result?.token),
      })
      return result
    },
    onSuccess: async (data) => {
      // Honor ?redirect= (e.g. a gated Book/Message CTA) so users return to
      // where they came from; falls back to the role default when absent.
      const redirectParam = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null
      const destination = getAllowedAuthRedirect(redirectParam, data.user?.role)
      try {
        logAuthDebug('useSignIn.onSuccess', {
          role: data.user?.role || null,
          email: data.user?.email || null,
          destination,
          hasToken: Boolean(data?.token),
        })

        // Set credentials with full user data from login response
        setCredentials(data.user, data.token)

        // Show success toast
        toastSuccess(`Welcome back, ${data.user.first_name || 'User'}!`)

        // Set redirecting flag to show preloader
        setRedirecting(true)

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })

        // Navigate immediately - preloader will show for 2 seconds
        logAuthDebug('useSignIn.navigate', { destination })
        navigate(destination, { replace: true })
      } catch (error) {
        console.error('Error in onSuccess:', error)
        logAuthDebug('useSignIn.onSuccess.error', {
          message: error?.message || 'Unknown post-login error',
        })
        toastError('An error occurred. Redirecting...')
        setTimeout(() => {
          logAuthDebug('useSignIn.navigate.fallback', { destination })
          navigate(destination, { replace: true })
          setRedirecting(false)
        }, 2000)
      }
    },
    onError(err) {
      console.error('useSignIn onError:', err)
      logAuthDebug('useSignIn.onError', {
        message: err?.message || 'Unknown sign-in error',
        status: err?.status ?? null,
      })
      toastError(err.message ?? 'Sign in failed. Check your credentials.')
    },
  })
}

export function useSignOut() {
  const { logout } = useAuthStore()
  const { toastSuccess } = useUIStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.signOut,
    onSettled() {
      // Clear regardless of server response
      logout()
      queryClient.clear()
      toastSuccess('You have been signed out.')
      navigate('/sign-in')
    },
  })
}

export function useForgotPassword() {
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess() {
      toastSuccess('Password reset email sent. Check your inbox.')
    },
    onError(err) {
      toastError(err.message ?? 'Failed to send reset email.')
    },
  })
}

export function useResetPassword() {
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess(data) {
      toastSuccess(data?.message || 'Password reset successful. You can sign in now.')
    },
    onError(err) {
      toastError(err.message ?? 'Failed to reset password.')
    },
  })
}

export function useGoogleAuthStart() {
  const { toastError } = useUIStore()

  return useMutation({
    mutationFn: async (params) => {
      const result = await authService.getGoogleAuthUrl(params)
      const authUrl = result?.data?.auth_url

      if (!authUrl) {
        throw new Error(result?.message || 'Google authorization URL was not returned.')
      }

      return authUrl
    },
    onSuccess(authUrl) {
      window.location.assign(authUrl)
    },
    onError(err) {
      toastError(err.message ?? 'Failed to start Google sign-in.')
    },
  })
}

export function useGoogleAuthCallback() {
  const { setCredentials, setRedirecting } = useAuthStore()
  const { toastSuccess, toastError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.googleCallback,
    onSuccess(data) {
      setCredentials(data.user, data.token)
      setRedirecting(true)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
      toastSuccess(`Welcome, ${data.user.first_name || 'User'}!`)
    },
    onError(err) {
      toastError(err.message ?? 'Google sign-in failed.')
    },
  })
}

export function useTokenSessionBootstrap() {
  const { setCredentials, setRedirecting, logout } = useAuthStore()
  const { toastSuccess, toastError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ token }) => {
      logAuthDebug('useTokenSessionBootstrap.start', { hasToken: Boolean(token) })

      if (!token) {
        throw new Error('Authentication token was not provided.')
      }

      storage.setToken(token)
      const { user } = await authService.getMe(token)
      return { token, user }
    },
    onSuccess(data) {
      setCredentials(data.user, data.token)
      setRedirecting(true)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
      toastSuccess(`Welcome, ${data.user.first_name || 'User'}!`)
    },
    onError(err) {
      logout()
      toastError(err.message ?? 'Automatic sign-in failed.')
    },
  })
}

export function useChangePassword() {
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess() {
      toastSuccess('Password updated successfully.')
    },
    onError(err) {
      toastError(err.message ?? 'Failed to update password.')
    },
  })
}

export function useChangeEmail() {
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: authService.changeEmail,
    onSuccess() {
      toastSuccess('Verification email sent to your new address.')
    },
    onError(err) {
      toastError(err.message ?? 'Failed to update email.')
    },
  })
}

export function useDeleteAccount() {
  const { logout } = useAuthStore()
  const { toastSuccess, toastError } = useUIStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.deleteAccount,
    onSuccess() {
      logout()
      queryClient.clear()
      toastSuccess('Your account has been deleted.')
      navigate('/sign-in')
    },
    onError(err) {
      toastError(err.message ?? 'Failed to delete account.')
    },
  })
}

export function useResendVerification() {
  const { toastSuccess, toastError } = useUIStore()
  return useMutation({
    mutationFn: authService.resendVerification,
    onSuccess(data) {
      toastSuccess(data.message || 'Verification email resent.')
      return data
    },
    onError(err) {
      toastError(err.message ?? 'Failed to resend verification email.')
    },
  })
}

export function useVerifyEmail() {
  const { toastSuccess, toastError } = useUIStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess(data) {
      toastSuccess(data.message || 'Email verified successfully! Redirecting to sign in...')
      // Wait 4 seconds before redirecting to allow user to see the toast
      setTimeout(() => navigate('/sign-in'), 4000)
    },
    onError(err) {
      toastError(err.message ?? 'Email verification failed. Please try again.')
    },
  })
}
