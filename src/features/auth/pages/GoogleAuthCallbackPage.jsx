import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout.jsx'
import { GlassCard } from '../../../shared/components/GlassCard.jsx'
import { Button } from '../../../shared/components/Button.jsx'
import { useGoogleAuthCallback, useTokenSessionBootstrap } from '../auth.hooks.js'
import { getDefaultAuthenticatedRoute } from '../authRedirect.js'

/**
 * GoogleAuthCallbackPage
 *
 * Handles two distinct flows that both land on /auth/callback:
 *
 * OLD flow (Google → frontend directly):
 *   Google redirects here with ?code=...&state=...
 *   We call GET /auth/google/callback?code=...&state=... to exchange the code.
 *
 * NEW flow (Google → backend → frontend):
 *   The backend now accepts redirect_uri pointing at itself, exchanges the code,
 *   and redirects the user here with ?access_token=... (or #access_token=...).
 *   We bootstrap the session from that token directly.
 *
 * Both paths share the same loading/error UI. The new path is checked first;
 * the old path remains fully intact as a fallback.
 */
export default function GoogleAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [errorMessage, setErrorMessage] = useState('')

  const { mutate: completeGoogleAuth, isPending: isCodePending } = useGoogleAuthCallback()
  const { mutate: bootstrapSession, isPending: isTokenPending } = useTokenSessionBootstrap()

  const isPending = isCodePending || isTokenPending

  // Resolve which flow applies from the URL — computed once per render.
  const { accessToken, code, state } = useMemo(() => {
    // Token can arrive in the query string or in the hash fragment.
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

    const token =
      searchParams.get('access_token')?.trim() ||
      searchParams.get('token')?.trim() ||
      hashParams.get('access_token')?.trim() ||
      hashParams.get('token')?.trim() ||
      ''

    return {
      accessToken: token,
      code: searchParams.get('code')?.trim() || '',
      state: searchParams.get('state')?.trim() || '',
    }
  }, [searchParams])

  useEffect(() => {
    // ── New flow: backend already exchanged the code and sent us a token ────────
    if (accessToken) {
      // Clean the token out of the URL bar before navigating away.
      window.history.replaceState(null, '', window.location.pathname)

      let cancelled = false

      bootstrapSession(
        { token: accessToken },
        {
          onSuccess: (session) => {
            if (cancelled) return
            navigate(getDefaultAuthenticatedRoute(session.user?.role), { replace: true })
          },
          onError: (error) => {
            if (cancelled) return
            setErrorMessage(error?.message || 'Google sign-in could not be completed.')
          },
        }
      )

      return () => { cancelled = true }
    }

    // ── Old flow: Google redirected here with an auth code ─────────────────────
    if (!code) return

    let cancelled = false

    completeGoogleAuth(
      { code, state },
      {
        onSuccess: (session) => {
          if (cancelled) return
          navigate(getDefaultAuthenticatedRoute(session.user?.role), { replace: true })
        },
        onError: (error) => {
          if (cancelled) return
          setErrorMessage(error?.message || 'Google sign-in could not be completed.')
        },
      }
    )

    return () => { cancelled = true }
  }, [accessToken, code, state, completeGoogleAuth, bootstrapSession, navigate])

  // Determine what error to show, if any.
  const displayError = (() => {
    if (errorMessage) return errorMessage
    if (!accessToken && !code) return 'The Google callback did not include an authorization code or token.'
    return ''
  })()

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
