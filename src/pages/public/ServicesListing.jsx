import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { HomePageFooter } from "./components/HomePageFooter";
import SimplePageHeader from "./components/Header";
import {
    Search, SlidersHorizontal, Clock, Star,
    ShieldCheck
} from 'lucide-react';
import { useMarketplaceCategories, usePrimaryServices } from './api/services.hooks.js';
import { locationService } from '../../shared/api/location.service.js';

/* ─────────────────────────────────────────────
   BRAND TOKENS (Sourced precisely from your file)
───────────────────────────────────────────── */
const T = {
    p100: "var(--color-primary-100)", p200: "var(--color-primary-200)", p300: "var(--color-primary-300)",
    p400: "var(--color-primary-400)", p500: "var(--color-primary-500)",
    s100: "var(--color-secondary-100)", s200: "var(--color-secondary-200)", s300: "var(--color-secondary-300)",
    s400: "var(--color-secondary-400)", s500: "var(--color-secondary-500)",
    gold: "var(--color-accent-gold)",
    bg: "var(--color-bg)", surface: "var(--color-surface)", mist: "var(--color-mist)",
    border: "var(--color-border)", borderMuted: "var(--color-border-muted)",
    t1: "var(--color-text-1)", t2: "var(--color-text-2)", t3: "var(--color-text-3)", t4: "var(--color-text-4)",
};

const G = {
    greenH: `linear-gradient(90deg,  ${T.p200} 0%, ${T.p300} 60%, ${T.p400} 100%)`,
};

const TONE_PALETTE = [T.p400, T.s300, T.s400, T.p200, T.p300, T.s200];

const useInView = (threshold = 0.15) => {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);
    useEffect(() => {
        const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); ob.disconnect(); } }, { threshold });
        if (ref.current) ob.observe(ref.current);
        return () => ob.disconnect();
    }, [threshold]);
    return [ref, vis];
};

const Reveal = ({ children, delay = 0, y = 24 }) => {
    const [ref, vis] = useInView();
    return (
        <div ref={ref} style={{
            opacity: vis ? 1 : 0,
            transform: vis ? `translateY(0)` : `translateY(${y}px)`,
            transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
        }}>
            {children}
        </div>
    );
};

function normalizeLabel(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function ServiceSkeleton({ idx }) {
    return (
        <Reveal delay={idx * 0.05}>
            <div style={{
                background: T.surface,
                border: `1.5px solid ${T.border}`,
                borderRadius: 16,
                display: "flex",
                overflow: "hidden",
                minHeight: 220,
            }}>
                <div style={{ width: 180, minWidth: 180, background: T.mist }} />
                <div style={{ padding: 20, flex: 1 }}>
                    <div style={{ height: 18, width: '72%', background: T.mist, borderRadius: 8, marginBottom: 10 }} />
                    <div style={{ height: 12, width: '48%', background: T.mist, borderRadius: 6, marginBottom: 12 }} />
                    <div style={{ height: 12, width: '100%', background: T.mist, borderRadius: 6, marginBottom: 8 }} />
                    <div style={{ height: 12, width: '88%', background: T.mist, borderRadius: 6, marginBottom: 18 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                            <div style={{ height: 24, width: 70, background: T.mist, borderRadius: 8 }} />
                            <div style={{ height: 24, width: 70, background: T.mist, borderRadius: 8 }} />
                        </div>
                        <div style={{ height: 32, width: 84, background: T.mist, borderRadius: 8 }} />
                    </div>
                </div>
            </div>
        </Reveal>
    );
}

export default function ServicesListingHorizontal() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState({
        q: '',
        category_id: '',
        country_id: '',
        city_id: '',
        skill_id: '',
        available_weekday: '',
        available_time: '',
        min_rating: '',
    });
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const categoryName = searchParams.get('category') ?? '';

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedQuery(filters.q.trim());
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [filters.q]);

    const { data: categories = [], isFetched: categoriesFetched } = useMarketplaceCategories();
    const { data: countriesData } = useQuery({
        queryKey: ['marketplace', 'countries', { per_page: 100 }],
        queryFn: () => locationService.getCountries({ per_page: 100 }),
        staleTime: Infinity,
    });
    const countries = locationService.unwrapItems(countriesData);

    const selectedCategoryFromRoute = useMemo(() => {
        if (!categoryName) return null;
        const target = normalizeLabel(categoryName);
        return categories.find((category) => (
            normalizeLabel(category?.name) === target
            || normalizeLabel(category?.title) === target
        )) ?? null;
    }, [categories, categoryName]);

    useEffect(() => {
        if (!selectedCategoryFromRoute || filters.category_id) return;
        setFilters((current) => ({
            ...current,
            category_id: String(selectedCategoryFromRoute.id),
        }));
    }, [filters.category_id, selectedCategoryFromRoute]);

    const { data: citiesData } = useQuery({
        queryKey: ['marketplace', 'cities', { country_id: filters.country_id || undefined, all: 1 }],
        queryFn: () => locationService.getCities({
            country_id: filters.country_id || undefined,
            all: 1,
        }),
        staleTime: 5 * 60 * 1000,
    });
    const cities = locationService.unwrapItems(citiesData);

    const effectiveCategoryId = filters.category_id || (selectedCategoryFromRoute ? String(selectedCategoryFromRoute.id) : '');
    const listingParams = useMemo(() => ({
        q: debouncedQuery || undefined,
        category_id: effectiveCategoryId || undefined,
        country_id: filters.country_id || undefined,
        city_id: filters.city_id || undefined,
        skill_id: filters.skill_id || undefined,
        available_weekday: filters.available_weekday || undefined,
        available_time: filters.available_time || undefined,
        min_rating: filters.min_rating || undefined,
    }), [debouncedQuery, effectiveCategoryId, filters.available_time, filters.available_weekday, filters.city_id, filters.country_id, filters.min_rating, filters.skill_id]);

    const {
        data: primaryServicesData,
        isLoading,
        isError,
        error,
    } = usePrimaryServices(listingParams, {
        enabled: !categoryName || categoriesFetched,
    });

    const activeFilterCount = [
        debouncedQuery,
        effectiveCategoryId,
        filters.country_id,
        filters.city_id,
        filters.skill_id,
        filters.available_weekday,
        filters.available_time,
        filters.min_rating,
    ].filter(Boolean).length;

    const handleFilterChange = (key) => (event) => {
        const nextValue = event.target.value;
        setFilters((current) => ({
            ...current,
            [key]: nextValue,
            ...(key === 'country_id' ? { city_id: '' } : {}),
        }));
    };

    const clearFilters = () => {
        setFilters({
            q: '',
            category_id: '',
            country_id: '',
            city_id: '',
            skill_id: '',
            available_weekday: '',
            available_time: '',
            min_rating: '',
        });
    };

    const services = useMemo(() => (
        (primaryServicesData?.items ?? []).map((provider, index) => {
            const tone = TONE_PALETTE[index % TONE_PALETTE.length];
            const primaryService = provider?.primaryService ?? {};
            return {
                id: primaryService?.id ?? provider?.primaryServiceId ?? provider?.id,
                artisanId: provider?.artisanAccountId ?? provider?.id ?? null,
                title: primaryService?.title ?? 'Untitled service',
                cat: primaryService?.categoryName ?? provider?.categoryNames?.[0] ?? 'Professional service',
                author: provider?.providerName ?? 'Verified professional',
                rate: primaryService?.priceLabel ?? 'Pricing on request',
                delivery: primaryService?.availabilityLabel ?? `${provider?.servicesCount ?? 0} services available`,
                rating: provider?.rating ?? 0,
                reviews: provider?.reviewCount ?? 0,
                desc: primaryService?.description ?? provider?.providerBio ?? 'No description provided yet.',
                tags: (
                    primaryService?.skills?.length
                        ? primaryService.skills
                        : [
                            ...(provider?.categoryNames ?? []),
                            ...(provider?.cityNames ?? []),
                        ]
                ).filter(Boolean),
                col: tone,
                img: primaryService?.image ?? '/images/workers.png',
            };
        })
    ), [primaryServicesData]);

    const openService = (service) => {
        if (!service?.id) return;
        const nextSearch = service?.artisanId ? `?artisan=${encodeURIComponent(service.artisanId)}` : '';
        navigate(`/services/${service.id}${nextSearch}`, {
            state: { from: `${location.pathname}${location.search}` },
        });
    };

    return (
        <div style={{ background: T.bg, color: T.t1, fontFamily: "system-ui, sans-serif", minHeight: "100vh" }}>

            {/* Search Header Controls */}
            <section style={{ borderBottom: `1px solid ${T.border}`, padding: "24px 16px", background: T.surface }}>
                <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1, minWidth: 280 }}>
                        <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: T.t4 }} />
                        <input
                            value={filters.q}
                            onChange={handleFilterChange('q')}
                            placeholder="Search for website development services..."
                            style={{ width: "100%", padding: "12px 16px 12px 44px", borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, color: T.t1, fontSize: 14, outline: "none" }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setFiltersOpen((current) => !current)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, border: `1.5px solid ${filtersOpen ? T.p300 : T.border}`, background: T.surface, color: T.t2, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
                    >
                        <SlidersHorizontal size={15} /> Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
                    </button>
                </div>
                {filtersOpen && (
                    <div style={{ maxWidth: 1140, margin: "16px auto 0", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: T.t3 }}>
                                Category
                                <select value={filters.category_id} onChange={handleFilterChange('category_id')} style={{ height: 42, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.t1, padding: "0 12px" }}>
                                    <option value="">{categoriesFetched ? 'All categories' : 'Loading categories...'}</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={String(category.id)}>
                                            {category.name ?? category.title}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: T.t3 }}>
                                Country
                                <select value={filters.country_id} onChange={handleFilterChange('country_id')} style={{ height: 42, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.t1, padding: "0 12px" }}>
                                    <option value="">{countries.length ? 'All countries' : 'Loading countries...'}</option>
                                    {countries.map((country) => (
                                        <option key={country.id} value={String(country.id)}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: T.t3 }}>
                                City
                                <select value={filters.city_id} onChange={handleFilterChange('city_id')} style={{ height: 42, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.t1, padding: "0 12px" }}>
                                    <option value="">
                                        {filters.country_id ? (cities.length ? 'All cities' : 'Loading cities...') : 'Select country first'}
                                    </option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={String(city.id)}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: T.t3 }}>
                                Skill ID
                                <input
                                    type="number"
                                    min="1"
                                    value={filters.skill_id}
                                    onChange={handleFilterChange('skill_id')}
                                    placeholder="e.g. 12"
                                    style={{ height: 42, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.t1, padding: "0 12px" }}
                                />
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: T.t3 }}>
                                Available weekday
                                <select value={filters.available_weekday} onChange={handleFilterChange('available_weekday')} style={{ height: 42, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.t1, padding: "0 12px" }}>
                                    <option value="">Any day</option>
                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                        <option key={day} value={day}>
                                            {day[0].toUpperCase() + day.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: T.t3 }}>
                                Available time
                                <input
                                    type="time"
                                    value={filters.available_time}
                                    onChange={handleFilterChange('available_time')}
                                    style={{ height: 42, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.t1, padding: "0 12px" }}
                                />
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: T.t3 }}>
                                Minimum rating
                                <select value={filters.min_rating} onChange={handleFilterChange('min_rating')} style={{ height: 42, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.t1, padding: "0 12px" }}>
                                    <option value="">Any rating</option>
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <option key={rating} value={String(rating)}>
                                            {rating}+ stars
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 12, color: T.t4 }}>
                                These filters now map directly to the documented `/services/primary` endpoint params.
                            </span>
                            <button
                                type="button"
                                onClick={clearFilters}
                                style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.t2, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <SimplePageHeader
                badge="Premium Services"
                title="Proffesional services that meet your needs"
                description="Monitor pending milestones, analyze historical payouts, and verify operational system balances securely."
            />

            {/* Main Multi-Column Horizontal Feed Grid */}
            <section style={{ padding: "40px 16px" }}>
                <div style={{
                    maxWidth: 1140,
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
                    gap: 20
                }}>
                    {isLoading ? (
                        [0, 1, 2, 3].map((idx) => <ServiceSkeleton key={idx} idx={idx} />)
                    ) : isError ? (
                        <div style={{
                            gridColumn: '1 / -1',
                            background: T.surface,
                            border: `1.5px solid ${T.border}`,
                            borderRadius: 16,
                            padding: 24,
                            color: T.t3,
                        }}>
                            Unable to load services right now.
                            {error?.message ? ` ${error.message}` : ''}
                        </div>
                    ) : services.length === 0 ? (
                        <div style={{
                            gridColumn: '1 / -1',
                            background: T.surface,
                            border: `1.5px solid ${T.border}`,
                            borderRadius: 16,
                            padding: 24,
                            color: T.t3,
                        }}>
                            No services found for the current search.
                        </div>
                    ) : (
                        services.map((serv, idx) => (
                            <Reveal key={serv.id ?? idx} delay={idx * 0.05}>
                                <div
                                    style={{
                                        background: T.surface,
                                        border: `1.5px solid ${T.border}`,
                                        borderRadius: 16,
                                        display: "flex",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        height: "100%",
                                        minHeight: 220,
                                        transition: "transform 0.2s, border-color 0.2s"
                                    }}
                                    onClick={() => openService(serv)}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.p300; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
                                >

                                    {/* Horizontal Left Panel: Service Image (Optimized size for Multi-Column rows) */}
                                    <div style={{ width: 180, minWidth: 180, position: "relative", background: T.mist, overflow: "hidden" }}>
                                        <img src={serv.img} alt={serv.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        <span style={{ position: "absolute", top: 12, left: 12, fontSize: 10, fontWeight: 700, background: `${serv.col}18`, color: serv.col, padding: "4px 8px", borderRadius: 6, backdropFilter: "blur(4px)" }}>
                                            {serv.cat}
                                        </span>
                                    </div>

                                    {/* Horizontal Right Panel: Information Stack */}
                                    <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
                                                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.t1, margin: 0, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                    {serv.title}
                                                </h3>
                                                <div style={{ fontSize: 16, fontWeight: 800, color: T.p400, whiteSpace: "nowrap" }}>{serv.rate}</div>
                                            </div>

                                            {/* Meta Rating Logs */}
                                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", fontSize: 12, color: T.t3, marginBottom: 10 }}>
                                                <span>By <strong>{serv.author}</strong></span>
                                                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                                    <Star size={12} fill={T.s200} stroke={T.s200} />
                                                    <span style={{ color: T.t1, fontWeight: 600 }}>{Number(serv.rating || 0).toFixed(1)}</span>
                                                    {serv.reviews > 0 && <span>({serv.reviews})</span>}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={12} /> {serv.delivery}</div>
                                            </div>

                                            <p style={{ fontSize: 13, color: T.t3, lineHeight: 1.5, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                {serv.desc}
                                            </p>
                                        </div>

                                        {/* Tags and Action Footer */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, paddingTop: 12, borderTop: `1px solid ${T.borderMuted}` }}>
                                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                                {serv.tags.slice(0, 2).map(t => (
                                                    <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: T.mist, color: T.t2 }}>{t}</span>
                                                ))}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 11.5, color: T.p400, fontWeight: 600 }}>
                                                    <ShieldCheck size={13} /> Secure
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        openService(serv);
                                                    }}
                                                    style={{ padding: "6px 14px", borderRadius: 8, background: G.greenH, border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </Reveal>
                        ))
                    )}
                </div>
            </section>

            <HomePageFooter />
        </div>
    );
}
