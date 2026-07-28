import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ChevronLeft, HardHat, Home, Wrench } from 'lucide-react'
import { useCountries, useGoogleAuthStart, useSignUp } from '../auth.hooks.js'
import { getDefaultAuthenticatedRoute } from '../authRedirect.js'
import { signUpSchema } from '../auth.schemas.js'
import { getCountryIso2, getCountryIso2FromTimezone, getTimezone } from '../authLocation.js'
import { AuthLayout } from '../components/AuthLayout.jsx'
import { GlassCard } from '../../../shared/components/GlassCard.jsx'
import { Input } from '../../../shared/components/Input.jsx'
import { Button } from '../../../shared/components/Button.jsx'
import { HustleLogoText, HustleLogoWhite } from '../../../shared/components/HustleLogo.jsx'
import useAuthStore from '../auth.store.js'

const STEP_LANDING = 'landing'
const STEP_ROLE = 'role'
const STEP_FORM = 'form'

const COUNTRIES = [
  { id: 1, code: 'NG', name: 'Nigeria' },
  { id: 2, code: 'GH', name: 'Ghana' },
]

const COUNTRY_TIMEZONES = {
  NG: 'Africa/Lagos',
  GH: 'Africa/Accra',
}

// Persisted in-progress signup draft, so a reload resumes where the user left off.
// Cleared once signup completes. Password fields are never stored.
const SIGNUP_DRAFT_KEY = 'hustle_signup_draft'

function loadSignupDraft() {
  try {
    const raw = localStorage.getItem(SIGNUP_DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearSignupDraft() {
  try {
    localStorage.removeItem(SIGNUP_DRAFT_KEY)
  } catch {
    // ignore
  }
}

export default function SignUpPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const savedDraft = useMemo(() => loadSignupDraft(), [])
  // Always begin at the landing step so entering signup (e.g. "Register" from the
  // home page) never jumps mid-flow. Saved field values are still restored below,
  // so a returning user's inputs are preserved as they step forward.
  const [step, setStep] = useState(STEP_LANDING)
  const [selectedRole, setSelectedRole] = useState(savedDraft?.selectedRole ?? null)

  const [isLocating, setIsLocating] = useState(false)

  const { mutate: signUp, isPending } = useSignUp()
  const { data: countriesData } = useCountries()
  const countries = countriesData?.countries?.length ? countriesData.countries : COUNTRIES

  const { mutate: startGoogleAuth, isPending: isGooglePending } = useGoogleAuthStart()
  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: savedDraft?.values ?? undefined,
  })

  // Save the in-progress draft whenever the step, role, or field values change.
  // Passwords are excluded so they never touch localStorage.
  const formValues = watch()
  const { password: _password, confirm_password: _confirmPassword, ...safeValues } = formValues
  const draftSnapshot = JSON.stringify({ step, selectedRole, values: safeValues })

  useEffect(() => {
    try {
      localStorage.setItem(SIGNUP_DRAFT_KEY, draftSnapshot)
    } catch {
      // ignore quota / serialization errors
    }
  }, [draftSnapshot])

  // Auto-detect the user's country from the browser timezone and pre-select it.
  // Runs once the country list is available; never overrides a restored draft or
  // a manual selection (only fills when the field is still empty).
  useEffect(() => {
    if (!countries.length || getValues('country_id')) return

    const iso2 = getCountryIso2FromTimezone(getTimezone())
    if (!iso2) return

    const match = countries.find(
      (country) => String(country.code || country.iso2_code || '').toUpperCase() === iso2
    )
    if (match) setValue('country_id', String(match.id))
  }, [countries, getValues, setValue])

  const onSubmit = (data) => {
    const selectedCountry = countries.find((country) => String(country.id) === String(data.country_id))
    const countryCode = selectedCountry?.code || selectedCountry?.iso2_code || 'NG'

    signUp({
      email: data.email,
      password: data.password,
      account_type: data.role,
      country_id: Number(data.country_id),
      timezone_name: COUNTRY_TIMEZONES[countryCode] || 'Africa/Lagos',
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
    }, {
      onSuccess: () => {
        clearSignupDraft()
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`)
      },
    })
  }

  const handleGoogleSignUp = async () => {
    setIsLocating(true)
    try {
      const timezone_name = getTimezone()
      const country_iso2 = await getCountryIso2()

      startGoogleAuth({
        intent: 'signup',
        account_type: selectedRole || undefined,
        platform: 'web',
        timezone_name,
        ...(country_iso2 && { country_iso2 }),
      })
    } finally {
      setIsLocating(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultAuthenticatedRoute(user?.role)} replace />
  }

  return (
    <AuthLayout variant={step === STEP_FORM ? 'split' : 'centered'} splitImage="/images/signup.png">
      {step === STEP_LANDING && (
        <GlassCard className="relative text-center">
          <Link
            to="/"
            className="absolute left-5 top-5 flex items-center gap-2 text-[13px] font-medium text-white/60 transition-colors hover:text-white"
          >
            <Home size={18} />
          </Link>

          <div className="mx-auto mb-4 flex w-[60%] justify-center">
            <HustleLogoWhite size="30%" radius="0px" className="text-center" />
          </div>

          <h2 className="font-display text-center font-normal leading-snug text-white tracking-tight">
            We're glad to have you on board <br />
          </h2>

          <div className="mt-5 flex flex-col items-center justify-center gap-3">
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

      {step === STEP_ROLE && (
        <GlassCard className="relative">
          <button
            type="button"
            onClick={() => setStep(STEP_LANDING)}
            className="absolute left-6 top-9 flex cursor-pointer items-center gap-1 border-none bg-transparent text-[13px] font-medium text-white/60 transition-colors hover:text-white"
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>

          <div className="flex-1 text-center">
            <HustleLogoWhite size="10%" radius="0px" />
          </div>
          <div className="w-4" />

          <h2 className="my-2 text-center font-display text-[18px] font-bold text-white tracking-tight sm:text-[22px]">
            Join as a Hustler or Hustle Creator
          </h2>
          <p className="mb-7 text-center text-[13px] leading-relaxed text-white/60">
            Start your hustle journey, choose whether you're here to create or offer services
          </p>

          <div className="mb-7 grid grid-cols-2 gap-3">
            {[
              { value: 'artisan', label: 'Hustler', Icon: Wrench },
              { value: 'client', label: 'Hustle Creator', Icon: HardHat },
            ].map((option, index) => {
              const RoleIcon = option.Icon
              const active = selectedRole === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedRole(option.value)}
                  className={[
                    'relative flex w-full cursor-pointer flex-col rounded-xl p-5 text-left transition-all md:w-[65%]',
                    index === 0 ? 'justify-self-end' : 'justify-self-start',
                    active
                      ? 'border-[1.5px] border-secondary bg-secondary/10'
                      : 'border-[1.5px] border-white/[0.12] bg-white/[0.06] hover:bg-white/10',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'mb-3 h-[18px] w-[18px] rounded-full border-2',
                      active ? 'border-secondary bg-secondary' : 'border-white/30 bg-transparent',
                    ].join(' ')}
                  />
                  <RoleIcon size={28} color="rgba(255,255,255,0.75)" strokeWidth={1.5} className="mb-1.5 block" />
                  <div className="text-[13px] font-semibold text-white">{option.label}</div>
                </button>
              )
            })}
          </div>

          <Button
            className="mx-auto sm:w-[65%]"
            variant="primary"
            disabled={!selectedRole}
            onClick={() => selectedRole && setStep(STEP_FORM)}
          >
            Continue
          </Button>

          <p className="mt-5 text-center text-[13px] text-white/50">
            Already have an account?{' '}
            <Link to="/sign-in" className="font-medium text-secondary no-underline hover:underline">
              Sign In
            </Link>
          </p>
        </GlassCard>
      )}

      {step === STEP_FORM && (
        <div className="relative mx-auto w-full max-w-[480px]">
          <Link
            to="/"
            className="absolute -left-1 -top-16 flex items-center gap-1 text-[14px] font-medium text-text-3 transition-colors hover:text-text-1"
          >
            <Home size={18} />
            <span>Home</span>
          </Link>

          <button
            type="button"
            onClick={() => setStep(STEP_ROLE)}
            className="absolute left-20 -top-16 flex cursor-pointer items-center gap-1 border-none bg-transparent text-[14px] font-medium text-text-3 transition-colors hover:text-text-1"
          >
            <ChevronLeft size={18} /> Back
          </button>

          <HustleLogoText size="35%" color="var(--color-primary-light)" fontSize="36px" />
          <div className="mb-6" />

          <h2 className="mb-2.5 text-center font-display text-[22px] font-bold tracking-tight text-text-1">
            Sign up as {selectedRole === 'client' ? 'a Hustle Creator' : 'a Hustler'}
          </h2>
          <p className="mb-9 text-center text-[14px] text-text-3">
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

            <div className="mb-5 grid grid-cols-2 gap-4">
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
              <label className="mb-1.5 block text-[13px] font-medium text-text-2">
                Country of residence
              </label>
              <select
                className={[
                  'h-[46px] w-full cursor-pointer appearance-none rounded-[10px] border bg-white px-3.5 text-[14px] text-text-1 outline-none transition-colors dark:bg-transparent',
                  errors.country_id ? 'border-error' : 'border-[#D1D5DB] focus:border-primary-btn',
                ].join(' ')}
                {...register('country_id')}
              >
                <option value="" className="bg-white text-text-1 dark:bg-surface">Select your country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id} className="bg-white text-text-1 dark:bg-surface">{country.name}</option>
                ))}
              </select>
              {errors.country_id && (
                <p className="mt-1 text-[12px] text-error">{errors.country_id.message}</p>
              )}
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
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

            <p className="mb-8 text-[13px] leading-relaxed text-text-3">
              By clicking 'Create my account' you are agreeing to Hustle's{' '}
              <a href="/terms" className="font-medium text-primary no-underline hover:underline">Terms</a> and{' '}
              <a href="/privacy-policy" className="font-medium text-primary no-underline hover:underline">privacy policy</a>.
            </p>

            <Button
              type="submit"
              variant="solid"
              isPending={isPending}
              className="h-[50px] w-full rounded-full bg-primary-btn text-[15px]"
            >
              {isPending ? '' : 'Create my account'}
            </Button>
          </form>

          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[13px] text-text-3">Or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="ghost"
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGooglePending || isLocating}
            className="mb-8 h-11 w-full"
          >
            <img
              src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png"
              className="h-4.5 w-4.5"
              alt="Google"
            />
            {isLocating || isGooglePending ? 'Starting Google...' : 'Google'}
          </Button>

          <p className="text-center text-[14px] text-text-3">
            Already have an account?{' '}
            <Link to="/sign-in" className="font-semibold text-primary no-underline hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  )
}
