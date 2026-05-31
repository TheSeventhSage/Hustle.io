import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { resetPasswordSchema } from '../auth.schemas.js'
import { useResetPassword } from '../auth.hooks.js'
import { AuthLayout } from '../components/AuthLayout.jsx'
import { GlassCard } from '../../../shared/components/GlassCard.jsx'
import { Input } from '../../../shared/components/Input.jsx'
import { Button } from '../../../shared/components/Button.jsx'
import { PaperPlaneIcon } from '../components/SharedAuthUI.jsx'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isComplete, setIsComplete] = useState(false)
  const { mutate: resetPassword, isPending } = useResetPassword()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  })

  const email = searchParams.get('email')?.trim() || ''
  const token = searchParams.get('token')?.trim() || ''
  const accountType = searchParams.get('account_type')?.trim() || ''
  const resetEmailSent = searchParams.get('sent') === '1'
  const hasValidLink = Boolean(email && token)
  const isAwaitingResetLink = Boolean(email && !token && resetEmailSent)

  const onSubmit = ({ password }) => {
    resetPassword({
      email,
      token,
      account_type: accountType || undefined,
      password,
      password_confirmation: password,
    }, {
      onSuccess: () => {
        setIsComplete(true)
      },
    })
  }

  return (
    <AuthLayout variant="centered">
      <GlassCard className="max-w-[520px]">
        {isComplete ? (
          <>
            <PaperPlaneIcon />

            <h2 className="mb-3 text-center font-display text-[22px] font-bold tracking-tight text-white">
              Password updated
            </h2>
            <p className="mb-6 text-center text-[14px] leading-relaxed text-white/65">
              Your password has been reset successfully. Sign in with your new password.
            </p>

            <Button
              variant="primary"
              onClick={() => navigate('/sign-in')}
              className="w-full"
            >
              Back to sign in
            </Button>
          </>
        ) : isAwaitingResetLink ? (
          <>
            <div className="mb-6 flex items-center">
              <Link to="/sign-in" className="flex items-center text-white no-underline">
                <ChevronLeft size={20} />
              </Link>
            </div>

            <PaperPlaneIcon />

            <h2 className="mb-3 text-center font-display text-[22px] font-bold tracking-tight text-white">
              Check your email
            </h2>
            <p className="mb-2 text-center text-[14px] leading-relaxed text-white/65">
              We sent a password reset link to <span className="font-semibold text-white">{email}</span>.
            </p>
            <p className="mb-6 text-center text-[14px] leading-relaxed text-white/65">
              Open the latest email from Hustle and follow the reset link to create your new password.
            </p>

            <Link to="/sign-in" className="block no-underline">
              <Button variant="primary" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </>
        ) : !hasValidLink ? (
          <>
            <div className="mb-6 flex items-center">
              <Link to="/forgot-password" className="flex items-center text-white no-underline">
                <ChevronLeft size={20} />
              </Link>
            </div>

            <h2 className="mb-3 font-display text-[22px] font-bold tracking-tight text-white">
              Invalid reset link
            </h2>
            <p className="mb-6 text-[14px] leading-relaxed text-white/65">
              This password reset link is missing required details or has been opened incorrectly. Request a new password reset email and use the latest link.
            </p>

            <Link to="/forgot-password" className="block no-underline">
              <Button variant="primary" className="w-full">
                Request a new reset link
              </Button>
            </Link>
          </>
        ) : (
          <>
            <div className="mb-6 flex items-center">
              <Link to="/sign-in" className="flex items-center text-white no-underline">
                <ChevronLeft size={20} />
              </Link>
            </div>

            <h2 className="mb-3 font-display text-[22px] font-bold tracking-tight text-white">
              Create a new password
            </h2>
            <p className="mb-2 text-[14px] leading-relaxed text-white/65">
              Resetting password for <span className="font-semibold text-white">{email}</span>
            </p>
            {accountType && (
              <p className="mb-8 text-[13px] uppercase tracking-[0.08em] text-white/45">
                Account type: {accountType}
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="New password"
                type="password"
                placeholder="Enter a new password"
                error={errors.password?.message}
                {...register('password')}
                style={{ marginBottom: '20px' }}
              />

              <Input
                label="Confirm password"
                type="password"
                placeholder="Re-enter your new password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
                style={{ marginBottom: '24px' }}
              />

              <Button type="submit" variant="primary" isPending={isPending} className="w-full">
                {isPending ? '' : 'Reset password'}
              </Button>
            </form>
          </>
        )}
      </GlassCard>
    </AuthLayout>
  )
}
