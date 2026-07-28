import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    MapPin, Star, Wallet, Briefcase, CheckCircle2, ShieldCheck,
    Lock, MessageCircle, Award, Sparkles,
} from 'lucide-react';
import SubHeader from './components/SubHeader';
import { useMarketplaceArtisanServices, useMarketplaceServiceDetail } from './api/services.hooks.js';
import { formatRelativeTime } from '../../shared/lib/format.js';
import { normalizeCollection } from '../../shared/lib/normalize.js';
import { publicProfileService } from '../../shared/api/publicProfile.service.js';
import { queryKeys } from '../../services/query-keys.js';
import useAuthStore from '../../features/auth/auth.store.js';
import useUIStore from '../../shared/store/ui.store.js';
import { BookHustlerPanel } from '../../features/hustles/components/BookHustlerPanel.jsx';

const PLACEHOLDER_BIO = ['No description provided yet.', 'No provider bio available yet.'];

// Gold-gradient button background used across the public pages (see JobDetailsPage.css .apply-button).
const GOLD = { background: 'var(--color-gold-gradient)' };
const GREEN_MEDIA = { background: 'linear-gradient(150deg, var(--color-green-dark), var(--color-green-deep))' };

function getInitials(name) {
    return String(name || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('') || 'HP';
}

function joinLocation(...parts) {
    return parts.map((p) => (typeof p === 'string' ? p.trim() : '')).filter(Boolean).join(', ');
}

const JobDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [bookingManual, setBookingManual] = useState(false);
    const [bookingDismissed, setBookingDismissed] = useState(false);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const toastInfo = useUIStore((state) => state.toastInfo);

    const serviceId = params.id ?? searchParams.get('id');
    const explicitArtisanId = searchParams.get('artisan');

    const { data: service, isLoading: serviceLoading, isError: serviceError } = useMarketplaceServiceDetail(serviceId, {
        enabled: Boolean(serviceId),
        retry: false,
    });

    const artisanId = explicitArtisanId
        ?? service?.raw?.artisan_account_id
        ?? service?.raw?.provider_account_id
        ?? service?.raw?.artisan_id
        ?? null;

    const { data: artisanServices } = useMarketplaceArtisanServices(artisanId, { per_page: 24 }, {
        enabled: Boolean(artisanId),
        retry: false,
    });

    const { data: profileData } = useQuery({
        queryKey: queryKeys.profiles.public(artisanId),
        queryFn: () => publicProfileService.getProfile(artisanId),
        enabled: Boolean(artisanId),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
    const profile = profileData?.profile ?? profileData ?? null;

    // ── Provider identity (prefer /profile, then artisan aggregate, then service) ──
    const providerName = profile?.name ?? artisanServices?.providerName ?? service?.providerName ?? 'Verified professional';
    const avatarUrl = profile?.avatar_url ?? service?.avatar ?? null;
    const role = profile?.role ?? service?.raw?.artisan_role ?? 'Service provider';
    const isPublic = profile?.is_public ?? true;
    const rating = Number(profile?.stats?.rating ?? artisanServices?.rating ?? service?.rating ?? 0) || 0;
    const reviewsCount = Number(profile?.stats?.reviews_count ?? artisanServices?.reviewCount ?? service?.reviewCount ?? 0) || 0;

    const servicesList = useMemo(() => artisanServices?.items ?? [], [artisanServices]);
    const servicesCount = Number(artisanServices?.servicesCount ?? servicesList.length ?? 0) || 0;

    const rawBio = profile?.bio ?? artisanServices?.providerBio ?? service?.description;
    const bio = rawBio && !PLACEHOLDER_BIO.includes(rawBio) ? rawBio : null;

    const categories = useMemo(() => {
        const fromServices = [...new Set(servicesList.map((s) => s?.categoryName).filter(Boolean))];
        if (fromServices.length) return fromServices;
        return service?.categoryName ? [service.categoryName] : [];
    }, [servicesList, service]);

    const providerLocation = useMemo(() => {
        const city = profile?.city?.name ?? service?.raw?.city_name ?? servicesList[0]?.raw?.city_name ?? '';
        const country = profile?.country?.name ?? service?.raw?.country_name ?? servicesList[0]?.raw?.country_name ?? '';
        const joined = joinLocation(city, country);
        if (joined) return joined;
        return service?.locationLabel && service.locationLabel !== 'Location not specified' ? service.locationLabel : null;
    }, [profile, service, servicesList]);

    const certifications = useMemo(() => normalizeCollection(
        profile?.certifications ?? profile?.provider_certifications ?? profile?.certification_items
    ), [profile]);

    const reviews = useMemo(() => (Array.isArray(service?.reviews) ? service.reviews : []), [service]);

    // ── Featured service (the service the visitor opened) ──
    const featured = service ? {
        title: service.title ?? 'Service listing',
        description: service.description && !PLACEHOLDER_BIO.includes(service.description) ? service.description : null,
        category: service.categoryName ?? 'Professional service',
        experience: service.experienceLabel ?? null,
        price: service.priceLabel ?? 'Pricing on request',
        image: service.image ?? null,
        skills: Array.isArray(service.skills) ? service.skills : [],
        availability: service.availabilityLabel ?? null,
    } : null;

    // ── Booking payloads (unchanged shape BookHustlerPanel expects) ──
    const bookingProfile = useMemo(() => ({
        name: providerName,
        role,
        avatar_url: avatarUrl ?? '/images/workers.png',
        bio: bio ?? '',
        city: { name: profile?.city?.name ?? service?.raw?.city_name ?? '' },
        country: { name: profile?.country?.name ?? service?.raw?.country_name ?? '' },
        stats: { rating },
        services: servicesList,
    }), [providerName, role, avatarUrl, bio, profile, service, rating, servicesList]);

    const bookingService = useMemo(() => (service ? { id: service.id, _raw: service.raw ?? {} } : null), [service]);

    // ── Auth gating: Book / Message require sign-in, then return here ──
    const requireAuth = (intent) => {
        const base = `${location.pathname}${location.search}`;
        const sep = location.search ? '&' : '?';
        const returnTo = `${base}${sep}${intent}=1`;
        navigate(`/sign-in?redirect=${encodeURIComponent(returnTo)}`, { state: { from: returnTo } });
    };

    const handleBook = () => {
        if (!service) return;
        if (!isAuthenticated) {
            toastInfo('Please sign in to book this provider.');
            requireAuth('book');
            return;
        }
        setBookingManual(true);
    };

    const handleMessage = () => {
        if (!isAuthenticated) {
            toastInfo('Please sign in to message this provider.');
            requireAuth('message');
            return;
        }
        navigate('/messages');
    };

    // Returning from sign-in with ?book=1 auto-opens booking (derived, no effect).
    const bookingIntent = isAuthenticated && searchParams.get('book') === '1';
    const bookingOpen = bookingManual || (bookingIntent && Boolean(service) && !bookingDismissed);

    const closeBooking = () => {
        setBookingManual(false);
        setBookingDismissed(true);
        if (searchParams.get('book')) {
            const next = new URLSearchParams(searchParams);
            next.delete('book');
            setSearchParams(next, { replace: true });
        }
    };

    const firstName = providerName.split(' ')[0];

    if (!serviceId) {
        return (
            <div className="min-h-screen bg-[var(--color-green-dark)]">
                <SubHeader />
                <div className="px-[17px] pt-9 pb-14">
                    <div className="mx-auto max-w-[1180px] rounded-[22px] bg-[var(--color-green-deep)] px-14 py-16 text-center max-sm:px-6">
                        <h1 className="text-[26px] font-black text-white">No provider selected</h1>
                        <p className="mt-2 text-[15px] text-white/70">Open a provider from the listing to view their profile here.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-green-dark)]">
            <SubHeader />

            <div className="px-[17px] pt-9 pb-14 max-md:px-3 max-md:pt-6">
                <div className="mx-auto max-w-[1180px] rounded-[22px] bg-[var(--color-green-deep)] px-14 pb-16 pt-11 max-lg:px-9 max-sm:px-5 max-sm:py-8">

                    {/* Breadcrumb */}
                    <p className="pb-6 text-[12.5px] text-white/60">
                        Home / Providers / <span className="font-bold text-white">{providerName}</span>
                    </p>

                    {/* ── Provider identity (on green) ── */}
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-8 max-lg:grid-cols-[auto_1fr] max-sm:grid-cols-1 max-sm:justify-items-center max-sm:text-center">
                        <div className="relative flex-shrink-0">
                            <div className="h-[112px] w-[112px] overflow-hidden rounded-full ring-4 ring-white/12" style={GOLD}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={providerName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[38px] font-black text-[var(--color-green-deep)]">
                                        {getInitials(providerName)}
                                    </div>
                                )}
                            </div>
                            {isPublic && (
                                <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#5f875f] ring-[3px] ring-[var(--color-green-deep)]">
                                    <CheckCircle2 size={17} className="text-white" />
                                </span>
                            )}
                        </div>

                        <div className="min-w-0">
                            <div className="mb-2 flex items-center gap-2 text-[11.5px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-secondary)] max-sm:justify-center">
                                <Sparkles size={14} /> {role} · {isPublic ? 'Public profile' : 'Provider'}
                            </div>
                            <h1 className="text-[clamp(28px,4vw,40px)] font-black leading-[1.03] tracking-[-0.02em] text-white">
                                {serviceLoading ? 'Loading provider…' : providerName}
                            </h1>
                            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 max-sm:justify-center">
                                <span className="inline-flex items-center gap-1.5 text-[13.5px] text-white">
                                    <Star size={15} className="fill-[var(--color-secondary)] text-[var(--color-secondary)]" />
                                    <span className="font-extrabold tabular-nums">{rating ? rating.toFixed(1) : 'Not rated'}</span>
                                    <span className="text-white/60">({reviewsCount} review{reviewsCount === 1 ? '' : 's'})</span>
                                </span>
                                {providerLocation && (
                                    <span className="inline-flex items-center gap-1.5 text-[13.5px] text-white/85">
                                        <MapPin size={15} /> {providerLocation}
                                    </span>
                                )}
                            </div>
                            {categories.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2 max-sm:justify-center">
                                    {categories.slice(0, 4).map((category, index) => (
                                        <span key={index} className="rounded-[5px] bg-[#5f875f] px-3 py-1.5 text-[12px] font-bold text-white">
                                            {category}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-3 max-lg:col-span-2 max-lg:flex-row max-lg:items-center max-lg:justify-between max-sm:col-span-1 max-sm:w-full max-sm:flex-col">
                            <div className="rounded-[14px] border border-white/12 bg-black/20 px-6 py-4 text-center max-sm:w-full">
                                <div className="text-[44px] font-black leading-none tabular-nums text-[var(--color-secondary)]">{servicesCount}</div>
                                <div className="mt-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/75">Services available</div>
                            </div>
                            <div className="flex flex-col items-end gap-2 max-sm:w-full max-sm:items-stretch">
                                <div className="flex gap-2.5 max-sm:flex-col">
                                    <button type="button" onClick={handleBook} style={GOLD}
                                        className="rounded-[6px] px-6 py-3 text-[14px] font-black text-white transition-all hover:brightness-105 active:scale-[0.98]">
                                        Book now
                                    </button>
                                    <button type="button" onClick={handleMessage}
                                        className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-white/30 bg-white/10 px-6 py-3 text-[14px] font-bold text-white transition-all hover:bg-white/20 active:scale-[0.98]">
                                        <MessageCircle size={15} /> Message
                                    </button>
                                </div>
                                {!isAuthenticated && (
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/70">
                                        <Lock size={12} className="text-[var(--color-secondary)]" /> Requires sign-in · returns here
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="my-9 h-px bg-white/15" />

                    {serviceError ? (
                        <div className="rounded-[14px] bg-[#efffee] p-10 text-center">
                            <p className="text-[15px] font-bold text-[#050505]">Unable to load this provider right now.</p>
                            <p className="mt-1 text-[13px] text-[#5e625f]">Please try again in a moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-11 max-lg:grid-cols-1 max-lg:gap-8">
                            {/* ── Main column ── */}
                            <div className="flex flex-col gap-8">
                                {/* About */}
                                <section className="rounded-[14px] bg-[#efffee] p-7 max-sm:p-5">
                                    <div className="text-[11.5px] font-extrabold uppercase tracking-[0.15em] text-[#5f875f]">About the provider</div>
                                    <h2 className="mt-2.5 text-[22px] font-black tracking-[-0.01em] text-[#050505]">Meet {providerName}</h2>
                                    {bio ? (
                                        <p className="mt-3.5 text-[15px] leading-[1.6] text-[#465044]">{bio}</p>
                                    ) : (
                                        <p className="mt-3.5 text-[14px] italic text-[#5e625f]">This provider hasn’t added a bio yet.</p>
                                    )}

                                    <div className="mt-6 grid grid-cols-3 gap-3 max-sm:grid-cols-2">
                                        {[
                                            { v: rating ? rating.toFixed(1) : 'Not rated', k: 'Rating' },
                                            { v: reviewsCount, k: 'Reviews' },
                                            { v: servicesCount, k: 'Services', accent: true },
                                        ].map((stat) => (
                                            <div key={stat.k} className="rounded-[10px] bg-white px-4 py-4">
                                                <div className={`text-[20px] font-black tabular-nums ${stat.accent ? 'text-[#c58f2e]' : 'text-[#050505]'}`}>{stat.v}</div>
                                                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9ca3ad]">{stat.k}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Featured service */}
                                {featured && (
                                    <section className="relative overflow-hidden rounded-[14px] bg-[#efffee]">
                                        <span className="absolute left-0 top-[18px] z-[2] rounded-r-full px-4 py-1.5 pl-5 text-[10.5px] font-black uppercase tracking-[0.14em] text-black" style={GOLD}>
                                            Featured service
                                        </span>
                                        <div className="grid grid-cols-[220px_1fr] max-sm:grid-cols-1">
                                            <div className="relative min-h-[220px] max-sm:min-h-[160px]" style={GREEN_MEDIA}>
                                                {featured.image ? (
                                                    <img src={featured.image} alt={featured.title} className="absolute inset-0 h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-white/80"><Sparkles size={54} strokeWidth={1.3} /></div>
                                                )}
                                            </div>
                                            <div className="p-7 max-sm:p-5">
                                                <div className="text-[11.5px] font-extrabold uppercase tracking-[0.15em] text-[#5f875f]">{featured.category}</div>
                                                <h3 className="mt-2.5 text-[24px] font-black tracking-[-0.015em] text-[#050505]">{featured.title}</h3>
                                                {featured.description && (
                                                    <p className="mt-2.5 text-[14.5px] leading-[1.55] text-[#465044]">{featured.description}</p>
                                                )}
                                                <div className="mb-5 mt-4 flex flex-wrap gap-2">
                                                    {featured.experience && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#d5dcd0] bg-white px-3 py-1.5 text-[12px] font-bold text-[var(--color-green-deep)]">
                                                            <Award size={13} /> {featured.experience}
                                                        </span>
                                                    )}
                                                    {featured.availability && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#d5dcd0] bg-white px-3 py-1.5 text-[12px] font-bold text-[var(--color-green-deep)]">
                                                            <CheckCircle2 size={13} /> {featured.availability}
                                                        </span>
                                                    )}
                                                    {featured.skills.slice(0, 3).map((skill, index) => (
                                                        <span key={index} className="inline-flex items-center rounded-[5px] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#5e625f]">{skill}</span>
                                                    ))}
                                                </div>
                                                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#d5dcd0] pt-[18px]">
                                                    <div>
                                                        <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#9ca3ad]">Price</div>
                                                        <div className="text-[22px] font-black tabular-nums text-[#050505]">{featured.price}</div>
                                                    </div>
                                                    <button type="button" onClick={handleBook} style={GOLD}
                                                        className="rounded-[6px] px-6 py-3 text-[14px] font-black text-white transition-all hover:brightness-105 active:scale-[0.98]">
                                                        Book this service
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* All services */}
                                <section className="rounded-[14px] bg-[#efffee] p-7 max-sm:p-5">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <div>
                                            <div className="text-[11.5px] font-extrabold uppercase tracking-[0.15em] text-[#5f875f]">Everything {firstName} offers</div>
                                            <h2 className="mt-2.5 text-[22px] font-black text-[#050505]">All services</h2>
                                        </div>
                                        <span className="text-[13px] font-bold tabular-nums text-[#9ca3ad]">{servicesCount} total</span>
                                    </div>
                                    {servicesList.length ? (
                                        <div className="mt-5 grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
                                            {servicesList.map((svc) => (
                                                <button key={svc.id} type="button"
                                                    onClick={() => navigate(`/services/${svc.id}${explicitArtisanId ? `?artisan=${explicitArtisanId}` : ''}`)}
                                                    className="flex gap-3.5 rounded-[10px] border border-[#d5dcd0] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#5f875f]">
                                                    <div className="h-[54px] w-[54px] flex-shrink-0 overflow-hidden rounded-[10px]" style={GREEN_MEDIA}>
                                                        {svc.image && <img src={svc.image} alt={svc.title} className="h-full w-full object-cover" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="truncate text-[15px] font-black text-[#050505]">{svc.title}</div>
                                                        <div className="mt-0.5 truncate text-[12px] text-[#9ca3ad]">{svc.categoryName}{svc.experienceLabel ? ` · ${svc.experienceLabel}` : ''}</div>
                                                        <div className="mt-1.5 text-[13.5px] font-black tabular-nums text-[#5f875f]">{svc.priceLabel}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-[14px] italic text-[#5e625f]">No other services listed yet.</p>
                                    )}
                                </section>

                                {/* Reviews */}
                                <section className="rounded-[14px] bg-[#efffee] p-7 max-sm:p-5">
                                    <div className="text-[11.5px] font-extrabold uppercase tracking-[0.15em] text-[#5f875f]">What clients say</div>
                                    <h2 className="mt-2.5 text-[22px] font-black text-[#050505]">Reviews</h2>
                                    <div className="mt-4 flex items-center gap-6 border-b border-[#d5dcd0] pb-5">
                                        <div>
                                            <div className="text-[50px] font-black leading-none tabular-nums text-[#050505]">{rating ? rating.toFixed(1) : '—'}</div>
                                            <div className="mt-1.5 text-[13px] text-[#9ca3ad]">{reviewsCount} review{reviewsCount === 1 ? '' : 's'}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <Star key={i} size={20} className={i < Math.round(rating) ? 'fill-[var(--color-secondary)] text-[var(--color-secondary)]' : 'text-[#d5dcd0]'} />
                                            ))}
                                        </div>
                                    </div>
                                    {reviews.length ? (
                                        <div className="mt-5 flex flex-col gap-5">
                                            {reviews.map((review, index) => (
                                                <div key={review.id ?? index} className="flex gap-3.5">
                                                    <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full text-[15px] font-black text-[var(--color-green-deep)]" style={GOLD}>
                                                        {getInitials(review.reviewerName)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[14.5px] font-black text-[#050505]">{review.reviewerName}</span>
                                                            <span className="inline-flex items-center gap-0.5 text-[12px] font-bold text-[#c58f2e]">
                                                                <Star size={12} className="fill-[var(--color-secondary)] text-[var(--color-secondary)]" /> {review.rating}
                                                            </span>
                                                        </div>
                                                        {review.created_at && <div className="text-[12px] text-[#9ca3ad]">{formatRelativeTime(review.created_at)}</div>}
                                                        {review.comment && <p className="mt-1.5 text-[14px] leading-[1.55] text-[#465044]">{review.comment}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-5 text-[14px] italic text-[#5e625f]">No written reviews yet.</p>
                                    )}
                                </section>
                            </div>

                            {/* ── Sidebar ── */}
                            <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
                                <div className="rounded-[14px] bg-[#efffee] p-6">
                                    <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#9ca3ad]">Starting from</div>
                                    <div className="mb-4 mt-1.5 text-[28px] font-black tabular-nums text-[#050505]">{featured?.price ?? 'Pricing on request'}</div>
                                    <button type="button" onClick={handleBook} style={GOLD}
                                        className="w-full rounded-[6px] py-3 text-[14px] font-black text-white transition-all hover:brightness-105 active:scale-[0.98]">
                                        Book now
                                    </button>
                                    <button type="button" onClick={handleMessage}
                                        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-[6px] border-[1.5px] border-[#050505] py-3 text-[14px] font-bold text-[#050505] transition-colors hover:bg-[#050505] hover:text-white">
                                        <MessageCircle size={15} /> Message {firstName}
                                    </button>
                                    {!isAuthenticated && (
                                        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#5e625f]">
                                            <Lock size={12} className="text-[#c58f2e]" /> Sign-in required · returns here
                                        </div>
                                    )}
                                    <div className="mt-2 flex flex-col">
                                        {providerLocation && (
                                            <div className="flex items-center gap-3 border-t border-[#d5dcd0] py-3 text-[13.5px] text-[#465044]">
                                                <MapPin size={16} className="text-[#5f875f]" /> Location <b className="ml-auto font-bold text-[#050505]">{providerLocation}</b>
                                            </div>
                                        )}
                                        {featured?.category && (
                                            <div className="flex items-center gap-3 border-t border-[#d5dcd0] py-3 text-[13.5px] text-[#465044]">
                                                <Briefcase size={16} className="text-[#5f875f]" /> Category <b className="ml-auto font-bold text-[#050505]">{featured.category}</b>
                                            </div>
                                        )}
                                        {featured?.experience && (
                                            <div className="flex items-center gap-3 border-t border-[#d5dcd0] py-3 text-[13.5px] text-[#465044]">
                                                <Wallet size={16} className="text-[#5f875f]" /> Experience <b className="ml-auto font-bold text-[#050505]">{featured.experience}</b>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {certifications.length > 0 && (
                                    <div className="rounded-[14px] bg-[#efffee] p-6">
                                        <p className="mb-3 flex items-center gap-2 text-[15px] font-black text-[#050505]"><ShieldCheck size={17} className="text-[#5f875f]" /> Certifications</p>
                                        <div className="flex flex-col">
                                            {certifications.map((cert, index) => (
                                                <div key={cert?.id ?? index} className="border-t border-[#d5dcd0] py-3 first:border-t-0 first:pt-0">
                                                    <div className="text-[13.5px] font-bold text-[#050505]">
                                                        {cert?.certification_type_name ?? cert?.certification_name ?? cert?.name ?? 'Certification'}
                                                    </div>
                                                    {cert?.issued_at && <div className="mt-0.5 text-[12px] text-[#9ca3ad]">Issued {cert.issued_at}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </aside>
                        </div>
                    )}
                </div>
            </div>

            <BookHustlerPanel
                isOpen={bookingOpen}
                onClose={closeBooking}
                onBack={closeBooking}
                hustler={bookingService}
                hustlerProfile={bookingProfile}
            />
        </div>
    );
};

export default JobDetailsPage;
