import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapPin, RefreshCw, Search, SlidersHorizontal, Star } from 'lucide-react'
import { PublicLayout } from './components/PublicLayout.jsx'
import { ServiceCard } from './components/ServiceCard.jsx'
import { usePrimaryServices } from './home/api/services.hooks.js'
import { hustlesService } from '../../features/hustles/hustles.service.js'
import { queryKeys } from '../../services/query-keys.js'
import { locationService } from '../../shared/api/location.service.js'
import { unwrapItems } from '../../shared/lib/api/response.js'

function ServicesPageSkeleton() {
    return (
        <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[var(--color-surface)]">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="h-16 w-16 flex-shrink-0 animate-pulse rounded-lg bg-gray-200 dark:bg-white/8" />
                    <div className="flex-1 space-y-3">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-white/8" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-white/8" />
                        <div className="flex gap-2">
                            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-white/8" />
                            <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-white/8" />
                        </div>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-white/8" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-white/8" />
                </div>
            </div>
        </article>
    )
}

function FilterChip({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors ${active
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/12 dark:bg-[var(--color-surface)] dark:text-white/80 dark:hover:bg-white/5'
                }`}
        >
            {children}
        </button>
    )
}

export default function ServicesPage() {
    const [searchDraft, setSearchDraft] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedCountryId, setSelectedCountryId] = useState('')
    const [selectedCityId, setSelectedCityId] = useState('')
    const [minRating, setMinRating] = useState('')
    const [sortBy, setSortBy] = useState('recommended')

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setSearchQuery(searchDraft.trim())
        }, 400)

        return () => window.clearTimeout(timeout)
    }, [searchDraft])

    useEffect(() => {
        setSelectedCityId('')
    }, [selectedCountryId])

    const { data: categories = [] } = useQuery({
        queryKey: queryKeys.marketplace.categories(),
        queryFn: hustlesService.getCategories,
        select: (response) => unwrapItems(response),
        staleTime: 5 * 60 * 1000,
    })

    const { data: countries = [] } = useQuery({
        queryKey: queryKeys.countries.list({ per_page: 100 }),
        queryFn: () => locationService.getCountries({ per_page: 100 }),
        select: (response) => unwrapItems(response),
        staleTime: 10 * 60 * 1000,
    })

    const { data: cities = [] } = useQuery({
        queryKey: queryKeys.cities.list({ country_id: selectedCountryId || undefined, per_page: 100 }),
        queryFn: () => locationService.getCities({ country_id: selectedCountryId || undefined, per_page: 100 }),
        select: (response) => unwrapItems(response),
        enabled: Boolean(selectedCountryId),
        staleTime: 10 * 60 * 1000,
    })

    const { data, isLoading, isError, refetch } = usePrimaryServices({
        q: searchQuery || undefined,
        category_id: selectedCategory || undefined,
        country_id: selectedCountryId || undefined,
        city_id: selectedCityId || undefined,
        min_rating: minRating || undefined,
        per_page: 24,
    })

    const providers = data?.items ?? []
    const meta = data?.meta ?? null
    const totalPrimaryServices = meta?.total ?? providers.length

    const activeCategory = categories.find((category) => String(category.id) === selectedCategory)
    const activeCountry = countries.find((country) => String(country.id) === selectedCountryId)
    const activeCity = cities.find((city) => String(city.id ?? city.city_id) === selectedCityId)

    const visibleProviders = [...providers].sort((left, right) => {
        if (sortBy === 'highest-rated') return right.rating - left.rating
        if (sortBy === 'most-reviewed') return right.reviewCount - left.reviewCount
        if (sortBy === 'price-low') return (left.primaryService?.priceAmount ?? 0) - (right.primaryService?.priceAmount ?? 0)
        if (sortBy === 'price-high') return (right.primaryService?.priceAmount ?? 0) - (left.primaryService?.priceAmount ?? 0)

        const leftDate = new Date(left.primaryService?.posted_at ?? left.primaryService?.created_at ?? 0).getTime()
        const rightDate = new Date(right.primaryService?.posted_at ?? right.primaryService?.created_at ?? 0).getTime()
        if (sortBy === 'newest') return rightDate - leftDate

        const leftScore = (left.rating * 20) + left.reviewCount + (left.primaryService?.isActive ? 6 : 0)
        const rightScore = (right.rating * 20) + right.reviewCount + (right.primaryService?.isActive ? 6 : 0)
        return rightScore - leftScore
    })

    const clearFilters = () => {
        setSearchDraft('')
        setSearchQuery('')
        setSelectedCategory('')
        setSelectedCountryId('')
        setSelectedCityId('')
        setMinRating('')
        setSortBy('recommended')
    }

    const hasFilters = Boolean(searchDraft || selectedCategory || selectedCountryId || selectedCityId || minRating || sortBy !== 'recommended')

    return (
        <PublicLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-[var(--color-bg)]">
                <section className="relative overflow-hidden bg-white dark:bg-[var(--color-surface)]">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-radial from-[var(--color-primary)]/20 via-[var(--color-primary)]/10 to-transparent opacity-60" />

                    <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        <div className="max-w-3xl">
                            <h1 className="text-5xl font-bold leading-tight text-gray-900 dark:text-white">
                                Locate your choice service provider
                            </h1>
                            <p className="mt-4 text-lg text-gray-600 dark:text-white/70">
                                The provider directory uses the primary services endpoint, so each artisan appears once and filters are sent as documented query params.
                            </p>
                        </div>

                        <div className="mt-12 rounded-lg bg-white p-6 shadow-lg dark:bg-[var(--color-bg)]">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Provider filters</h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
                                        Search, category, country, city, and minimum rating are applied on `GET /services/primary`.
                                    </p>
                                </div>
                                {hasFilters ? (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-sm font-medium text-red-500 hover:text-red-600"
                                    >
                                        Clear all
                                    </button>
                                ) : null}
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                                <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-white/12 dark:bg-[var(--color-surface)]">
                                    <Search size={20} className="text-gray-400 dark:text-white/40" />
                                    <input
                                        type="text"
                                        value={searchDraft}
                                        onChange={(event) => setSearchDraft(event.target.value)}
                                        placeholder="Search title, provider, or keyword"
                                        className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-white/40"
                                    />
                                </div>

                                <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-white/12 dark:bg-[var(--color-surface)]">
                                    <MapPin size={20} className="text-gray-400 dark:text-white/40" />
                                    <select
                                        value={selectedCountryId}
                                        onChange={(event) => setSelectedCountryId(event.target.value)}
                                        className="flex-1 bg-transparent text-sm text-gray-900 outline-none dark:text-white"
                                    >
                                        <option value="">All countries</option>
                                        {countries.map((country) => (
                                            <option key={country.id} value={String(country.id)}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-white/12 dark:bg-[var(--color-surface)]">
                                    <MapPin size={20} className="text-gray-400 dark:text-white/40" />
                                    <select
                                        value={selectedCityId}
                                        onChange={(event) => setSelectedCityId(event.target.value)}
                                        disabled={!selectedCountryId}
                                        className="flex-1 bg-transparent text-sm text-gray-900 outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
                                    >
                                        <option value="">{selectedCountryId ? 'All cities' : 'Select country first'}</option>
                                        {cities.map((city) => {
                                            const cityId = city.id ?? city.city_id
                                            return (
                                                <option key={cityId} value={String(cityId)}>
                                                    {city.name ?? city.city_name}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>

                                <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-white/12 dark:bg-[var(--color-surface)]">
                                    <Star size={20} className="text-gray-400 dark:text-white/40" />
                                    <select
                                        value={minRating}
                                        onChange={(event) => setMinRating(event.target.value)}
                                        className="flex-1 bg-transparent text-sm text-gray-900 outline-none dark:text-white"
                                    >
                                        <option value="">All ratings</option>
                                        <option value="4.5">4.5 and above</option>
                                        <option value="4">4.0 and above</option>
                                        <option value="3.5">3.5 and above</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {totalPrimaryServices} Provider result{totalPrimaryServices === 1 ? '' : 's'}
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-white/60">
                                {activeCategory ? `Category: ${activeCategory.name}. ` : ''}
                                {activeCountry ? `Country: ${activeCountry.name}. ` : ''}
                                {activeCity ? `City: ${activeCity.name ?? activeCity.city_name}. ` : ''}
                                {minRating ? `Minimum rating: ${minRating}+. ` : ''}
                                {searchQuery ? `Search: "${searchQuery}".` : 'Showing the current provider discovery view.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 self-start lg:self-auto">
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-white/60">
                                <SlidersHorizontal size={15} />
                                Sort by
                            </span>
                            <select
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value)}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 outline-none dark:border-white/12 dark:bg-[var(--color-surface)] dark:text-white"
                            >
                                <option value="recommended">Recommended</option>
                                <option value="highest-rated">Highest rated</option>
                                <option value="most-reviewed">Most reviewed</option>
                                <option value="price-low">Price: low to high</option>
                                <option value="price-high">Price: high to low</option>
                                <option value="newest">Newest first</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-8 flex flex-wrap gap-3">
                        <FilterChip active={!selectedCategory} onClick={() => setSelectedCategory('')}>
                            All Categories
                        </FilterChip>
                        {categories.slice(0, 8).map((category) => (
                            <FilterChip
                                key={category.id}
                                active={selectedCategory === String(category.id)}
                                onClick={() => setSelectedCategory(String(category.id))}
                            >
                                {category.name}
                            </FilterChip>
                        ))}
                    </div>

                    {isError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-14 text-center dark:border-red-400/20 dark:bg-red-500/8">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">Unable to load services right now.</p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-white/60">The documented primary marketplace request failed. Retry the page.</p>
                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-sat)]"
                            >
                                <RefreshCw size={16} />
                                Retry request
                            </button>
                        </div>
                    ) : isLoading ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <ServicesPageSkeleton key={item} />
                            ))}
                        </div>
                    ) : visibleProviders.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-white/12 dark:bg-[var(--color-surface)]">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">No providers matched this view.</p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-white/60">Try another keyword, category, country, city, or minimum rating combination.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {visibleProviders.map((provider) => (
                                <ServiceCard key={provider.artisanAccountId} provider={provider} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </PublicLayout>
    )
}
