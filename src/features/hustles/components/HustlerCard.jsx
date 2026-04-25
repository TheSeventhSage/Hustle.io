import { MapPin, Star } from 'lucide-react'
import { VerifiedBadge } from './VerifiedBadge.jsx'

/**
 * HustlerCard
 * Card component for displaying hustler profiles in grid layout
 * Used in "Lash Techs Near You" and similar sections
 */
export function HustlerCard({ hustler, onClick }) {
    return (
        <button
            onClick={() => onClick?.(hustler)}
            className="flex items-start gap-4 p-4 bg-surface border border-border rounded-2xl hover:shadow-md hover:border-text-4 transition-all text-left w-full"
        >
            <img
                src={hustler.avatar}
                alt={hustler.name}
                className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-1">
                    <p className="text-[15px] font-bold text-text-1 truncate">{hustler.name}</p>
                    <VerifiedBadge />
                </div>
                <p className="text-[13px] text-text-3 truncate mb-2">{hustler.role}</p>
                <div className="flex items-center gap-1.5 mb-2">
                    <Star size={14} className="text-secondary fill-secondary flex-shrink-0" />
                    <span className="text-[13px] font-semibold text-text-1">{hustler.rating}</span>
                    <span className="text-[12px] text-text-4">({hustler.completed} hustles completed)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-text-4 mb-3">
                    <MapPin size={12} strokeWidth={2} />
                    {hustler.location}
                </div>
                <p className={`text-[16px] font-bold ${hustler.rateColor}`}>{hustler.rate}</p>
            </div>
        </button>
    )
}
