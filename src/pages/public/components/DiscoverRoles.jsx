import { useMemo } from 'react';
import { MapPin, Star } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/DiscoverRoles.css';
import { usePrimaryServices } from '../api/services.hooks.js';

function getLandingLocation(service = {}, provider = {}) {
    const primaryLocation = service?.raw?.location_text
        ?? (service?.locationLabel && service.locationLabel !== 'Location not specified' ? service.locationLabel : '');
    if (primaryLocation) return primaryLocation;

    return service?.raw?.city_name
        ?? service?.raw?.city?.name
        ?? provider?.cityNames?.[0]
        ?? service?.raw?.country_name
        ?? service?.raw?.country?.name
        ?? provider?.countryNames?.[0]
        ?? 'Location not specified';
}

function getInitials(name) {
    return String(name || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('') || 'HP';
}

// Provider-shaped placeholders shown only when the discovery feed is empty.
const fallbackProviders = [
    { id: 'f1', name: 'Amara Okafor', categories: ['Cleaning & Housekeeping', 'Laundry'], servicesCount: 4, featuredService: 'Deep Home Cleaning', rating: 4.9, location: 'Lagos, Nigeria', description: 'Reliable home cleaning and laundry with a careful eye for detail and dependable turnaround.' },
    { id: 'f2', name: 'Kwame Mensah', categories: ['Plumbing & Electrical'], servicesCount: 3, featuredService: 'Pipe & Fixture Repair', rating: 4.7, location: 'Accra, Ghana', description: 'Licensed plumbing and electrical repairs for homes and offices, done safely and on schedule.' },
    { id: 'f3', name: 'Zainab Bello', categories: ['Health & Beauty', 'Hairstyling'], servicesCount: 5, featuredService: 'Bridal Makeup', rating: 5.0, location: 'Abuja, Nigeria', description: 'Bridal and event makeup plus hairstyling that keeps you looking flawless from morning to night.' },
    { id: 'f4', name: 'Daniel Osei', categories: ['Landscaping & Gardening'], servicesCount: 2, featuredService: 'Lawn Maintenance', rating: 4.8, location: 'Kumasi, Ghana', description: 'Lawn care, planting, and outdoor upkeep to keep your garden healthy and looking its best.' },
    { id: 'f5', name: 'Chioma Eze', categories: ['Photography & Videography'], servicesCount: 6, featuredService: 'Event Coverage', rating: 4.9, location: 'Port Harcourt, Nigeria', description: 'Full event photography and videography, delivering crisp, well-edited memories every time.' },
    { id: 'f6', name: 'Samuel Addo', categories: ['Automotive Services'], servicesCount: 3, featuredService: 'Mobile Car Wash', rating: 4.6, location: 'Tema, Ghana', description: 'Mobile car wash and detailing that comes to you, leaving your vehicle spotless inside and out.' },
];

const DiscoverRoles = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: primaryServicesData } = usePrimaryServices({}, { retry: false });

    const providers = useMemo(() => {
        const liveProviders = (primaryServicesData?.items ?? []).map((provider) => {
            const service = provider?.primaryService ?? {};
            const categories = provider?.categoryNames?.length
                ? provider.categoryNames
                : [service?.categoryName].filter(Boolean);

            const rawDescription = service?.description ?? provider?.providerBio;
            const description = rawDescription
                && rawDescription !== 'No description provided yet.'
                && rawDescription !== 'No provider bio available yet.'
                ? rawDescription
                : null;

            return {
                id: provider?.artisanAccountId ?? provider?.id ?? service?.id,
                artisanId: provider?.artisanAccountId ?? null,
                serviceId: service?.id ?? provider?.primaryServiceId ?? null,
                name: provider?.providerName ?? 'Verified professional',
                categories: categories.length ? categories : ['Professional services'],
                servicesCount: provider?.servicesCount ?? 0,
                featuredService: service?.title ?? null,
                rating: provider?.rating ?? 0,
                location: getLandingLocation(service, provider),
                description,
            };
        });

        return liveProviders.length ? liveProviders : fallbackProviders;
    }, [primaryServicesData]);

    const openProfile = (provider) => {
        // Public provider profile lives on the service-details page (with the
        // artisan context). Guard when there is no representative service id.
        if (!provider.serviceId) return;
        const suffix = provider.artisanId ? `?artisan=${encodeURIComponent(provider.artisanId)}` : '';
        navigate(`/services/${provider.serviceId}${suffix}`, {
            state: { from: `${location.pathname}${location.search}` },
        });
    };

    return (
        <section className="w-full bg-[var(--color-green-dark)] py-10 pb-[60px] flex justify-center">
            <div className="w-full bg-[var(--color-green-deep)] py-[38px] px-[42px] pb-[60px] relative xl:py-8 xl:px-9 xl:pb-14 lg:py-7 lg:px-7 lg:pb-12 md:w-full md:py-6 md:px-5 md:pb-10">

                {/* Header */}
                <div className="flex flex-col items-center mb-11">
                    <h2 className="text-[60px] font-black text-center leading-[1.05] tracking-tight mb-2 xl:text-[52px] lg:text-[44px] md:text-[38px] max-md:text-[32px]">
                        <span className="text-white">Featured</span>{' '}
                        <span className="text-[var(--color-orange)]">Professionals</span>
                    </h2>

                    <p className="text-[22px] font-semibold leading-[1.25] text-[rgba(255,255,255,0.65)] text-center max-w-[620px] mx-auto xl:text-xl lg:text-lg lg:max-w-[540px] md:text-base md:max-w-[480px] max-md:text-[15px]">
                        Explore verified service providers ready to help you with your next project. Compare profiles, check reviews, and book with confidence.
                    </p>
                </div>

                {/* Providers Grid */}
                <div className="grid grid-cols-3 gap-[27px] w-full max-w-[1440px] mx-auto xl:gap-6 xl:grid-cols-4 lg:grid-cols-4 lg:gap-5 md:grid-cols-3 md:gap-[18px] max-sm:grid-cols-1 max-sm:gap-4 max-sm:max-w-[420px]">
                    {providers.map((provider) => (
                        <article
                            key={provider.id}
                            className="group bg-white rounded-[16px] p-5 flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(0,15,31,0.14)] max-sm:p-[18px]"
                            onClick={() => openProfile(provider)}
                        >
                            {/* Identity: avatar + name + rating */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative flex-shrink-0">
                                        <div
                                            className="w-14 h-14 rounded-full flex items-center justify-center text-[18px] font-extrabold text-[var(--color-green-deep)]"
                                            style={{ background: 'var(--color-gold-gradient)' }}
                                        >
                                            {getInitials(provider.name)}
                                        </div>
                                        <span className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full bg-[var(--color-green-dark)] flex items-center justify-center ring-2 ring-white">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                        </span>
                                    </div>
                                    <h3 className="text-[18px] font-extrabold text-[#050505] leading-tight truncate">
                                        {provider.name}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0 bg-[#F4F5F0] rounded-full px-2.5 py-1">
                                    <Star size={13} strokeWidth={2.5} className="text-[var(--color-orange)] fill-[var(--color-orange)]" />
                                    <span className="text-[12.5px] font-bold text-[#050505]">
                                        {provider.rating ? Number(provider.rating).toFixed(1) : 'Not rated'}
                                    </span>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="flex flex-wrap gap-1.5 mt-4">
                                {provider.categories.slice(0, 2).map((category, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center bg-[#668f63] text-white text-[11px] font-bold py-1 px-2.5 rounded-md"
                                    >
                                        {category}
                                    </span>
                                ))}
                                {provider.categories.length > 2 && (
                                    <span className="inline-flex items-center bg-[#eef1e9] text-[#535b65] text-[11px] font-bold py-1 px-2 rounded-md">
                                        +{provider.categories.length - 2}
                                    </span>
                                )}
                            </div>

                            {/* Services count + featured */}
                            <p className="text-[15px] font-black text-[var(--color-orange)] mt-4 tabular-nums">
                                {provider.servicesCount}
                                <span className="ml-1 text-[#2d342f] font-bold">service{provider.servicesCount === 1 ? '' : 's'} available</span>
                            </p>
                            {provider.featuredService && (
                                <p className="text-[12px] text-[#6a6a6a] mt-1">
                                    Featured service: <span className="text-[#2d342f] font-semibold">{provider.featuredService}</span>
                                </p>
                            )}

                            {/* Description */}
                            <p className="text-[13px] leading-relaxed text-[#6a6a6a] mt-3 line-clamp-2 flex-1">
                                {provider.description ?? `${provider.name} is a verified provider ready to help with your next project.`}
                            </p>

                            {/* Location */}
                            <div className="flex items-center gap-1 text-[12.5px] text-[#2d342f] mt-4">
                                <MapPin size={14} strokeWidth={2.5} className="flex-shrink-0 text-[var(--color-green-dark)]" />
                                <span className="truncate">{provider.location}</span>
                            </div>

                            {/* View Profile */}
                            <button
                                type="button"
                                onClick={(event) => { event.stopPropagation(); openProfile(provider); }}
                                className="mt-4 w-full rounded-full bg-[var(--color-green-deep)] text-white text-[13.5px] font-bold py-2.5 transition-all hover:opacity-90 active:scale-[0.98]"
                            >
                                View Profile
                            </button>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DiscoverRoles;
