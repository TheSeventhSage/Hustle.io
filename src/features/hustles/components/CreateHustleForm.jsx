import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { RichTextEditor } from '../../../shared/components/RichTextEditor.jsx'
import { DatePickerDropdown, TimePickerDropdown } from '../../../shared/components/DateTimePicker.jsx'
import { Button } from '../../../shared/components/Button.jsx'
import { queryKeys } from '../../../services/query-keys.js'
import { useCreateHustle } from '../hustles.hooks.js'
import useHustlesStore from '../hustles.store.js'
import { hustlesService } from '../hustles.service.js'
import { storage } from '../../../services/storage.js'
import useUIStore from '../../../shared/store/ui.store.js'
import { locationService } from '../../../shared/api/location.service.js'

const schema = z.object({
  title: z.string().min(5, 'Min 5 characters').max(100),
  category_id: z.string().min(1, 'Required'),
  country_id: z.string().min(1, 'Required'),
  city_id: z.string().min(1, 'Required'),
  location_text: z.string().min(3, 'Required'),
  duration_minutes: z.string().min(1, 'Required').refine((value) => Number(value) > 0, 'Must be positive'),
  budget_amount: z.string().min(1, 'Required').refine((value) => Number(value) > 0, 'Must be positive'),
  required_experience_level: z.enum(['entry', 'mid', 'senior']),
  payment_model: z.enum(['per_service', 'full_amount', 'per_hour']),
  description: z.string().min(20, 'Min 20 characters'),
  skills: z.string().optional(), // Comma-separated skills
  // Optional preferred schedule fields
  preferred_date: z.string().optional(),
  preferred_start_time: z.string().optional(),
  preferred_end_time: z.string().optional(),
}).refine(
  (data) => {
    // If any time is provided, both must be provided
    const hasStartTime = data.preferred_start_time && data.preferred_start_time.trim() !== ''
    const hasEndTime = data.preferred_end_time && data.preferred_end_time.trim() !== ''

    if (hasStartTime || hasEndTime) {
      return hasStartTime && hasEndTime
    }
    return true
  },
  {
    message: 'Both start and end time must be provided',
    path: ['preferred_end_time'],
  }
).refine(
  (data) => {
    // If times are provided, end time must be after start time
    if (data.preferred_start_time && data.preferred_end_time) {
      return data.preferred_end_time > data.preferred_start_time
    }
    return true
  },
  {
    message: 'End time must be after start time',
    path: ['preferred_end_time'],
  }
)

function Lbl({ children }) {
  return <p className="text-[12px] font-semibold text-text-3 mb-1.5">{children}</p>
}

function Err({ msg }) {
  return msg ? <p className="text-[11px] text-red-500 mt-1">{msg}</p> : null
}

function inp(err) {
  return `w-full h-11 px-3.5 text-[13px] font-medium text-text-1 bg-surface rounded-xl border outline-none transition-all placeholder:text-text-4 ${err ? 'border-red-400' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/8'
    }`
}

function pickInsuranceRate(rates = [], countryId, categoryId) {
  if (!Array.isArray(rates) || rates.length === 0) return null
  const activeRates = rates.filter(rate => Number(rate?.is_active ?? 1) === 1)
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

export function CreateHustleForm({ onClose }) {
  const { formDraft, saveDraft, clearDraft } = useHustlesStore()
  const { mutate: createHustle, isPending } = useCreateHustle()
  const { toastError } = useUIStore()

  const [selectedImage, setSelectedImage] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [insuranceEnabled, setInsuranceEnabled] = useState(false)

  // Date and time picker states
  const [preferredDateObj, setPreferredDateObj] = useState(null)
  const [preferredStartTimeStr, setPreferredStartTimeStr] = useState('')
  const [preferredEndTimeStr, setPreferredEndTimeStr] = useState('')

  // Dropdown states
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [startTimePickerOpen, setStartTimePickerOpen] = useState(false)
  const [endTimePickerOpen, setEndTimePickerOpen] = useState(false)

  // Refs for dropdown anchors
  const dateButtonRef = useRef(null)
  const startTimeButtonRef = useRef(null)
  const endTimeButtonRef = useRef(null)

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: hustlesService.getCategories,
    staleTime: Infinity,
  })

  const { data: countriesData } = useQuery({
    queryKey: ['countries', { per_page: 100 }],
    queryFn: () => locationService.getCountries({ per_page: 100 }),
    staleTime: Infinity,
  })

  const categories = categoriesData?.data?.items ?? []
  const countries = locationService.unwrapItems(countriesData)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      category_id: '',
      country_id: '',
      city_id: '',
      location_text: '',
      duration_minutes: '',
      budget_amount: '',
      required_experience_level: 'mid',
      payment_model: 'full_amount',
      description: '',
      skills: '',
      preferred_date: '',
      preferred_start_time: '',
      preferred_end_time: '',
    },
  })

  const selectedExperience = watch('required_experience_level')
  const selectedPaymentModel = watch('payment_model')
  const description = watch('description')
  const selectedCountryId = watch('country_id')
  const selectedCategoryId = watch('category_id')
  const budgetAmount = watch('budget_amount')

  const { data: citiesData } = useQuery({
    queryKey: ['cities', { country_id: selectedCountryId, per_page: 100 }],
    queryFn: () => locationService.getCities({ country_id: selectedCountryId, per_page: 100 }),
    enabled: Boolean(selectedCountryId),
    staleTime: Infinity,
  })

  const { data: insuranceRatesData, isLoading: insuranceRatesLoading } = useQuery({
    queryKey: queryKeys.insurance.rates({ country_id: selectedCountryId || undefined, category_id: selectedCategoryId || undefined }),
    queryFn: () => hustlesService.getInsuranceRates({ country_id: selectedCountryId || undefined, category_id: selectedCategoryId || undefined }),
    enabled: insuranceEnabled && Boolean(selectedCountryId || selectedCategoryId),
    staleTime: 5 * 60 * 1000,
  })

  const cities = locationService.unwrapItems(citiesData)
  const insuranceRates = insuranceRatesData?.data?.data?.items ?? insuranceRatesData?.data?.items ?? []
  const selectedInsuranceRate = insuranceEnabled ? pickInsuranceRate(insuranceRates, selectedCountryId, selectedCategoryId) : null
  const insuranceRatePct = selectedInsuranceRate ? Number(selectedInsuranceRate.percentage_rate) || 0 : 0
  const budgetNumber = Number(budgetAmount) || 0
  const insurancePremium = insuranceEnabled && budgetNumber > 0 ? (budgetNumber * insuranceRatePct) / 100 : 0
  const totalWithInsurance = budgetNumber + insurancePremium

  useEffect(() => {
    setValue('city_id', '', { shouldValidate: true })
  }, [selectedCountryId, setValue])

  // Auto-calculate duration from time inputs
  useEffect(() => {
    if (preferredStartTimeStr && preferredEndTimeStr) {
      try {
        const [startHours, startMinutes] = preferredStartTimeStr.split(':').map(Number)
        const [endHours, endMinutes] = preferredEndTimeStr.split(':').map(Number)

        const startTotalMinutes = startHours * 60 + startMinutes
        const endTotalMinutes = endHours * 60 + endMinutes

        let durationMinutes = endTotalMinutes - startTotalMinutes

        // Handle case where end time is next day (e.g., 23:00 to 02:00)
        if (durationMinutes < 0) {
          durationMinutes += 24 * 60
        }

        if (durationMinutes > 0) {
          setValue('duration_minutes', String(durationMinutes), { shouldValidate: true })
        }
      } catch (e) {
        // Invalid time format, ignore
      }
    }
  }, [preferredStartTimeStr, preferredEndTimeStr, setValue])

  useEffect(() => {
    if (!formDraft) return
    Object.entries(formDraft).forEach(([key, value]) => {
      setValue(key, value)
    })
  }, [formDraft, setValue])

  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(watch())
    }, 1200)

    return () => clearTimeout(timer)
  }, [watch, saveDraft])

  const handleClearDraft = () => {
    reset()
    localStorage.removeItem('hustle-draft')
    clearDraft()
  }

  const uploadImage = async () => {
    if (!selectedImage) return null

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('asset_type', 'listing_image')

      // Use fetch directly to avoid Content-Type header issues with FormData
      const token = storage.getToken()
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'

      const response = await fetch(`${baseURL}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do NOT set Content-Type - browser sets it automatically with boundary
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const result = await response.json()
      setUploadingImage(false)

      if (result.data?.asset?.url) {
        return result.data.asset.url
      }

      throw new Error('No URL returned from upload')
    } catch (error) {
      setUploadingImage(false)
      throw error
    }
  }

  const onSubmit = async (data) => {
    const plainDescription = data.description.replace(/<[^>]*>/g, '').trim()

    let imageUrl = null

    // Upload image first if selected
    if (selectedImage) {
      try {
        imageUrl = await uploadImage()
      } catch (error) {
        toastError(error.message || 'Image upload failed. Please try again.')
        return // Stop if image upload fails
      }
    }

    // Get user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos'

    // Build payload
    const payload = {
      category_id: Number(data.category_id),
      title: data.title.trim(),
      description: plainDescription,
      country_id: Number(data.country_id),
      city_id: Number(data.city_id),
      location_text: data.location_text.trim(),
      duration_minutes: Number(data.duration_minutes),
      required_experience_level: data.required_experience_level,
      payment_model: data.payment_model,
      budget_amount: Number(data.budget_amount),
      currency_code: 'NGN',
      status: 'open',
      ...(imageUrl && { image_url: imageUrl }), // Add image URL if available
    }

    // Add skills if provided
    if (data.skills && data.skills.trim() !== '') {
      const skillsArray = data.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)

      if (skillsArray.length > 0) {
        payload.skills = skillsArray
      }
    }

    // Add preferred schedule fields if provided
    if (data.preferred_date && data.preferred_date.trim() !== '') {
      payload.preferred_date = data.preferred_date
      payload.timezone_name = timezone
    }

    if (data.preferred_start_time && data.preferred_start_time.trim() !== '') {
      payload.preferred_start_time = data.preferred_start_time
    }

    if (data.preferred_end_time && data.preferred_end_time.trim() !== '') {
      payload.preferred_end_time = data.preferred_end_time
    }

    // Create hustle with optional schedule
    createHustle(payload, {
      onSuccess: () => {
        handleClearDraft()
        onClose()
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-5 sm:px-7 pt-5 pb-0">
      {/* Image Upload Section */}
      {/* <div className="mb-4">
        <Lbl>Hustle image (optional)</Lbl>
        {!imagePreview ? (
          <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors bg-mist/30">
            <Upload size={32} className="text-text-4 mb-2" />
            <p className="text-[13px] text-text-2 font-semibold mb-1">Click to upload image</p>
            <p className="text-[11px] text-text-4">JPG, PNG, or WebP (max 5MB)</p>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-40 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
            <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg flex items-center gap-1.5">
              <ImageIcon size={12} className="text-white" />
              <span className="text-[11px] text-white font-medium">{selectedImage?.name}</span>
            </div>
          </div>
        )}
      </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Lbl>Job title</Lbl>
          <input placeholder="Weekend apartment cleanup" className={inp(errors.title)} {...register('title')} />
          <Err msg={errors.title?.message} />
        </div>
        <div>
          <Lbl>Category</Lbl>
          <select
            className={`${inp(errors.category_id)} cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238A9A91' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center] pr-9`}
            {...register('category_id')}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
          <Err msg={errors.category_id?.message} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Lbl>Country</Lbl>
          <select
            className={`${inp(errors.country_id)} cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238A9A91' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center] pr-9`}
            {...register('country_id')}
          >
            <option value="">Select country</option>
            {countries.map((country) => (
              <option key={country.id} value={String(country.id)}>
                {country.name}
              </option>
            ))}
          </select>
          <Err msg={errors.country_id?.message} />
        </div>
        <div>
          <Lbl>City</Lbl>
          <select
            className={`${inp(errors.city_id)} cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238A9A91' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center] pr-9`}
            {...register('city_id')}
            disabled={!selectedCountryId}
          >
            <option value="">{selectedCountryId ? 'Select city' : 'Select country first'}</option>
            {cities.map((city) => (
              <option key={city.id} value={String(city.id)}>
                {city.name}
              </option>
            ))}
          </select>
          <Err msg={errors.city_id?.message} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Lbl>Location details</Lbl>
          <input placeholder="Yaba, Lagos" className={inp(errors.location_text)} {...register('location_text')} />
          <Err msg={errors.location_text?.message} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Lbl>Duration in minutes</Lbl>
          <div className="relative">
            <input
              type="number"
              min="1"
              placeholder="Auto-calculated from time window"
              className={`${inp(errors.duration_minutes)} cursor-not-allowed bg-mist/50`}
              {...register('duration_minutes')}
              disabled
              title="This field will be automatically calculated when you select start and end times below"
            />
          </div>
          <p className="text-[11px] text-text-4 mt-1">Select start and end times in the schedule section below</p>
          <Err msg={errors.duration_minutes?.message} />
        </div>
        <div>
          <Lbl>Budget amount</Lbl>
          <div className={`flex items-stretch rounded-xl border overflow-hidden transition-all ${errors.budget_amount ? 'border-red-400' : 'border-border focus-within:border-primary'}`}>
            <span className="flex items-center px-3.5 text-[12px] font-bold text-text-3 bg-mist border-r border-border flex-shrink-0">
              NGN
            </span>
            <input
              type="number"
              min="1"
              placeholder="18000"
              className="flex-1 min-w-0 h-11 px-3.5 text-[13px] font-medium text-text-1 bg-surface outline-none placeholder:text-text-4"
              {...register('budget_amount')}
            />
          </div>
          <Err msg={errors.budget_amount?.message} />
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-border bg-white p-4 dark:bg-surface">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Lbl>Insurance option</Lbl>
            <p className="text-[11px] text-text-4 -mt-1">Choose whether the client should pay for insurance on this hustle.</p>
          </div>
          <button
            type="button"
            onClick={() => setInsuranceEnabled((current) => !current)}
            className={`px-3.5 py-2 rounded-full text-[12px] font-semibold border transition-all ${insuranceEnabled ? 'bg-primary text-white border-primary' : 'bg-surface text-text-3 border-border'}`}
          >
            {insuranceEnabled ? 'Insurance on' : 'Insurance off'}
          </button>
        </div>

        {insuranceEnabled && (
          <div className="mt-4 rounded-xl bg-mist/60 p-3 space-y-2">
            {insuranceRatesLoading ? (
              <p className="text-[12px] text-text-4">Loading insurance rates...</p>
            ) : selectedInsuranceRate ? (
              <>
                <p className="text-[12px] font-semibold text-text-2">
                  {selectedInsuranceRate.name || 'Insurance rate'}: {Number(selectedInsuranceRate.percentage_rate || 0).toFixed(2)}%
                </p>
                <p className="text-[12px] text-text-4">
                  Estimated insurance premium: NGN {insurancePremium.toLocaleString()}
                </p>
                <p className="text-[12px] text-text-4">
                  Estimated total client price: NGN {totalWithInsurance.toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-[12px] text-text-4">Pick a country and category to load insurance rates.</p>
            )}
          </div>
        )}
      </div>

      {/* Preferred Schedule Section */}
      <div className="mb-4 p-4 bg-mist/30 rounded-xl border border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-bold text-text-2">Preferred Schedule (Optional)</p>
          <p className="text-[11px] text-text-4">When do you want this done?</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Date Picker */}
          <div className="relative">
            <Lbl>Preferred date</Lbl>
            <button
              ref={dateButtonRef}
              type="button"
              onClick={() => setDatePickerOpen(!datePickerOpen)}
              className={`${inp(errors.preferred_date)} flex items-center justify-between text-left`}
            >
              <span className={preferredDateObj ? 'text-text-1' : 'text-text-4'}>
                {preferredDateObj ? format(preferredDateObj, 'MMM dd, yyyy') : 'Select date'}
              </span>
              <Calendar size={18} className="text-text-4" />
            </button>
            <DatePickerDropdown
              isOpen={datePickerOpen}
              onClose={() => setDatePickerOpen(false)}
              onSelect={(date) => {
                setPreferredDateObj(date)
                setValue('preferred_date', format(date, 'yyyy-MM-dd'), { shouldValidate: true })
              }}
              selectedDate={preferredDateObj}
              title="Select preferred date"
              anchorRef={dateButtonRef}
              minDate={new Date()}
            />
            {errors.preferred_date && <Err msg={errors.preferred_date?.message} />}
          </div>

          {/* Time Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Lbl>Start time</Lbl>
              <button
                ref={startTimeButtonRef}
                type="button"
                onClick={() => setStartTimePickerOpen(!startTimePickerOpen)}
                className={`${inp(errors.preferred_start_time)} flex items-center justify-between text-left`}
              >
                <span className={preferredStartTimeStr ? 'text-text-1' : 'text-text-4'}>
                  {preferredStartTimeStr ? format(new Date(`2000-01-01T${preferredStartTimeStr}`), 'h:mm a') : 'Start time'}
                </span>
                <Clock size={18} className="text-text-4" />
              </button>
              <TimePickerDropdown
                isOpen={startTimePickerOpen}
                onClose={() => setStartTimePickerOpen(false)}
                onSelect={(time) => {
                  setPreferredStartTimeStr(time)
                  setValue('preferred_start_time', time, { shouldValidate: true })
                }}
                selectedTime={preferredStartTimeStr}
                title="Select start time"
                anchorRef={startTimeButtonRef}
              />
              {errors.preferred_start_time && <Err msg={errors.preferred_start_time?.message} />}
            </div>

            <div className="relative">
              <Lbl>End time</Lbl>
              <button
                ref={endTimeButtonRef}
                type="button"
                onClick={() => setEndTimePickerOpen(!endTimePickerOpen)}
                className={`${inp(errors.preferred_end_time)} flex items-center justify-between text-left`}
              >
                <span className={preferredEndTimeStr ? 'text-text-1' : 'text-text-4'}>
                  {preferredEndTimeStr ? format(new Date(`2000-01-01T${preferredEndTimeStr}`), 'h:mm a') : 'End time'}
                </span>
                <Clock size={18} className="text-text-4" />
              </button>
              <TimePickerDropdown
                isOpen={endTimePickerOpen}
                onClose={() => setEndTimePickerOpen(false)}
                onSelect={(time) => {
                  setPreferredEndTimeStr(time)
                  setValue('preferred_end_time', time, { shouldValidate: true })
                }}
                selectedTime={preferredEndTimeStr}
                title="Select end time"
                anchorRef={endTimeButtonRef}
              />
              {errors.preferred_end_time && <Err msg={errors.preferred_end_time?.message} />}
            </div>
          </div>

          {(preferredDateObj || preferredStartTimeStr || preferredEndTimeStr) && (
            <div className="px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-[11px] text-text-3">
                <span className="font-semibold text-primary">Note:</span> If you set a time window, both start and end times are required.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <Lbl>Experience level</Lbl>
        <div className="flex gap-3">
          {[
            { value: 'entry', label: 'Beginner' },
            { value: 'mid', label: 'Intermediate' },
            { value: 'senior', label: 'Expert' },
          ].map(({ value, label }) => {
            const active = selectedExperience === value
            return (
              <label
                key={value}
                className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-[12px] font-semibold capitalize ${active ? 'border-primary bg-primary/4 text-primary' : 'border-border bg-surface text-text-3'
                  }`}
              >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${active ? 'border-primary' : 'border-text-4'}`}>
                  {active && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <input type="radio" value={value} className="sr-only" {...register('required_experience_level')} />
                {label}
              </label>
            )
          })}
        </div>
        <Err msg={errors.required_experience_level?.message} />
      </div>

      <div className="mb-4">
        <Lbl>Payment model</Lbl>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'per_service', label: 'Per service' },
            { value: 'full_amount', label: 'Full amount' },
            { value: 'per_hour', label: 'Per hour' },
          ].map(({ value, label }) => {
            const active = selectedPaymentModel === value
            return (
              <label
                key={value}
                className={`flex items-center justify-center h-11 rounded-xl border cursor-pointer text-[12px] font-semibold transition-all ${active ? 'border-primary bg-primary/4 text-primary' : 'border-border bg-surface text-text-3'
                  }`}
              >
                <input type="radio" value={value} className="sr-only" {...register('payment_model')} />
                {label}
              </label>
            )
          })}
        </div>
        <Err msg={errors.payment_model?.message} />
      </div>

      <div className="mb-4">
        <Lbl>Skills & expertise (optional)</Lbl>
        <input
          placeholder="e.g., Plumbing, Electrical work, Carpentry"
          className={inp(errors.skills)}
          {...register('skills')}
        />
        <p className="text-[11px] text-text-4 mt-1">Separate multiple skills with commas</p>
        <Err msg={errors.skills?.message} />
      </div>

      <div className="mb-6">

        <RichTextEditor
          value={description}
          onChange={(value) => setValue('description', value, { shouldValidate: true })}
          placeholder="Describe the hustle you want completed"
        />
        <Err msg={errors.description?.message} />
      </div>

      <div className="sticky bottom-0 bg-surface border-t border-border -mx-5 sm:-mx-7 px-5 sm:px-7 py-4">
        <Button
          type="submit"
          disabled={!isValid || isPending || uploadingImage}
          isPending={isPending || uploadingImage}
          variant="primary"
          className="h-12 text-[14px]"
        >
          {uploadingImage ? 'Uploading image...' : isPending ? 'Creating hustle...' : 'Create hustle'}
        </Button>
      </div>
    </form>
  )
}
