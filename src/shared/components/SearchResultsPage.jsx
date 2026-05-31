import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Search, SlidersHorizontal, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from './Button.jsx'
import { ServiceCard } from '../../features/hustles/components/ServiceCard.jsx'
import { HustleCard } from '../../features/hustles/components/HustleCard.jsx'
import { HustlerProfilePanel } from '../../features/hustles/components/HustlerProfilePanel.jsx'
import { hustlesService } from '../../features/hustles/hustles.service.js'
import PublicNavbar from '../../pages/public/components/PublicNavbar.jsx'
import { HomePageFooter } from '../../pages/public/components/HomePageFooter.jsx'
import useAuthStore from '../../features/auth/auth.store.js'
import { locationService } from '../api/location.service.js'
import { unwrapItems } from '../lib/api/response.js'
import useUIStore from '../store/ui.store.js'

const PAGE_SIZE = 6

const DEFAULT_FILTERS = {
  type: '',
  q: '',
  category_id: '',
  country_id: '',
  city_id: '',
  sortBy: 'all',
  skillLevel: 'all',
  rating: 'all',
}

function normalizeSearchType(value) {
  return value === 'hustles' || value === 'services' ? value : ''
}

function getInitialFilters(searchParams) {
  return {
    type: normalizeSearchType(searchParams.get('type')),
    q: searchParams.get('q')?.trim() || '',
    category_id: searchParams.get('category_id') || '',
    country_id: searchParams.get('country_id') || '',
    city_id: searchParams.get('city_id') || '',
    sortBy: searchParams.get('sort_by') || DEFAULT_FILTERS.sortBy,
    skillLevel: searchParams.get('skill_level') || DEFAULT_FILTERS.skillLevel,
    rating: searchParams.get('rating') || DEFAULT_FILTERS.rating,
  }
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

function dedupeSearchResults(items = []) {
  const seen = new Set()

  return items.filter((item, index) => {
    const id = item?.id
    const key = id == null || id === '' ? `fallback-${index}` : String(id)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function PaginationBar({ current, total, onChange }) {
  if (total <= 1) return null

  const windowSize = 7
  const start = Math.max(1, Math.min(current - Math.floor(windowSize / 2), total - windowSize + 1))
  const end = Math.min(total, start + windowSize - 1)
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index)

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
          className={`h-8 w-8 rounded-full text-[13px] font-semibold transition-all ${current === p ? 'bg-secondary text-primary' : 'text-text-3 hover:bg-mist'
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
  countries = [],
  countriesLoading,
  cities = [],
  citiesLoading,
  isSearching,
  searchSubjectLabel,
  onClose,
  showMobileClose = false,
}) {
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-bold text-text-1">Search filters</p>
            <p className="mt-1 text-[12px] text-text-4">Choose criteria, then run the search.</p>
          </div>
          {showMobileClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-3 transition-colors hover:bg-mist lg:hidden"
              aria-label="Close filters"
            >
              <X size={16} />
            </button>
          )}
        </div>
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
              placeholder={`Search ${searchSubjectLabel}`}
              className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-9 text-[13px] text-text-1 outline-none placeholder:text-text-4 focus:border-primary-sat"
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
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13px] text-text-1 outline-none focus:border-primary-sat"
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
            <p className="mb-1.5 text-[12px] font-semibold text-text-3">Country</p>
            <select
              value={draft.country_id}
              onChange={(event) => setDraft((current) => ({
                ...current,
                country_id: event.target.value,
                city_id: '',
              }))}
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13px] text-text-1 outline-none focus:border-primary-sat"
            >
              <option value="">{countriesLoading ? 'Loading countries...' : 'All countries'}</option>
              {countries.map((country) => (
                <option key={country.id} value={String(country.id)}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-text-3">City</p>
          <select
            value={draft.city_id}
            onChange={(event) => setDraft((current) => ({ ...current, city_id: event.target.value }))}
            className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13px] text-text-1 outline-none focus:border-primary-sat"
          >
            <option value="">
              {draft.country_id
                ? (citiesLoading ? 'Loading cities...' : 'All cities')
                : 'Select country first'}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={String(city.id)}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-semibold text-text-3">Experience level</p>
          <div className="space-y-2">
            {experienceOptions.map((option) => {
              const checked = draft.skillLevel === option.value
              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px] text-text-1 transition-colors hover:border-primary-sat"
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
              className={`mr-2 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${draft.rating === 'all' ? 'bg-secondary text-primary' : 'bg-mist text-text-3 hover:bg-secondary-pale'
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

      </div>

      <div className="border-t border-mist px-5 py-4">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            onClick={() => {
              onReset()
              onClose?.()
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="primary"
            className="h-11 flex-1"
            onClick={() => {
              onSearch()
              onClose?.()
            }}
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
  const toastError = useUIStore((s) => s.toastError)
  const isArtisan = user?.role === 'artisan'
  const urlFilters = useMemo(() => getInitialFilters(searchParams), [searchParams])
  const resultType = urlFilters.type || (isArtisan ? 'hustles' : 'services')
  const submittedQuery = urlFilters.q
  const searchSubjectLabel = resultType === 'hustles' ? 'hustles' : 'services'

  const [draftFilters, setDraftFilters] = useState(urlFilters)
  const [appliedFilters, setAppliedFilters] = useState(urlFilters)
  const [page, setPage] = useState(1)
  const [selectedHustler, setSelectedHustler] = useState(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    setDraftFilters(urlFilters)
    setAppliedFilters(urlFilters)
    setPage(1)
  }, [urlFilters])

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileFiltersOpen])

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

  const { data: citiesData } = useQuery({
    queryKey: ['cities', { country_id: draftFilters.country_id || undefined, per_page: 100 }],
    queryFn: () => locationService.getCities({
      country_id: draftFilters.country_id || undefined,
      per_page: 100,
    }),
    staleTime: Infinity,
  })

  const categories = unwrapItems(categoriesData)
  const countries = locationService.unwrapItems(countriesData)
  const cities = locationService.unwrapItems(citiesData)

  const searchParamsForApi = useMemo(() => {
    const params = {
      type: resultType,
      page,
      per_page: PAGE_SIZE,
    }

    if (submittedQuery) params.q = submittedQuery
    if (appliedFilters.category_id) params.category_id = appliedFilters.category_id
    if (appliedFilters.country_id) params.country_id = appliedFilters.country_id
    if (appliedFilters.city_id) params.city_id = appliedFilters.city_id
    if (appliedFilters.sortBy !== 'all') params.sort_by = appliedFilters.sortBy
    if (appliedFilters.skillLevel !== 'all') params.skill_level = appliedFilters.skillLevel
    if (appliedFilters.rating !== 'all') params.rating = appliedFilters.rating

    return params
  }, [appliedFilters, page, resultType, submittedQuery])

  const {
    data: searchData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['marketplace-search', searchParamsForApi],
    queryFn: () => hustlesService.searchMarketplace(searchParamsForApi),
    enabled: Boolean(submittedQuery),
    staleTime: 30 * 1000,
  })

  const rawResults = searchData?.data?.items ?? searchData?.data?.data?.items ?? []
  const results = useMemo(() => dedupeSearchResults(rawResults), [rawResults])
  const meta = searchData?.meta ?? searchData?.data?.meta ?? {}
  const totalCount = Number(meta.total ?? 0) || 0
  const totalPages = Number(meta.total_pages ?? 0) || 0
  const currentPage = Number(meta.page ?? page) || page

  const handleSearch = () => {
    const normalizedFilters = {
      ...draftFilters,
      q: draftFilters.q.trim(),
    }

    if (!normalizedFilters.q) {
      const resetFilters = { ...DEFAULT_FILTERS, type: resultType }
      setAppliedFilters(resetFilters)
      setDraftFilters(resetFilters)
      setPage(1)
      const next = new URLSearchParams()
      next.set('type', resultType)
      setSearchParams(next, { replace: true })
      toastError('Enter a search term first. The /search endpoint requires q, and the filters only refine that query.')
      return
    }

    setAppliedFilters(normalizedFilters)
    setPage(1)

    const next = new URLSearchParams()
    next.set('type', resultType)
    next.set('q', normalizedFilters.q)
    if (normalizedFilters.category_id) next.set('category_id', normalizedFilters.category_id)
    if (normalizedFilters.country_id) next.set('country_id', normalizedFilters.country_id)
    if (normalizedFilters.city_id) next.set('city_id', normalizedFilters.city_id)
    if (normalizedFilters.sortBy !== 'all') next.set('sort_by', normalizedFilters.sortBy)
    if (normalizedFilters.skillLevel !== 'all') next.set('skill_level', normalizedFilters.skillLevel)
    if (normalizedFilters.rating !== 'all') next.set('rating', normalizedFilters.rating)
    setSearchParams(next, { replace: true })
  }

  const handleReset = () => {
    const resetFilters = { ...DEFAULT_FILTERS, type: resultType }
    setDraftFilters(resetFilters)
    setAppliedFilters(resetFilters)
    setPage(1)
    const next = new URLSearchParams()
    next.set('type', resultType)
    setSearchParams(next, { replace: true })
  }

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || (totalPages > 0 && nextPage > totalPages) || nextPage === page) return
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const noQueryYet = !submittedQuery

  return (
    <>
      <div className="min-h-screen bg-bg">
        <PublicNavbar />
        <main className="pb-12 pt-8 sm:pt-32">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
            <div className="grid min-h-0 grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
              <div className="hidden lg:sticky lg:top-28 lg:block lg:h-[calc(100vh-8rem)]">
                <SearchSidebar
                  draft={draftFilters}
                  setDraft={setDraftFilters}
                  onSearch={handleSearch}
                  onReset={handleReset}
                  categories={categories}
                  categoriesLoading={!categoriesData}
                  countries={countries}
                  countriesLoading={!countriesData}
                  cities={cities}
                  citiesLoading={!citiesData}
                  isSearching={isLoading}
                  searchSubjectLabel={searchSubjectLabel}
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
                      Enter a search term first. The backend requires `q`, then the filters narrow those results.
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-mist pt-4">
                  <div className="mb-4 lg:hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 w-full justify-center rounded-xl"
                      onClick={() => setMobileFiltersOpen(true)}
                    >
                      <SlidersHorizontal size={16} />
                      Filters
                    </Button>
                  </div>

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
                        placeholder={`Search ${searchSubjectLabel}`}
                        className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-9 text-[13px] text-text-1 outline-none placeholder:text-text-4 focus:border-primary-sat"
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
                        <p className="mb-2 text-[15px] font-bold text-text-1">Enter a search term to begin</p>
                        <p className="text-[13px] text-text-4">`/search` needs `q`. Use the filters after that to refine the results.</p>
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
                          ? results.map((hustle, index) => (
                            <HustleCard
                              key={`${hustle.id ?? 'hustle'}-${hustle.posted_at ?? hustle.created_at ?? index}`}
                              hustle={hustle}
                              onViewDetails={(id) => navigate(`/hustles/${id}`)}
                            />
                          ))
                          : results.map((service, index) => (
                            <ServiceCard
                              key={`${service.id ?? 'service'}-${service.city_name ?? service.location_text ?? index}`}
                              service={toServiceCard(service)}
                              onBookNow={(s) => setSelectedHustler(s)}
                            />
                          ))}
                      </div>

                      {totalPages > 1 && (
                        <>
                          <PaginationBar current={currentPage} total={totalPages} onChange={handlePageChange} />
                          <p className="text-center text-[12px] text-text-4">
                            Showing page {currentPage} of {totalPages} pages
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
        </main>
        <HomePageFooter />
      </div>

      {mobileFiltersOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[210] bg-black/40 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Close filters"
          />
          <div className="fixed inset-y-0 left-0 z-[220] w-full max-w-[340px] p-3 lg:hidden">
            <SearchSidebar
              draft={draftFilters}
              setDraft={setDraftFilters}
              onSearch={handleSearch}
              onReset={handleReset}
              categories={categories}
              categoriesLoading={!categoriesData}
              countries={countries}
              countriesLoading={!countriesData}
              cities={cities}
              citiesLoading={!citiesData}
              isSearching={isLoading}
              searchSubjectLabel={searchSubjectLabel}
              onClose={() => setMobileFiltersOpen(false)}
              showMobileClose
            />
          </div>
        </>
      )}

      {selectedHustler && (
        <HustlerProfilePanel
          hustler={selectedHustler}
          onClose={() => setSelectedHustler(null)}
        />
      )}
    </>
  )
}
