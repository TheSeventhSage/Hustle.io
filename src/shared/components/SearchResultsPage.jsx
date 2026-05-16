import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Calendar, Clock, Search, X } from 'lucide-react'
import { format } from 'date-fns'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DatePickerDropdown, TimePickerDropdown } from './DateTimePicker.jsx'
import { Button } from './Button.jsx'
import { ServiceCard } from '../../features/hustles/components/ServiceCard.jsx'
import { HustleCard } from '../../features/hustles/components/HustleCard.jsx'
import { HustlerProfilePanel } from '../../features/hustles/components/HustlerProfilePanel.jsx'
import { hustlesService } from '../../features/hustles/hustles.service.js'
import useAuthStore from '../../features/auth/auth.store.js'
import { locationService } from '../api/location.service.js'
import { unwrapItems } from '../lib/api/response.js'

const PAGE_SIZE = 6

const DEFAULT_FILTERS = {
  q: '',
  category_id: '',
  city_id: '',
  location: '',
  sortBy: 'all',
  skillLevel: 'all',
  minBudget: '',
  maxBudget: '',
  rating: 'all',
  verified: 'all',
  preferred_date: '',
  preferred_start_time: '',
  preferred_end_time: '',
}

function toServiceCard(s) {
  return {
    id: s.id,
    artisanId: s.artisan_account_id,
    name: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || s.artisan_name || s.title,
    location: s.city_name ?? s.location_text ?? '',
    rating: s.average_rating ? Number(s.average_rating) : 0,
    reviews: s.review_count ?? 0,
    available: s.is_active ?? true,
    skills: s.skills?.map((sk) => sk.name ?? sk) ?? [s.category_name].filter(Boolean),
    title: s.title,
    desc: s.short_description ?? s.description ?? '',
    img: s.image_url ?? null,
    avatar: s.artisan_avatar ?? s.profile_image_url ?? null,
    rate: s.default_rate_amount
      ? `${s.currency_code ?? 'NGN'} ${Number(s.default_rate_amount).toLocaleString()}/${s.pricing_model_default === 'per_hour' ? 'hr' : 'service'}`
      : null,
    _raw: s,
  }
}

function PaginationBar({ current, total, onChange }) {
  if (total <= 1) return null

  const pages = Array.from({ length: Math.min(total, 7) }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-1 pt-8 pb-4">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-4 transition-all hover:border-primary-sat disabled:opacity-40"
      >
        <ArrowLeft size={14} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`h-8 w-8 rounded-full text-[13px] font-semibold transition-all ${
            current === p ? 'bg-secondary text-primary' : 'text-text-3 hover:bg-mist'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-4 transition-all hover:border-primary-sat disabled:opacity-40"
      >
        <ArrowLeft size={14} className="rotate-180" />
      </button>
    </div>
  )
}

function SearchSidebar({
  draft,
  setDraft,
  onSearch,
  onReset,
  categories = [],
  categoriesLoading,
  cities = [],
  citiesLoading,
  isSearching,
}) {
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [startTimePickerOpen, setStartTimePickerOpen] = useState(false)
  const [endTimePickerOpen, setEndTimePickerOpen] = useState(false)

  const dateButtonRef = useRef(null)
  const startTimeButtonRef = useRef(null)
  const endTimeButtonRef = useRef(null)

  const selectedDate = draft.preferred_date ? new Date(`${draft.preferred_date}T00:00:00`) : null
  const ratingValue = draft.rating === 'all' ? 0 : Number(draft.rating)
  const experienceOptions = [
    { value: 'all', label: 'All levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' },
  ]

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-mist bg-surface">
      <div className="border-b border-mist px-5 py-4">
        <p className="text-[15px] font-bold text-text-1">Search filters</p>
        <p className="mt-1 text-[12px] text-text-4">Choose criteria, then run the search.</p>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-text-3">Search text</p>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              type="search"
              value={draft.q}
              onChange={(event) => setDraft((current) => ({ ...current, q: event.target.value }))}
              placeholder="Search hustles"
              className="h-11 w-full rounded-xl border border-border bg-white pl-9 pr-9 text-[13px] text-text-1 outline-none placeholder:text-text-4 focus:border-primary-sat"
            />
            {draft.q && (
              <button
                type="button"
                onClick={() => setDraft((current) => ({ ...current, q: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-4 hover:text-text-1"
                aria-label="Clear search text"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-[12px] font-semibold text-text-3">Category</p>
            <select
              value={draft.category_id}
              onChange={(event) => setDraft((current) => ({ ...current, category_id: event.target.value }))}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-[13px] text-text-1 outline-none focus:border-primary-sat"
            >
              <option value="">{categoriesLoading ? 'Loading categories...' : 'All categories'}</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1.5 text-[12px] font-semibold text-text-3">City</p>
            <select
              value={draft.city_id}
              onChange={(event) => setDraft((current) => ({ ...current, city_id: event.target.value }))}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-[13px] text-text-1 outline-none focus:border-primary-sat"
            >
              <option value="">{citiesLoading ? 'Loading cities...' : 'All cities'}</option>
              {cities.map((city) => (
                <option key={city.id} value={String(city.id)}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-text-3">Location</p>
          <input
            type="text"
            value={draft.location}
            onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
            placeholder="Enter location"
            className="h-11 w-full rounded-xl border border-border bg-white px-3 text-[13px] text-text-1 outline-none placeholder:text-text-4 focus:border-primary-sat"
          />
        </div>

        <div className="relative">
          <p className="mb-1.5 text-[12px] font-semibold text-text-3">Preferred date</p>
          <button
            ref={dateButtonRef}
            type="button"
            onClick={() => setDatePickerOpen((current) => !current)}
            className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-white px-3 text-left text-[13px] text-text-1"
          >
            <span className={draft.preferred_date ? 'text-text-1' : 'text-text-4'}>
              {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Select date'}
            </span>
            <Calendar size={16} className="text-text-4" />
          </button>
          <DatePickerDropdown
            isOpen={datePickerOpen}
            onClose={() => setDatePickerOpen(false)}
            onSelect={(date) => {
              setDraft((current) => ({
                ...current,
                preferred_date: date ? format(date, 'yyyy-MM-dd') : '',
              }))
            }}
            selectedDate={selectedDate}
            title="Select preferred date"
            anchorRef={dateButtonRef}
            minDate={new Date()}
          />
        </div>

        <div className="relative">
          <p className="mb-1.5 text-[12px] font-semibold text-text-3">Start time</p>
          <button
            ref={startTimeButtonRef}
            type="button"
            onClick={() => setStartTimePickerOpen((current) => !current)}
            className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-white px-3 text-left text-[13px] text-text-1"
          >
            <span className={draft.preferred_start_time ? 'text-text-1' : 'text-text-4'}>
              {draft.preferred_start_time
                ? format(new Date(`2000-01-01T${draft.preferred_start_time}`), 'h:mm a')
                : 'Start'}
            </span>
            <Clock size={16} className="text-text-4" />
          </button>
          <TimePickerDropdown
            isOpen={startTimePickerOpen}
            onClose={() => setStartTimePickerOpen(false)}
            onSelect={(time) => {
              setDraft((current) => ({ ...current, preferred_start_time: time || '' }))
            }}
            selectedTime={draft.preferred_start_time}
            title="Select start time"
            anchorRef={startTimeButtonRef}
          />
        </div>

        <div className="relative">
          <p className="mb-1.5 text-[12px] font-semibold text-text-3">End time</p>
          <button
            ref={endTimeButtonRef}
            type="button"
            onClick={() => setEndTimePickerOpen((current) => !current)}
            className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-white px-3 text-left text-[13px] text-text-1"
          >
            <span className={draft.preferred_end_time ? 'text-text-1' : 'text-text-4'}>
              {draft.preferred_end_time
                ? format(new Date(`2000-01-01T${draft.preferred_end_time}`), 'h:mm a')
                : 'End'}
            </span>
            <Clock size={16} className="text-text-4" />
          </button>
          <TimePickerDropdown
            isOpen={endTimePickerOpen}
            onClose={() => setEndTimePickerOpen(false)}
            onSelect={(time) => {
              setDraft((current) => ({ ...current, preferred_end_time: time || '' }))
            }}
            selectedTime={draft.preferred_end_time}
            title="Select end time"
            anchorRef={endTimeButtonRef}
          />
        </div>

        <div>
          <p className="mb-2 text-[12px] font-semibold text-text-3">Experience level</p>
          <div className="space-y-2">
            {experienceOptions.map((option) => {
              const checked = draft.skillLevel === option.value
              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-white px-3 py-2.5 text-[13px] text-text-1 transition-colors hover:border-primary-sat"
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${checked ? 'border-primary-sat' : 'border-text-4'}`}>
                    {checked && <span className="h-2 w-2 rounded-full bg-primary-sat" />}
                  </span>
                  <input
                    type="radio"
                    name="experience-level"
                    value={option.value}
                    checked={checked}
                    onChange={(event) => setDraft((current) => ({ ...current, skillLevel: event.target.value }))}
                    className="sr-only"
                  />
                  <span className={checked ? 'font-semibold text-text-1' : 'text-text-2'}>{option.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-semibold text-text-3">Rating</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDraft((current) => ({ ...current, rating: 'all' }))}
              className={`mr-2 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                draft.rating === 'all' ? 'bg-secondary text-primary' : 'bg-mist text-text-3 hover:bg-secondary-pale'
              }`}
            >
              All
            </button>
            {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => {
              const active = ratingValue >= value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDraft((current) => ({ ...current, rating: String(value) }))}
                  className="group flex items-center justify-center rounded-lg p-1 transition-colors hover:bg-mist"
                  aria-label={`${value} star rating`}
                >
                  <svg width="18" height="18" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885l-3.09 1.625.59-3.44L2 4.635l3.455-.505z"
                      fill={active ? 'var(--color-secondary)' : 'var(--color-border)'}
                      stroke={active ? 'var(--color-secondary)' : 'var(--color-text-4)'}
                      strokeWidth="0.5"
                    />
                  </svg>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-text-3">Verification</p>
          <select
            value={draft.verified}
            onChange={(event) => setDraft((current) => ({ ...current, verified: event.target.value }))}
            className="h-11 w-full rounded-xl border border-border bg-white px-3 text-[13px] text-text-1 outline-none focus:border-primary-sat"
          >
            <option value="all">All hustlers</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-[12px] font-semibold text-text-3">Min budget</p>
            <div className="flex h-11 items-stretch overflow-hidden rounded-xl border border-border bg-white">
              <span className="flex h-full items-center border-r border-border bg-mist px-3 text-[12px] font-semibold text-text-3">
                NGN
              </span>
              <input
                type="number"
                min="0"
                value={draft.minBudget}
                onChange={(event) => setDraft((current) => ({ ...current, minBudget: event.target.value }))}
                className="w-full min-w-0 px-3 text-[13px] text-text-1 outline-none placeholder:text-text-4"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[12px] font-semibold text-text-3">Max budget</p>
            <div className="flex h-11 items-stretch overflow-hidden rounded-xl border border-border bg-white">
              <span className="flex h-full items-center border-r border-border bg-mist px-3 text-[12px] font-semibold text-text-3">
                NGN
              </span>
              <input
                type="number"
                min="0"
                value={draft.maxBudget}
                onChange={(event) => setDraft((current) => ({ ...current, maxBudget: event.target.value }))}
                className="w-full min-w-0 px-3 text-[13px] text-text-1 outline-none placeholder:text-text-4"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-mist px-5 py-4">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            onClick={onReset}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="primary"
            className="h-11 flex-1"
            onClick={onSearch}
            isPending={isSearching}
          >
            Search
          </Button>
        </div>
      </div>
    </aside>
  )
}

export default function SearchResultsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const isArtisan = user?.role === 'artisan'
  const resultType = isArtisan ? 'hustles' : 'services'

  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [selectedHustler, setSelectedHustler] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const initialQ = searchParams.get('q') || ''
    if (!initialQ) return

    setDraftFilters((current) => ({ ...current, q: initialQ }))
    setAppliedFilters((current) => ({ ...current, q: initialQ }))
    setHasSearched(true)
  }, [searchParams])

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: hustlesService.getCategories,
    staleTime: Infinity,
  })

  const { data: citiesData } = useQuery({
    queryKey: ['cities', { per_page: 100 }],
    queryFn: () => locationService.getCities({ per_page: 100 }),
    staleTime: Infinity,
  })

  const categories = unwrapItems(categoriesData)
  const cities = locationService.unwrapItems(citiesData)

  const searchParamsForApi = useMemo(() => {
    const params = {
      type: resultType,
      page,
      per_page: PAGE_SIZE,
    }

    if (appliedFilters.q.trim()) params.q = appliedFilters.q.trim()
    if (appliedFilters.category_id) params.category_id = appliedFilters.category_id
    if (appliedFilters.city_id) params.city_id = appliedFilters.city_id
    if (appliedFilters.location) params.location = appliedFilters.location
    if (appliedFilters.preferred_date) params.preferred_date = appliedFilters.preferred_date
    if (appliedFilters.preferred_start_time) params.preferred_start_time = appliedFilters.preferred_start_time
    if (appliedFilters.preferred_end_time) params.preferred_end_time = appliedFilters.preferred_end_time
    if (appliedFilters.sortBy !== 'all') params.sort_by = appliedFilters.sortBy
    if (appliedFilters.skillLevel !== 'all') params.skill_level = appliedFilters.skillLevel
    if (appliedFilters.minBudget) params.min_budget = appliedFilters.minBudget
    if (appliedFilters.maxBudget) params.max_budget = appliedFilters.maxBudget
    if (appliedFilters.rating !== 'all') params.rating = appliedFilters.rating
    if (appliedFilters.verified !== 'all') params.verified = appliedFilters.verified

    return params
  }, [appliedFilters, page, resultType])

  const {
    data: searchData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['marketplace-search', searchParamsForApi],
    queryFn: () => hustlesService.searchMarketplace(searchParamsForApi),
    enabled: hasSearched,
    staleTime: 30 * 1000,
  })

  const results = searchData?.data?.items ?? []
  const meta = searchData?.meta ?? {}
  const totalCount = meta.total ?? results.length
  const totalPages = meta.total_pages || Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const handleSearch = () => {
    const trimmed = draftFilters.q.trim()
    if (!trimmed) {
      setDraftFilters((current) => ({ ...current, q: '' }))
      setAppliedFilters((current) => ({ ...current, q: '' }))
      setPage(1)
      setHasSearched(false)
      setSearchParams(new URLSearchParams(), { replace: true })
      return
    }

    setAppliedFilters((current) => ({ ...current, ...draftFilters, q: trimmed }))
    setPage(1)
    setHasSearched(true)

    const next = new URLSearchParams(searchParams)
    next.set('q', trimmed)
    setSearchParams(next, { replace: true })
  }

  const handleReset = () => {
    setDraftFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setPage(1)
    setHasSearched(false)
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const noQueryYet =
    !hasSearched &&
    !draftFilters.q &&
    !draftFilters.category_id &&
    !draftFilters.city_id &&
    !draftFilters.location &&
    !draftFilters.preferred_date &&
    !draftFilters.preferred_start_time &&
    !draftFilters.preferred_end_time &&
    draftFilters.sortBy === 'all' &&
    draftFilters.skillLevel === 'all' &&
    !draftFilters.minBudget &&
    !draftFilters.maxBudget &&
    draftFilters.rating === 'all' &&
    draftFilters.verified === 'all'

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid min-h-0 grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
              <SearchSidebar
                draft={draftFilters}
                setDraft={setDraftFilters}
                onSearch={handleSearch}
                onReset={handleReset}
                categories={categories}
                categoriesLoading={!categoriesData}
                cities={cities}
                citiesLoading={!citiesData}
                isSearching={isLoading}
              />
            </div>

            <section className="min-w-0 rounded-2xl border border-mist bg-surface px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-shrink-0 rounded-lg p-1.5 text-text-3 transition-colors hover:bg-mist"
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h1 className="text-[22px] font-bold text-text-1">Search results</h1>
            <p className="text-[13px] text-text-4">
                    Search from the sidebar or the top bar and review matching hustles or services here.
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-mist pt-4">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="relative flex-1">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                    <input
                      type="search"
                      value={draftFilters.q}
                      onChange={(event) => setDraftFilters((current) => ({ ...current, q: event.target.value }))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') handleSearch()
                      }}
                      placeholder="Search hustles"
                      className="h-11 w-full rounded-xl border border-border bg-white pl-9 pr-9 text-[13px] text-text-1 outline-none placeholder:text-text-4 focus:border-primary-sat"
                    />
                    {draftFilters.q && (
                      <button
                        type="button"
                        onClick={() => setDraftFilters((current) => ({ ...current, q: '' }))}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-4 hover:text-text-1"
                        aria-label="Clear search text"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    className="h-11 w-full lg:w-[140px]"
                    onClick={handleSearch}
                    isPending={isLoading}
                  >
                    Search
                  </Button>
                </div>

                {noQueryYet ? (
                  <div className="flex min-h-[420px] items-center justify-center text-center">
                    <div>
                      <p className="mb-2 text-[15px] font-bold text-text-1">Use the filters to search</p>
                      <p className="text-[13px] text-text-4">Pick criteria on the left, then run Search.</p>
                    </div>
                  </div>
                ) : isLoading ? (
                  <div className="flex min-h-[420px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : isError ? (
                  <div className="flex min-h-[420px] items-center justify-center text-center">
                    <div>
                      <p className="mb-2 text-[15px] font-bold text-text-1">Search failed</p>
                      <p className="text-[13px] text-text-4">Please try again.</p>
                    </div>
                  </div>
                ) : results.length > 0 ? (
                  <>
                    <p className="mb-4 text-[13px] text-text-3">
                      <span className="font-bold text-text-1">{totalCount.toLocaleString()}</span>{' '}
                      result{totalCount !== 1 ? 's' : ''} found
                      {appliedFilters.q ? ` for "${appliedFilters.q}"` : ''}
                    </p>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {isArtisan
                        ? results.map((hustle) => (
                          <HustleCard
                            key={hustle.id}
                            hustle={hustle}
                            onViewDetails={(id) => navigate(`/hustles/${id}`)}
                          />
                        ))
                        : results.map((service) => (
                          <ServiceCard
                            key={service.id}
                            service={toServiceCard(service)}
                            onBookNow={(s) => setSelectedHustler(s)}
                          />
                        ))}
                    </div>

                    {totalCount > 0 && (
                      <>
                        <PaginationBar current={page} total={totalPages} onChange={handlePageChange} />
                        <p className="text-center text-[12px] text-text-4">
                          Showing page {page} of {totalCount} entries
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex min-h-[420px] items-center justify-center text-center">
                    <div>
                      <p className="mb-2 text-[15px] font-bold text-text-1">No results found</p>
                      <p className="text-[13px] text-text-4">Try different filters or a broader search term.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {selectedHustler && (
        <HustlerProfilePanel
          hustler={selectedHustler}
          onClose={() => setSelectedHustler(null)}
        />
      )}
    </>
  )
}
