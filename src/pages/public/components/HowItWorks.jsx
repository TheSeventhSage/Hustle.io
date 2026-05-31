/**
 * HowItWorks.jsx
 *
 * Two-column layout:
 *   LEFT  (flex:4) — your SVG illustration slot
 *   RIGHT (flex:6) — diagonal staircase steps
 *
 * To use your own SVG, replace the <img> placeholder
 * inside .hiw-col-left with your <YourIllustration /> component.
 *
 * Import path (adjust to your project):
 *   import '../css/HowItWorks.css';
 */

import '../css/HowItWorks.css';

const steps = [
    {
        number: 1,
        title: 'Search for a service',
        description: 'Browse trusted professionals and discover the right service provider for your needs.',
    },
    {
        number: 2,
        title: 'Compare providers',
        description: 'Review profiles, ratings, and service details to make an informed decision.',
    },
    {
        number: 3,
        title: 'Book securely',
        description: 'Confirm your booking and pay safely through our protected payment system.',
    },
    {
        number: 4,
        title: 'Get it done',
        description: 'Work with your chosen professional and leave a review after completion.',
    },
];

const HowItWorks = () => {
    return (
        <section className="hiw-section">
            {/* SVG Filter to convert purple to green while preserving white */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="purple-to-green-hiw">
                        {/* Shift purple hue to green */}
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

            {/* Header */}
            <div className="hiw-header">
                <h2 className="hiw-heading">
                    <span className="hiw-heading-white">How it</span>{' '}
                    <span className="hiw-heading-orange">Works?</span>
                </h2>
                <p className="hiw-subtitle">
                    Follow a few simple steps to discover trusted professionals, book services with confidence, and manage your requests from start to finish.
                </p>
            </div>

            {/* Body */}
            <div className="hiw-body">

                {/* LEFT — replace with your SVG component */}
                <div className="hiw-col-left">
                    {/* ↓ Swap this img for your own SVG, e.g. <HowItWorksIllustration /> */}
                    <img
                        src="/images/home/howItWorks.webp"
                        alt="How it works illustration"
                    />
                </div>

                {/* RIGHT — diagonal steps */}
                <div className="hiw-col-right">
                    {steps.map((step) => (
                        <div key={step.number} className={`hiw-step hiw-step-${step.number}`}>
                            <div className="hiw-step-number">{step.number}</div>
                            <div className="hiw-step-bar" />
                            <div className="hiw-step-text">
                                <h3 className="hiw-step-title">{step.title}</h3>
                                <p className="hiw-step-desc">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default HowItWorks;