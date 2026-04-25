import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Layers } from 'lucide-react'

export function ServiceCard({ service }) {
    return (
        <div className="group relative h-full flex flex-col bg-white rounded-[2.5rem] border border-gray-100 p-4 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
            {/* Image/Icon Container */}
            <div className="relative h-64 w-full rounded-[2rem] overflow-hidden bg-gray-50 mb-8">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-700">
                    {service.icon}
                </div>

                {/* Floating Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold shadow-sm">
                    <Layers size={14} className="text-primary" />
                    {service.zones} Active Zones
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4 flex-1 flex flex-col">
                <h3 className="text-2xl font-black text-text-1 mb-4 group-hover:text-primary transition-colors">
                    {service.title}
                </h3>
                <p className="text-text-3 text-sm leading-relaxed mb-6 line-clamp-2">
                    {service.description}
                </p>

                {/* Subcategories as Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {service.subcategories.slice(0, 3).map((sub) => (
                        <span key={sub} className="px-4 py-1.5 bg-gray-50 rounded-lg text-[11px] font-bold text-text-2 border border-gray-100">
                            {sub.toUpperCase()}
                        </span>
                    ))}
                </div>

                {/* Modern Footer Action */}
                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-success font-bold text-xs uppercase tracking-tighter">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        Live Now
                    </span>

                    <Link to={`/services/${service.id}`} className="flex items-center gap-2 font-black text-sm text-text-1 group/btn">
                        VIEW DETAILS
                        <span className="w-8 h-8 rounded-full bg-text-1 text-white flex items-center justify-center group-hover/btn:bg-primary transition-colors">
                            <ArrowRight size={14} />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}