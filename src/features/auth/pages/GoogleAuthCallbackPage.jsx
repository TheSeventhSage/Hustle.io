import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout.jsx'
import { GlassCard } from '../../../shared/components/GlassCard.jsx'
import { Button } from '../../../shared/components/Button.jsx'
import { useGoogleAuthCallback } from '../auth.hooks.js'
import { getDefaultAuthenticatedRoute } from '../authRedirect.js'

export default function GoogleAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [errorMessage, setErrorMessage] = useState('')
  const { mutate: completeGoogleAuth, isPending } = useGoogleAuthCallback()

  const code = searchParams.get('code')?.trim() || ''
  const state = searchParams.get('state')?.trim() || ''
  const displayError = code ? errorMessage : 'The Google callback did not include an authorization code.'

  useEffect(() => {
    if (!code) {
      return
    }

    let cancelled = false

    completeGoogleAuth({
      code,
      state,
    }, {
      onSuccess: (session) => {
        if (cancelled) return
        navigate(getDefaultAuthenticatedRoute(session.user?.role), { replace: true })
      },
      onError: (error) => {
        if (cancelled) return
        setErrorMessage(error?.message || 'Google sign-in could not be completed.')
      },
    })

    return () => {
      cancelled = true
    }
  }, [code, completeGoogleAuth, navigate, state])

  return (
    <AuthLayout variant="centered">
      <GlassCard className="max-w-[520px] text-center">
        {displayError ? (
          <>
            <h2 className="mb-3 font-display text-[22px] font-bold tracking-tight text-white">
              Google sign-in failed
            </h2>
            <p className="mb-6 text-[14px] leading-relaxed text-white/65">
              {displayError}
            </p>
            <Link to="/sign-in" className="block no-underline">
              <Button variant="primary" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-5 h-16 w-16 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
            <h2 className="mb-3 font-display text-[22px] font-bold tracking-tight text-white">
              Completing Google sign-in
            </h2>
            <p className="text-[14px] leading-relaxed text-white/65">
              {isPending ? 'Please wait while we finish your secure sign-in.' : 'Preparing your account...'}
            </p>
          </>
        )}
      </GlassCard>
    </AuthLayout>
  )
}
