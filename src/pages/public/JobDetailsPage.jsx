import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Users, Clock, MapPin, Wallet, Briefcase, GraduationCap, Check, Facebook, Twitter, Linkedin, Star, Tags } from 'lucide-react';
import SubHeader from './components/SubHeader';
import HeroSection from './components/HeroSection';
import './css/JobDetailsPage.css';
import { useMarketplaceArtisanServices, useMarketplaceServiceDetail } from './api/services.hooks.js';
import { formatDate, formatRelativeTime, formatServiceRate } from '../../shared/lib/format.js';
import useAuthStore from '../../features/auth/auth.store.js';
import useUIStore from '../../shared/store/ui.store.js';
import { BookHustlerPanel } from '../../features/hustles/components/BookHustlerPanel.jsx';
import { PublicProfileDrawer } from '../../features/hustles/components/hustle-detail-panel/PublicProfileDrawer.jsx';

function buildDescription(service) {
    return service?.raw?.description
        ?? service?.raw?.short_description
        ?? service?.description
        ?? 'No description provided yet.';
}

function buildBudget(service) {
    const amount = Number(service?.raw?.rate_min_amount ?? service?.priceAmount ?? 0) || 0;
    const currency = service?.raw?.currency_code ?? 'NGN';
    const pricingModel = service?.raw?.pricing_model_default ?? service?.raw?.pricing_display_type;

    if (!amount) return 'Pricing on request';
    return formatServiceRate(amount, currency, pricingModel);
}

function buildResponsibilities(service, providerBio) {
    const description = buildDescription(service);
    const sentences = description
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

    const metaSentences = [
        service?.categoryName ? `Service category: ${service.categoryName}.` : null,
        service?.pricingLabel ? `Pricing model: ${service.pricingLabel}.` : null,
        service?.availabilityLabel ? `Availability: ${service.availabilityLabel}.` : null,
        providerBio ? `Provider summary: ${providerBio}` : null,
    ].filter(Boolean);

    return [...sentences, ...metaSentences].slice(0, 6);
}

const JobDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const [searchParams] = useSearchParams();
    const [bookingOpen, setBookingOpen] = useState(false);
    const [providerDrawerOpen, setProviderDrawerOpen] = useState(false);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const toastInfo = useUIStore((state) => state.toastInfo);

    const serviceId = params.id ?? searchParams.get('id');
    const explicitArtisanId = searchParams.get('artisan');

    const {
        data: service,
        isLoading: serviceLoading,
        isError: serviceError,
    } = useMarketplaceServiceDetail(serviceId, {
        enabled: Boolean(serviceId),
        retry: false,
    });

    const artisanId = explicitArtisanId
        ?? service?.raw?.artisan_account_id
        ?? service?.raw?.provider_account_id
        ?? service?.raw?.artisan_id
        ?? null;

    const { data: artisanServices } = useMarketplaceArtisanServices(
        artisanId,
        { per_page: 12 },
        {
            enabled: Boolean(artisanId),
            retry: false,
        }
    );

    const description = buildDescription(service);
    const providerName = artisanServices?.providerName ?? service?.providerName ?? 'Verified professional';
    const providerBio = artisanServices?.providerBio ?? description;
    const providerRating = artisanServices?.rating ?? service?.rating ?? 0;
    const providerReviews = artisanServices?.reviewCount ?? service?.reviewCount ?? 0;
    const providerServicesCount = artisanServices?.servicesCount ?? 1;
    const cityName = service?.raw?.city_name ?? service?.raw?.city?.name ?? '';
    const countryName = service?.raw?.country_name ?? service?.raw?.country?.name ?? '';
    const locationLabel = service?.locationLabel ?? 'Location not specified';
    const primaryLocation = locationLabel && locationLabel !== 'Location not specified'
        ? locationLabel
        : '';
    const overviewLocation = primaryLocation || cityName || countryName || '';
    const hasPrimaryLocation = Boolean(primaryLocation);
    const hasOverviewLocation = Boolean(overviewLocation);
    const latitude = Number(service?.raw?.latitude ?? service?.raw?.provider_latitude ?? NaN);
    const longitude = Number(service?.raw?.longitude ?? service?.raw?.provider_longitude ?? NaN);
    const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
    const mapEmbedUrl = hasCoordinates
        ? `https://maps.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}&z=15&output=embed`
        : null;
    const postedAt = service?.raw?.posted_at ?? service?.raw?.created_at ?? null;
    const budgetLabel = buildBudget(service);
    const ratingOverviewValue = providerRating > 0
        ? `${providerRating.toFixed(1)} / 5`
        : 'No ratings yet';
    const jobMeta = useMemo(() => ([
        { icon: Star, label: 'Average Rating', value: ratingOverviewValue },
        { icon: Briefcase, label: 'Experience Level', value: service?.experienceLabel ?? 'Not specified' },
        ...(hasPrimaryLocation ? [{ icon: MapPin, label: 'Location', value: primaryLocation }] : []),
        { icon: Wallet, label: 'Price Offer', value: service?.priceLabel ?? 'Pricing on request' },
    ]), [hasPrimaryLocation, primaryLocation, ratingOverviewValue, service]);

    const overviewItems = useMemo(() => ([
        { icon: Briefcase, label: 'Service Title', value: service?.title ?? 'Service listing' },
        { icon: Star, label: 'Average Rating', value: ratingOverviewValue ?? 'No ratings yet' },
        { icon: Tags, label: 'Category', value: service?.categoryName ?? 'Professional service' },
        { icon: Briefcase, label: 'Experience', value: service?.experienceLabel ?? 'Not specified' },
        { icon: Wallet, label: 'Service Offer', value: service?.priceLabel ?? 'Pricing on request' },
        ...(hasOverviewLocation ? [{ icon: MapPin, label: 'Location', value: overviewLocation }] : []),
    ]), [hasOverviewLocation, overviewLocation, service]);

    const responsibilities = useMemo(() => (
        buildResponsibilities(service, providerBio)
    ), [providerBio, service]);

    const skills = useMemo(() => {
        const liveSkills = Array.isArray(service?.skills) ? service.skills.filter(Boolean) : [];
        return liveSkills.length ? liveSkills : ['No specific skills were provided for this service.'];
    }, [service]);

    const tags = useMemo(() => {
        const liveTags = [
            ...(service?.skills ?? []),
            service?.categoryName,
            service?.experienceLabel,
            service?.pricingLabel,
        ].filter(Boolean);

        return [...new Set(liveTags)].slice(0, 6);
    }, [service]);

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/services/${serviceId}${explicitArtisanId ? `?artisan=${explicitArtisanId}` : ''}`
        : '';
    const encodedShareUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(service?.title ?? 'Hustle.io service');

    const bookingProfile = useMemo(() => ({
        name: providerName,
        role: service?.raw?.artisan_role ?? 'Service provider',
        avatar_url: service?.avatar ?? service?.image ?? '/images/workers.png',
        bio: providerBio,
        city: { name: service?.raw?.city_name ?? '' },
        country: { name: service?.raw?.country_name ?? '' },
        stats: {
            rating: providerRating,
        },
        services: artisanServices?.items ?? [],
    }), [artisanServices?.items, providerBio, providerName, providerRating, service]);

    const bookingService = useMemo(() => (
        service
            ? {
                id: service.id,
                _raw: service.raw ?? {},
            }
            : null
    ), [service]);

    const handleApply = () => {
        if (!service) return;
        if (!isAuthenticated) {
            toastInfo('Please sign in first to book this service.');
            navigate('/sign-in', {
                state: { from: `${location.pathname}${location.search}` },
            });
            return;
        }

        setBookingOpen(true);
    };

    if (!serviceId) {
        return (
            <div className="job-details-page">
                <SubHeader />
                <HeroSection variant="breadcrumb" title="Service Details" breadcrumb="Home / Service List / Service Details" />
                <main className="job-details-section">
                    <div className="details-container">
                        <div className="job-summary">
                            <div className="summary-content">
                                <h1 className="job-title-main">No service selected</h1>
                                <p className="job-description-main">Open a service from the listing page to view its details here.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="job-details-page">
            <SubHeader />
            <HeroSection variant="breadcrumb" title="Service Details" breadcrumb="Home / Service List / Service Details" />

            <main className="job-details-section">
                <div className="details-container">
                    <div className="job-summary">
                        <div className="summary-illustration">
                            <img
                                src={service?.image ?? '/images/workers.png'}
                                alt={service?.title ?? 'Service image'}
                                className="summary-image"
                            />
                        </div>

                        <div className="summary-content">
                            <h1 className="job-title-main">
                                {serviceLoading ? 'Loading service...' : service?.title ?? 'Service unavailable'}
                            </h1>
                            <p className="job-description-main">
                                {serviceError ? 'Unable to load this service right now.' : description}
                            </p>

                            <div className="vacancy-row">
                                <Users size={20} />
                                <span>{providerServicesCount} Service Offer{providerServicesCount === 1 ? '' : 's'}</span>
                            </div>

                            <div className="job-meta-grid">
                                {jobMeta.map((item, index) => (
                                    <div key={index} className="meta-item-detail">
                                        <item.icon size={22} className="meta-icon-detail" />
                                        <div className="meta-text-detail">
                                            <div className="meta-value-detail">{item.value}</div>
                                            <div className="meta-label-detail">{item.label}</div>
                                        </div>
                                        {index < jobMeta.length - 1 && <div className="meta-divider" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="content-divider" />

                    <div className="content-layout">
                        <div className="main-content">
                            <section className="content-section">
                                <h2 className="section-heading">Service Description</h2>
                                <p className="section-text">{description}</p>
                            </section>

                            <section className="content-section">
                                <h2 className="section-heading">Key Responsibilities</h2>
                                <ul className="checklist">
                                    {responsibilities.map((item, index) => (
                                        <li key={index} className="checklist-item">
                                            <Check size={20} className="check-icon" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="content-section">
                                <h2 className="section-heading">Professional Skills</h2>
                                <ul className="checklist">
                                    {skills.map((item, index) => (
                                        <li key={index} className="checklist-item">
                                            <Check size={20} className="check-icon" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <div className="tags-section">
                                <span className="tags-label">Tags:</span>
                                <div className="tags-list">
                                    {tags.map((tag, index) => (
                                        <span key={index} className="tag-item">{tag}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="share-section">
                                <span className="share-label">Share Service:</span>
                                <div className="share-icons">
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="share-icon"
                                        aria-label="Share on Facebook"
                                    >
                                        <Facebook size={22} />
                                    </a>
                                    <a
                                        href={`https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedTitle}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="share-icon"
                                        aria-label="Share on Twitter"
                                    >
                                        <Twitter size={22} />
                                    </a>
                                    <a
                                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="share-icon"
                                        aria-label="Share on LinkedIn"
                                    >
                                        <Linkedin size={22} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <aside className="sidebar-content">
                            <div className="overview-card">
                                <h3 className="overview-heading">Service Overview</h3>

                                <div className="overview-list">
                                    {overviewItems.map((item, index) => (
                                        <div key={index} className="overview-row">
                                            <item.icon size={22} className="overview-icon" />
                                            <div className="overview-text">
                                                <div className="overview-label">{item.label}</div>
                                                <div className="overview-value">{item.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button className="apply-button" onClick={handleApply}>Apply Now</button>

                                {hasPrimaryLocation && mapEmbedUrl && (
                                    <div className="location-section">
                                        <h4 className="location-heading">Service Location</h4>
                                        <div className="map-container">
                                            <iframe
                                                src={mapEmbedUrl}
                                                title="Service Location Map"
                                                className="map-embed"
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="company-card">
                                <div className="company-logo-wrapper">
                                    <img
                                        src={service?.avatar ?? service?.image ?? '/images/workers.png'}
                                        alt={providerName}
                                        className="company-logo"
                                    />
                                </div>
                                <h4 className="company-name">{providerName}</h4>
                                <p className="company-type">{service?.raw?.artisan_role ?? 'Service provider'}</p>
                                {hasPrimaryLocation && (
                                    <p className="company-location">{primaryLocation}</p>
                                )}
                                <button className="company-profile-btn" onClick={() => setProviderDrawerOpen(true)}>
                                    View Company Profile
                                </button>
                                <p className="company-location">
                                    {providerRating > 0 ? `${providerRating.toFixed(1)} rating from ${providerReviews} review${providerReviews === 1 ? '' : 's'}` : budgetLabel}
                                </p>
                                {postedAt && (
                                    <p className="company-location">
                                        {`Published ${formatDate(postedAt)} (${formatRelativeTime(postedAt)})`}
                                    </p>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <BookHustlerPanel
                isOpen={bookingOpen}
                onClose={() => setBookingOpen(false)}
                onBack={() => setBookingOpen(false)}
                hustler={bookingService}
                hustlerProfile={bookingProfile}
            />

            <PublicProfileDrawer
                isOpen={providerDrawerOpen}
                accountId={artisanId}
                serviceId={service?.id}
                onClose={() => setProviderDrawerOpen(false)}
            />
        </div>
    );
};

export default JobDetailsPage;
