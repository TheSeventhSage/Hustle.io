import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from './auth.service.js'
import useAuthStore from './auth.store.js'
import useUIStore from '../../shared/store/ui.store.js'
import { queryKeys } from '../../services/query-keys.js'

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
      const result = await authService.signIn(data)
      return result
    },
    onSuccess: async (data) => {
      try {
        // Set credentials with full user data from login response
        setCredentials(data.user, data.token)

        // Set redirecting flag to prevent UI flicker
        setRedirecting(true)

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })

        // Show success toast
        toastSuccess(`Welcome back, ${data.user.first_name || 'User'}!`)

        // Wait 4 seconds before redirecting to allow user to see the toast
        setTimeout(() => {
          navigate('/feed', { replace: true })
          setRedirecting(false)
        }, 4000)
      } catch (error) {
        console.error('Error in onSuccess:', error)
        toastError('An error occurred. Redirecting...')
        setTimeout(() => {
          navigate('/feed', { replace: true })
          setRedirecting(false)
        }, 2000)
      }
    },
    onError(err) {
      console.error('useSignIn onError:', err)
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
