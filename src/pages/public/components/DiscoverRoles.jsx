import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/DiscoverRoles.css';
import { usePrimaryServices } from '../api/services.hooks.js';
import { formatRelativeTime } from '../../../shared/lib/format.js';

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

const DiscoverRoles = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: primaryServicesData } = usePrimaryServices({}, { retry: false });

    const fallbackJobs = [
        {
            id: 1,
            title: 'UI UX Designer',
            tags: ['Full Time'],
            location: 'Los Angeles, CA',
            salary: '$40000-$42000',
            timeAgo: '2 days ago',
            description:
                'We are looking for a talented UI/UX Designer to create amazing user experiences. The ideal candidate should have an eye for clean and artful design, possess superior UI skills, and be able to translate high-level requirements into...',
            image: '/images/ui-ux-designer.png',
        },
        {
            id: 2,
            title: 'Frontend Developer',
            tags: ['Part Time', 'Remote', 'Freelance'],
            location: 'Menlo Park, CA',
            salary: '$80k - $100k',
            timeAgo: '5 days ago',
            description:
                'We are seeking a skilled Frontend Developer to join our team. You will be responsible for building and maintaining high-quality user interfaces, collaborating closely with designers and back-end developers to deliver...',
            image: '/images/frontend-developer.png',
        },
        {
            id: 3,
            title: 'Product Manager',
            tags: ['Remote'],
            location: 'Seattle, WA',
            salary: '$110k - $140k',
            timeAgo: '1 week ago',
            description:
                'We are looking for a strategic and data-driven Product Manager to lead the development of innovative products. You will work cross-functionally to define product vision, prioritize the roadmap, and ship features that delight customers.',
            image: '/images/product-manager.png',
        },
        {
            id: 4,
            title: 'Backend Engineer',
            tags: ['Full Time', 'Remote'],
            location: 'San Francisco, CA',
            salary: '$120k - $160k',
            timeAgo: '3 days ago',
            description:
                'Join our engineering team as a Backend Engineer. You will design and build scalable APIs, work with databases, and ensure our systems are reliable and performant. Strong knowledge of Node.js or Python required.',
            image: '/images/backend-engineer.png',
        },
        {
            id: 5,
            title: 'Digital Marketer',
            tags: ['Part Time', 'Freelance'],
            location: 'Austin, TX',
            salary: '$50k - $70k',
            timeAgo: '1 week ago',
            description:
                'We need a creative Digital Marketer to develop and execute marketing campaigns across multiple channels. Experience with SEO, social media, email marketing, and analytics tools is essential.',
            image: '/images/digital-marketer.png',
        },
        {
            id: 6,
            title: 'Project Coordinator',
            tags: ['Full Time'],
            location: 'New York, NY',
            salary: '$55k - $75k',
            timeAgo: '4 days ago',
            description:
                'Seeking an organized Project Coordinator to manage timelines, coordinate with stakeholders, and ensure projects are delivered on time. Strong communication and organizational skills are a must.',
            image: '/images/project-coordinator.png',
        },
    ];

    const jobs = useMemo(() => {
        const liveJobs = (primaryServicesData?.items ?? []).map((provider) => {
            const service = provider?.primaryService ?? {};
            const createdAt = service?.raw?.created_at ?? service?.raw?.posted_at ?? null;

            return {
                id: service?.id ?? provider?.primaryServiceId ?? provider?.id,
                artisanId: provider?.artisanAccountId ?? null,
                title: service?.title ?? 'Untitled service',
                tags: service?.skills?.length
                    ? service.skills.slice(0, 3)
                    : [service?.categoryName ?? 'Professional service'],
                location: getLandingLocation(service, provider),
                salary: service?.priceLabel ?? 'Pricing on request',
                timeAgo: createdAt ? formatRelativeTime(createdAt) : 'Available now',
                description: service?.description ?? provider?.providerBio ?? 'No description provided yet.',
                image: service?.image ?? '/images/workers.png',
            };
        });

        return liveJobs.length ? liveJobs : fallbackJobs;
    }, [primaryServicesData]);

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

                {/* Jobs Grid */}
                <div className="grid grid-cols-3 gap-[27px] w-full max-w-[1440px] mx-auto xl:gap-6 xl:grid-cols-4 lg:grid-cols-4 lg:gap-5 md:grid-cols-3 md:gap-[18px] max-sm:grid-cols-1 max-sm:gap-4 max-sm:max-w-[400px]">
                    {jobs.map((job) => (
                        <article
                            key={job.id}
                            className="bg-white rounded-[10px] p-[18px] overflow-hidden transition-all duration-250 cursor-pointer flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] md:h-auto max-sm:p-4"
                            onClick={() => {
                                if (!job.id) return;
                                const suffix = job.artisanId ? `?artisan=${encodeURIComponent(job.artisanId)}` : '';
                                navigate(`/services/${job.id}${suffix}`, {
                                    state: { from: `${location.pathname}${location.search}` },
                                });
                            }}
                        >
                            {/* Image Panel */}
                            <div className="w-full h-[240px] bg-[var(--color-mint-pale)] rounded-lg flex items-center justify-center p-5 overflow-hidden flex-shrink-0 xl:h-[220px] lg:h-[200px] max-sm:h-[220px]">
                                <img
                                    src={job.image}
                                    alt={job.title}
                                    className="w-full h-full object-contain object-center"
                                />
                            </div>

                            {/* Job Content */}
                            <div className="flex flex-col mt-[26px] flex-1 overflow-hidden md:mt-5 max-sm:mt-4">
                                <h3 className="text-[22px] font-extrabold text-[#050505] mb-3 leading-[1.2] md:text-xl max-sm:text-[19px] max-sm:mb-2">
                                    {job.title}
                                </h3>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 mb-3 max-sm:mb-2">
                                    {job.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center bg-[#668f63] text-white text-[11px] font-bold py-1 px-2 rounded-[5px] capitalize max-sm:text-[10px]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-1 text-[13px] text-[#2d342f] mb-3 max-sm:text-[12px] max-sm:mb-2">
                                    <MapPin size={14} strokeWidth={2.5} className="flex-shrink-0 max-sm:w-3 max-sm:h-3" />
                                    <span>{job.location}</span>
                                </div>

                                {/* Salary Row */}
                                <div className="flex items-center justify-between mb-5 max-sm:mb-3">
                                    <span className="text-[19px] font-extrabold text-black md:text-[17px] max-sm:text-[16px]">
                                        {job.salary}
                                    </span>
                                    <span className="text-xs text-[#9a9a9a] font-medium max-sm:text-[11px]">
                                        {job.timeAgo}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="job-description text-[13px] leading-[1.35] text-[#6a6a6a] m-0 max-sm:text-[12px]">
                                    {job.description}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DiscoverRoles;
