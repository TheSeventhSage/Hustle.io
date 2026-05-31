import { BadgeCheck, UserSearch, Award, Star, CalendarCheck, ClipboardCheck, ArrowDownLeft } from 'lucide-react';
import '../css/WhyChooseUs.css';

const FEATURES = [
    {
        id: 1,
        title: 'Tailored Recruitment Solutions',
        description: 'We understand your unique needs and provide customized hiring strategies to ensure the perfect match',
        icon: BadgeCheck,
        backgroundImage: '/images/tailored-recruitment.jpg'
    },
    {
        id: 2,
        title: 'Expert in Hiring & Job Search',
        description: 'Our experienced team will help you in the best way possible in the field of job search and recruitment.',
        icon: UserSearch,
        backgroundImage: '/images/expert-hiring.jpg'
    },
    {
        id: 3,
        title: 'Commitment to Quality',
        description: 'We prioritize integrity, transparency, and efficiency, ensuring a seamless hiring experience.',
        icon: Award,
        backgroundImage: '/images/commitment-quality.jpg'
    },
    {
        id: 4,
        title: 'Extensive Talent Network',
        description: 'Access a wide pool of qualified candidates ready to enhance your business.',
        icon: Star,
        backgroundImage: '/images/talent-network.jpg'
    },
    {
        id: 5,
        title: 'Long-Term Partnerships',
        description: 'We build lasting relationships through trust, reliability, and consistent results.',
        icon: CalendarCheck,
        backgroundImage: '/images/long-term-partnerships.jpg'
    },
    {
        id: 6,
        title: 'Quality & Integrity',
        description: 'We ensure transparency, efficiency, and lasting partnerships built on trust and excellence.',
        icon: ClipboardCheck,
        backgroundImage: '/images/quality-integrity.jpg'
    }
];

const WhyChooseUs = () => {
    return (
        <section className="why-choose-us-section">
            <div className="why-choose-us-container">
                <h2 className="why-choose-us-heading">
                    <span className="heading-white">Why </span>
                    <span className="heading-orange">Choose Us</span>
                </h2>

                <p className="why-choose-us-subtitle">
                    Finding the right people shouldn't feel complicated we make it easy.
                </p>

                <div className="why-choose-grid">
                    {FEATURES.map((feature) => {
                        const IconComponent = feature.icon;
                        return (
                            <div
                                key={feature.id}
                                className="why-choose-card"
                                style={{
                                    '--hover-bg-image': `url(${feature.backgroundImage})`,
                                }}
                            >
                                <div className="card-overlay"></div>

                                <div className="card-content">
                                    <div className="icon-wrapper">
                                        <IconComponent size={72} strokeWidth={2} className="feature-icon" />
                                    </div>

                                    <h3 className="feature-title">{feature.title}</h3>
                                </div>

                                <div className="decorative-circle"></div>
                                <div className="hover-arrow-button">
                                    <ArrowDownLeft size={28} strokeWidth={2.5} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
