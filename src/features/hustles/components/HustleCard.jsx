import { MapPin, Share2, Clock } from 'lucide-react';
import { Button } from '../../../shared/components/Button'

const LEVEL_STYLES = {
  entry: { label: 'Entry', cls: 'text-primary' },
  mid: { label: 'Intermediate', cls: 'text-secondary-dark' },
  senior: { label: 'Expert', cls: 'text-primary-sat' },
  // legacy fallbacks
  beginner: { label: 'Beginner', cls: 'text-primary' },
  intermediate: { label: 'Intermediate', cls: 'text-secondary-dark' },
  expert: { label: 'Expert', cls: 'text-primary-sat' },
}

function formatRelativeTime(dateString) {
  if (!dateString) return 'Posted now'
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Posted now'
  if (mins < 60) return `Posted ${mins} minutes ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Posted ${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `Posted ${days} day${days > 1 ? 's' : ''} ago`
}

function formatAmount(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
  }).format(value)
}

function formatDuration(minutes) {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes} min`
  const hrs = Math.floor(minutes / 60)
  const rem = minutes % 60
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`
}

export function HustleCard({ hustle, onViewDetails }) {
  const {
    id,
    title,
    description,
    image,
    // API field names
    posted_at,
    required_experience_level,
    duration_minutes,
    budget_amount,
    location_text,
    city_name,
    category_name,
    company_name,
    // legacy field names (for seed data fallback)
    postedAt,
    experienceLevel,
    duration,
    amount,
  } = hustle

  const displayDate = posted_at || postedAt
  const displayLevel = required_experience_level || experienceLevel
  const displayDuration = duration_minutes ? formatDuration(duration_minutes) : (duration || '—')
  const displayAmount = budget_amount || amount
  const displayLocation = location_text || city_name

  const level = LEVEL_STYLES[displayLevel] || LEVEL_STYLES.entry

  const handleShare = (e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(`${window.location.origin}/hustles/${id}`)
  }

  return (
    <article className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">

      {/* Top row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-0">
        <p className="text-sm font-semibold text-text-4">{formatRelativeTime(displayDate)}</p>
      </div>

      {/* Cover image */}
      <div className="relative mx-4 mt-2.5 rounded-xl overflow-hidden h-44 bg-mist flex-shrink-0">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5 dark:bg-primary-light/10">
            <span className="text-3xl font-black text-primary tracking-tight opacity-20">HUSTLE</span>
          </div>
        )}
        <button
          onClick={handleShare}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface/90 backdrop-blur-sm flex items-center justify-center text-text-3 hover:bg-surface transition-all shadow-sm"
          aria-label="Share hustle"
        >
          <Share2 size={13} strokeWidth={2} />
        </button>
        {category_name && (
          <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-primary/90 backdrop-blur-sm rounded-lg text-[11px] font-semibold text-white">
            {category_name}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 px-4 pt-3 pb-4">

        {/* Company name */}
        {company_name && (
          <p className="text-[11px] font-semibold text-text-4 mb-1">{company_name}</p>
        )}

        {/* Title */}
        <h5 className="font-bold text-text-1 leading-snug line-clamp-1 mb-2.5">{title}</h5>

        {/* Description */}
        <div className="mb-3">
          <p className="text-sm font-semibold text-text-1 mb-1">Description:</p>
          <p className="text-sm text-text-3 leading-relaxed line-clamp-3">{description}</p>
        </div>

        {/* Location */}
        {displayLocation && (
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin size={12} className="text-text-4 flex-shrink-0" />
            <span className="text-[12px] text-text-4 truncate">{displayLocation}</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <p className="text-text-4 text-sm mb-0.5">Experience</p>
            <p className={`font-bold capitalize text-sm ${level.cls}`}>{level.label}</p>
          </div>
          <div>
            <p className="text-text-4 text-sm mb-0.5">Duration</p>
            <div className="flex items-center gap-1">
              <Clock size={11} className="text-text-4" />
              <p className="font-semibold text-text-1 text-sm">{displayDuration}</p>
            </div>
          </div>
          <div>
            <p className="text-text-4 text-sm mb-0.5">Budget</p>
            <p className="font-bold text-text-1 text-sm">{displayAmount ? formatAmount(displayAmount) : '—'}</p>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="solid"
          onClick={() => onViewDetails?.(id)}
          className="w-full h-11 text-sm font-bold rounded-xl"
        >
          View more details
        </Button>
      </div>
    </article>
  )
}
