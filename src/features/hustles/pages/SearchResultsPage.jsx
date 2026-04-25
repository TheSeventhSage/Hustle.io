import { useMemo, useState, useEffect } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FilterSidebar } from '../components/FilterSidebar.jsx'
import { ServiceCard } from '../components/ServiceCard.jsx'
import { HustlerProfilePanel } from '../components/HustlerProfilePanel.jsx'
import useHustlesStore from '../hustles.store.js'

// ── Pagination constants ─────────────────────────────────────────
const PAGE_SIZE = 6

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
export default function SearchResultsPage({ results = [] }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { search, setSearch, filters } = useHustlesStore()
  const [page, setPage] = useState(1)
  const [selectedHustler, setSelectedHustler] = useState(null)

  // Initialize search from URL query parameter
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearch(query)
    }
  }, [searchParams, setSearch])

  // Client-side filter application (swap for API params when backend is ready)
  const filtered = useMemo(() => {
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
  }, [results, filters])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
              {filtered.length.toLocaleString()}
            </span>{' '}
            result{filtered.length !== 1 ? 's' : ''} found
            {search ? ` for "${search}"` : ''}
          </p>

          {/* Grid */}
          {paged.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
              {paged.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
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
          {filtered.length > 0 && (
            <>
              <PaginationBar current={page} total={totalPages} onChange={handlePageChange} />
              <p className="text-center text-[12px] text-text-4">
                Showing page {page} of {filtered.length} entries
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
