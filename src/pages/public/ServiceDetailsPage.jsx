import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
    ArrowRight,
    BriefcaseBusiness,
    ChevronLeft,
    Clock3,
    Layers3,
    MapPin,
    ShieldCheck,
    Sparkles,
    Star,
} from 'lucide-react'
import { PublicLayout } from './components/PublicLayout.jsx'
import { Button } from '../../shared/components/Button.jsx'
import { useArtisanServices, useService } from './home/api/services.hooks.js'
import { formatDate } from '../../shared/lib/format.js'

function DetailSkeleton() {
    return (
        <div className="space-y-8">
            <div className="h-[280px] animate-pulse rounded-2xl bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:bg-[var(--color-surface)]" />
            <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-5">
                    <div className="h-5 w-28 animate-pulse rounded-full bg-[#eceef0] dark:bg-white/8" />
                    <div className="h-12 w-4/5 animate-pulse rounded-full bg-[#eceef0] dark:bg-white/8" />
                    <div className="h-4 w-full animate-pulse rounded-full bg-[#eceef0] dark:bg-white/8" />
                    <div className="h-4 w-11/12 animate-pulse rounded-full bg-[#eceef0] dark:bg-white/8" />
                </div>
                <div className="h-[320px] animate-pulse rounded-2xl bg-white dark:bg-[var(--color-surface)]" />
            </div>
        </div>
    )
}

function DetailField({ icon: Icon, label, value }) {
    return (
        <div className="rounded-2xl border border-[#e4e5e7] bg-[#fafafa] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-[var(--color-bg)]">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--color-primary)] dark:bg-[var(--color-surface)] dark:text-[var(--color-secondary)]">
                    <Icon size={18} />
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9da4] dark:text-white/34">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-[#222325] dark:text-white">{value}</p>
                </div>
            </div>
        </div>
    )
}

function SectionShell({ children, className = '' }) {
    return (
        <section className={`bg-[#f7f7f7] py- dark:bg-[var(--color-bg)] ${className}`}>
            {children}
        </section>
    )
}

function getMarketplaceLocationValue(service = {}) {
    return (
        service?.raw?.location_text
        || service?.raw?.city_name
        || service?.raw?.country_name
        || service?.locationLabel
        || 'Location not specified'
    )
}

function ProviderServiceCard({ service }) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-[#e4e5e7] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-[var(--color-surface)] dark:hover:shadow-[0_14px_36px_rgba(0,0,0,0.34)]">
            <div className="relative h-52 overflow-hidden bg-[#f3f4f6] dark:bg-white/6">
                <img src={service.image} alt={service.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)] shadow-sm dark:bg-black/35 dark:text-[var(--color-secondary)]">
                    <Sparkles size={12} />
                    {service.categoryName}
                </div>
                <div className="absolute right-4 bottom-4 rounded-full bg-white/95 px-3 py-1.5 text-sm font-black text-[#222325] shadow-sm dark:bg-black/40 dark:text-white">
                    {service.priceLabel}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a9da4] dark:text-white/34">Service</p>
                <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-tight text-[#222325] dark:text-white">{service.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#62646a] dark:text-white/62">
                    {service.description}
                </p>

                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a9da4] dark:text-white/34">Highlights</p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {(service.skills ?? []).slice(0, 3).map((skill) => (
                        <span
                            key={skill}
                            className="rounded-full bg-[#f5f5f5] px-3 py-1.5 text-[11px] font-semibold text-[#62646a] dark:bg-white/6 dark:text-white/68"
                        >
                            {skill}
                        </span>
                    ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#efeff0] pt-4 dark:border-white/10">
                    <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-[#74767e] dark:text-white/50">
                        <MapPin size={14} className="shrink-0 text-[var(--color-primary)]" />
                        <span className="truncate">{getMarketplaceLocationValue(service)}</span>
                    </span>

                    <Link to={`/services/${service.id}`} className="group/btn flex shrink-0 items-center gap-2 text-sm font-bold text-[#222325] transition-colors hover:text-[var(--color-primary)] dark:text-white">
                        View service
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-white transition-all duration-300 group-hover/btn:bg-[var(--color-secondary)] group-hover/btn:text-[var(--color-primary-500)]">
                            <ArrowRight size={14} />
                        </span>
                    </Link>
                </div>
            </div>
        </article>
    )
}

function ProviderModePage({ artisanId }) {
    const { data, isLoading, isError, refetch } = useArtisanServices(artisanId, { per_page: 24 }, { enabled: Boolean(artisanId) })
    const services = data?.items ?? []
    const leadService = data?.leadService ?? null
    const categoryLabels = [...new Set(services.map((service) => service.categoryName).filter(Boolean))].slice(0, 4)
    const locationLabel = getMarketplaceLocationValue(leadService)

    return (
        <div className="min-h-screen bg-[#f7f7f7] text-[#404145] dark:bg-[var(--color-bg)] dark:text-[var(--color-text-2)]">
            <section className="border-b border-[#e4e5e7] bg-white dark:border-white/10 dark:bg-[var(--color-surface)]">
                <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-12 sm:px-6 lg:px-8">
                    <Link to="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-[#74767e] transition-colors hover:text-[#222325] dark:text-white/50 dark:hover:text-white">
                        <ChevronLeft size={18} />
                        Back to services
                    </Link>

                    <div className="mt-6">
                        {isLoading ? (
                            <DetailSkeleton />
                        ) : isError ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center dark:border-red-400/20 dark:bg-red-500/8">
                                <p className="text-xl font-bold text-[#222325] dark:text-white">Unable to load this provider.</p>
                                <p className="mt-3 text-sm text-[#62646a] dark:text-white/58">The provider profile request failed. Retry the page or return to the directory.</p>
                                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => refetch()}
                                        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-primary-400)]"
                                    >
                                        Retry request
                                    </button>
                                    <Link to="/services">
                                        <Button variant="outline" className="h-12 rounded-full px-6">
                                            Return to directory
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : !data?.artisanAccountId ? (
                            <div className="rounded-2xl border border-dashed border-[#d5d7da] bg-white px-6 py-14 text-center dark:border-white/12 dark:bg-[var(--color-surface)]">
                                <p className="text-xl font-bold text-[#222325] dark:text-white">Provider not found.</p>
                                <p className="mt-3 text-sm text-[#62646a] dark:text-white/58">This provider is no longer available or the artisan id is invalid.</p>
                            </div>
                        ) : (
                            <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                                <div className="space-y-6 flex gap-3 ">
                                    <div className="rounded-2xl border border-[#e4e5e7] bg-white p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-[#eef7f1] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary)] dark:bg-[var(--color-primary)]/16 dark:text-[var(--color-secondary)]">
                                            <Sparkles size={13} />
                                            Provider profile
                                        </div>

                                        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-[#222325] dark:text-white sm:text-5xl">
                                            {data.providerName}
                                        </h1>

                                        <p className="mt-5 max-w-3xl text-base leading-8 text-[#62646a] dark:text-white/62">
                                            {data.providerBio}
                                        </p>

                                        <div className="mt-8 flex flex-wrap gap-3">
                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#e4e5e7] bg-[#fafafa] px-4 py-2 text-sm font-semibold text-[#222325] dark:border-white/10 dark:bg-[var(--color-bg)] dark:text-white/82">
                                                <Star size={14} className="fill-[var(--color-secondary)] text-[var(--color-secondary)]" />
                                                {data.rating > 0 ? data.rating.toFixed(1) : 'New'} rating
                                            </span>
                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#e4e5e7] bg-[#fafafa] px-4 py-2 text-sm font-semibold text-[#222325] dark:border-white/10 dark:bg-[var(--color-bg)] dark:text-white/82">
                                                <Layers3 size={14} className="text-[var(--color-primary)]" />
                                                {data.servicesCount} service{data.servicesCount === 1 ? '' : 's'}
                                            </span>
                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#e4e5e7] bg-[#fafafa] px-4 py-2 text-sm font-semibold text-[#222325] dark:border-white/10 dark:bg-[var(--color-bg)] dark:text-white/82">
                                                <MapPin size={14} className="text-[var(--color-primary)]" />
                                                {locationLabel}
                                            </span>
                                        </div>

                                        {categoryLabels.length > 0 ? (
                                            <div className="mt-6">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9da4] dark:text-white/34">Provider categories</p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {categoryLabels.map((category) => (
                                                        <span
                                                            key={category}
                                                            className="rounded-full bg-[#f5f5f5] px-3 py-1.5 text-[11px] font-semibold text-[#62646a] dark:bg-white/6 dark:text-white/68"
                                                        >
                                                            {category}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="overflow-hidden rounded-2xl border border-[#e4e5e7] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                        <img src={leadService?.image} alt={data.providerName} className="h-[340px] w-full object-cover sm:h-[420px]" />
                                    </div>
                                </div>

                                <aside className="space-y-6">
                                    <div className="rounded-2xl border border-[#e4e5e7] bg-white p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9da4] dark:text-white/34">Featured service</p>
                                        <p className="mt-3 text-2xl font-black text-[#222325] dark:text-white">{leadService?.title ?? 'Primary service'}</p>
                                        <p className="mt-2 text-sm text-[#62646a] dark:text-white/58">{leadService?.priceLabel ?? 'Pricing on request'}</p>

                                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                            <DetailField icon={ShieldCheck} label="Availability" value={leadService?.availabilityLabel ?? 'Available for bookings'} />
                                            <DetailField icon={BriefcaseBusiness} label="Category" value={leadService?.categoryName ?? 'Professional service'} />
                                            <DetailField icon={MapPin} label="Coverage" value={locationLabel} />
                                            <DetailField icon={Layers3} label="Services" value={`${data.servicesCount}`} />
                                        </div>

                                        <div className="mt-6 grid grid-cols-2 gap-3">
                                            {leadService?.id ? (
                                                <Link to={`/services/${leadService.id}`}>
                                                    <Button variant="solid" className="h-12 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-400)]">
                                                        View service
                                                    </Button>
                                                </Link>
                                            ) : <div />}
                                            <Link to="/services">
                                                <Button variant="outline" className="h-12 rounded-xl">
                                                    Directory
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {!isLoading && !isError && data?.artisanAccountId ? (
                <>
                    <SectionShell className="bg-white py-0 dark:bg-[var(--color-bg)]">
                        <div className="mx-auto max-w-[1440px] grid gap-8 px-4 py-16 sm:px-6 lg:px-8    grid-cols-1">
                            <div className="rounded-2xl border border-[#e4e5e7] bg-white p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9da4] dark:text-white/34">Artisans Bio</p>
                                <p className="mt-4 text-base leading-8 text-[#62646a] dark:text-white/62">
                                    {data.providerBio}
                                </p>

                                {categoryLabels.length > 0 ? (
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        {categoryLabels.map((category) => (
                                            <span
                                                key={category}
                                                className="rounded-full bg-[#f5f5f5] px-4 py-2 text-sm font-semibold text-[#62646a] dark:bg-white/6 dark:text-white/68"
                                            >
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            {/* <div className="rounded-2xl border border-[#e4e5e7] bg-white p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9da4] dark:text-white/34">Provider snapshot</p>
                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <DetailField icon={Layers3} label="Services published" value={`${data.servicesCount}`} />
                                    <DetailField icon={Star} label="Average rating" value={data.rating > 0 ? data.rating.toFixed(1) : 'New provider'} />
                                    <DetailField icon={BriefcaseBusiness} label="Featured category" value={leadService?.categoryName ?? 'Not specified'} />
                                    <DetailField icon={MapPin} label="Coverage" value={locationLabel} />
                                </div>
                            </div> */}
                        </div>
                    </SectionShell>

                    <SectionShell className="pt-0">
                        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9da4] dark:text-white/34">Provider services</p>
                                    <h2 className="mt-3 text-3xl font-extrabold text-[#222325] dark:text-white">
                                        Choose the exact service that fits your brief.
                                    </h2>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#e4e5e7] bg-white px-4 py-2 text-sm font-semibold text-[#222325] dark:border-white/10 dark:bg-[var(--color-surface)] dark:text-white/82">
                                    <Layers3 size={15} className="text-[var(--color-primary)]" />
                                    {services.length} service{services.length === 1 ? '' : 's'}
                                </div>
                            </div>

                            {services.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-4">
                                    {services.map((service) => (
                                        <ProviderServiceCard key={service.id} service={service} />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-[#d5d7da] bg-white px-6 py-16 text-center dark:border-white/12 dark:bg-[var(--color-surface)]">
                                    <p className="text-lg font-bold text-[#222325] dark:text-white">No services are available for this provider.</p>
                                    <p className="mt-2 text-sm text-[#62646a] dark:text-white/58">This profile loaded correctly, but there are no published services to show yet.</p>
                                </div>
                            )}
                        </div>
                    </SectionShell>
                </>
            ) : null}
        </div>
    )
}

function ExactServiceModePage({ serviceId }) {
    const { data: service, isLoading, isError, refetch } = useService(serviceId, { enabled: Boolean(serviceId) })
    const providerViewLink = service?.raw?.artisan_account_id ? `/services/${service.raw.artisan_account_id}?view=provider` : null
    const locationLabel = getMarketplaceLocationValue(service)

    return (
        <div className="min-h-screen bg-[#f7f7f7] text-[#404145] dark:bg-[var(--color-bg)] dark:text-[var(--color-text-2)]">
            <section className="border-b border-[#e4e5e7] bg-white dark:border-white/10 dark:bg-[var(--color-surface)]">
                <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-12 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-[#74767e] dark:text-white/45">
                        <Link to="/services" className="transition-colors hover:text-[#222325] dark:hover:text-white">
                            Services
                        </Link>
                        <ChevronLeft size={14} className="rotate-180" />
                        <span>{service?.categoryName ?? 'Service detail'}</span>
                    </div>

                    <div className="mt-5">
                        {isLoading ? (
                            <DetailSkeleton />
                        ) : isError ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center dark:border-red-400/20 dark:bg-red-500/8">
                                <p className="text-xl font-bold text-[#222325] dark:text-white">Unable to load this service.</p>
                                <p className="mt-3 text-sm text-[#62646a] dark:text-white/58">The public detail request failed. Retry the page or return to the directory.</p>
                                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => refetch()}
                                        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-primary-400)]"
                                    >
                                        Retry request
                                    </button>
                                    <Link to="/services">
                                        <Button variant="outline" className="h-12 rounded-full px-6">
                                            Return to directory
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : !service?.id ? (
                            <div className="rounded-2xl border border-dashed border-[#d5d7da] bg-white px-6 py-14 text-center dark:border-white/12 dark:bg-[var(--color-surface)]">
                                <p className="text-xl font-bold text-[#222325] dark:text-white">Service not found.</p>
                                <p className="mt-3 text-sm text-[#62646a] dark:text-white/58">This listing is no longer available or the service id is invalid.</p>
                            </div>
                        ) : (
                            <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                                <div className="flex gap-3 space-y-6">
                                    <div className=" w-full rounded-2xl border border-[#e4e5e7] bg-white p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[var(--color-surface)] ">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="max-w-3xl">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9da4] dark:text-white/34">Service category</p>
                                                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#eef7f1] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary)] dark:bg-[var(--color-primary)]/16 dark:text-[var(--color-secondary)]">
                                                    <Sparkles size={12} />
                                                    {service.categoryName}
                                                </div>
                                                <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-[#222325] dark:text-white sm:text-4xl">
                                                    {service.title}
                                                </h1>
                                            </div>

                                            <div className="rounded-2xl border border-[#e4e5e7] bg-[#fafafa] px-5 py-4 text-right dark:border-white/10 dark:bg-[var(--color-bg)]">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a9da4] dark:text-white/34">Starting at</p>
                                                <p className="mt-2 text-2xl font-black text-[#222325] dark:text-white">{service.priceLabel}</p>
                                                <p className="mt-1 text-sm text-[#74767e] dark:text-white/50">{service.pricingLabel}</p>
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9da4] dark:text-white/34">About this service</p>
                                            <p className="mt-2 text-base leading-7 text-[#62646a] dark:text-white/62">
                                                {service.description} Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cum cumque quos illum, qui facilis inventore debitis, animi facere enim unde culpa ducimus assumenda? Ratione totam repellat eum sint nesciunt neque!
                                            </p>
                                        </div>

                                        <div className="mt-6 flex flex-wrap gap-3">
                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#e4e5e7] bg-white px-4 py-2 text-sm font-semibold text-[#222325] dark:border-white/10 dark:bg-[var(--color-bg)] dark:text-white/82">
                                                <Star size={14} className="fill-[var(--color-secondary)] text-[var(--color-secondary)]" />
                                                {service.rating > 0 ? service.rating.toFixed(1) : 'New'} rating
                                            </span>
                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#e4e5e7] bg-white px-4 py-2 text-sm font-semibold text-[#222325] dark:border-white/10 dark:bg-[var(--color-bg)] dark:text-white/82">
                                                <Layers3 size={14} className="text-[var(--color-primary)]" />
                                                {service.reviewCount} review{service.reviewCount === 1 ? '' : 's'}
                                            </span>
                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#e4e5e7] bg-white px-4 py-2 text-sm font-semibold text-[#222325] dark:border-white/10 dark:bg-[var(--color-bg)] dark:text-white/82">
                                                <MapPin size={14} className="text-[var(--color-primary)]" />
                                                {locationLabel}
                                            </span>
                                        </div>
                                    </div>

                                    <div className=" w-full overflow-hidden rounded-2xl border border-[#e4e5e7] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                        <img src={service.image} alt={service.title} className="h-[360px] w-full object-cover sm:h-[440px]" />
                                    </div>
                                </div>

                                <aside className="space-y-6">
                                    <div className="rounded-2xl border border-[#e4e5e7] bg-white p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9da4] dark:text-white/34">Booking snapshot</p>
                                        <p className="mt-2 text-sm text-[#62646a] dark:text-white/58">{service.pricingLabel}</p>
                                        <p className="mt-1 text-4xl font-black text-[#222325] dark:text-white">{service.priceLabel}</p>

                                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                            <DetailField icon={ShieldCheck} label="Availability" value={service.availabilityLabel} />
                                            <DetailField icon={BriefcaseBusiness} label="Experience" value={service.experienceLabel} />
                                            <DetailField icon={MapPin} label="Coverage" value={locationLabel} />
                                            {service.raw?.created_at ? (
                                                <DetailField icon={Clock3} label="Published" value={formatDate(service.raw.created_at)} />
                                            ) : null}
                                        </div>

                                        <div className="mt-6 border-t border-[#efeff0] pt-6 dark:border-white/10">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9da4] dark:text-white/34">Provider</p>
                                            <div className="mt-3 flex items-center gap-3">
                                                <img src={service.avatar} alt={service.providerName} className="h-12 w-12 rounded-full object-cover" />
                                                <div className="min-w-0">
                                                    <p className="truncate text-base font-bold text-[#222325] dark:text-white">{service.providerName}</p>
                                                    <p className="truncate text-sm text-[#74767e] dark:text-white/50">{locationLabel}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 grid grid-cols-2 gap-3">
                                            <Link to="/sign-in">
                                                <Button variant="solid" className="h-12 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-400)]">
                                                    Sign in to book
                                                </Button>
                                            </Link>
                                            {providerViewLink ? (
                                                <Link to={providerViewLink}>
                                                    <Button variant="outline" className="h-12 rounded-xl">
                                                        Provider services
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Link to="/services">
                                                    <Button variant="outline" className="h-12 rounded-xl">
                                                        More services
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-[#e4e5e7] bg-white p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9da4] dark:text-white/34">Service facts</p>
                                        <div className="mt-4 space-y-3 text-sm text-[#62646a] dark:text-white/58">
                                            <div className="flex items-start justify-between gap-3 border-b border-[#efeff0] pb-3 dark:border-white/10">
                                                <span>Category</span>
                                                <span className="font-semibold text-[#222325] dark:text-white">{service.categoryName}</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-3 border-b border-[#efeff0] pb-3 dark:border-white/10">
                                                <span>Pricing type</span>
                                                <span className="font-semibold text-[#222325] dark:text-white">{service.pricingLabel}</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-3 border-b border-[#efeff0] pb-3 dark:border-white/10">
                                                <span>Reviews</span>
                                                <span className="font-semibold text-[#222325] dark:text-white">{service.reviewCount}</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-3">
                                                <span>Status</span>
                                                <span className="font-semibold text-[#222325] dark:text-white">{service.availabilityLabel}</span>
                                            </div>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {!isLoading && !isError && service?.id ? (
                <section className="mx-auto max-w-[1440px] px-4 pb-20 pt-2 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-[#e4e5e7] bg-white p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a9da4] dark:text-white/34">Client reviews</p>
                                <h2 className="mt-3 text-3xl font-extrabold text-[#222325] dark:text-white">
                                    Recent feedback on this service
                                </h2>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#e4e5e7] bg-[#fafafa] px-4 py-2 text-sm font-semibold text-[#222325] dark:border-white/10 dark:bg-[var(--color-bg)] dark:text-white/82">
                                <Star size={15} className="fill-[var(--color-secondary)] text-[var(--color-secondary)]" />
                                {service.rating > 0 ? service.rating.toFixed(1) : 'New'} average
                            </div>
                        </div>

                        {service.reviews.length > 0 ? (
                            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                                {service.reviews.map((review, index) => (
                                    <article key={review.id ?? `${review.reviewerName}-${index}`} className="rounded-2xl border border-[#e4e5e7] bg-[#fafafa] p-5 dark:border-white/10 dark:bg-[var(--color-bg)]">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-[#222325] dark:text-white">{review.reviewerName}</p>
                                                {review.created_at ? (
                                                    <p className="mt-1 text-xs text-[#74767e] dark:text-white/50">{formatDate(review.created_at)}</p>
                                                ) : null}
                                            </div>
                                            <div className="inline-flex items-center gap-2 rounded-full border border-[#e4e5e7] bg-white px-3 py-1.5 text-sm font-semibold text-[#222325] dark:border-white/10 dark:bg-[var(--color-surface)] dark:text-white">
                                                <Star size={14} className="fill-[var(--color-secondary)] text-[var(--color-secondary)]" />
                                                {review.rating.toFixed(1)}
                                            </div>
                                        </div>
                                        <p className="mt-4 text-sm leading-7 text-[#62646a] dark:text-white/62">
                                            {review.comment || 'No written review was provided.'}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-6 text-sm text-[#62646a] dark:text-white/58">No reviews have been published for this service yet.</p>
                        )}
                    </div>
                </section>
            ) : null}
        </div>
    )
}

export default function ServiceDetailsPage() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const isProviderView = searchParams.get('view') === 'provider'

    return (
        <PublicLayout hideHeader>
            {isProviderView ? <ProviderModePage artisanId={id} /> : <ExactServiceModePage serviceId={id} />}
        </PublicLayout>
    )
}
