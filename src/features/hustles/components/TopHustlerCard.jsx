import { CheckCircle2 } from 'lucide-react'

/**
 * TopHustlerCard
 * Card component for displaying top-rated hustlers in horizontal carousel
 */
export function TopHustlerCard({ hustler, onClick }) {
    return (
        <button
            onClick={() => onClick?.(hustler)}
            className="flex-shrink-0 w-[300px] bg-surface border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-lg transition-all"
        >
            <div className="relative mb-4">
                <img
                    src={hustler.avatar}
                    alt={hustler.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-surface shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1">
                    <CheckCircle2 size={24} className="text-primary-btn fill-white" strokeWidth={2.5} />
                </span>
            </div>
            <p className="text-[14px] font-bold text-text-1 leading-tight mb-3 line-clamp-2">
                {hustler.name}
            </p>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#B45309] dark:text-secondary bg-secondary-pale dark:bg-secondary/10 px-3 py-1.5 rounded-full mb-1">
                🏆 Top rated
            </span>
            <p className="text-[13px] text-text-3 font-medium mb-">{hustler.skill}</p>
            <p className="text-[12px] text-text-4">({hustler.completed} hustles completed)</p>
        </button>
    )
}
