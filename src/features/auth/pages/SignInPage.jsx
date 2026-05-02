import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate } from 'react-router-dom'
import { Home } from 'lucide-react'
import { signInSchema } from '../auth.schemas.js'
import { useSignIn } from '../auth.hooks.js'
import { Input } from '../../../shared/components/Input.jsx'
import { Button } from '../../../shared/components/Button.jsx'
import { AuthLayout } from '../components/AuthLayout.jsx'
import { SocialLogins } from '../components/SharedAuthUI.jsx'
import { HustleLogoText } from '../../../shared/components/HustleLogo.jsx'
import useAuthStore from '../auth.store.js'

export default function SignInPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { mutate: signIn, isPending } = useSignIn()

  // Redirect to feed if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/feed" replace />
  }

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  })

  const onSubmit = (data) => {
    signIn(data)
  }

  return (
    <AuthLayout variant="split" splitImage="/src/assets/images/signin.png">
      <div className="w-full max-w-[440px] mx-auto relative">

        {/* Home button */}
        {/* <Link
          to="/"
          className="absolute -top-12 left-0 flex items-center gap-2 text-[14px] font-medium text-text-3 hover:text-primary transition-colors"
        >
          <Home size={18} />
        </Link> */}

        <HustleLogoText size="40%" className="mb-6" />

        <h2 className="font-display text-[28px] font-bold text-text-1 tracking-tight mb-2">
          Sign in to your account
        </h2>
        <p className="text-[14px] text-text-3 mb-9 leading-relaxed">
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
              disabled={isPending}
              className="rounded-full h-[50px] w-full text-[15px] bg-primary-btn"
            >
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>

        <SocialLogins />

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
