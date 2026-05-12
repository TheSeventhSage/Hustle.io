import { Star, MapPin } from 'lucide-react'
import { VerifiedBadge } from '../VerifiedBadge.jsx'

export function ApplicantTile({ applicant, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left p-3.5 bg-white dark:bg-surface cursor-pointer border border-border rounded-2xl hover:border-primary/40 hover:shadow-sm transition-all"
        >
            <div className="flex items-start gap-3">
                <img
                    src={applicant.avatar}
                    alt={applicant.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-[13px] font-bold text-text-1 truncate">{applicant.name}</p>
                        {applicant.verified && <VerifiedBadge />}
                    </div>
                    <p className="text-[11px] text-text-3 truncate mb-1.5">{applicant.role}</p>
                    <div className="flex items-center gap-1 mb-1">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-semibold text-text-2">
                            {applicant.rating} ({applicant.hustlesCompleted} hustles completed)
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin size={11} className="text-text-4" />
                        <span className="text-[11px] text-text-4">{applicant.location}</span>
                    </div>
                </div>
            </div>
        </button>
    )
}
