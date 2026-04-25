import { MapPin, Star } from 'lucide-react'
import { VerifiedBadge } from './VerifiedBadge'
import Image from '../../../shared/components/Image'
import { Button } from '../../../shared/components/Button'

/**
 * ServiceCard
 * Feed card matching the design: avatar + meta header, large title,
 * rounded image, description, Book Now pill button.
 */
export function ServiceCard({ service, onBookNow }) {
    return (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">

            {/* ── Header: avatar + name/location/skills + rating/availability ── */}
            <div className="px-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-3">

                    {/* Left: avatar + info */}
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                            <Image
                                src={service.avatar}
                                alt={'Hustle' + service.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <span className="absolute -top-0.5 -right-0.5">
                                <VerifiedBadge />
                            </span>
                        </div>
                        <div className="min-w-0 pt-0.5">
                            <p className="text-[15px] font-bold text-text-1 leading-tight truncate">
                                {service.name}
                            </p>
                            <div className="flex items-center gap-1 text-[12px] text-text-4 mt-1">
                                <MapPin size={11} strokeWidth={2} className="flex-shrink-0" />
                                <span className="truncate">{service.location}</span>
                            </div>
                            <p className="text-[12px] text-text-3 mt-0.5 truncate">
                                {service.skills.join(' | ')}
                            </p>
                        </div>
                    </div>

                    {/* Right: rating + availability */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-secondary fill-secondary" />
                            <span className="text-[13px] font-bold text-text-1">{service.rating}</span>
                            <span className="text-[12px] text-text-4">({service.reviews})</span>
                        </div>
                        {service.available && (
                            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#16A34A]">
                                <span className="w-2 h-2 rounded-full bg-primary-light flex-shrink-0" />
                                Available now
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Title ── */}
            <div className="px-4 pb-3">
                <p className="text-[17px] font-extrabold text-text-1 leading-snug">
                    {service.title}
                </p>
            </div>

            {/* ── Image ── */}
            <div className="px-4 pb-3">
                <div className="rounded-xl overflow-hidden h-44 bg-mist flex-shrink-0">
                    {service.img ? (
                        <img
                            src={service.img}
                            alt={service.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl font-black text-primary tracking-tight opacity-30">
                                HUSTLE
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Description ── */}
            <div className="px-4 pb-4 flex-1">
                <p className="text-[14px] text-text-3 leading-relaxed line-clamp-2">
                    {service.desc}
                </p>
            </div>

            {/* ── Book Now button ── */}
            <div className="px-4 pb-5">
                <Button
                    variant='primary'
                    onClick={() => onBookNow?.(service)}
                    className="h-11 w-fit px-12 active:scale-[0.98] text-[14px] font-bold rounded-full transition-all"
                >
                    Book Now
                </Button>
            </div>
        </div>
    )
}
