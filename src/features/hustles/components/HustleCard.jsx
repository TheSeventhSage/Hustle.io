import { Share2 } from 'lucide-react';
import { Button } from '../../../shared/components/Button'

const LEVEL_STYLES = {
  beginner: { label: 'Beginner', cls: 'text-blue-600' },
  intermediate: { label: 'Intermediate', cls: 'text-amber-600' },
  expert: { label: 'Expert', cls: 'text-emerald-600' },
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
  return new Intl.NumberFormat('en-GH', {
    style: 'currency', currency: 'GHS', minimumFractionDigits: 0,
  }).format(value)
}

export function HustleCard({ hustle, onViewDetails }) {
  const {
    id, title, description, image,
    postedAt, experienceLevel, duration, amount, applicantCount = 0,
  } = hustle

  const level = LEVEL_STYLES[experienceLevel] || LEVEL_STYLES.beginner

  const handleShare = (e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(`${window.location.origin}/hustles/${id}`)
  }

  const countLabel = applicantCount === 0
    ? '0 Applicants'
    : `${applicantCount} Applicant${applicantCount > 1 ? 's' : ''}`

  const countColor = applicantCount > 0 ? 'text-primary' : 'text-text-4'

  return (
    <article className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">

      {/* ── Applicant count row ──────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-0">
        <p className="text-sm font-semibold text-text-4">{formatRelativeTime(postedAt)}</p>
        <span className={`text-sm font-bold ${countColor}`}>{countLabel}</span>
      </div>

      {/* ── Cover image ──────────────────────────────────────── */}
      <div className="relative mx-4 mt-2.5 rounded-xl overflow-hidden h-44 bg-mist flex-shrink-0">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-3xl font-black text-primary tracking-tight opacity-20">HUSTLE</span>
          </div>
        )}

        {/* Share button top-right */}
        <button
          onClick={handleShare}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface/90 backdrop-blur-sm flex items-center justify-center text-text-3 hover:bg-surface transition-all shadow-sm"
          aria-label="Share hustle"
        >
          <Share2 size={13} strokeWidth={2} />
        </button>
      </div>

      {/* ── Card body ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 px-4 pt-3 pb-4">

        {/* Title */}
        <h5 className=" font-bold text-text-1 leading-snug line-clamp-1 mb-2.5">
          {title}
        </h5>

        {/* Description */}
        <div className="mb-3">
          <p className="text-sm font-semibold text-text-1 mb-1">Description:</p>
          <p className="text-sm text-text-3 leading-relaxed line-clamp-3">{description}</p>
        </div>

        {/* Push footer down */}
        <div className="flex-1" />

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          {/* <div>
            <p className="text-text-4  text-[13px] mb-0.5">Experience level:</p>
            <p className="text-text-4 text-[13px]  mb-0.5">Hustle duration</p>
            <p className="text-text-4 text-[13px]  mb-0.5">Amount:</p>
          </div>
          <div>
            <p className={`font-bold capitalize text-[13px] ${level.cls}`}>{level.label}</p>
            <p className="font-semibold text-text-1 text-[13px]">{duration || '—'}</p>
            <p className="font-bold text-text-1 text-[13px]">{amount ? formatAmount(amount) : '—'}</p>
          </div> */}
          <div>
            <p className="text-text-4  text-sm mb-0.5">Experience level:</p>
            <p className={`font-bold capitalize text-sm ${level.cls}`}>{level.label}</p>
          </div>
          <div>
            <p className="text-text-4 text-sm  mb-0.5">Hustle duration</p>
            <p className="font-semibold text-text-1 text-sm">{duration || '—'}</p>
          </div>
          <div>
            <p className="text-text-4 text-sm  mb-0.5">Amount:</p>
            <p className="font-bold text-text-1 text-sm">{amount ? formatAmount(amount) : '—'}</p>
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
