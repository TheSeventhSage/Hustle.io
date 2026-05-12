import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Layers } from 'lucide-react'

export function ServiceCard({ service }) {
    return (
        <div className="group relative h-full flex flex-col rounded-[2.25rem] border border-white/10 bg-[linear-gradient(180deg,#0d1713_0%,#09110e_100%)] p-4 text-white shadow-[0_24px_70px_-25px_rgba(0,0,0,0.55)] transition-all duration-500 hover:-translate-y-1 hover:border-secondary/35">
            {/* Image/Icon Container */}
            <div className="relative mb-8 h-64 w-full overflow-hidden rounded-[1.8rem] bg-[radial-gradient(circle_at_top,rgba(222,183,55,0.14),transparent_56%),linear-gradient(180deg,#0f1915_0%,#07100d_100%)]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-700">
                    {service.icon}
                </div>

                {/* Floating Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-md">
                    <Layers size={14} className="text-secondary" />
                    {service.zones} Active Zones
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4 flex-1 flex flex-col">
                <h3 className="mb-4 text-2xl font-black text-white group-hover:text-secondary transition-colors">
                    {service.title}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-white/60 line-clamp-2">
                    {service.description}
                </p>

                {/* Subcategories as Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {service.subcategories.slice(0, 3).map((sub) => (
                        <span key={sub} className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-bold text-white/75">
                            {sub.toUpperCase()}
                        </span>
                    ))}
                </div>

                {/* Modern Footer Action */}
                <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-6">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter text-secondary">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        Live Now
                    </span>

                    <Link to={`/services/${service.id}`} className="group/btn flex items-center gap-2 text-sm font-black text-white">
                        VIEW DETAILS
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-text-1 transition-colors group-hover/btn:bg-secondary">
                            <ArrowRight size={14} />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
