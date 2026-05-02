import { useEffect, useMemo, useState } from 'react'
import { X, ArrowLeft, Info, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../../shared/components/Button.jsx'
import useUIStore from '../../../shared/store/ui.store.js'
import { storage } from '../../../services/storage.js'
import { hustlesService } from '../hustles.service.js'

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDateTime(date, time) {
  if (!date) return null
  const resolvedTime = time || '09:00'
  const [hours, minutes] = resolvedTime.split(':')
  return `${date} ${pad(hours)}:${pad(minutes)}:00`
}

const INITIAL_FORM = {
  booking_mode: 'scheduled',
  scheduled_date: '',
  scheduled_time: '',
  expected_duration_minutes: '60',
  city_id: '',
  service_location_text: '',
  special_instructions: '',
  insurance_rate_pct: '5',
}

export function BookHustlerPanel({ isOpen, onClose, onBack, hustler }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const { toastError } = useUIStore()
  const queryClient = useQueryClient()

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: () => hustlesService.getCities(),
    staleTime: Infinity,
  })

  const cities = citiesData?.data?.items ?? []
  const rawService = hustler?._raw ?? {}

  const serviceId = hustler?.id ?? rawService?.id
  const serviceCityId = rawService?.city_id ?? rawService?.default_city_id ?? ''
  const serviceLocationText = rawService?.location_text ?? rawService?.city_name ?? ''

  useEffect(() => {
    if (!isOpen) return
    setFormData((current) => ({
      ...current,
      city_id: current.city_id || (serviceCityId ? String(serviceCityId) : ''),
      service_location_text: current.service_location_text || serviceLocationText,
    }))
  }, [isOpen, serviceCityId, serviceLocationText])

  const scheduledStart = useMemo(
    () => formatDateTime(formData.scheduled_date, formData.scheduled_time),
    [formData.scheduled_date, formData.scheduled_time]
  )

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

    const payload = {
      provider_service_id: serviceId,
      booking_mode: formData.booking_mode,
      expected_duration_minutes: Number(formData.expected_duration_minutes) || 60,
      timezone_name: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos',
      city_id: Number(formData.city_id),
      service_location_text: formData.service_location_text.trim(),
      special_instructions: formData.special_instructions.trim() || undefined,
      insurance_rate_pct: Number(formData.insurance_rate_pct) || undefined,
    }

    if (formData.booking_mode === 'scheduled') {
      payload.scheduled_start_at = scheduledStart
    }

    createBooking(payload)
  }

  const handleClose = () => {
    setStep(1)
    setFormData(INITIAL_FORM)
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
      Number(formData.expected_duration_minutes) > 0 &&
      (!requiresSchedule || (formData.scheduled_date && scheduledStart))
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
                            className={`flex items-center justify-center h-11 rounded-xl border cursor-pointer text-[13px] font-semibold transition-all ${
                              active ? 'border-primary bg-primary/4 text-primary' : 'border-border bg-surface text-text-3'
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

                  {requiresSchedule && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-medium text-text-3 mb-2">Scheduled date</label>
                        <input
                          type="date"
                          value={formData.scheduled_date}
                          onChange={set('scheduled_date')}
                          className="w-full px-4 py-3 border border-border rounded-xl text-[14px] text-text-1 focus:outline-none focus:border-primary-sat"
                          required={requiresSchedule}
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-text-3 mb-2">Scheduled time</label>
                        <input
                          type="time"
                          value={formData.scheduled_time}
                          onChange={set('scheduled_time')}
                          className="w-full px-4 py-3 border border-border rounded-xl text-[14px] text-text-1 focus:outline-none focus:border-primary-sat"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-text-3 mb-2">City</label>
                      <select
                        value={formData.city_id}
                        onChange={set('city_id')}
                        className="w-full px-4 py-3 border border-border rounded-xl text-[14px] text-text-1 bg-surface focus:outline-none focus:border-primary-sat"
                        required
                      >
                        <option value="">Select city</option>
                        {cities.map((city) => (
                          <option key={city.id} value={String(city.id)}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-text-3 mb-2">Expected duration in minutes</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.expected_duration_minutes}
                        onChange={set('expected_duration_minutes')}
                        className="w-full px-4 py-3 border border-border rounded-xl text-[14px] text-text-1 focus:outline-none focus:border-primary-sat"
                        required
                      />
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-text-3 mb-2">Insurance rate %</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.insurance_rate_pct}
                        onChange={set('insurance_rate_pct')}
                        className="w-full px-4 py-3 border border-border rounded-xl text-[14px] text-text-1 focus:outline-none focus:border-primary-sat"
                      />
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
