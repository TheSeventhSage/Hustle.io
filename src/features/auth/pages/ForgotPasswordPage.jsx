import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useForgotPassword } from '../auth.hooks.js'
import { forgotPasswordSchema } from '../auth.schemas.js'
import { getDefaultAuthenticatedRoute } from '../authRedirect.js'
import { AuthLayout } from '../components/AuthLayout.jsx'
import { GlassCard } from '../../../shared/components/GlassCard.jsx'
import { Button } from '../../../shared/components/Button.jsx'
import { PaperPlaneIcon } from '../components/SharedAuthUI.jsx'
import useAuthStore from '../auth.store.js'

export default function ForgotPasswordPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const { mutate: forgot, isPending, isSuccess } = useForgotPassword()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  })

  // Redirect to feed if already authenticated
  if (isAuthenticated) {
    return <Navigate to={getDefaultAuthenticatedRoute(user?.role)} replace />
  }

  return (
    <AuthLayout variant="centered">
      <GlassCard className="max-w-[520px]">

        {isSuccess ? (
          <>
            <div className="flex items-center mb-4">
              <Link to="/sign-in" className="text-white flex items-center no-underline">
                <ChevronLeft size={20} />
              </Link>
            </div>

            <PaperPlaneIcon />

            <h2 className="font-display text-[22px] font-bold text-white tracking-tight text-center mb-3">
              Email sent
            </h2>
            <p className="text-[14px] text-white/65 text-center leading-relaxed mb-6">
              Check your inbox for instructions to reset your password.
            </p>

            <Link to="/sign-in" className="block no-underline">
              <Button variant="primary" className="w-full">
                Return to sign in
              </Button>
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center mb-6">
              <Link to="/sign-in" className="text-white flex items-center no-underline">
                <ChevronLeft size={20} />
              </Link>
            </div>

            <h2 className="font-display text-[22px] font-bold text-white tracking-tight mb-3">
              Reset password
            </h2>
            <p className="text-[14px] text-white/65 leading-relaxed mb-8">
              Enter the email associated with your account and we'll send an email with instructions to reset your password.
            </p>

            <form onSubmit={handleSubmit(forgot)}>
              <div className="mb-6">
                <label className="block text-[13px] font-medium text-white/70 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={[
                    'w-full h-12 px-4 bg-white/10 rounded-[10px] outline-none text-white placeholder:text-white/40 border transition-colors',
                    errors.email ? 'border-error' : 'border-white/20 focus:border-white/50',
                  ].join(' ')}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-[12px] text-error mt-1">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" variant="primary" isPending={isPending} className="w-full">
                {isPending ? '' : 'Send reset link'}
              </Button>
            </form>
          </>
        )}
      </GlassCard>
    </AuthLayout>
  )
}
