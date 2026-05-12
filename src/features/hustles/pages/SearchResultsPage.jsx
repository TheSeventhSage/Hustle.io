import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FilterSidebar } from '../components/FilterSidebar.jsx'
import { ServiceCard } from '../components/ServiceCard.jsx'
import { HustleCard } from '../components/HustleCard.jsx'
import { HustlerProfilePanel } from '../components/HustlerProfilePanel.jsx'
import useHustlesStore from '../hustles.store.js'
import { hustlesService } from '../hustles.service.js'
import useAuthStore from '../../auth/auth.store.js'

// ── Pagination constants ─────────────────────────────────────────
const PAGE_SIZE = 6

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
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
    skills: s.skills?.map(sk => sk.name ?? sk) ?? [s.category_name].filter(Boolean),
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

// ── Pagination bar ───────────────────────────────────────────────
function PaginationBar({ current, total, onChange }) {
  if (total <= 1) return null

  const pages = Array.from({ length: Math.min(total, 7) }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-1 pt-8 pb-4">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center rounded-full text-text-4
          border border-border hover:border-primary-sat disabled:opacity-40 transition-all"
      >
        <ArrowLeft size={14} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-full text-[13px] font-semibold transition-all
            ${current === p
              ? 'bg-secondary text-primary'
              : 'text-text-3 hover:bg-mist'
            }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="w-8 h-8 flex items-center justify-center rounded-full text-text-4
          border border-border hover:border-primary-sat disabled:opacity-40 transition-all"
      >
        <ArrowLeft size={14} className="rotate-180" />
      </button>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────
export default function SearchResultsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const { search, setSearch, filters } = useHustlesStore()
  const [page, setPage] = useState(1)
  const [selectedHustler, setSelectedHustler] = useState(null)
  const debouncedSearch = useDebouncedValue(search.trim())
  const isArtisan = user?.role === 'artisan'
  const resultType = isArtisan ? 'hustles' : 'services'

  // Initialize search from URL query parameter
  useEffect(() => {
    const query = searchParams.get('q')
    setSearch(query || '')
  }, [searchParams, setSearch])

  useEffect(() => {
    const current = searchParams.get('q') || ''
    if (debouncedSearch === current) return

    const next = new URLSearchParams(searchParams)
    if (debouncedSearch) next.set('q', debouncedSearch)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }, [debouncedSearch, searchParams, setSearchParams])

  const {
    data: searchData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['marketplace-search', resultType, debouncedSearch, page],
    queryFn: () => hustlesService.searchMarketplace({
      q: debouncedSearch,
      type: resultType,
      page,
      per_page: PAGE_SIZE,
    }),
    enabled: Boolean(debouncedSearch),
    staleTime: 30 * 1000,
  })

  const results = searchData?.data?.items ?? []
  const meta = searchData?.meta ?? {}

  const filtered = useMemo(() => {
    if (isArtisan) return results

    return results.filter((item) => {
      if (filters.skillLevel && item.skillLevel !== filters.skillLevel) return false
      if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false
      if (filters.rating && item.rating < filters.rating) return false
      if (filters.verified === 'verified' && !item.verified) return false
      if (filters.verified === 'unverified' && item.verified) return false
      if (filters.minBudget && item.amount < Number(filters.minBudget)) return false
      if (filters.maxBudget && item.amount > Number(filters.maxBudget)) return false
      return true
    })
  }, [results, filters, isArtisan])

  const totalPages = meta.total_pages || Math.ceil(filtered.length / PAGE_SIZE)
  const totalCount = meta.total ?? filtered.length
  const paged = filtered

  const handlePageChange = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="flex h-full min-h-screen bg-white">

        {/* ── Left: filter sidebar ─────────────────── */}
        <div className="w-[280px] flex-shrink-0 border-r border-mist px-5 pt-6 hidden md:block overflow-y-auto">
          <FilterSidebar />
        </div>

        {/* ── Right: results ───────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 px-4 sm:px-6 pt-4 pb-10">

          {/* Search bar row */}
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg hover:bg-mist text-text-3 transition-colors flex-shrink-0"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex-1 relative max-w-sm">
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search hustles..."
                className="w-full h-10 pl-4 pr-9 text-[13px] border border-border rounded-xl
                  outline-none focus:border-primary-sat text-text-1 placeholder:text-text-4 bg-white"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setPage(1) }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-4 hover:text-text-1"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Result count */}
          <p className="text-[13px] text-text-3 mb-5">
            <span className="font-bold text-text-1">
              {totalCount.toLocaleString()}
            </span>{' '}
            result{totalCount !== 1 ? 's' : ''} found
            {search ? ` for "${search}"` : ''}
          </p>

          {/* Grid */}
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : isError ? (
            <div className="flex-1 flex items-center justify-center py-20 text-center">
              <div>
                <p className="text-[15px] font-bold text-text-1 mb-2">Search failed</p>
                <p className="text-[13px] text-text-4">Please try again.</p>
              </div>
            </div>
          ) : paged.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
              {isArtisan
                ? paged.map((hustle) => (
                  <HustleCard
                    key={hustle.id}
                    hustle={hustle}
                    onViewDetails={(id) => navigate(`/hustles/${id}`)}
                  />
                ))
                : paged.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={toServiceCard(service)}
                    onBookNow={(s) => setSelectedHustler(s)}
                  />
                ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-20 text-center">
              <div>
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-[15px] font-bold text-text-1 mb-2">No results found</p>
                <p className="text-[13px] text-text-4">
                  Try adjusting your filters or search term.
                </p>
              </div>
            </div>
          )}

          {/* Pagination + count */}
          {totalCount > 0 && (
            <>
              <PaginationBar current={page} total={totalPages} onChange={handlePageChange} />
              <p className="text-center text-[12px] text-text-4">
                Showing page {page} of {totalCount} entries
              </p>
            </>
          )}
        </div>
      </div>

      {/* Profile panel */}
      {selectedHustler && (
        <HustlerProfilePanel
          hustler={selectedHustler}
          onClose={() => setSelectedHustler(null)}
        />
      )}
    </>
  )
}
