import { RadioGroup } from '../../../shared/components/RadioGroup.jsx'
import { Search } from 'lucide-react'
import useHustlesStore from '../hustles.store.js'

// ── Static option lists ──────────────────────────────────────────
const SORT_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Nearest', value: 'nearest' },
  { label: 'Newly posted', value: 'newly_posted' },
  { label: 'Available now', value: 'available_now' },
]

const LEVEL_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Expert', value: 'expert' },
]

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Beauty Service', value: 'beauty' },
  { label: 'Building & Trade Services', value: 'building' },
  { label: 'Chauffeur & Airport Transfer Services', value: 'chauffeur' },
  { label: 'Child Care & Education Services', value: 'childcare' },
  { label: 'Cleaning Services', value: 'cleaning' },
  { label: 'Computer & IT Services', value: 'it' },
  { label: 'DJ & Entertainment Services', value: 'entertainment' },
  { label: 'Fitness & Personal Training', value: 'fitness' },
]

const RATING_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: '5', value: '5' },
  { label: '4', value: '4' },
  { label: '3', value: '3' },
  { label: '2', value: '2' },
  { label: '1', value: '1' },
]

const VERIFIED_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Verified', value: 'verified' },
  { label: 'Unverified', value: 'unverified' },
]

// ── Reusable section block ───────────────────────────────────────
function FilterSection({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-[13px] font-bold text-text-1 mb-3">{title}</p>
      {children}
    </div>
  )
}

// ── Star row for rating options ──────────────────────────────────
function StarRating({ count }) {
  if (count === 'all') return <span className="text-[13px] text-text-3">All</span>
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885l-3.09 1.625.59-3.44L2 4.635l3.455-.505z"
            fill={i < Number(count) ? 'var(--color-secondary)' : 'var(--color-border)'}
            stroke={i < Number(count) ? 'var(--color-secondary)' : 'var(--color-text-4)'}
            strokeWidth="0.5"
          />
        </svg>
      ))}
    </span>
  )
}

// ── Main component ───────────────────────────────────────────────
export function FilterSidebar() {
  const { filters, setFilter } = useHustlesStore()

  const f = filters

  return (
    <aside className="w-full overflow-y-auto pb-8">

      {/* Sort by */}
      <FilterSection title="Sort by">
        <RadioGroup
          name="sortBy"
          value={f.sortBy || 'all'}
          options={SORT_OPTIONS}
          onChange={(v) => setFilter('sortBy', v)}
        />
      </FilterSection>

      <div className="h-px bg-mist mb-6" />

      {/* Experience level */}
      <FilterSection title="Experience Level">
        <RadioGroup
          name="skillLevel"
          value={f.skillLevel || 'all'}
          options={LEVEL_OPTIONS}
          onChange={(v) => setFilter('skillLevel', v === 'all' ? null : v)}
        />
      </FilterSection>

      <div className="h-px bg-mist mb-6" />

      {/* Location */}
      <FilterSection title="Location">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none"
          />
          <input
            type="text"
            value={f.location || ''}
            onChange={(e) => setFilter('location', e.target.value)}
            placeholder="Enter location"
            className="w-full h-10 pl-8 pr-3 text-[13px] border border-border rounded-xl
              outline-none focus:border-primary-sat text-text-1 placeholder:text-text-4"
          />
        </div>
      </FilterSection>

      <div className="h-px bg-mist mb-6" />

      {/* Categories */}
      <FilterSection title="Categories">
        <div className="max-h-[220px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          <RadioGroup
            name="category"
            value={f.category || 'all'}
            options={CATEGORIES}
            onChange={(v) => setFilter('category', v === 'all' ? null : v)}
          />
        </div>
      </FilterSection>

      <div className="h-px bg-mist mb-6" />

      {/* Amount range */}
      <FilterSection title="Amount:">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Min', key: 'minBudget' },
            { label: 'Max', key: 'maxBudget' },
          ].map(({ label, key }) => (
            <div key={key}>
              <p className="text-[11px] text-text-4 mb-1">{label}</p>
              <div className="flex items-center border border-border rounded-xl overflow-hidden h-10">
                <span className="px-2.5 text-[12px] font-semibold text-text-3 bg-mist border-r border-border h-full flex items-center">
                  GHS
                </span>
                <input
                  type="number"
                  min="0"
                  value={f[key] || ''}
                  onChange={(e) => setFilter(key, e.target.value)}
                  placeholder="Enter amount"
                  className="flex-1 px-2.5 text-[12px] text-text-1 outline-none bg-white placeholder:text-text-4 w-0"
                />
              </div>
            </div>
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-mist mb-6" />

      {/* Availability */}
      <FilterSection title="Availability">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'From', key: 'availFrom' },
            { label: 'To', key: 'availTo' },
          ].map(({ label, key }) => (
            <div key={key}>
              <p className="text-[11px] text-text-4 mb-1">{label}</p>
              <div className="relative">
                <select
                  value={f[key] || ''}
                  onChange={(e) => setFilter(key, e.target.value)}
                  className="w-full h-10 px-3 text-[12px] text-text-1 border border-border
                    rounded-xl outline-none bg-white focus:border-primary-sat appearance-none cursor-pointer"
                >
                  <option value="">Select date</option>
                </select>
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="var(--color-text-4)" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-mist mb-6" />

      {/* Rating */}
      <FilterSection title="Rating:">
        <div className="flex flex-col gap-2.5">
          {RATING_OPTIONS.map((opt) => {
            const checked = (f.rating?.toString() || 'all') === opt.value
            return (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${checked ? 'border-primary-sat bg-primary-sat' : 'border-text-4 bg-white group-hover:border-primary-sat/50'}`}>
                  {checked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <input type="radio" name="rating" value={opt.value} checked={checked}
                  onChange={() => setFilter('rating', opt.value === 'all' ? null : Number(opt.value))}
                  className="sr-only" />
                <StarRating count={opt.value} />
              </label>
            )
          })}
        </div>
      </FilterSection>

      <div className="h-px bg-mist mb-6" />

      {/* Verified Hustlers */}
      <FilterSection title="Verified Hustlers">
        <RadioGroup
          name="verified"
          value={f.verified || 'all'}
          options={VERIFIED_OPTIONS}
          onChange={(v) => setFilter('verified', v)}
        />
      </FilterSection>
    </aside>
  )
}
