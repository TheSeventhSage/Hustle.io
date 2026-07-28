import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useResendVerification, useVerifyEmail } from '../auth.hooks.js'
import { AuthLayout } from '../components/AuthLayout.jsx'
import { HustleLogoWhite } from '../../../shared/components/HustleLogo.jsx'
import { GlassCard } from '../../../shared/components/GlassCard.jsx'
import { Button } from '../../../shared/components/Button.jsx'
import { PaperPlaneIcon } from '../components/SharedAuthUI.jsx'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { mutate: resend, isPending: isResending } = useResendVerification()
  const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail()
  const [countdown, setCountdown] = useState(null)
  const [verificationStatus, setVerificationStatus] = useState('idle') // 'idle', 'verifying', 'success', 'error'

  // Get token and email from URL params
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  // Auto-verify if token and email are present in URL
  useEffect(() => {
    if (token && email && verificationStatus === 'idle') {
      setVerificationStatus('verifying')
      verifyEmail(
        { email, token },
        {
          onSuccess: () => {
            setVerificationStatus('success')
          },
          onError: () => {
            setVerificationStatus('error')
          }
        }
      )
    }
  }, [token, email, verificationStatus, verifyEmail])

  const handleResend = () => {
    if (!email) return

    resend(
      { email },
      {
        onSuccess(data) {
          const resendTime = data?.resend_after ?? 60
          setCountdown(resendTime)
          const interval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(interval)
                return null
              }
              return prev - 1
            })
          }, 1000)
        }
      }
    )
  }

  // Show verifying state
  if (verificationStatus === 'verifying') {
    return (
      <AuthLayout variant="centered">
        <GlassCard className="max-w-[520px] text-center">
          <div className="mb-4">
            <HustleLogoWhite size="10%" radius="0px" />
          </div>
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="font-display text-[22px] font-bold text-white tracking-tight text-center mb-3">
            Verifying your email...
          </h2>
          <p className="text-[14px] text-white/65 text-center leading-relaxed">
            Please wait while we verify your email address.
          </p>
        </GlassCard>
      </AuthLayout>
    )
  }

  // Show error state
  if (verificationStatus === 'error') {
    return (
      <AuthLayout variant="centered">
        <GlassCard className="max-w-[520px]">
          <div className="mb-4">
            <HustleLogoWhite size="10%" radius="0px" />
          </div>

          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>

          <h2 className="font-display text-[22px] font-bold text-white tracking-tight text-center mb-3">
            Verification failed
          </h2>
          <p className="text-[14px] text-white/65 text-center leading-relaxed mb-6">
            The verification link is invalid or has expired. Please request a new verification email.
          </p>

          <Button
            variant="primary"
            isPending={isResending}
            disabled={countdown !== null || !email}
            onClick={handleResend}
            className="w-full mb-4"
          >
            {countdown !== null
              ? `Resend in ${countdown}s`
              : 'Resend verification email'}
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/sign-in')}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </GlassCard>
      </AuthLayout>
    )
  }

  // Show default state (waiting for email verification)
  return (
    <AuthLayout variant="centered">
      <GlassCard className="max-w-[520px]">
        <div className="mb-4">
          <HustleLogoWhite size="10%" radius="0px" />
        </div>

        <PaperPlaneIcon />

        <h2 className="font-display text-[22px] font-bold text-white tracking-tight text-center mb-3">
          Complete your email verification
        </h2>

        <p className="text-[14px] text-white/65 text-center leading-relaxed ">
          We've just sent an email to the address:{' '}
          <span className="text-white font-semibold">{email || 'your email'}</span>
        </p>

        <p className="text-[14px] text-white/65 text-center leading-relaxed mb-6">
          Kindly check your email and click on the verification link to verify your <br/> account on Hustle.
        </p>

        <Button
          variant="primary"
          isPending={isResending}
          disabled={countdown !== null || !email}
          onClick={handleResend}
          className="w-full mb-4"
        >
          {countdown !== null
            ? `Resend in ${countdown}s`
            : 'Resend verification email'}
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/sign-in')}
          className="w-full"
        >
          Back to Sign In
        </Button>
      </GlassCard>
    </AuthLayout>
  )
}
