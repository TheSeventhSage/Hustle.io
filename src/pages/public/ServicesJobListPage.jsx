import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Wallet, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import SubHeader from './components/SubHeader';
import HeroSection from './components/HeroSection';
import './css/ServicesJobListPage.css';
import { useMarketplaceCategories, useMarketplaceServices } from './api/services.hooks.js';
import { locationService } from '../../shared/api/location.service.js';
import { formatRelativeTime } from '../../shared/lib/format.js';

const FALLBACK_TAGS = [
    'Engineering', 'Design', 'UI/UX', 'Graphic',
    'Marketing', 'Management', 'Soft', 'Construction',
];

const PAGE_SIZE = 8;

function buildJobFromService(service = {}) {
    const createdAt = service?.raw?.created_at ?? service?.raw?.posted_at ?? null;

    return {
        id: service?.id,
        artisanId: service?.raw?.artisan_account_id ?? service?.raw?.provider_account_id ?? null,
        title: service?.title ?? 'Untitled service',
        company: service?.providerName ?? 'Verified professional',
        location: service?.locationLabel ?? 'Location not specified',
        salary: service?.priceLabel ?? 'Pricing on request',
        tags: service?.skills?.length
            ? service.skills.slice(0, 3)
            : [service?.categoryName ?? 'Professional service'],
        time: createdAt ? formatRelativeTime(createdAt) : 'Recently updated',
        description: service?.description ?? 'No description provided yet.',
        image: service?.image ?? '/images/workers.png',
        categoryId: String(service?.raw?.category_id ?? service?.raw?.category?.id ?? ''),
        categoryName: service?.categoryName ?? 'Professional service',
        experienceLabel: service?.experienceLabel ?? '',
        priceAmount: Number(service?.priceAmount ?? 0) || 0,
        createdAt,
    };
}

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const normalized = value.toLowerCase();
        if (normalized === 'true') return true;
        if (normalized === 'false') return false;
        return Number.isFinite(Number(value)) ? Number(value) > 0 : Boolean(value);
    }
    if (typeof value === 'number') return value > 0;
    return Boolean(value);
}

const ServicesJobListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Applied filters (what's actually used for filtering)
    const [appliedQuery, setAppliedQuery] = useState('');
    const [appliedCity, setAppliedCity] = useState('');
    const [appliedCategory, setAppliedCategory] = useState('');
    const [page, setPage] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Function to apply filters
    const handleApplyFilters = () => {
        setAppliedQuery(searchQuery.trim());
        setAppliedCity(selectedCity);
        setAppliedCategory(selectedCategory);
        setPage(1);
    };

    // Function to clear all filters
    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCity('');
        setSelectedCategory('');
        setAppliedQuery('');
        setAppliedCity('');
        setAppliedCategory('');
        setPage(1);
    };

    const { data: categoriesData = [] } = useMarketplaceCategories({ retry: false });
    const { data: citiesData } = useQuery({
        queryKey: ['marketplace', 'cities', { per_page: 100 }],
        queryFn: () => locationService.getCities({ per_page: 100 }),
        staleTime: 5 * 60 * 1000,
    });
    const cities = locationService.unwrapItems(citiesData);

    // Build API query parameters
    const apiParams = useMemo(() => {
        const params = {
            page,
            per_page: PAGE_SIZE,
        };

        // Add search query if present
        if (appliedQuery) {
            params.q = appliedQuery;
        }

        // Add city filter if present
        if (appliedCity) {
            params.city_id = appliedCity;
        }

        if (appliedCategory) {
            params.category_id = appliedCategory;
        }

        return params;
    }, [page, appliedQuery, appliedCity, appliedCategory]);

    const {
        data: servicesData,
        isLoading,
        isError,
    } = useMarketplaceServices(apiParams, { retry: false });

    const jobs = useMemo(() => (
        (servicesData?.items ?? []).map((service) => buildJobFromService(service))
    ), [servicesData]);

    const paginationMeta = servicesData?.meta ?? {};
    const currentPage = toNumber(paginationMeta.page ?? paginationMeta.current_page, page) || page;
    const perPage = toNumber(paginationMeta.per_page ?? paginationMeta.limit, PAGE_SIZE) || PAGE_SIZE;
    const totalPages = toNumber(paginationMeta.total_pages ?? paginationMeta.last_page, 0) || 0;
    const totalResults = toNumber(paginationMeta.total ?? paginationMeta.total_count, 0) || 0;
    const hasNextPage = toBoolean(paginationMeta.has_next_page ?? paginationMeta.next_page);
    const hasPreviousPage = toBoolean(paginationMeta.has_previous_page ?? paginationMeta.previous_page ?? paginationMeta.prev_page);
    const nextPage = toNumber(paginationMeta.next_page, currentPage + 1);
    const previousPage = toNumber(paginationMeta.previous_page ?? paginationMeta.prev_page, currentPage - 1);

    const resultsStart = totalResults > 0 ? ((currentPage - 1) * perPage) + 1 : 0;
    const resultsEnd = totalResults > 0 ? Math.min(resultsStart + jobs.length - 1, totalResults) : 0;

    const categoryOptions = useMemo(() => (
        categoriesData.map((category) => {
            const label = category?.name ?? category?.title ?? 'Unnamed category';
            const id = String(category?.id ?? label);

            return {
                label,
                value: id,
                count: Number(category?.services_count ?? category?.service_count ?? 0) || 0,
            };
        })
    ), [categoriesData]);

    const tags = useMemo(() => {
        const liveTags = [...new Set(
            jobs.flatMap((job) => job.tags).filter(Boolean)
        )].slice(0, 8);

        return liveTags.length ? liveTags : FALLBACK_TAGS;
    }, [jobs]);

    const toggleSidebar = () => {
        setIsSidebarOpen((current) => !current);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const toggleCategory = (value) => {
        setSelectedCategory((current) => (current === value ? '' : value));
    };

    const openJob = (job) => {
        if (!job?.id) return;
        const suffix = job?.artisanId ? `?artisan=${encodeURIComponent(job.artisanId)}` : '';
        navigate(`/services/${job.id}${suffix}`, {
            state: { from: `${location.pathname}${location.search}` },
        });
    };

    const paginationNumbers = useMemo(() => {
        if (totalPages <= 0) return [];
        const windowSize = 7;
        const start = Math.max(1, Math.min(currentPage - Math.floor(windowSize / 2), totalPages - windowSize + 1));
        const end = Math.min(totalPages, start + windowSize - 1);
        return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    }, [currentPage, totalPages]);

    return (
        <div className="services-job-list-page">
            <SubHeader />
            <HeroSection variant="breadcrumb" title="Service List" breadcrumb="Home / Service List" />

            <main className="job-listing-section">
                <div className="listing-container">
                    {isSidebarOpen && (
                        <div
                            className="sidebar-overlay"
                            onClick={closeSidebar}
                            aria-hidden="true"
                        />
                    )}

                    <div className="listing-layout">
                        <aside className={`filter-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                            <button
                                className="sidebar-close-btn"
                                onClick={closeSidebar}
                                aria-label="Close filters"
                            >
                                <X size={24} />
                            </button>

                            <div className="filter-card">
                                <div className="filter-section">
                                    <h3 className="filter-heading">Search by Service Title</h3>
                                    <div className="search-input-wrapper">
                                        <Search size={16} className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Service title or provider"
                                            className="search-input"
                                            value={searchQuery}
                                            onChange={(event) => setSearchQuery(event.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="filter-section">
                                    <h3 className="filter-heading">Location</h3>
                                    <div className="select-wrapper">
                                        <MapPin size={16} className="select-icon" />
                                        <select
                                            className="filter-select"
                                            value={selectedCity}
                                            onChange={(event) => setSelectedCity(event.target.value)}
                                        >
                                            <option value="">Choose city</option>
                                            {cities.map((city) => (
                                                <option key={city.id} value={String(city.id)}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="select-chevron" />
                                    </div>
                                </div>

                                <div className="filter-section">
                                    <h3 className="filter-heading">Category</h3>
                                    <div className="checkbox-list">
                                        {categoryOptions.map((category) => (
                                            <label key={category.value} className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-input"
                                                    checked={selectedCategory === category.value}
                                                    onChange={() => toggleCategory(category.value)}
                                                />
                                                <span className="checkbox-label">{category.label}</span>
                                                <span className="count-badge">{category.count}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="filter-section">
                                    <h3 className="filter-heading">Tags</h3>
                                    <div className="tags-wrapper">
                                        {tags.map((tag) => (
                                            <span key={tag} className="tag-pill">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="filter-actions">
                                    <button
                                        className="apply-filters-btn"
                                        onClick={handleApplyFilters}
                                    >
                                        <Search size={16} />
                                        Search
                                    </button>
                                    <button
                                        className="clear-filters-btn"
                                        onClick={handleClearFilters}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>

                            <div className="download-app-card">
                                <h2 className="download-title">Download Our App</h2>
                                <p className="download-subtitle">Get the best experience</p>
                                <div className="download-buttons">
                                    <a href="#" className="store-button">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm2.49-1.27l-2.49 1.24-2.45-2.45 2.45-2.45 2.49 1.24c.61.31.61 1.16 0 1.47zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z" />
                                        </svg>
                                        <div className="store-text">
                                            <span className="store-label">GET IT ON</span>
                                            <span className="store-name">Google Play</span>
                                        </div>
                                    </a>
                                    <a href="#" className="store-button">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                        </svg>
                                        <div className="store-text">
                                            <span className="store-label">Download on the</span>
                                            <span className="store-name">App Store</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </aside>

                        <div className="results-area">
                            <div className="results-controls">
                                <p className="results-count">
                                    {`Showing ${resultsStart}\u2013${resultsEnd} of ${totalResults} results`}
                                </p>
                                <div className="sort-dropdown-wrapper">
                                    <button
                                        className="sidebar-toggle-btn"
                                        onClick={toggleSidebar}
                                        aria-label="Toggle filters"
                                    >
                                        <Menu size={24} />
                                        <span>Filters</span>
                                    </button>
                                </div>
                            </div>

                            <div className="job-cards-list">
                                {isLoading ? (
                                    <article className="job-card">
                                        <div className="job-card-content">
                                            <h3 className="job-title">Loading services...</h3>
                                            <p className="job-description">Marketplace services are loading from the public API.</p>
                                        </div>
                                    </article>
                                ) : isError ? (
                                    <article className="job-card">
                                        <div className="job-card-content">
                                            <h3 className="job-title">Unable to load services</h3>
                                            <p className="job-description">The public services endpoint did not return data for this page.</p>
                                        </div>
                                    </article>
                                ) : jobs.length === 0 ? (
                                    <article className="job-card">
                                        <div className="job-card-content">
                                            <h3 className="job-title">No services found</h3>
                                            <p className="job-description">Try changing your search, category, or city filters.</p>
                                        </div>
                                    </article>
                                ) : (
                                    jobs.map((job) => (
                                        <article key={job.id} className="job-card" onClick={() => openJob(job)}>
                                            <div className="job-card-image">
                                                <img src={job.image} alt={job.title} />
                                            </div>

                                            <div className="job-card-content">
                                                <h3 className="job-title">{job.title}</h3>

                                                <div className="job-meta">
                                                    <span className="meta-item">
                                                        <span className="meta-text">{job.company}</span>
                                                    </span>
                                                    <span className="meta-item">
                                                        <MapPin size={13} />
                                                        <span className="meta-text">{job.location}</span>
                                                    </span>
                                                    <span className="meta-item">
                                                        <Wallet size={13} />
                                                        <span className="meta-text">{job.salary}</span>
                                                    </span>
                                                </div>

                                                <div className="job-tags">
                                                    {job.tags.map((tag, index) => (
                                                        <span key={index} className="job-tag">{tag}</span>
                                                    ))}
                                                </div>

                                                <p className="job-description">{job.description}</p>
                                            </div>

                                            <div className="job-card-right">
                                                <span className="time-badge">{job.time}</span>
                                                <button
                                                    className="job-details-btn"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        openJob(job);
                                                    }}
                                                >
                                                    Service Details
                                                </button>
                                            </div>
                                        </article>
                                    ))
                                )}
                            </div>

                            <div className="pagination">
                                <button
                                    className="prev-btn"
                                    disabled={!hasPreviousPage}
                                    onClick={() => {
                                        if (hasPreviousPage) setPage(Math.max(1, previousPage));
                                    }}
                                >
                                    <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                                    <span>Previous</span>
                                </button>
                                <div className="page-buttons">
                                    {paginationNumbers.map((pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            className={`page-btn ${pageNumber === currentPage ? 'active' : ''}`}
                                            onClick={() => setPage(pageNumber)}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="next-btn"
                                    disabled={!hasNextPage}
                                    onClick={() => {
                                        if (hasNextPage) setPage(nextPage);
                                    }}
                                >
                                    <span>Next</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ServicesJobListPage;
