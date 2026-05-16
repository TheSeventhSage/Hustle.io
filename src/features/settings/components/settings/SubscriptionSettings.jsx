import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { CreditCard, MapPin, Plus, RefreshCw, XCircle } from 'lucide-react'
import { Button } from '../../../../shared/components/Button.jsx'
import useUIStore from '../../../../shared/store/ui.store.js'
import { locationService } from '../../../../shared/api/location.service.js'
import { unwrapData } from '../../../../shared/lib/api/response.js'
import { PAYMENT_SESSION_TYPES, reconcileStoredPayment, runPaymentFlow } from '../../../../shared/utils/paymentFlow.js'
import { queryKeys } from '../../../../services/query-keys.js'
import {
  useCityAccess,
  useCreateCityAccess,
  useDeactivateCityAccess,
  useInitializeCityAccessPayment,
  useVerifyCityAccessPayment,
} from '../../../city-access/cityAccess.hooks.js'
import { isCityAccessActive, normalizeCityAccessStatus } from '../../../city-access/cityAccess.utils.js'

function unwrapItem(response) {
  const data = unwrapData(response)
  return data?.item ?? data
}

function statusClass(status) {
  switch (status) {
    case 'active':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'expired':
    case 'cancelled':
    case 'inactive':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-mist text-text-3 border-border'
  }
}

function formatMoney(amount, currency = 'NGN') {
  if (amount == null || amount === '') return null
  return `${currency} ${Number(amount).toLocaleString()}`
}

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function normalizeId(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'object') {
    return normalizeId(value.id ?? value.city_id)
  }

  const stringValue = String(value)
  if (stringValue === '[object Object]') return ''

  const numberValue = Number(stringValue)
  return Number.isFinite(numberValue) && numberValue > 0 ? String(numberValue) : ''
}

export function SubscriptionSettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { toastSuccess, toastError, toastInfo } = useUIStore()
  const [countryId, setCountryId] = useState('')
  const [cityId, setCityId] = useState(() => normalizeId(searchParams.get('city_id')))
  const [paymentPrompt, setPaymentPrompt] = useState(null)

  const {
    data: cityAccessRows = [],
    isLoading: cityAccessLoading,
    refetch: refetchCityAccess,
  } = useCityAccess()
  const createCityAccess = useCreateCityAccess()
  const deactivateCityAccess = useDeactivateCityAccess()
  const initializePayment = useInitializeCityAccessPayment()
  const verifyPayment = useVerifyCityAccessPayment()

  const { data: countriesResponse, isLoading: countriesLoading } = useQuery({
    queryKey: queryKeys.countries.list({ per_page: 100 }),
    queryFn: () => locationService.getCountries({ per_page: 100 }),
    staleTime: 10 * 60 * 1000,
  })

  const { data: citiesResponse, isLoading: citiesLoading } = useQuery({
    queryKey: queryKeys.cities.list({ country_id: countryId, per_page: 100 }),
    queryFn: () => locationService.getCities({ country_id: countryId, per_page: 100 }),
    enabled: Boolean(countryId),
    staleTime: 10 * 60 * 1000,
  })

  const countries = useMemo(() => locationService.unwrapItems(countriesResponse), [countriesResponse])
  const cities = useMemo(() => locationService.unwrapItems(citiesResponse), [citiesResponse])

  const selectedCity = useMemo(
    () => cities.find((city) => String(city.id) === String(cityId)),
    [cities, cityId]
  )

  const startCityPayment = async (cityAccessId, fallback = {}) => {
    if (!cityAccessId) return

    try {
      await runPaymentFlow({
        initializePayment: ({ forceNew, callbackUrl }) => initializePayment.mutateAsync({
          id: cityAccessId,
          data: {
            ...(forceNew ? { force_new: true } : {}),
            ...(callbackUrl ? { callback_url: callbackUrl } : {}),
          },
        }),
        verifyPayment: (reference) => verifyPayment.mutateAsync(reference),
        sessionType: PAYMENT_SESSION_TYPES.cityAccess,
        sessionData: ({ paymentData, reference }) => ({
          reference,
          cityAccessId,
          cityId: normalizeId(fallback.cityId ?? cityId),
          paymentId: paymentData?.payment_id ?? paymentData?.id ?? null,
        }),
        returnUrl: `${window.location.origin}/settings?section=my-subscription`,
        onAlreadyPaid: async () => {
          toastSuccess('City access is already active.')
          setPaymentPrompt(null)
          refetchCityAccess()
        },
        onPaymentSuccess: async () => {
          setPaymentPrompt(null)
          refetchCityAccess()
        },
        onPaymentStatusMismatch: async ({ status }) => {
          toastError(`Payment status: ${status}. Please contact support if needed.`)
        },
        onPaymentCancelled: async () => {
          toastError('Payment cancelled.')
        },
        onPaymentError: async (error) => {
          toastError(error?.message ?? 'Payment failed.')
        },
        onVerificationError: async (error) => {
          toastError(error?.message ?? 'Payment verification failed. Please contact support.')
        },
      })
    } catch {
      // Error feedback is handled inside the shared flow callbacks.
    }
  }

  useEffect(() => {
    const section = searchParams.get('section')
    if (section !== 'my-subscription') return

    void reconcileStoredPayment({
      sessionType: PAYMENT_SESSION_TYPES.cityAccess,
      searchParams,
      setSearchParams,
      shouldHandle: () => section === 'my-subscription',
      verifyPayment: (reference) => verifyPayment.mutateAsync(reference),
      onMismatch: async () => {
        toastError('Payment reference mismatch.')
      },
      onExpired: async () => {
        toastError('Payment session expired. Please try again.')
      },
      onSuccess: async () => {
        setPaymentPrompt(null)
        queryClient.invalidateQueries({ queryKey: queryKeys.cityAccess.all() })
      },
      onError: async (error) => {
        toastError(error?.message ?? 'Payment verification failed. Please contact support.')
      },
    })
  }, [queryClient, searchParams, setSearchParams, toastError, verifyPayment])

  const handleCreateCityAccess = () => {
    const normalizedCityId = normalizeId(cityId)

    if (!normalizedCityId) {
      toastError('Select a city to subscribe to.')
      return
    }

    createCityAccess.mutate(
      {
        city_id: Number(normalizedCityId),
        is_default_city: cityAccessRows.length === 0,
      },
      {
        onSuccess(response) {
          const data = unwrapData(response)
          const item = data?.item ?? unwrapItem(response)
          const paymentRequired = Boolean(data?.payment_required)

          if (paymentRequired) {
            setPaymentPrompt({
              cityAccessId: item?.id,
              cityName: selectedCity?.name ?? item?.city_name ?? 'Selected city',
              amount: data?.amount,
              currencyCode: data?.currency_code,
              durationDays: data?.duration_days,
            })
            toastInfo('City access created. Complete payment to activate it.')
            return
          }

          toastSuccess('City access activated.')
          setCityId('')
          refetchCityAccess()
        },
      }
    )
  }

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-[20px] font-semibold text-text-1 mb-2">City access</h3>
        <p className="text-[13px] text-text-3 leading-relaxed">
          Manage the cities where you can receive bookings and apply to posted hustles.
        </p>
      </div>

      <div className="grid gap-5">
        <section className="border border-border rounded-2xl p-5 bg-surface">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-[15px] font-bold text-text-1">Subscribed cities</p>
              <p className="text-[12px] text-text-4 mt-1">Only active cities allow hustle applications.</p>
            </div>
            <button
              type="button"
              onClick={() => refetchCityAccess()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-3 hover:bg-mist"
              aria-label="Refresh city access"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {cityAccessLoading ? (
            <p className="text-[13px] text-text-3">Loading city access...</p>
          ) : cityAccessRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
              <MapPin size={22} className="mx-auto mb-2 text-text-4" />
              <p className="text-[14px] font-bold text-text-1">No subscribed city yet</p>
              <p className="text-[12px] text-text-4 mt-1">Add your first operating city below.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {cityAccessRows.map((row) => {
                const status = normalizeCityAccessStatus(row)
                const active = isCityAccessActive(row)
                const amount = formatMoney(row.subscription_amount, row.currency_code)

                return (
                  <div key={row.id ?? `${row.city_id}-${row.subscription_reference}`} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[14px] font-bold text-text-1">{row.city_name ?? `City #${row.city_id}`}</p>
                          {row.country_name && <span className="text-[12px] text-text-4">{row.country_name}</span>}
                          {row.is_default_city ? (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">Default</span>
                          ) : null}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-text-4">
                          {amount ? <span>{amount}</span> : null}
                          {formatDate(row.starts_at) ? <span>Starts {formatDate(row.starts_at)}</span> : null}
                          {formatDate(row.ends_at) ? <span>Ends {formatDate(row.ends_at)}</span> : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${statusClass(active ? 'active' : status)}`}>
                          {active ? 'active' : status}
                        </span>
                        {active ? (
                          <button
                            type="button"
                            onClick={() => deactivateCityAccess.mutate(row.id)}
                            disabled={deactivateCityAccess.isPending}
                            className="inline-flex h-8 items-center gap-1 rounded-full border border-red-200 px-3 text-[12px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            <XCircle size={13} /> Deactivate
                          </button>
                        ) : status === 'pending' && row.id ? (
                          <button
                            type="button"
                            onClick={() => startCityPayment(row.id, { cityId: normalizeId(row.city_id) })}
                            disabled={initializePayment.isPending || verifyPayment.isPending}
                            className="inline-flex h-8 items-center gap-1 rounded-full border border-primary px-3 text-[12px] font-semibold text-primary hover:bg-primary/5 disabled:opacity-60"
                          >
                            <CreditCard size={13} /> Pay
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="border border-border rounded-2xl p-5 bg-surface">
          <div className="mb-4">
            <p className="text-[15px] font-bold text-text-1">Add city access</p>
            <p className="text-[12px] text-text-4 mt-1">Extra cities may require payment before activation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-text-3 mb-1.5">Country</label>
              <select
                value={countryId}
                onChange={(event) => {
                  setCountryId(event.target.value)
                  setCityId('')
                }}
                className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13px] text-text-1 outline-none focus:border-primary"
              >
                <option value="">{countriesLoading ? 'Loading countries...' : 'Select country'}</option>
                {countries.map((country) => (
                  <option key={country.id} value={String(country.id)}>{country.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-text-3 mb-1.5">City</label>
              <select
                value={cityId}
                onChange={(event) => setCityId(normalizeId(event.target.value))}
                disabled={!countryId || citiesLoading}
                className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13px] text-text-1 outline-none focus:border-primary disabled:opacity-60"
              >
                <option value="">{citiesLoading ? 'Loading cities...' : 'Select city'}</option>
                {cities.map((city) => (
                  <option key={city.id} value={String(city.id)}>{city.name}</option>
                ))}
              </select>
            </div>
          </div>

          {paymentPrompt ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-[14px] font-bold text-amber-900">Payment required for {paymentPrompt.cityName}</p>
              <p className="mt-1 text-[12px] text-amber-700">
                {formatMoney(paymentPrompt.amount, paymentPrompt.currencyCode) ?? 'Payment'} activates this city
                {paymentPrompt.durationDays ? ` for ${paymentPrompt.durationDays} days` : ''}.
              </p>
              <Button
                type="button"
                variant="solid"
                onClick={() => startCityPayment(paymentPrompt.cityAccessId, { cityId: normalizeId(cityId) })}
                isPending={initializePayment.isPending || verifyPayment.isPending}
                className="mt-3 w-fit h-10 px-5 rounded-full text-[13px]"
              >
                <CreditCard size={15} className="mr-2" /> Pay for city access
              </Button>
            </div>
          ) : null}

          <Button
            type="button"
            variant="solid"
            onClick={handleCreateCityAccess}
            isPending={createCityAccess.isPending}
            disabled={!normalizeId(cityId) || createCityAccess.isPending}
            className="mt-5 w-fit min-w-[180px] h-11 rounded-full text-[13px]"
          >
            <Plus size={15} className="mr-2" /> Add city
          </Button>
        </section>
      </div>
    </div>
  )
}
