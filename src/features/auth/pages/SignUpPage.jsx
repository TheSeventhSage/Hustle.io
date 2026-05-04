import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { Wrench, HardHat, ChevronLeft, Home } from 'lucide-react'
import { useSignUp } from '../auth.hooks.js'
import { signUpSchema } from '../auth.schemas.js'
import { AuthLayout } from '../components/AuthLayout.jsx'
import { GlassCard } from '../../../shared/components/GlassCard.jsx'
import { Input } from '../../../shared/components/Input.jsx'
import { Button } from '../../../shared/components/Button.jsx'
import { HustleLogoWhite, HustleLogoText } from '../../../shared/components/HustleLogo.jsx'
import useAuthStore from '../auth.store.js'

const STEP_LANDING = 'landing'
const STEP_ROLE = 'role'
const STEP_FORM = 'form'

const COUNTRIES = [
  { id: 1, code: 'NG', name: 'Nigeria' },
  { id: 2, code: 'GH', name: 'Ghana' },
]

// Map country codes to timezone names
const COUNTRY_TIMEZONES = {
  'NG': 'Africa/Lagos',
  'GH': 'Africa/Accra',
}

export default function SignUpPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const [step, setStep] = useState(STEP_LANDING)
  const [selectedRole, setSelectedRole] = useState(null)

  // Redirect to feed if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/feed" replace />
  }

  const { mutate: signUp, isPending } = useSignUp()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = (data) => {
    // Find the selected country to get its code for timezone lookup
    const selectedCountry = COUNTRIES.find(c => c.id === parseInt(data.country_id))
    const countryCode = selectedCountry?.code || 'NG'

    // Transform data to match API requirements
    const apiData = {
      email: data.email,
      password: data.password,
      account_type: data.role, // 'client', 'artisan', or 'company'
      country_id: parseInt(data.country_id),
      timezone_name: COUNTRY_TIMEZONES[countryCode] || 'Africa/Lagos',
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
    }

    signUp(apiData, {
      onSuccess: (response) => {
        // Redirect to verify email page with email in URL
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`)
      }
    })
  }

  const layoutVariant = step === STEP_FORM ? 'split' : 'centered'

  return (
    <AuthLayout variant={layoutVariant} splitImage="/images/signup.png">

      {/* ── LANDING ────────────────── */}
      {step === STEP_LANDING && (
        <GlassCard className="text-center relative">
          {/* Home button */}
          <Link
            to="/"
            className="absolute top-5 left-5 flex items-center gap-2 text-[13px] font-medium text-white/60 hover:text-white transition-colors"
          >
            <Home size={18} />
          </Link>

          <div className="mb-4">
            <HustleLogoWhite size="40%" />
          </div>

          <h2 className="font-display font-normal text-center text-white tracking-tight leading-snug">
            We're glad to have you on board <br /> 🎊🥳
          </h2>

          <div className="flex flex-col items-center justify-center gap-3 mt-5">
            <Button
              variant="solid"
              className="bg-primary-btn text-white sm:w-[65%]"
              onClick={() => navigate('/sign-in')}
            >
              Sign In
            </Button>
            <Button className="text-white sm:w-[65%]" variant="outline" onClick={() => setStep(STEP_ROLE)}>
              Create an account
            </Button>
          </div>
        </GlassCard>
      )}

      {/* ── ROLE SELECTOR ──────────── */}
      {step === STEP_ROLE && (
        <GlassCard className='relative'>
          {/* Back button */}
          <button
            type="button"
            onClick={() => setStep(STEP_LANDING)}
            className="absolute top-9 left-6 flex items-center gap-1 text-[13px] font-medium text-white/60 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>

          <div className="flex-1 text-center">
            <HustleLogoWhite size="40%" />
          </div>
          <div className="w-4" />

          <h2 className="font-display text-[18px] sm:text-[22px] font-bold text-white tracking-tight text-center my-2">
            Join as a Hustler or Hustle Creator
          </h2>
          <p className="text-[13px] text-white/60 text-center mb-7 leading-relaxed">
            Start your hustle journey, choose whether you're here to create or offer services
          </p>

          <div className="grid grid-cols-2 gap-3 mb-7">
            {[
              { value: 'artisan', label: 'Hustler', Icon: Wrench },
              { value: 'client', label: 'Hustle Creator', Icon: HardHat },
            ].map(({ value, label, Icon }, idx) => {
              const active = selectedRole === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedRole(value)}
                  className={[
                    'p-5 rounded-xl cursor-pointer text-left transition-all relative flex flex-col w-full md:w-[65%]',
                    idx === 0 ? 'justify-self-end' : 'justify-self-start',
                    active
                      ? 'bg-secondary/10 border-[1.5px] border-secondary'
                      : 'bg-white/[0.06] border-[1.5px] border-white/[0.12] hover:bg-white/10',
                  ].join(' ')}
                >
                  {/* Radio dot */}
                  <div className={[
                    'w-[18px] h-[18px] rounded-full border-2 mb-3',
                    active ? 'border-secondary bg-secondary' : 'border-white/30 bg-transparent',
                  ].join(' ')} />

                  <Icon size={28} color="rgba(255,255,255,0.75)" strokeWidth={1.5} className="mb-1.5 block" />
                  <div className="text-[13px] font-semibold text-white">{label}</div>
                </button>
              )
            })}
          </div>

          <Button
            className='sm:w-[65%] mx-auto'
            variant="primary"
            disabled={!selectedRole}
            onClick={() => selectedRole && setStep(STEP_FORM)}
          >
            Continue
          </Button>

          <p className="text-center text-[13px] text-white/50 mt-5">
            Already have an account? {' '}
            <Link to="/sign-in" className="text-secondary no-underline font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </GlassCard>
      )}

      {/* ── SIGN UP FORM ───────────── */}
      {step === STEP_FORM && (
        <div className="relative w-full max-w-[480px] mx-auto">

          {/* Home button */}
          <Link
            to="/"
            className="absolute -top-16 -left-1 flex items-center gap-1 text-[14px] font-medium text-text-3 hover:text-text-1 transition-colors"
          >
            <Home size={18} />
            <span>Home</span>
          </Link>

          <button
            type="button"
            onClick={() => setStep(STEP_ROLE)}
            className="absolute -top-16 left-20 flex items-center gap-1 text-[14px] font-medium text-text-3 bg-transparent border-none cursor-pointer hover:text-text-1 transition-colors"
          >
            <ChevronLeft size={18} /> Back
          </button>

          <HustleLogoText size="35%" color="var(--color-primary-light)" fontSize="36px" />
          <div className="mb-6" />

          <h2 className="font-display text-[22px] font-bold text-text-1 tracking-tight text-center mb-2.5">
            Sign up as {selectedRole === 'client' ? 'a Hustle Creator' : 'a Hustler'}
          </h2>
          <p className="text-[14px] text-text-3 text-center mb-9">
            This is where your journey begins. Let's get you in.
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" value={selectedRole ?? ''} {...register('role')} />

            <div className="mb-5">
              <Input
                label="Enter email"
                type="email"
                placeholder="Enter your email"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <Input
                label="First name"
                type="text"
                placeholder="Enter your first name"
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                label="Last name"
                type="text"
                placeholder="Enter your last name"
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            <div className="mb-5">
              <Input
                label="Phone number"
                type="tel"
                placeholder="+234 800 000 0000"
                error={errors.phone_number?.message}
                {...register('phone_number')}
              />
            </div>

            <div className="mb-5">
              <label className="block text-[13px] font-medium text-text-2 mb-1.5">
                Country of residence
              </label>
              <select
                className={[
                  'w-full h-[46px] px-3.5 text-[14px] text-text-1 bg-white rounded-[10px] outline-none appearance-none cursor-pointer border transition-colors dark:bg-surface',
                  errors.country_id ? 'border-error' : 'border-[#D1D5DB] focus:border-primary-btn',
                ].join(' ')}
                {...register('country_id')}
              >
                <option value="">Select your country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.country_id && (
                <p className="text-[12px] text-error mt-1">{errors.country_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="Re-enter your password"
                error={errors.confirm_password?.message}
                {...register('confirm_password')}
              />
            </div>

            <p className="text-[13px] text-text-3 leading-relaxed mb-8">
              By clicking 'Create my account' you are agreeing to Hustle's{' '}
              <a href="#" className="text-primary font-medium no-underline hover:underline">Terms</a> and{' '}
              <a href="#" className="text-primary font-medium no-underline hover:underline">privacy policy</a>.
            </p>

            <Button
              type="submit"
              variant="solid"
              isPending={isPending}
              className="rounded-full h-[50px] w-full text-[15px] bg-primary-btn"
            >
              {isPending ? '' : 'Create my account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[13px] text-text-3">Or Sign up with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <SocialButton icon="google" label="Google" />
            <SocialButton icon="apple" label="Apple" />
          </div>

          <p className="text-center text-[14px] text-text-3">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-primary font-semibold no-underline hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  )
}

// ── Social button ─────────────────────────────────────────────────────────────
function SocialButton({ icon, label }) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2 h-11 bg-white dark:bg-white/84 border border-border rounded-[10px] text-[13px] font-medium text-primary cursor-pointer hover:bg-bg transition-colors"
    >
      {icon === 'google' && (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )}
      {icon === 'apple' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      )}
      {label}
    </button>
  )
}
