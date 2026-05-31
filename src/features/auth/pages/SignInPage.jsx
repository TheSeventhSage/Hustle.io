import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { logAuthDebug } from '../authDebug.js'
import { signInSchema } from '../auth.schemas.js'
import { getDefaultAuthenticatedRoute } from '../authRedirect.js'
import { useGoogleAuthStart, useSignIn, useTokenSessionBootstrap } from '../auth.hooks.js'
import { Input } from '../../../shared/components/Input.jsx'
import { Button } from '../../../shared/components/Button.jsx'
import { AuthLayout } from '../components/AuthLayout.jsx'
import { HustleLogoText } from '../../../shared/components/HustleLogo.jsx'
import useAuthStore from '../auth.store.js'
import { storage } from '../../../services/storage.js'

export default function SignInPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { mutate: signIn, isPending } = useSignIn()
  const { mutate: startGoogleAuth, isPending: isGooglePending } = useGoogleAuthStart()
  const { mutate: bootstrapSession, isPending: isBootstrapPending } = useTokenSessionBootstrap()
  const bootstrapAttemptedRef = useRef(false)

  // Auto-redirect authenticated users to their role-specific home
  useEffect(() => {
    logAuthDebug('SignInPage.effect', {
      isAuthenticated,
      role: user?.role || null,
    })

    if (isAuthenticated && user?.role) {
      const destination = getDefaultAuthenticatedRoute(user.role)
      logAuthDebug('SignInPage.effect.navigate', { destination, role: user.role })
      navigate(destination, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    if (bootstrapAttemptedRef.current || isAuthenticated) {
      return
    }

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const hashToken = hashParams.get('access_token')?.trim() || hashParams.get('token')?.trim() || ''
    const storedToken = storage.getToken()?.trim() || ''
    const token = hashToken || storedToken

    if (!token) {
      return
    }

    bootstrapAttemptedRef.current = true

    logAuthDebug('SignInPage.bootstrapSession', {
      hasHashToken: Boolean(hashToken),
      hasStoredToken: Boolean(storedToken),
    })

    bootstrapSession(
      { token },
      {
        onSuccess: (session) => {
          if (hashToken) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }

          navigate(getDefaultAuthenticatedRoute(session.user?.role), { replace: true })
        },
        onError: () => {
          if (hashToken) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }
        },
      }
    )
  }, [bootstrapSession, isAuthenticated, navigate])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  })

  const onSubmit = (data) => {
    logAuthDebug('SignInPage.onSubmit', { email: data?.email || null })
    signIn(data)
  }

  const handleGoogleSignIn = () => {
    startGoogleAuth({
      timezone_name: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Accra',
    })
  }

  return (
    <AuthLayout variant="split" splitImage="/images/signin.png">
      <div className="w-full max-w-[440px] mx-auto relative">

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/sign-up')}
          className="absolute top-1 left-0 flex items-center gap-1 text-[14px] font-medium text-text-3 hover:text-text-1 transition-colors bg-transparent border-none cursor-pointer"
        >
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>

        <HustleLogoText size="30%" className="mb-6" />

        <h2 className="font-display text-[28px] font-bold text-text-1 tracking-tight mb-2 text-center">
          Sign in to your account
        </h2>
        <p className="text-[14px] text-text-3 mb-9 leading-relaxed text-center">
          Welcome back! Please enter your details.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[13px] font-medium text-text-2">Password</label>
              <Link
                to="/forgot-password"
                className="text-[13px] text-primary dark:text-primary-light font-medium no-underline hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div className="mt-8">
            <Button
              type="submit"
              variant="solid"
              disabled={isPending || isBootstrapPending}
              className="rounded-full h-[50px] w-full text-[15px] bg-primary-btn"
            >
              {isPending || isBootstrapPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className="my-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[13px] text-text-3">Or continue with</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          variant="ghost"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGooglePending || isBootstrapPending}
          className="mb-8 h-11 w-full"
        >
          <img
            src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png"
            className="h-4.5 w-4.5"
            alt="Google"
          />
          {isGooglePending ? 'Starting Google...' : 'Google'}
        </Button>

        <p className="text-center text-[14px] text-text-3">
          Don't have an account?{' '}
          <Link to="/sign-up" className="text-primary dark:text-primary-light font-semibold no-underline hover:underline">
            Create an account here
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
