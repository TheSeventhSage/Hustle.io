import { MapPin, Star } from 'lucide-react'
import { VerifiedBadge } from './VerifiedBadge'
import Image from '../../../shared/components/Image'
import { Button } from '../../../shared/components/Button'

/**
 * ProviderCard
 * Discovery card for a provider from GET /services/primary.
 *
 * A provider is NOT a single service — the primary service is only one
 * representative offering. This card leads with the provider's identity
 * (name, categories, how many services they offer) and treats the featured
 * service as secondary. See normalizePrimaryProvider() for the field shape.
 *
 * Expected shape (normalized provider):
 *   providerName, providerBio, categoryNames[], servicesCount, rating,
 *   reviewCount, locationLabel, primaryService{ title, description, avatar }
 */
function getInitials(name) {
    return String(name || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('') || 'HP'
}

export function ProviderCard({ provider, onViewProfile }) {
    const displayName = provider.providerName || 'Verified professional'
    const displayRating = provider.rating ? Number(provider.rating).toFixed(1) : null
    const categories = provider.categoryNames?.length
        ? provider.categoryNames
        : ['Professional services']
    const servicesCount = provider.servicesCount || 0
    const featuredTitle = provider.primaryService?.title
    const avatar = provider.primaryService?.avatar
    const location = provider.locationLabel && provider.locationLabel !== 'Location not specified'
        ? provider.locationLabel
        : null

    const rawDescription = provider.primaryService?.description ?? provider.providerBio
    const description = rawDescription
        && rawDescription !== 'No description provided yet.'
        && rawDescription !== 'No provider bio available yet.'
        ? rawDescription
        : null

    return (
        <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">

            {/* ── Header: avatar + identity + rating ── */}
            <div className="flex items-start justify-between gap-3 px-5 pt-5">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="relative flex-shrink-0">
                        <div className="h-[52px] w-[52px] overflow-hidden rounded-full ring-2 ring-secondary/40">
                            {avatar ? (
                                <Image src={avatar} alt={displayName} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary-pale to-secondary text-[16px] font-extrabold text-primary-dark">
                                    {getInitials(displayName)}
                                </div>
                            )}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5">
                            <VerifiedBadge />
                        </span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-[17px] font-extrabold leading-tight text-text-1">
                            {displayName}
                        </h3>
                        {location && (
                            <div className="mt-1 flex items-center gap-1 text-[12px] text-text-4">
                                <MapPin size={12} strokeWidth={2} className="flex-shrink-0" />
                                <span className="truncate">{location}</span>
                            </div>
                        )}
                    </div>
                </div>

                {displayRating && (
                    <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-mist px-2.5 py-1">
                        <Star size={13} className="fill-secondary text-secondary" />
                        <span className="text-[12.5px] font-bold text-text-1">{displayRating}</span>
                        {provider.reviewCount > 0 && (
                            <span className="text-[11px] text-text-4">({provider.reviewCount})</span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Category chips ── */}
            <div className="flex flex-wrap gap-1.5 px-5 pt-3.5">
                {categories.slice(0, 2).map((category, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center rounded-md bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-primary dark:bg-primary/15"
                    >
                        {category}
                    </span>
                ))}
                {categories.length > 2 && (
                    <span className="inline-flex items-center rounded-md bg-mist px-2 py-1 text-[11px] font-semibold text-text-3">
                        +{categories.length - 2}
                    </span>
                )}
            </div>

            {/* ── Services count (accent) + featured service ── */}
            <div className="px-5 pt-3.5">
                <p className="text-[14px] font-black tabular-nums text-[var(--color-accent-gold)]">
                    {servicesCount}
                    <span className="ml-1 font-bold text-text-2">service{servicesCount === 1 ? '' : 's'} available</span>
                </p>
                {featuredTitle && (
                    <p className="mt-1 text-[12px] text-text-4">
                        Featured service: <span className="font-semibold text-text-3">{featuredTitle}</span>
                    </p>
                )}
            </div>

            {/* ── Description ── */}
            <div className="flex-1 px-5 pt-3">
                <p className="line-clamp-2 text-[13px] leading-relaxed text-text-3">
                    {description ?? `${displayName} is a verified provider ready to help with your next project.`}
                </p>
            </div>

            {/* ── View Profile ── */}
            <div className="px-5 pb-5 pt-4">
                <Button
                    variant="primary"
                    onClick={() => onViewProfile?.(provider)}
                    className="h-11 w-full rounded-full text-[14px] font-bold transition-all active:scale-[0.98]"
                >
                    View Profile
                </Button>
            </div>
        </div>
    )
}
