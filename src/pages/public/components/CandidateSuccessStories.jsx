import { useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Star, Quote } from 'lucide-react';
import '../css/CandidateSuccessStories.css';
import { useMarketplaceReviews } from '../api/services.hooks.js';
import { publicProfileService } from '../../../shared/api/publicProfile.service.js';
import { firstDefined, getProfileDisplayName, getProfileLocation } from '../../../shared/lib/normalize.js';

const CandidateSuccessStories = () => {
    const { data: reviewsData } = useMarketplaceReviews({}, { retry: false });

    const fallbackTestimonials = [
        {
            id: 1,
            name: 'Kristin Watson',
            role: 'Business Owner',
            location: 'Lagos, Nigeria',
            title: 'Best Experience Ever',
            review:
                'This platform completely transformed the way I find reliable service providers. I was able to connect with highly skilled and verified professionals. The booking process became faster, smoother, and more transparent. Hustle.io made it easy to discover trusted talent and manage service requests with confidence.',
            rating: 5,
            mainImage: '/images/workers.png',
            thumbnail: '/images/workers.png',
        },
        {
            id: 2,
            name: 'John Anderson',
            role: 'Freelance Designer',
            location: 'Abuja, Nigeria',
            title: 'Amazing Platform',
            review:
                'Finding quality clients has never been easier. The platform connected me with people who truly valued my skills and experience. The entire process was seamless and professional. Hustle.io helped me grow my business and build a strong reputation.',
            rating: 5,
            mainImage: '/images/workers.png',
            thumbnail: '/images/workers.png',
        },
        {
            id: 3,
            name: 'Sarah Mitchell',
            role: 'Marketing Consultant',
            location: 'Accra, Ghana',
            title: 'Highly Recommended',
            review:
                'I was able to land consistent projects within weeks of joining this platform. The quality of clients and the ease of the booking process exceeded my expectations. Truly a game-changer for service providers looking to grow their professional presence.',
            rating: 5,
            mainImage: '/images/workers.png',
            thumbnail: '/images/workers.png',
        },
    ];

    const imagePool = [
        '/images/workers.png',
        '/images/workers.png',
        '/images/workers.png',
    ];

    // Default avatar for when no image is available
    const defaultAvatar = '/images/workers.png';

    const liveReviews = useMemo(() => {
        return (reviewsData?.items ?? []).filter((review) => review?.comment).slice(0, 6);
    }, [reviewsData]);

    const reviewerIds = useMemo(() => {
        const uniqueIds = new Set();

        liveReviews.forEach((review) => {
            const reviewerAccountId = firstDefined(
                review?.reviewer_account_id,
                review?.reviewer?.account_id,
                review?.reviewer?.id,
            );

            if (reviewerAccountId) {
                uniqueIds.add(String(reviewerAccountId));
            }
        });

        return Array.from(uniqueIds);
    }, [liveReviews]);

    const reviewerProfileQueries = useQueries({
        queries: reviewerIds.map((reviewerId) => ({
            queryKey: ['profiles', 'public', reviewerId],
            queryFn: () => publicProfileService.getProfile(reviewerId),
            staleTime: 5 * 60 * 1000,
            retry: 1,
        })),
    });

    const reviewerProfilesById = useMemo(() => {
        return reviewerIds.reduce((accumulator, reviewerId, index) => {
            const profile = reviewerProfileQueries[index]?.data;
            if (profile) {
                accumulator[String(reviewerId)] = profile;
            }
            return accumulator;
        }, {});
    }, [reviewerIds, reviewerProfileQueries]);

    const testimonials = useMemo(() => {
        const liveTestimonials = liveReviews.map((review, index) => {
            const reviewerAccountId = firstDefined(
                review?.reviewer_account_id,
                review?.reviewer?.account_id,
                review?.reviewer?.id,
            );
            const reviewerProfile = reviewerAccountId
                ? reviewerProfilesById[String(reviewerAccountId)] ?? null
                : null;

            return {
                id: review.id ?? index + 1,
                reviewerAccountId: reviewerAccountId ?? null,
                name: getProfileDisplayName(reviewerProfile, review.reviewerName ?? 'Verified Client'),
                role: firstDefined(
                    reviewerProfile?.account_type,
                    reviewerProfile?.role,
                    reviewerProfile?.user_type,
                    'Verified Client',
                ),
                location: getProfileLocation(reviewerProfile, 'Location not provided'),
                title: Number(review.rating ?? 0) >= 4.5 ? 'Excellent Experience' : 'Trusted Review',
                review: review.comment,
                rating: Number(review.rating ?? 0) || 5,
                mainImage: firstDefined(
                    reviewerProfile?.avatar_url,
                    reviewerProfile?.profile_image_url,
                    reviewerProfile?.avatar,
                    imagePool[index % imagePool.length],
                    defaultAvatar,
                ),
                thumbnail: firstDefined(
                    reviewerProfile?.avatar_url,
                    reviewerProfile?.profile_image_url,
                    reviewerProfile?.avatar,
                    imagePool[index % imagePool.length],
                    defaultAvatar,
                ),
                bio: reviewerProfile?.bio ?? '',
            };
        });

        return liveTestimonials.length ? liveTestimonials : fallbackTestimonials;
    }, [liveReviews, reviewerProfilesById]);

    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (!testimonials.length) return;
        setActiveIndex((current) => Math.min(current, testimonials.length - 1));
    }, [testimonials.length]);

    useEffect(() => {
        if (testimonials.length <= 3) return undefined;

        const intervalId = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % testimonials.length);
        }, 5000);

        return () => window.clearInterval(intervalId);
    }, [testimonials.length]);

    // Auto-scroll the thumbnail stack to keep active item visible
    useEffect(() => {
        const thumbnailStack = document.querySelector('.thumbnail-stack');
        const activeItem = document.querySelector('.thumbnail-item.active');

        if (thumbnailStack && activeItem) {
            // Use scrollTop to scroll within the container without affecting page scroll
            const stackTop = thumbnailStack.scrollTop;
            const stackHeight = thumbnailStack.clientHeight;
            const itemTop = activeItem.offsetTop;
            const itemHeight = activeItem.clientHeight;

            // Check if item is outside visible area
            if (itemTop < stackTop) {
                // Item is above visible area, scroll up
                thumbnailStack.scrollTo({
                    top: itemTop,
                    behavior: 'smooth'
                });
            } else if (itemTop + itemHeight > stackTop + stackHeight) {
                // Item is below visible area, scroll down
                thumbnailStack.scrollTo({
                    top: itemTop + itemHeight - stackHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [activeIndex]);

    const activeTestimonial = testimonials[activeIndex] ?? testimonials[0];

    return (
        <section className="candidate-success-wrapper">
            <div className="candidate-success-section">
                {/* Top curved shape */}
                <div className="top-curved-shape"></div>

                {/* Background decorations */}
                <div className="bg-decoration cloud-1"></div>
                <div className="bg-decoration cloud-2"></div>
                <div className="bg-decoration city-silhouette"></div>

                {/* Header */}
                <div className="success-header">
                    <h2 className="success-heading">
                        <span className="heading-white">Client Success</span>{' '}
                        <span className="heading-yellow">Stories</span>
                    </h2>

                    <p className="success-subtitle">
                        Discover how clients found trusted professionals and service providers achieved career growth through our marketplace.
                    </p>
                </div>

                {/* Main Content */}
                <div className="success-content">
                    {/* Main Testimonial Card */}
                    <div className="testimonial-card">
                        {/* Left Portrait */}
                        <div className="testimonial-portrait">
                            <img src={activeTestimonial.mainImage || defaultAvatar} alt={activeTestimonial.name} />
                        </div>

                        {/* Text Content */}
                        <div className="testimonial-text">
                            <div className="quote-rating-row">
                                <Quote size={72} strokeWidth={3} className="quote-icon" />
                                <div className="rating-stars">
                                    {[...Array(5)].map((_, index) => (
                                        <Star
                                            key={index}
                                            size={24}
                                            fill={index < activeTestimonial.rating ? 'var(--color-secondary)' : '#718970'}
                                            stroke={index < activeTestimonial.rating ? 'var(--color-secondary)' : '#718970'}
                                            strokeWidth={1.5}
                                        />
                                    ))}
                                </div>
                            </div>

                            <h3 className="testimonial-title">{activeTestimonial.title}</h3>

                            <p className="testimonial-review">{activeTestimonial.review}</p>

                            <div className="reviewer-info">
                                <p className="reviewer-name">{activeTestimonial.name}</p>
                                <p className="reviewer-role">
                                    {String(activeTestimonial.role || 'Verified Client').replaceAll('_', ' ')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Thumbnail Stack - Shows all with overflow scroll */}
                    <div className="thumbnail-stack">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={testimonial.id}
                                className={`thumbnail-item ${activeTestimonial.id === testimonial.id ? 'active' : ''
                                    }`}
                                onClick={() => setActiveIndex(index)}
                            >
                                {activeTestimonial.id === testimonial.id && <div className="active-bar"></div>}
                                <img src={testimonial.thumbnail || defaultAvatar} alt={testimonial.name} />
                                <div className="thumbnail-overlay"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CandidateSuccessStories;
