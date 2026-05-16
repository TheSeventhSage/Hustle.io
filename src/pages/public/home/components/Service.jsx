import { Link } from 'react-router-dom'
import { ArrowRight, Layers3, MapPin, Sparkles, Star } from 'lucide-react'
import { Button } from '../../../../shared/components/Button.jsx'
import { usePrimaryServices } from '../api/services.hooks.js'

function ServicePreviewSkeleton() {
    return (
        <div className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_18px_46px_rgba(7,18,14,0.06)]">
            <div className="aspect-[4/3] animate-pulse bg-[radial-gradient(circle_at_top,rgba(222,183,55,0.12),transparent_50%),linear-gradient(180deg,rgba(37,86,77,0.12)_0%,rgba(255,255,255,0.8)_100%)] dark:bg-[linear-gradient(180deg,rgba(16,36,32,0.8)_0%,rgba(22,51,45,0.95)_100%)]" />
            <div className="space-y-4 p-5">
                <div className="h-4 w-24 animate-pulse rounded-full bg-[var(--color-mist)] dark:bg-white/8" />
                <div className="h-6 w-4/5 animate-pulse rounded-full bg-[var(--color-mist)] dark:bg-white/8" />
                <div className="h-4 w-full animate-pulse rounded-full bg-[var(--color-mist)] dark:bg-white/8" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-[var(--color-mist)] dark:bg-white/8" />
            </div>
        </div>
    )
}

export function ServicesGridSection() {
    const { data, isLoading, isError } = usePrimaryServices({ per_page: 4 })
    const providers = data?.items ?? []

    return (
        <section className="bg-white py-24 dark:bg-[var(--color-bg)]">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/10 bg-[var(--color-bg)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--color-primary)] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:text-white">
                            <Sparkles size={14} className="text-[var(--color-secondary)]" />
                            Featured providers
                        </div>
                        <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-[var(--color-primary-500)] dark:text-white">
                            Discover standout professionals, with one refined provider card per artisan.
                        </h2>
                        <p className="text-lg font-light text-[var(--color-text-3)]">
                            Browse a cleaner home showcase, open a provider profile, and then inspect every service that provider offers before booking.
                        </p>
                    </div>

                    <Link to="/services" className="max-[600px]:hidden">
                        <Button variant="outline" className="w-auto border-[var(--color-primary-300)] px-6 text-[var(--color-primary-300)] dark:border-[var(--color-secondary)] dark:text-[var(--color-secondary)] dark:hover:bg-[var(--color-surface)]">
                            View full directory
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <ServicePreviewSkeleton key={item} />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-8 text-center text-sm text-amber-900 dark:border-amber-700/40 dark:bg-[var(--color-surface)] dark:text-amber-100">
                        Providers are temporarily unavailable. Refresh or open the full directory to try again.
                    </div>
                ) : providers.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-[var(--color-primary)]/15 bg-[var(--color-surface)] px-6 py-12 text-center shadow-sm dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]">
                        <p className="text-base font-semibold text-[var(--color-primary-500)] dark:text-white">No providers have been published yet.</p>
                        <p className="mt-2 text-sm text-[var(--color-text-3)]">New provider listings will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {providers.map((provider) => (
                            <article
                                key={provider.artisanAccountId}
                                className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_20px_55px_-30px_rgba(7,18,14,0.24)] transition-all duration-500 hover:-translate-y-2 hover:border-[var(--color-secondary)]/45 hover:shadow-[0_32px_85px_-38px_rgba(7,18,14,0.4)] dark:shadow-[0_24px_70px_-34px_rgba(0,0,0,0.6)]"
                            >
                                <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-secondary)]/75 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(222,183,55,0.15),transparent_56%),linear-gradient(180deg,rgba(37,86,77,0.12)_0%,rgba(255,255,255,0.82)_100%)] dark:bg-[linear-gradient(180deg,rgba(16,36,32,0.88)_0%,rgba(11,26,23,0.96)_100%)]">
                                    <img
                                        src={provider.primaryService.image}
                                        alt={provider.primaryService.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/12 to-transparent dark:from-[var(--color-primary-500)]/88" />
                                    <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                                        <Star size={12} className="fill-[var(--color-secondary)] text-[var(--color-secondary)]" />
                                        {provider.rating > 0 ? provider.rating.toFixed(1) : 'New'}
                                    </div>
                                    <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-white/18 bg-black/18 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/86 backdrop-blur-md">
                                        <Layers3 size={12} className="text-[var(--color-secondary)]" />
                                        {provider.servicesCount} service{provider.servicesCount === 1 ? '' : 's'}
                                    </div>

                                    <div className="absolute inset-x-4 bottom-4 rounded-[1.4rem] border border-white/12 bg-black/18 p-4 backdrop-blur-xl">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
                                            {provider.primaryService.categoryName}
                                        </p>
                                        <div className="mt-3 flex items-end justify-between gap-3">
                                            <h3 className="line-clamp-2 text-lg font-black leading-tight text-white">
                                                {provider.providerName}
                                            </h3>
                                            <span className="shrink-0 text-sm font-black text-[var(--color-secondary)]">
                                                {provider.primaryService.priceLabel}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-5 dark:bg-[linear-gradient(180deg,rgba(16,36,32,0.96)_0%,rgba(11,26,23,0.98)_100%)]">
                                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[var(--color-text-3)] dark:text-white/65">
                                        <img src={provider.primaryService.avatar} alt={provider.providerName} className="h-8 w-8 rounded-full object-cover" />
                                        <span className="truncate">{provider.primaryService.title}</span>
                                    </div>

                                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-3)] dark:text-white/68">
                                        {provider.providerBio}
                                    </p>

                                    <div className="mb-5 flex flex-wrap gap-2">
                                        {(provider.categoryNames.length ? provider.categoryNames : provider.primaryService.skills).slice(0, 3).map((label) => (
                                            <span
                                                key={label}
                                                className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary)] dark:border-white/10 dark:bg-white/6 dark:text-white/78"
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4 dark:border-white/10">
                                        <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-[var(--color-text-3)] dark:text-white/64">
                                            <MapPin size={14} className="shrink-0 text-[var(--color-secondary)]" />
                                            <span className="truncate">{provider.locationLabel}</span>
                                        </span>

                                        <Link
                                            to={`/services/${provider.artisanAccountId}?view=provider`}
                                            className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[var(--color-primary-500)] transition-colors hover:text-[var(--color-primary-300)] dark:text-white"
                                        >
                                            View Profile
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <Link to="/services" className="min-[610px]:hidden">
                    <Button variant="outline" className="mt-8 border-[var(--color-primary-300)] px-6 text-[var(--color-primary-300)] dark:border-[var(--color-secondary)] dark:text-[var(--color-secondary)] dark:hover:bg-[var(--color-surface)]">
                        View full directory
                    </Button>
                </Link>
            </div>
        </section>
    )
}
