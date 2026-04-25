import { ChevronRight } from 'lucide-react'

/**
 * SectionHeader
 * Reusable section header with optional "See More" action
 */
export function SectionHeader({ title, onSeeMore }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-text-1">{title}</h2>
            {onSeeMore && (
                <button
                    onClick={onSeeMore}
                    className="text-[13px] font-bold text-primary-sat hover:text-primary-light transition-colors flex items-center gap-0.5"
                >
                    See More <ChevronRight size={14} strokeWidth={2.5} />
                </button>
            )}
        </div>
    )
}
