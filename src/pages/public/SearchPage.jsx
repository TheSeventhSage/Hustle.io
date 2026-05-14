import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight, Filter, MapPin, Moon, Search, Sun, Star, X, Briefcase, Building2, CheckCircle, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
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

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(value) {
  if (!value) return null
  const date = new Date(`2000-01-01T${value}`)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatDetailValue(value) {
  if (value === null || value === undefined || value === '') return null
  if (Array.isArray(value)) {
    const parts = value.map((entry) => formatDetailValue(entry)).filter(Boolean)
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
  ].filter((entry) => entry.value)

  const extraEntries = Object.entries(raw)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .filter(([key]) => !['id','title','description','short_description','category_name','city_name','location_text','service_location_text','status','result_type','currency_code','budget_amount','default_rate_amount','preferred_date','preferred_start_time','preferred_end_time','posted_by_name','company_name','poster_first_name','poster_last_name','required_experience_level','duration_minutes','payment_model'].includes(key))
    .map(([key, value]) => ({ label: key.replace(/_/g, ' '), value: formatDetailValue(value) }))
    .filter((entry) => entry.value)

  return { summary, extraEntries }
}

// ─── BOOKING PROMPT MODAL ────────────────────────────────────────────────────
function BookingPromptModal({ service, onClose }) {
  if (!service) return null
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.2)]">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-mist)] text-[var(--color-text-3)] hover:text-[var(--color-text-1)] transition-colors">
          <X size={15} />
        </button>
        <div className="mb-1 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-secondary-200)]" />
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-text-4)] font-semibold">Secure your booking</p>
        </div>
        <h3 className="mt-3 text-xl font-bold text-[var(--color-text-1)] leading-snug">{service.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-3)]">
          Sign in or create an account to book this service. Your session will continue after authentication.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/sign-in" className="flex-1">
            <Button variant="solid" className="h-12 w-full rounded-2xl bg-[var(--color-primary-500)] text-white font-semibold hover:bg-[var(--color-primary-400)]">Sign in</Button>
          </Link>
          <Link to="/sign-up" className="flex-1">
            <Button variant="outline" className="h-12 w-full rounded-2xl border-[var(--color-border)] text-[var(--color-text-1)] font-semibold hover:bg-[var(--color-mist)]">Create account</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── RESULT DETAILS MODAL ────────────────────────────────────────────────────
function ResultDetailsModal({ item, onClose }) {
  if (!item) return null
  const isHustle = item.resultType === 'hustle'
  const { summary, extraEntries } = buildDetailGroups(item)

  return (
    <div className="fixed inset-0 z-[82] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[0_40px_80px_rgba(0,0,0,0.22)]">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-mist)] text-[var(--color-text-3)] hover:text-[var(--color-text-1)] transition-colors">
          <X size={15} />
        </button>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-secondary-200)]" />
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-text-4)] font-semibold">{isHustle ? 'Opportunity' : 'Service listing'}</p>
        </div>
        <h3 className="mt-3 text-2xl font-bold text-[var(--color-text-1)] leading-snug">{item.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-3)]">{item.description || 'No description provided.'}</p>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {summary.map((detail) => (
            <div key={detail.label} className="rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] p-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-4)] font-semibold mb-1.5">{detail.label}</p>
              <p className="text-sm font-semibold text-[var(--color-text-1)]">{detail.value}</p>
            </div>
          ))}
        </div>

        {extraEntries.length > 0 && (
          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-4)] font-semibold mb-3">Additional details</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {extraEntries.map((entry) => (
                <div key={entry.label} className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-4)] font-semibold">{entry.label}</p>
                  <p className="mt-1 text-sm font-medium text-[var(--color-text-1)] break-words">{entry.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--color-text-4)]">{isHustle ? 'Client request' : 'Provider listing'}</span>
          <button type="button" onClick={onClose} className="inline-flex h-10 items-center justify-center rounded-2xl bg-[var(--color-primary-500)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-400)]">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SEARCH RESULT CARD ──────────────────────────────────────────────────────
function SearchResultCard({ service, onBook, onDetails }) {
  const isHustle = service?.resultType === 'hustle'
  const ctaLabel = isHustle ? 'View' : 'Book'

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden hover:border-[var(--color-primary-300)]/40 hover:shadow-[0_12px_40px_rgba(37,86,77,0.08)] transition-all duration-300">
      {/* Image */}
      {service.image ? (
        <div className="relative h-48 overflow-hidden bg-[var(--color-mist)] shrink-0">
          <img src={service.image} alt={service.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${isHustle ? 'bg-[var(--color-secondary-200)] text-[var(--color-primary-500)]' : 'bg-white/90 text-[var(--color-primary-500)]'}`}>
              {isHustle ? <Briefcase size={9} /> : <Building2 size={9} />}
              {isHustle ? 'Opportunity' : 'Service'}
            </span>
          </div>
          {!isHustle && service.rating > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/30 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white border border-white/10">
              <Star size={10} className="fill-[var(--color-secondary-200)] text-[var(--color-secondary-200)]" />
              {service.rating.toFixed(1)}
            </div>
          )}
        </div>
      ) : (
        <div className="h-14 shrink-0 bg-gradient-to-r from-[var(--color-primary-500)]/8 to-[var(--color-primary-400)]/4 border-b border-[var(--color-border)] flex items-center px-5 gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${isHustle ? 'bg-[var(--color-secondary-200)]/20 text-[var(--color-primary-400)]' : 'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-400)]'}`}>
            {isHustle ? <Briefcase size={9} /> : <Building2 size={9} />}
            {isHustle ? 'Opportunity' : 'Service'}
          </span>
          {service.category && (
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1 text-[10px] font-medium text-[var(--color-text-3)]">{service.category}</span>
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {service.image && service.category && (
          <span className="mb-3 inline-block text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--color-text-4)]">{service.category}</span>
        )}
        <h3 className="text-[15px] font-bold leading-snug text-[var(--color-text-1)] line-clamp-2 group-hover:text-[var(--color-primary-400)] transition-colors">{service.title}</h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[var(--color-text-3)]">{service.description}</p>

        <div className="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--color-text-4)]">
          <MapPin size={12} className="text-[var(--color-primary-300)] shrink-0" />
          <span>{service.city || 'Remote / On request'}</span>
        </div>

        {/* Tags row */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {service.price && (
            <span className="rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-text-2)]">
              {money(service.price, service.currency_code) || service.price}
            </span>
          )}
          {service.is_verified && (
            <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle size={9} /> Verified
            </span>
          )}
          {service.reviews > 0 && (
            <span className="rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-text-2)]">
              {service.reviews} reviews
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto pt-4 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onBook(service)}
            className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary-500)] text-[13px] font-semibold text-white transition-all hover:bg-[var(--color-primary-400)] hover:shadow-[0_6px_20px_rgba(37,86,77,0.25)]"
          >
            {ctaLabel} <ArrowUpRight size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDetails(service)}
            className="h-10 px-4 inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[13px] font-semibold text-[var(--color-text-2)] transition-colors hover:bg-[var(--color-mist)]"
          >
            Info
          </button>
        </div>
      </div>
    </article>
  )
}

// ─── SKELETON CARD ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden animate-pulse">
      <div className="h-48 bg-[var(--color-mist)]" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-16 rounded-full bg-[var(--color-mist)]" />
        <div className="h-4 w-4/5 rounded-full bg-[var(--color-mist)]" />
        <div className="h-3 w-full rounded-full bg-[var(--color-mist)]" />
        <div className="h-3 w-3/4 rounded-full bg-[var(--color-mist)]" />
        <div className="pt-2 flex gap-2">
          <div className="h-10 flex-1 rounded-xl bg-[var(--color-mist)]" />
          <div className="h-10 w-16 rounded-xl bg-[var(--color-mist)]" />
        </div>
      </div>
    </div>
  )
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
function EmptyState({ title, message, action }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 text-center">
      <div className="max-w-xs">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-mist)]">
          <Search size={22} className="text-[var(--color-text-4)]" />
        </div>
        <p className="text-[15px] font-bold text-[var(--color-text-1)]">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-3)]">{message}</p>
        {action}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
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
  const [showFilters, setShowFilters] = useState(false)

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

  const { data: searchData, isLoading, isError, error } = useQuery({
    queryKey: ['public-search', apiParams],
    queryFn: () => hustlesService.searchMarketplace(apiParams),
    enabled: Boolean(searchTerm),
    staleTime: 30 * 1000,
  })

  const results = useMemo(() => {
    const resultGroups = searchData?.data?.results ?? searchData?.results ?? {}
    const services = (resultGroups.services ?? []).map(normalizeService)
    const hustles = (resultGroups.hustles ?? []).map(normalizeHustle)
    return {
      services: services.map(normalizeSearchResult).filter(Boolean),
      hustles: hustles.map(normalizeSearchResult).filter(Boolean),
    }
  }, [searchData])

  const meta = searchData?.data?.meta ?? searchData?.meta ?? {}
  const totalCount = meta.total ?? meta.count ?? (results.services.length + results.hustles.length)
  const totalPages = meta.total_pages ?? Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const activeResults = activeTab === 'hustles' ? results.hustles : results.services
  const activeTabLabel = activeTab === 'hustles' ? 'Opportunities' : 'Services'
  const activeTabCount = activeTab === 'hustles' ? results.hustles.length : results.services.length
  const hasActiveQuery = Boolean(searchTerm || activeFilters.category_id || activeFilters.city_id)
  const queryLabel = searchData?.data?.query || searchTerm || 'search'
  const hasFilters = Boolean(activeFilters.category_id || activeFilters.city_id)

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
    if (!user) { setBookPromptService(service); return }
    navigate(`/services/${service.id}`)
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div data-theme={isDark ? 'dark' : undefined} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-1)]">

      {/* ─── TOPBAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
          {/* Back + Brand */}
          <Link to="/" className="flex items-center gap-2 text-[var(--color-text-3)] hover:text-[var(--color-text-1)] transition-colors shrink-0">
            <ChevronLeft size={16} />
            <span className="hidden sm:block text-sm font-medium">Home</span>
          </Link>

          <div className="h-5 w-px bg-[var(--color-border)] shrink-0" />

          {/* Search bar — always visible in header */}
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 focus-within:border-[var(--color-primary-300)]/60 focus-within:ring-2 focus-within:ring-[var(--color-primary-500)]/8 transition-all">
            <Search size={15} className="text-[var(--color-text-4)] shrink-0" />
            <input
              value={draft.q}
              onChange={(e) => setDraft((c) => ({ ...c, q: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
              className="w-full bg-transparent text-sm font-medium text-[var(--color-text-1)] outline-none placeholder:text-[var(--color-text-4)]"
              placeholder="Search roles, skills, services…"
            />
            {draft.q && (
              <button type="button" onClick={() => setDraft((c) => ({ ...c, q: '' }))} className="text-[var(--color-text-4)] hover:text-[var(--color-text-1)] transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors shrink-0 ${showFilters || hasFilters ? 'border-[var(--color-primary-300)] bg-[var(--color-primary-500)]/8 text-[var(--color-primary-400)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] hover:bg-[var(--color-mist)]'}`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:block">Filters</span>
            {hasFilters && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[9px] font-bold text-white">!</span>}
          </button>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSearch}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--color-primary-500)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-400)] transition-colors shrink-0 shadow-[0_4px_16px_rgba(37,86,77,0.2)]"
          >
            <span className="hidden sm:block">Search</span>
            <Search size={14} className="sm:hidden" />
          </button>

          {/* Dark mode */}
          <button
            type="button"
            onClick={() => setIsDark((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-3)] hover:bg-[var(--color-mist)] transition-colors shrink-0"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Collapsible filter row */}
        {showFilters && (
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
              <select
                value={draft.category_id}
                onChange={(e) => setDraft((c) => ({ ...c, category_id: e.target.value }))}
                className="h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text-1)] outline-none focus:border-[var(--color-primary-300)]/60 min-w-[160px]"
              >
                <option value="">All categories</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>

              <select
                value={draft.city_id}
                onChange={(e) => setDraft((c) => ({ ...c, city_id: e.target.value }))}
                className="h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text-1)] outline-none focus:border-[var(--color-primary-300)]/60 min-w-[160px]"
              >
                <option value="">All cities</option>
                {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
              </select>

              <div className="ml-auto flex gap-2">
                <button type="button" onClick={handleReset} className="h-9 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-semibold text-[var(--color-text-2)] hover:bg-[var(--color-mist)] transition-colors">
                  Reset
                </button>
                <button type="button" onClick={() => { handleSearch(); setShowFilters(false) }} className="h-9 px-4 rounded-xl bg-[var(--color-primary-500)] text-sm font-semibold text-white hover:bg-[var(--color-primary-400)] transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── MAIN CONTENT ───────────────────────────────────────────── */}
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">

        {/* Result meta row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            {hasActiveQuery ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[var(--color-text-4)] mb-1">Results</p>
                <h2 className="text-lg font-bold text-[var(--color-text-1)]">
                  <span className="text-[var(--color-primary-400)]">{totalCount.toLocaleString()}</span>{' '}
                  result{totalCount === 1 ? '' : 's'} for <span className="italic">"{queryLabel}"</span>
                </h2>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-3)]">Enter a keyword to begin your search.</p>
            )}
          </div>

          {/* Tab switcher */}
          {hasActiveQuery && (
            <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 gap-1">
              {[
                { key: 'services', label: 'Services', count: results.services.length, icon: Building2 },
                { key: 'hustles', label: 'Opportunities', count: results.hustles.length, icon: Briefcase },
              ].map(({ key, label, count, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-semibold transition-all ${activeTab === key ? 'bg-[var(--color-primary-500)] text-white shadow-sm' : 'text-[var(--color-text-3)] hover:text-[var(--color-text-1)]'}`}
                >
                  <Icon size={12} />
                  {label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === key ? 'bg-white/20 text-white' : 'bg-[var(--color-mist)] text-[var(--color-text-3)]'}`}>{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── RESULTS AREA ──────────────────────────────────────────── */}
        {!searchTerm ? (
          <EmptyState
            title="What are you looking for?"
            message="Search by role, skill, service type, or category. Refine results with location and category filters."
          />
        ) : isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : isError ? (
          <EmptyState
            title="Search unavailable"
            message={error?.message || 'Something went wrong. Please try again.'}
            action={
              <button type="button" onClick={handleSearch} className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--color-primary-500)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-400)] transition-colors">
                Retry
              </button>
            }
          />
        ) : activeResults.length === 0 ? (
          <EmptyState
            title={`No ${activeTabLabel.toLowerCase()} found`}
            message="Try a different keyword, or switch tabs to see other result types."
          />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[var(--color-text-4)] uppercase tracking-[0.2em]">
                {activeTabCount} {activeTabLabel} · Page {page} of {totalPages}
              </p>
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-4)]">
                {activeTab === 'hustles' ? 'Client requests' : 'Provider listings'}
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {activeResults.map((item) => (
                <SearchResultCard
                  key={`${item.resultType || 'service'}-${item.id}`}
                  service={item}
                  onBook={handleBook}
                  onDetails={(s) => setSelectedResult(s)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-1)] transition-colors hover:bg-[var(--color-mist)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${pageNum === page ? 'bg-[var(--color-primary-500)] text-white shadow-sm' : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] hover:bg-[var(--color-mist)]'}`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-1)] transition-colors hover:bg-[var(--color-mist)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="mt-16 border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-text-4)]">
        © {new Date().getFullYear()} HustleIO · All rights reserved
      </footer>

      {/* ─── MODALS ──────────────────────────────────────────────────── */}
      <ResultDetailsModal item={selectedResult} onClose={() => setSelectedResult(null)} />
      <BookingPromptModal service={bookPromptService} onClose={() => setBookPromptService(null)} />
    </div>
  )
}
