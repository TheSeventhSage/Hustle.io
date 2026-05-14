import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Filter, MapPin, Moon, Search, Sun, Star, X } from 'lucide-react'
import { Button } from '../../shared/components/Button.jsx'
import { hustlesService } from '../../features/hustles/hustles.service.js'
import { locationService } from '../../shared/api/location.service.js'
import useAuthStore from '../../features/auth/auth.store.js'

const PAGE_SIZE = 12

const DEFAULT_FILTERS = {
  q: '',
  category_id: '',
  city_id: '',
}

function money(value, currency = 'NGN') {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  if (Number.isNaN(num)) return null
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

function normalizeService(item) {
  const title = item?.title || item?.name || item?.service_name || 'Untitled service'
  return {
    id: item?.id,
    title,
    description: item?.short_description || item?.description || item?.summary || '',
    category: item?.category_name || item?.category?.name || '',
    city: item?.city_name || item?.city?.name || item?.location_text || '',
    rating: Number(item?.average_rating || item?.rating || 0),
    reviews: Number(item?.review_count || item?.reviews_count || 0),
    price: item?.price_amount ?? item?.base_amount ?? item?.default_rate_amount ?? item?.amount ?? null,
    currency_code: item?.currency_code || 'NGN',
    image: item?.image_url || item?.cover_image_url || item?.avatar_url || null,
    is_verified: Boolean(item?.is_verified || item?.verified),
    _raw: item,
  }
}

function normalizeHustle(item) {
  return {
    id: item?.id,
    title: item?.title || 'Untitled hustle',
    description: item?.description || item?.short_description || '',
    category: item?.category_name || item?.category?.name || '',
    city: item?.city_name || item?.city?.name || item?.location_text || '',
    rating: 0,
    reviews: 0,
    price: item?.budget_amount ?? null,
    currency_code: item?.currency_code || 'NGN',
    image: item?.image_url || null,
    is_verified: false,
    resultType: 'hustle',
    _raw: item,
  }
}

function normalizeSearchResult(item) {
  if (!item) return null
  if (item.result_type === 'hustle' || Object.prototype.hasOwnProperty.call(item, 'budget_amount')) {
    return normalizeHustle(item)
  }
  return normalizeService(item)
}

function BookingPromptModal({ service, onClose }) {
  if (!service) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-[var(--color-text-1)] shadow-[0_30px_80px_rgba(0,0,0,0.16)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-3)] transition-colors hover:bg-[var(--color-mist)] hover:text-[var(--color-text-1)]"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-4)]">Book service</p>
        <h3 className="mt-3 text-2xl font-bold text-[var(--color-text-1)]">{service.title}</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--color-text-3)]">
          To book this service, sign in or create an account. The booking flow continues after authentication.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/sign-in" className="flex-1">
            <Button variant="solid" className="h-12 w-full rounded-full bg-[var(--color-secondary-200)] text-[var(--color-primary-500)] font-semibold hover:bg-[var(--color-secondary-100)]">
              Sign in
            </Button>
          </Link>
          <Link to="/sign-up" className="flex-1">
            <Button variant="outline" className="h-12 w-full rounded-full border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-1)] font-semibold hover:bg-[var(--color-mist)]">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return null
  const date = new Date(`2000-01-01T${value}`)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDetailValue(value) {
  if (value === null || value === undefined || value === '') return null
  if (Array.isArray(value)) {
    const parts = value
      .map((entry) => formatDetailValue(entry))
      .filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }

  if (typeof value === 'object') {
    if ('name' in value && value.name) return value.name
    if ('title' in value && value.title) return value.title
    if ('label' in value && value.label) return value.label
    if ('value' in value && value.value) return String(value.value)

    const compact = Object.entries(value)
      .map(([key, entry]) => `${key}: ${formatDetailValue(entry)}`)
      .filter((entry) => !entry.endsWith(': null'))

    return compact.length > 0 ? compact.join(' | ') : JSON.stringify(value)
  }

  return String(value)
}

function buildDetailGroups(item) {
  const raw = item?._raw || {}
  const isHustle = item?.resultType === 'hustle'

  const summary = [
    { label: 'Category', value: item?.category || raw.category_name || raw.category?.name },
    { label: 'City', value: item?.city || raw.city_name || raw.city?.name },
    { label: 'Location', value: raw.location_text || raw.service_location_text || raw.address },
    { label: 'Status', value: raw.status || raw.result_type || item?.resultType },
    { label: 'Currency', value: raw.currency_code || item?.currency_code },
    {
      label: isHustle ? 'Budget' : 'Starting from',
      value: item?.price ? money(item.price, item.currency_code) : raw.budget_amount ? money(raw.budget_amount, raw.currency_code || item?.currency_code) : raw.default_rate_amount ? money(raw.default_rate_amount, raw.currency_code || item?.currency_code) : null,
    },
    {
      label: isHustle ? 'Preferred date' : 'Rating',
      value: isHustle ? formatDate(raw.preferred_date) : item?.rating ? item.rating.toFixed(1) : null,
    },
    {
      label: isHustle ? 'Preferred time' : 'Reviews',
      value: isHustle
        ? [formatTime(raw.preferred_start_time), formatTime(raw.preferred_end_time)].filter(Boolean).join(' - ')
        : item?.reviews ? `${item.reviews} reviews` : null,
    },
    { label: 'Posted by', value: raw.posted_by_name || raw.company_name || `${raw.poster_first_name || ''} ${raw.poster_last_name || ''}`.trim() },
    { label: 'Experience', value: raw.required_experience_level },
    { label: 'Duration', value: raw.duration_minutes ? `${raw.duration_minutes} min` : null },
    { label: 'Payment model', value: raw.payment_model },
    { label: 'Job title', value: raw.title },
  ].filter((entry) => entry.value)

  const extraEntries = Object.entries(raw)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .filter(([key]) => ![
      'id',
      'title',
      'description',
      'short_description',
      'category_name',
      'city_name',
      'location_text',
      'service_location_text',
      'status',
      'result_type',
      'currency_code',
      'budget_amount',
      'default_rate_amount',
      'preferred_date',
      'preferred_start_time',
      'preferred_end_time',
      'posted_by_name',
      'company_name',
      'poster_first_name',
      'poster_last_name',
      'required_experience_level',
      'duration_minutes',
      'payment_model',
    ].includes(key))
    .map(([key, value]) => ({ label: key.replace(/_/g, ' '), value: formatDetailValue(value) }))
    .filter((entry) => entry.value)

  return { summary, extraEntries }
}

function ResultDetailsModal({ item, onClose }) {
  if (!item) return null

  const isHustle = item.resultType === 'hustle'
  const raw = item._raw || {}
  const { summary, extraEntries } = buildDetailGroups(item)

  return (
    <div className="fixed inset-0 z-[82] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-[var(--color-text-1)] shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-3)] transition-colors hover:bg-[var(--color-mist)] hover:text-[var(--color-text-1)]"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-4)]">
          {isHustle ? 'Hustle details' : 'Service details'}
        </p>
        <h3 className="mt-3 text-2xl font-bold text-[var(--color-text-1)]">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--color-text-3)]">
          {item.description || 'No description provided.'}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {summary.map((detail) => (
            <div key={detail.label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-4)]">{detail.label}</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text-1)]">{detail.value}</p>
            </div>
          ))}
        </div>

        {extraEntries.length > 0 && (
          <div className="mt-6 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-4)]">Additional data</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {extraEntries.map((entry) => (
                <div key={entry.label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-text-4)]">{entry.label}</p>
                  <p className="mt-1.5 text-sm font-medium text-[var(--color-text-1)] break-words">
                    {entry.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="text-xs text-[var(--color-text-4)]">
            {isHustle ? 'Client posting preview' : 'Provider listing preview'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-secondary-200)] px-5 text-sm font-semibold text-[var(--color-primary-500)] transition-colors hover:bg-[var(--color-secondary-100)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function SearchResultCard({ service, onBook, onDetails }) {
  const isHustle = service?.resultType === 'hustle'
  const ctaLabel = isHustle ? 'View' : 'Book'
  const typeLabel = isHustle ? 'Hustle' : 'Service'

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-1)] shadow-[0_18px_45px_-25px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-secondary-200)]/70">
      {service.image ? (
        <div className="relative h-52 overflow-hidden bg-[var(--color-mist)]">
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[var(--color-secondary-200)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary-500)] shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
              {typeLabel}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              {service.category || 'General'}
            </span>
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-md">
            <Star size={13} className="fill-[var(--color-secondary-200)] text-[var(--color-secondary-200)]" />
            {isHustle ? 'Hustle' : service.rating ? service.rating.toFixed(1) : 'New'}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[var(--color-secondary-200)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary-500)] shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
              {typeLabel}
            </span>
            <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-2)]">
              {service.category || 'General'}
            </span>
          </div>
          <div className="flex min-h-[120px] items-center justify-between rounded-[1.25rem] border border-dashed border-[var(--color-border)] bg-[linear-gradient(180deg,var(--color-bg)_0%,var(--color-surface)_100%)] px-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-4)]">No image available</p>
              <p className="mt-2 text-[15px] font-semibold text-[var(--color-text-2)]">{service.title}</p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-text-1)]">
              <Star size={13} className="fill-[var(--color-secondary-200)] text-[var(--color-secondary-200)]" />
              {isHustle ? 'Hustle' : service.rating ? service.rating.toFixed(1) : 'New'}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[18px] font-bold leading-tight text-[var(--color-text-1)]">{service.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--color-text-3)]">
          {service.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-text-3)]">
          <MapPin size={14} className="text-[var(--color-primary-300)]" />
          <span>{service.city || 'Location on request'}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {service.price ? (
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-2)]">
              From {money(service.price, service.currency_code) || service.price}
            </span>
          ) : null}
          {service.is_verified ? (
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-2)]">
              Verified
            </span>
          ) : null}
          {service.reviews ? (
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-2)]">
              {service.reviews} reviews
            </span>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onBook(service)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-secondary-200)] px-4 text-sm font-semibold text-[var(--color-primary-500)] transition-colors hover:bg-[var(--color-secondary-100)]"
          >
            {ctaLabel}
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDetails(service)}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm font-semibold text-[var(--color-text-1)] transition-colors hover:bg-[var(--color-mist)]"
          >
            Details
          </button>
        </div>
      </div>
    </article>
  )
}

export default function SearchPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState(DEFAULT_FILTERS)
  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [bookPromptService, setBookPromptService] = useState(null)
  const [selectedResult, setSelectedResult] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const [activeTab, setActiveTab] = useState('services')

  useEffect(() => {
    const nextDraft = {
      q: searchParams.get('q') || '',
      category_id: searchParams.get('category_id') || '',
      city_id: searchParams.get('city_id') || '',
    }
    setDraft(nextDraft)
    setActiveFilters(nextDraft)
    setPage(1)
  }, [searchParams])

  const { data: categoriesData } = useQuery({
    queryKey: ['public-categories'],
    queryFn: hustlesService.getCategories,
    staleTime: Infinity,
  })

  const { data: citiesData } = useQuery({
    queryKey: ['public-cities', { per_page: 100 }],
    queryFn: () => locationService.getCities({ per_page: 100 }),
    staleTime: Infinity,
  })

  const categories = categoriesData?.data?.items ?? []
  const cities = locationService.unwrapItems(citiesData)

  const searchTerm = activeFilters.q.trim()

  const apiParams = useMemo(() => {
    const params = { q: searchTerm, page, per_page: PAGE_SIZE }
    if (activeFilters.category_id) params.category_id = activeFilters.category_id
    if (activeFilters.city_id) params.city_id = activeFilters.city_id
    return params
  }, [activeFilters, page, searchTerm])

  const {
    data: searchData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['public-search', apiParams],
    queryFn: () => hustlesService.searchMarketplace(apiParams),
    enabled: Boolean(searchTerm),
    staleTime: 30 * 1000,
  })

  const results = useMemo(() => {
    const resultGroups = searchData?.data?.results ?? searchData?.results ?? {}
    const services = (resultGroups.services ?? []).map(normalizeService)
    const hustles = (resultGroups.hustles ?? []).map(normalizeHustle)
    const companies = (resultGroups.companies ?? []).map((item) => ({
      id: item?.id,
      title: item?.company_name || item?.title || 'Untitled company',
      description: item?.description || item?.summary || '',
      category: item?.category_name || 'Company',
      city: item?.city_name || '',
      rating: 0,
      reviews: 0,
      price: null,
      currency_code: 'NGN',
      image: item?.image_url || null,
      is_verified: false,
      resultType: 'company',
      _raw: item,
    }))

    return {
      services: services.map(normalizeSearchResult).filter(Boolean),
      hustles: hustles.map(normalizeSearchResult).filter(Boolean),
      companies: companies.map(normalizeSearchResult).filter(Boolean),
    }
  }, [searchData])

  const meta = searchData?.data?.meta ?? searchData?.meta ?? {}
  const totalCount = meta.total ?? meta.count ?? (results.services.length + results.hustles.length + results.companies.length)
  const totalPages = meta.total_pages ?? Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const hasServices = results.services.length > 0
  const hasHustles = results.hustles.length > 0
  const activeResults = activeTab === 'hustles' ? results.hustles : results.services
  const activeTabLabel = activeTab === 'hustles' ? 'Hustles' : 'Services'
  const activeTabCount = activeTab === 'hustles' ? results.hustles.length : results.services.length

  const handleSearch = () => {
    const trimmed = draft.q.trim()
    const next = new URLSearchParams()

    if (trimmed) next.set('q', trimmed)
    if (draft.category_id) next.set('category_id', draft.category_id)
    if (draft.city_id) next.set('city_id', draft.city_id)

    setSearchParams(next, { replace: true })
    setActiveFilters(draft)
    setPage(1)
  }

  const handleReset = () => {
    setDraft(DEFAULT_FILTERS)
    setActiveFilters(DEFAULT_FILTERS)
    setPage(1)
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const handleBook = (service) => {
    if (!user) {
      setBookPromptService(service)
      return
    }

    navigate(`/services/${service.id}`)
  }

  const handleDetails = (service) => {
    setSelectedResult(service)
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasActiveQuery = Boolean(searchTerm || activeFilters.category_id || activeFilters.city_id)
  const queryLabel = searchData?.data?.query || searchTerm || 'search'

  return (
    <div
      data-theme={isDark ? 'dark' : undefined}
      className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-1)]"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-3)] shadow-[0_10px_25px_rgba(0,0,0,0.04)]">
            <Search size={13} className="text-[var(--color-secondary-200)]" />
            Search
          </div>

          <button
            type="button"
            onClick={() => setIsDark((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] shadow-[0_10px_25px_rgba(0,0,0,0.04)] transition-colors hover:bg-[var(--color-mist)]"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <section className="mt-5 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.16)] sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
              <div className="flex flex-1 items-center gap-3 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
                <Search size={18} className="text-[var(--color-text-4)]" />
                <input
                  value={draft.q}
                  onChange={(event) => setDraft((current) => ({ ...current, q: event.target.value }))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSearch()
                  }}
                  className="w-full bg-transparent text-[15px] font-medium text-[var(--color-text-1)] outline-none placeholder:text-[var(--color-text-4)]"
                  placeholder="Search for a service"
                />
                {draft.q ? (
                  <button
                    type="button"
                    onClick={() => setDraft((current) => ({ ...current, q: '' }))}
                    className="text-[var(--color-text-4)] transition-colors hover:text-[var(--color-text-1)]"
                    aria-label="Clear search text"
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
                <select
                  value={draft.category_id}
                  onChange={(event) => setDraft((current) => ({ ...current, category_id: event.target.value }))}
                  className="h-14 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm text-[var(--color-text-1)] outline-none"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={draft.city_id}
                  onChange={(event) => setDraft((current) => ({ ...current, city_id: event.target.value }))}
                  className="h-14 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm text-[var(--color-text-1)] outline-none"
                >
                  <option value="">All cities</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 lg:w-[180px]">
                <Button
                  type="button"
                  variant="outline"
                  className="h-14 flex-1 rounded-full border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-1)] hover:bg-[var(--color-mist)]"
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="solid"
                  className="h-14 flex-1 rounded-full bg-[var(--color-secondary-200)] text-[var(--color-primary-500)] hover:bg-[var(--color-secondary-100)]"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-[var(--color-text-3)]">
                {hasActiveQuery ? (
                  <>
                    <span className="font-semibold text-[var(--color-text-1)]">{totalCount.toLocaleString()}</span>{' '}
                    result{totalCount === 1 ? '' : 's'} for "{queryLabel}"
                  </>
                ) : (
                  'Enter a search term to load results.'
                )}
              </p>
              <p className="text-xs text-[var(--color-text-4)]">
                Sign in or register before booking.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
              activeTab === 'services'
                ? 'border-[var(--color-secondary-200)] bg-[var(--color-secondary-200)] text-[var(--color-primary-500)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] hover:bg-[var(--color-mist)]'
            }`}
          >
            Services
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-bold">
              {results.services.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hustles')}
            className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
              activeTab === 'hustles'
                ? 'border-[var(--color-secondary-200)] bg-[var(--color-secondary-200)] text-[var(--color-primary-500)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] hover:bg-[var(--color-mist)]'
            }`}
          >
            Hustles
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-bold">
              {results.hustles.length}
            </span>
          </button>
        </div>

        <section className="mt-6 flex-1">
          {!searchTerm ? (
            <div className="flex min-h-[56vh] items-center justify-center rounded-[1.75rem] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 text-center">
              <div className="max-w-md">
                <p className="text-[15px] font-bold text-[var(--color-text-1)]">Search by keyword first</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-3)]">
                  The marketplace search endpoint requires a `q` term. Type a query above, then refine it with category or city and search again.
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <div
                  key={index}
                  className="h-[420px] animate-pulse rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)]"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="flex min-h-[50vh] items-center justify-center rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 text-center">
              <div className="max-w-md">
                <p className="text-[15px] font-bold text-[var(--color-text-1)]">Search failed</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-3)]">
                  {error?.message || 'Please try again.'}
                </p>
                <Button
                  type="button"
                  variant="solid"
                  className="mt-5 h-11 rounded-full bg-[var(--color-secondary-200)] text-[var(--color-primary-500)] hover:bg-[var(--color-secondary-100)]"
                  onClick={handleSearch}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : activeResults.length === 0 ? (
            <div className="flex min-h-[50vh] items-center justify-center rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 text-center">
              <div className="max-w-md">
                <p className="text-[15px] font-bold text-[var(--color-text-1)]">No {activeTabLabel.toLowerCase()} found</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-3)]">
                  Try a different keyword, category, or city.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-4)]">{activeTabLabel}</p>
                  <h3 className="mt-1 text-[18px] font-bold text-[var(--color-text-1)]">
                    {activeTabCount} result{activeTabCount === 1 ? '' : 's'}
                  </h3>
                </div>
                <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-3)]">
                  {activeTab === 'hustles' ? 'Client requests' : 'Provider listings'}
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {activeResults.map((item) => (
                  <SearchResultCard
                    key={`${item.resultType}-${item.id}`}
                    service={item}
                    onBook={handleBook}
                    onDetails={handleDetails}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-1)] transition-colors hover:bg-[var(--color-mist)] disabled:opacity-40"
                  >
                    <ArrowRight size={15} className="rotate-180" />
                  </button>
                  <span className="px-4 text-sm text-[var(--color-text-3)]">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-1)] transition-colors hover:bg-[var(--color-mist)] disabled:opacity-40"
                  >
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <div className="py-6 text-center text-xs text-[var(--color-text-4)]">
          © {new Date().getFullYear()} HustleApp. All rights reserved.
        </div>
      </div>

      <ResultDetailsModal item={selectedResult} onClose={() => setSelectedResult(null)} />
      <BookingPromptModal service={bookPromptService} onClose={() => setBookPromptService(null)} />
    </div>
  )
}
