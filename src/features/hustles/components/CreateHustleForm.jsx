import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { RichTextEditor } from '../../../shared/components/RichTextEditor.jsx'
import { useCreateHustle } from '../hustles.hooks.js'
import useHustlesStore from '../hustles.store.js'
import { hustlesService } from '../hustles.service.js'

const schema = z.object({
  title: z.string().min(5, 'Min 5 characters').max(100),
  category_id: z.string().min(1, 'Required'),
  city_id: z.string().min(1, 'Required'),
  location_text: z.string().min(3, 'Required'),
  duration_minutes: z.string().min(1, 'Required').refine((value) => Number(value) > 0, 'Must be positive'),
  budget_amount: z.string().min(1, 'Required').refine((value) => Number(value) > 0, 'Must be positive'),
  required_experience_level: z.enum(['entry', 'mid', 'senior']),
  payment_model: z.enum(['per_service', 'full_amount', 'per_hour']),
  description: z.string().min(20, 'Min 20 characters'),
})

function Lbl({ children }) {
  return <p className="text-[12px] font-semibold text-text-3 mb-1.5">{children}</p>
}

function Err({ msg }) {
  return msg ? <p className="text-[11px] text-red-500 mt-1">{msg}</p> : null
}

function inp(err) {
  return `w-full h-11 px-3.5 text-[13px] font-medium text-text-1 bg-surface rounded-xl border outline-none transition-all placeholder:text-text-4 ${
    err ? 'border-red-400' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/8'
  }`
}

export function CreateHustleForm({ onClose }) {
  const { formDraft, saveDraft, clearDraft } = useHustlesStore()
  const { mutate: createHustle, isPending } = useCreateHustle()

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: hustlesService.getCategories,
    staleTime: Infinity,
  })

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: () => hustlesService.getCities(),
    staleTime: Infinity,
  })

  const categories = categoriesData?.data?.items ?? []
  const cities = citiesData?.data?.items ?? []

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
      city_id: '',
      location_text: '',
      duration_minutes: '',
      budget_amount: '',
      required_experience_level: 'mid',
      payment_model: 'full_amount',
      description: '',
    },
  })

  const selectedExperience = watch('required_experience_level')
  const selectedPaymentModel = watch('payment_model')
  const description = watch('description')

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

  const onSubmit = (data) => {
    const plainDescription = data.description.replace(/<[^>]*>/g, '').trim()

    createHustle(
      {
        category_id: Number(data.category_id),
        title: data.title.trim(),
        description: plainDescription,
        city_id: Number(data.city_id),
        location_text: data.location_text.trim(),
        duration_minutes: Number(data.duration_minutes),
        required_experience_level: data.required_experience_level,
        payment_model: data.payment_model,
        budget_amount: Number(data.budget_amount),
        currency_code: 'NGN',
        status: 'open',
      },
      {
        onSuccess: () => {
          handleClearDraft()
          onClose()
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-5 sm:px-7 pt-5 pb-0">
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
          <Lbl>City</Lbl>
          <select
            className={`${inp(errors.city_id)} cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238A9A91' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center] pr-9`}
            {...register('city_id')}
          >
            <option value="">Select city</option>
            {cities.map((city) => (
              <option key={city.id} value={String(city.id)}>
                {city.name}
              </option>
            ))}
          </select>
          <Err msg={errors.city_id?.message} />
        </div>
        <div>
          <Lbl>Location details</Lbl>
          <input placeholder="Yaba, Lagos" className={inp(errors.location_text)} {...register('location_text')} />
          <Err msg={errors.location_text?.message} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Lbl>Duration in minutes</Lbl>
          <input type="number" min="1" placeholder="180" className={inp(errors.duration_minutes)} {...register('duration_minutes')} />
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
                className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-[12px] font-semibold capitalize ${
                  active ? 'border-primary bg-primary/4 text-primary' : 'border-border bg-surface text-text-3'
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
                className={`flex items-center justify-center h-11 rounded-xl border cursor-pointer text-[12px] font-semibold transition-all ${
                  active ? 'border-primary bg-primary/4 text-primary' : 'border-border bg-surface text-text-3'
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

      <div className="mb-6">
        <Lbl>Description</Lbl>
        <RichTextEditor
          value={description}
          onChange={(value) => setValue('description', value, { shouldValidate: true })}
          placeholder="Describe the hustle you want completed"
        />
        <Err msg={errors.description?.message} />
      </div>

      <div className="sticky bottom-0 bg-surface border-t border-border -mx-5 sm:-mx-7 px-5 sm:px-7 py-4">
        <button
          type="submit"
          disabled={!isValid || isPending}
          className={`w-full h-12 rounded-2xl text-[14px] font-bold transition-all ${
            isValid && !isPending
              ? 'bg-primary hover:bg-primary-sat active:scale-[0.99] text-white cursor-pointer'
              : 'bg-text-4 text-white cursor-not-allowed'
          }`}
        >
          {isPending ? 'Creating hustle...' : 'Create hustle'}
        </button>
      </div>
    </form>
  )
}
