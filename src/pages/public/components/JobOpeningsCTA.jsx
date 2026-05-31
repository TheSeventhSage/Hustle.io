import { Link } from 'react-router-dom';
import { ArrowRight, } from 'lucide-react'

import '../css/JobOpeningsCTA.css';

const JobOpeningsCTA = () => {
    return (
        <section className="job-openings-cta">
            {/* SVG Filter to convert purple to green while preserving white */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="purple-to-green">
                        {/* Convert to HSL color space */}
                        <feColorMatrix
                            type="matrix"
                            values="1 0 0 0 0
                                    0 1 0 0 0
                                    0 0 1 0 0
                                    0 0 0 1 0"
                        />
                        {/* Shift purple hue (270-300deg) to green (120-150deg) */}
                        <feColorMatrix
                            type="hueRotate"
                            values="-150"
                        />
                        {/* Adjust saturation to match background */}
                        <feColorMatrix
                            type="saturate"
                            values="0.7"
                        />
                    </filter>
                </defs>
            </svg>

            <div className="cta-container">
                {/* Left Illustration */}
                <div className="cta-illustration">
                    <img
                        src="/images/home/cta.webp"
                        alt="Find your next job illustration"
                        className="illustration-image"
                    />
                </div>

                {/* Right Content */}
                <div className="cta-content">
                    <h2 className="cta-heading">
                        <span className="heading-white">Ready to find </span>
                        <span className="heading-green">trusted</span>{' '}
                        <br />
                        <span className="heading-white">professionals?</span>
                    </h2>

                    <p className="cta-subtitle">
                        Discover skilled service providers, book securely, and manage your service requests with confidence. Join thousands who trust Hustle.io.
                    </p>

                    <Link to="/services" className="footer-cta-button">
                        Find a Service
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default JobOpeningsCTA;
