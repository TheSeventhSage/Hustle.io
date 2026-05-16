import { Link } from 'react-router-dom'
import { Heart, MapPin, ShieldCheck, Star } from 'lucide-react'

export function ServiceCard({ service, provider }) {
    const featuredService = provider?.primaryService ?? service
    const providerName = provider?.providerName ?? featuredService.providerName
    const rating = provider?.rating ?? featuredService.rating
    const reviewCount = provider?.reviewCount ?? featuredService.reviewCount
    const locationLabel = provider?.locationLabel ?? featuredService.locationLabel
    const href = provider
        ? `/services/${provider.artisanAccountId}?view=provider`
        : `/services/${featuredService.id}`
    const title = featuredService.title
    const categoryName = featuredService.categoryName
    const description = featuredService.description
    const image = featuredService.image
    const avatar = featuredService.avatar
    const tags = provider
        ? (provider.categoryNames?.length ? provider.categoryNames : featuredService.skills ?? [])
        : featuredService.skills ?? []
    const priceLabel = featuredService.priceLabel
    const experienceLabel = featuredService.experienceLabel

    return (
        <article className="group overflow-hidden rounded-2xl border border-[#e4e5e7] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_22px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-[var(--color-surface)] dark:hover:shadow-[0_14px_36px_rgba(0,0,0,0.34)]">
            <Link to={href} className="block">
                <div className="relative h-52 overflow-hidden bg-[#f3f4f6] dark:bg-white/6">
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/96 text-[#62646a] shadow-sm dark:bg-black/38 dark:text-white/72">
                        <Heart size={16} />
                    </div>
                </div>

                <div className="p-4">
                    <span className="rounded-full bg-[#f5f5f5] px-2.5 py-1 text-[11px] font-semibold text-[#62646a] dark:bg-white/6 dark:text-white/62">
                        {experienceLabel}
                    </span>
                    <div className="mt-2 flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3">
                            <img
                                src={avatar}
                                alt={providerName}
                                className="h-8 w-8 rounded-full object-cover"
                            />
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-bold text-[#222325] dark:text-white">{providerName}</p>
                                    {reviewCount > 0 ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#eef7f1] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)] dark:bg-[var(--color-primary)]/16 dark:text-[var(--color-secondary)]">
                                            <ShieldCheck size={10} />
                                        </span>
                                    ) : null}
                                </div>
                                <p className="truncate text-xs text-[#74767e] dark:text-white/50">{categoryName}</p>
                            </div>
                        </div>


                        <div className="flex items-center gap-2 text-sm">
                            <span className="inline-flex items-center gap-1 font-bold text-[#ffb33e]">
                                <Star size={14} className="fill-current" />
                                {rating > 0 ? rating.toFixed(1) : 'New'}
                            </span>
                            <span className="text-[#74767e] dark:text-white/50">
                                ({reviewCount})
                            </span>
                        </div>
                    </div>

                    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a9da4] dark:text-white/34">Service</p>
                    <h3 className="mt-2 line-clamp-2 text-[16px] font-semibold leading-6 text-[#222325] transition-colors group-hover:text-[var(--color-primary)] dark:text-white dark:group-hover:text-[var(--color-secondary)]">
                        {title}

                        {provider ? (
                            <em className="pl-1 text-[9px] font-semibold tracking-[0.16em] text-[#74767e] dark:text-white/46">
                                {provider.servicesCount > 1 ? `+ ${provider.servicesCount} more services` : ` `}
                            </em>
                        ) : null}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#62646a] dark:text-white/60">
                        {description}
                    </p>


                    <div className="mt-2 flex items-center justify-between gap-3 text-sm">

                        <div>
                            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a9da4] dark:text-white/34">Location</p>
                            <span className="inline-flex items-center gap-1 text-[#74767e] dark:text-white/50">
                                <MapPin size={13} />
                                <span className="truncate">{locationLabel}</span>
                            </span>
                        </div>
                    </div>

                    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a9da4] dark:text-white/34">Service tags</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {tags.slice(0, 2).map((skill) => (
                            <span
                                key={skill}
                                className="rounded-full bg-[#f5f5f5] px-2.5 py-1 text-[11px] font-semibold text-[#62646a] dark:bg-white/6 dark:text-white/62"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>

                    <div className="mt-5 border-t border-[#efeff0] pt-4 text-right dark:border-white/10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#74767e] dark:text-white/38">
                            Starting at
                        </p>
                        <p className="mt-1 text-lg font-black text-[#222325] dark:text-white">{priceLabel}</p>
                    </div>
                </div>
            </Link>
        </article>
    )
}
