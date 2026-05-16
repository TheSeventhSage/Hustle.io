import { useEffect, useMemo, useState } from 'react'
import { X, ArrowLeft, Info, CheckCircle, Clock, ShieldCheck, MapPin, Star, UserCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../../shared/components/Button.jsx'
import { AvailabilitySlotsPicker } from '../../../shared/components/AvailabilitySlotsPicker.jsx'
import { TimePickerDropdown } from '../../../shared/components/DateTimePicker.jsx'
import useUIStore from '../../../shared/store/ui.store.js'
import { storage } from '../../../services/storage.js'
import { queryKeys } from '../../../services/query-keys.js'
import { hustlesService } from '../hustles.service.js'
import { unwrapItems } from '../../../shared/lib/api/response.js'
import { calculateSelectedSlotDurationMinutes } from '../../../shared/utils/availabilitySlots.js'

function pad(value) {
  return String(value).padStart(2, '0')
}

function getLocalDateString(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function getLocalTimeString(date = new Date()) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDateTime(date, time) {
  if (!date) return null
  const resolvedTime = time || '09:00'
  const [hours, minutes] = resolvedTime.split(':')
  return `${date} ${pad(hours)}:${pad(minutes)}:00`
}

function pickInsuranceRate(rates = [], service = {}) {
  if (!Array.isArray(rates) || rates.length === 0) return null
  const activeRates = rates.filter(rate => Number(rate?.is_active ?? 1) === 1)
  const countryId = service?.country_id ?? service?.country?.id ?? null
  const categoryId = service?.category_id ?? service?.category?.id ?? null
  const exact = activeRates.find(rate =>
    (rate?.country_id == null || String(rate.country_id) === String(countryId)) &&
    (rate?.category_id == null || String(rate.category_id) === String(categoryId))
  )
  const countryMatch = activeRates.find(rate =>
    rate?.country_id != null && String(rate.country_id) === String(countryId) && rate?.category_id == null
  )
  const categoryMatch = activeRates.find(rate =>
    rate?.category_id != null && String(rate.category_id) === String(categoryId) && rate?.country_id == null
  )
  return exact || countryMatch || categoryMatch || activeRates[0] || rates[0] || null
}

const INITIAL_FORM = {
  booking_mode: 'scheduled',
  selectedSlots: [],
  city_id: '',
  service_location_text: '',
  special_instructions: '',
  start_time: '',
  insurance_enabled: false,
}

export function BookHustlerPanel({ isOpen, onClose, onBack, hustler, hustlerProfile }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [startTimePickerOpen, setStartTimePickerOpen] = useState(false)
  const { toastError } = useUIStore()
  const queryClient = useQueryClient()

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: () => hustlesService.getCities(),
    staleTime: Infinity,
  })

  const cities = unwrapItems(citiesData)
  const rawService = hustler?._raw ?? {}

  const serviceId = hustler?.id ?? rawService?.id
  const serviceCityId = rawService?.city_id ?? rawService?.default_city_id ?? ''
  const serviceLocationText = rawService?.location_text ?? rawService?.city_name ?? ''
  const serviceBaseAmount = Number(rawService?.default_rate_amount ?? rawService?.budget_amount ?? 0) || 0
  const serviceCurrency = rawService?.currency_code ?? 'NGN'
  const insuranceParams = {
    country_id: rawService?.country_id ?? hustlerProfile?.country?.id ?? undefined,
    category_id: rawService?.category_id ?? rawService?.category?.id ?? undefined,
  }

  const { data: insuranceRatesData, isLoading: insuranceRatesLoading } = useQuery({
    queryKey: queryKeys.insurance.rates(insuranceParams),
    queryFn: () => hustlesService.getInsuranceRates(insuranceParams),
    enabled: isOpen && formData.insurance_enabled,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (!isOpen) return
    setFormData((current) => ({
      ...current,
      city_id: current.city_id || (serviceCityId ? String(serviceCityId) : ''),
      service_location_text: current.service_location_text || serviceLocationText,
    }))
  }, [isOpen, serviceCityId, serviceLocationText])

  useEffect(() => {
    if (!isOpen) return
    if (formData.booking_mode === 'come_now' && !formData.start_time) {
      setFormData((current) => ({
        ...current,
        start_time: getLocalTimeString(),
      }))
    }
  }, [isOpen, formData.booking_mode, formData.start_time])

  const insuranceRates = insuranceRatesData?.data?.data?.items ?? insuranceRatesData?.data?.items ?? []
  const selectedInsuranceRate = formData.insurance_enabled ? pickInsuranceRate(insuranceRates, rawService) : null
  const insuranceRatePct = selectedInsuranceRate ? Number(selectedInsuranceRate.percentage_rate) || 0 : 0
  const insurancePremium = formData.insurance_enabled && serviceBaseAmount > 0
    ? (serviceBaseAmount * insuranceRatePct) / 100
    : 0
  const totalEstimate = serviceBaseAmount + insurancePremium

  const handleSlotSelect = (slots) => {
    setFormData((current) => ({
      ...current,
      selectedSlots: slots,
    }))
  }

  const calculatedDuration = useMemo(() => {
    return calculateSelectedSlotDurationMinutes(formData.selectedSlots)
  }, [formData.selectedSlots])

  const { mutate: createBooking, isPending } = useMutation({
    mutationFn: async (payload) => {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
      const token = storage.getToken()
      const response = await fetch(`${baseURL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`)
        error.status = response.status
        error.statusCode = response.status
        throw error
      }

      return response.json()
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'mine'] })
      setStep(3)
    },
    onError(err) {
      setStep(1)
      const status = err?.status ?? err?.statusCode
      if (status === 403) {
        toastError('Only clients can create bookings. Company accounts cannot book hustlers directly.')
      } else if (status === 422) {
        toastError(err?.message ?? 'Invalid booking payload. Check the required booking fields.')
      } else {
        toastError(err?.message ?? 'Failed to create booking. Please try again.')
      }
    },
  })

  const handleSubmit = (event) => {
    event.preventDefault()

    const now = new Date()
    const today = getLocalDateString(now)
    const expectedDurationMinutes = formData.booking_mode === 'come_now' ? 60 : (calculatedDuration || 60)
    const payload = {
      provider_service_id: serviceId,
      booking_mode: formData.booking_mode,
      expected_duration_minutes: expectedDurationMinutes,
      timezone_name: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos',
      city_id: Number(formData.city_id),
      service_location_text: formData.service_location_text.trim(),
      special_instructions: formData.special_instructions.trim() || undefined,
      insurance_rate_pct: formData.insurance_enabled ? insuranceRatePct || undefined : undefined,
    }

    if (formData.booking_mode === 'come_now') {
      payload.scheduled_start_at = formatDateTime(today, formData.start_time || getLocalTimeString(now))
    } else if (formData.booking_mode === 'scheduled' && formData.selectedSlots.length > 0) {
      // Use the first slot's start time as the scheduled start
      const firstSlot = formData.selectedSlots[0]
      const slotStart = firstSlot.display_start || firstSlot.start
      const dateTime = new Date(slotStart)
      const formattedDateTime = dateTime.toISOString().slice(0, 19).replace('T', ' ')
      payload.scheduled_start_at = formattedDateTime
    }

    createBooking(payload)
  }

  const handleClose = () => {
    setStep(1)
    setFormData(INITIAL_FORM)
    setStartTimePickerOpen(false)
    onClose()
  }

  const set = (key) => (event) => {
    setFormData((current) => ({
      ...current,
      [key]: event.target?.value ?? event,
    }))
  }

  const requiresSchedule = formData.booking_mode === 'scheduled'
  const isFormValid = Boolean(
    serviceId &&
    formData.city_id &&
    formData.service_location_text.trim() &&
    (formData.booking_mode === 'come_now' || calculatedDuration > 0) &&
    (formData.booking_mode === 'come_now' ? Boolean(formData.start_time) : (!requiresSchedule || formData.selectedSlots.length > 0))
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
          />

          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-surface shadow-2xl w-full sm:w-[580px] lg:w-[720px]"
          >
            <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-border bg-surface">
              <div className="flex items-center gap-3">
                {step === 3 && (
                  <button
                    onClick={onBack}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4 hover:bg-mist hover:text-text-1 transition-all"
                    aria-label="Back"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <h2 className="text-[17px] font-bold text-text-1">
                  {step === 3 ? 'Booking confirmed' : 'Book hustler'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4 hover:bg-mist hover:text-text-1 transition-all"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain relative">
              {(step === 1 || isPending) && step !== 3 && (
                <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
                  <div className="bg-primary-sat/10 border border-primary-sat/30 rounded-xl p-4 flex gap-3">
                    <Info size={18} className="text-primary-sat flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-bold text-primary-sat mb-1">Booking payload follows the live API contract</p>
                      <p className="text-[12px] text-primary-sat/80">
                        City, location text, duration, and scheduled time are sent exactly on create.
                      </p>
                    </div>
                  </div>

                  {hustlerProfile && (
                    <div className="rounded-xl border border-border bg-white p-4 dark:bg-surface">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-mist">
                          {hustlerProfile.avatar_url ? (
                            <img
                              src={hustlerProfile.avatar_url}
                              alt={hustlerProfile.name || 'Hustler'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-[11px] font-black text-primary">HU</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-bold text-text-1 truncate">{hustlerProfile.name || 'Hustler profile'}</p>
                          <p className="text-[12px] text-text-3 truncate">{hustlerProfile.role || 'Service provider'}</p>
                          <p className="mt-1 text-[12px] text-text-4">
                            {[hustlerProfile?.city?.name, hustlerProfile?.country?.name].filter(Boolean).join(', ') || 'Location not available'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-mist/60 px-3 py-2">
                          <p className="text-[11px] text-text-4">Ratings</p>
                          <p className="mt-1 text-[13px] font-bold text-text-1">
                            {hustlerProfile?.stats?.rating != null ? Number(hustlerProfile.stats.rating).toFixed(1) : 'N/A'}
                          </p>
                        </div>
                        <div className="rounded-xl bg-mist/60 px-3 py-2">
                          <p className="text-[11px] text-text-4">Certs</p>
                          <p className="mt-1 text-[13px] font-bold text-text-1">
                            {Array.isArray(hustlerProfile.certifications) ? hustlerProfile.certifications.length : 0}
                          </p>
                        </div>
                        <div className="rounded-xl bg-mist/60 px-3 py-2">
                          <p className="text-[11px] text-text-4">Services</p>
                          <p className="mt-1 text-[13px] font-bold text-text-1">
                            {Array.isArray(hustlerProfile.services) ? hustlerProfile.services.length : 0}
                          </p>
                        </div>
                      </div>

                      {hustlerProfile.bio && (
                        <p className="mt-4 text-[12px] leading-relaxed text-text-3 line-clamp-3">
                          {hustlerProfile.bio}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-[12px] font-medium text-text-3 mb-2">Booking mode</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'come_now', label: 'Come now' },
                        { value: 'scheduled', label: 'Scheduled' },
                      ].map((option) => {
                        const active = formData.booking_mode === option.value
                        return (
                          <label
                            key={option.value}
                            className={`flex items-center justify-center h-11 rounded-xl border cursor-pointer text-[13px] font-semibold transition-all ${active ? 'border-primary bg-primary/4 text-primary' : 'border-border bg-surface text-text-3'
                              }`}
                          >
                            <input
                              type="radio"
                              name="booking_mode"
                              value={option.value}
                              checked={active}
                              onChange={set('booking_mode')}
                              className="sr-only"
                            />
                            {option.label}
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {formData.booking_mode === 'come_now' && (
                    <div className="relative rounded-xl border border-border bg-mist/40 p-4">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div>
                          <p className="text-[13px] font-bold text-text-1">Come now time</p>
                          <p className="text-[11px] text-text-4">Prefilled with your current local time and still editable.</p>
                        </div>
                        <Clock size={16} className="text-primary-sat" />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData((current) => ({
                            ...current,
                            start_time: current.start_time || getLocalTimeString(),
                          }))
                          setStartTimePickerOpen((current) => !current)
                        }}
                        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left"
                      >
                        <span className={formData.start_time ? 'text-text-1' : 'text-text-4'}>
                          {formData.start_time ? formData.start_time : 'Select time'}
                        </span>
                        <Clock size={18} className="text-text-4" />
                      </button>

                      <TimePickerDropdown
                        isOpen={startTimePickerOpen}
                        onClose={() => setStartTimePickerOpen(false)}
                        onSelect={(time) => {
                          setFormData((current) => ({ ...current, start_time: time }))
                        }}
                        selectedTime={formData.start_time || getLocalTimeString()}
                        title="Select come now time"
                        anchorRef={null}
                      />
                    </div>
                  )}

                  {requiresSchedule && (
                    <AvailabilitySlotsPicker
                      serviceId={serviceId}
                      selectedSlots={formData.selectedSlots}
                      onSelectSlots={handleSlotSelect}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-text-3 mb-2">City</label>
                      <select
                        value={formData.city_id}
                        onChange={set('city_id')}
                        className="w-full px-4 py-3 border border-border rounded-xl text-[14px] text-text-1 bg-surface focus:outline-none focus:border-primary-sat"
                        required
                        disabled={Boolean(serviceCityId)}
                      >
                        <option value="">Select city</option>
                        {cities.map((city) => (
                          <option key={city.id} value={String(city.id)}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                      {serviceCityId && (
                        <p className="mt-1 text-[11px] text-text-4">
                          This booking uses the provider's active service city.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-text-3 mb-2">
                        Expected duration (minutes)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={calculatedDuration || '—'}
                          readOnly
                          className="w-full px-4 py-3 border border-border rounded-xl text-[14px] text-text-1 bg-mist cursor-not-allowed"
                          title="Duration is calculated from selected time slots"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-text-4 font-medium">
                          Auto-calculated
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-text-3 mb-2">Service location details</label>
                    <input
                      type="text"
                      value={formData.service_location_text}
                      onChange={set('service_location_text')}
                      placeholder="Yaba, Lagos"
                      className="w-full px-4 py-3 border border-border rounded-xl text-[14px] text-text-1 placeholder:text-text-4 focus:outline-none focus:border-primary-sat"
                      required
                    />
                  </div>

                  <div className="rounded-xl border border-border bg-white p-4 dark:bg-surface">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-bold text-text-1">Insurance</p>
                        <p className="text-[11px] text-text-4">Add insurance coverage to this booking.</p>
                      </div>
                      <ShieldCheck size={16} className="text-primary-sat" />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {[
                        { value: false, label: 'No' },
                        { value: true, label: 'Yes' },
                      ].map((option) => {
                        const active = formData.insurance_enabled === option.value
                        return (
                          <label
                            key={String(option.value)}
                            className={`flex items-center justify-center h-11 rounded-xl border cursor-pointer text-[13px] font-semibold transition-all ${active ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface text-text-3'
                              }`}
                          >
                            <input
                              type="radio"
                              name="insurance_enabled"
                              checked={active}
                              onChange={() => setFormData((current) => ({ ...current, insurance_enabled: option.value }))}
                              className="sr-only"
                            />
                            {option.label}
                          </label>
                        )
                      })}
                    </div>

                    {formData.insurance_enabled && (
                      <div className="mt-3 rounded-xl bg-mist/60 p-3">
                        {insuranceRatesLoading ? (
                          <p className="text-[12px] text-text-4">Loading insurance rates...</p>
                        ) : selectedInsuranceRate ? (
                          <div className="space-y-1 text-[12px]">
                            <p className="font-semibold text-text-2">
                              {selectedInsuranceRate.name || 'Insurance rate'}: {Number(selectedInsuranceRate.percentage_rate || 0).toFixed(2)}%
                            </p>
                            <p className="text-text-4">
                              Premium estimate: {serviceCurrency} {insurancePremium.toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[12px] text-text-4">No matching insurance rate was found. The booking will proceed without an add-on.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-border bg-white p-4 dark:bg-surface">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-bold text-text-1">Price estimate</p>
                      <p className="text-[13px] font-semibold text-text-1">
                        {serviceCurrency} {serviceBaseAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[12px] text-text-4">
                      <span>Insurance</span>
                      <span>{formData.insurance_enabled ? `${serviceCurrency} ${insurancePremium.toLocaleString()}` : '—'}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-[13px] font-bold text-text-1">Total estimate</span>
                      <span className="text-[14px] font-extrabold text-primary">
                        {serviceCurrency} {totalEstimate.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-text-3 mb-2">Special instructions</label>
                    <textarea
                      value={formData.special_instructions}
                      onChange={set('special_instructions')}
                      placeholder="Call on arrival"
                      className="w-full min-h-[140px] px-4 py-3 border border-border rounded-xl text-[14px] text-text-1 placeholder:text-text-4 focus:outline-none focus:border-primary-sat resize-none"
                    />
                  </div>

                  <Button type="submit" variant="solid" className="w-full" isPending={isPending} disabled={!isFormValid}>
                    Book Hustler
                  </Button>
                </form>
              )}

              {isPending && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-surface">
                  <div className="w-16 h-16 border-4 border-border border-t-primary-btn rounded-full animate-spin mb-6" />
                  <h3 className="text-[24px] font-bold text-text-1 mb-2">Sending request...</h3>
                  <p className="text-text-3 text-[15px]">Submitting the booking payload now.</p>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 mt-32">
                  <div className="w-24 h-24 bg-[#ECFDF3] rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12 text-primary-light" />
                  </div>
                  <h3 className="text-[24px] font-bold text-text-1 mb-3">Request sent successfully</h3>
                  <p className="text-text-3 text-[15px] mb-8 max-w-[280px]">
                    The booking was created with the documented booking fields.
                  </p>
                  <Button variant="solid" onClick={handleClose} className="w-full">
                    Done
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
