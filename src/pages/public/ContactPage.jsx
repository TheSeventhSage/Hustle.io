import { useState } from 'react';
import { Phone, Mail, Clock, MapPin } from 'lucide-react';
import SubHeader from './components/SubHeader';
import HeroSection from './components/HeroSection';
import './css/ContactPage.css';

const CONTACT_INFO = [
    {
        icon: Phone,
        label: 'Call for inquiry',
        value: '+1 (800) 123-4567',
    },
    {
        icon: Mail,
        label: 'Send us email',
        value: 'hello@hustle.io.com',
    },
    {
        icon: Clock,
        label: 'Opening hours',
        value: 'Mon - Fri: 10AM - 10PM',
    },
    {
        icon: MapPin,
        label: 'Office',
        value: '1800 Broadway Ave, New York, NY 10036',
    },
];

const ContactPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Handle form submission
    };

    return (
        <div className="contact-page">
            <SubHeader />
            <HeroSection variant="breadcrumb" title="Contact Us" breadcrumb="Home / Contact" />

            <main className="contact-section">
                <div className="contact-container">
                    {/* Top Content Layout */}
                    <div className="contact-content-layout">
                        {/* Left Contact Info */}
                        <div className="contact-info-area">
                            <h1 className="contact-headline">
                                You Will Grow, You Will<br />
                                Succeed. We Promise That
                            </h1>

                            <p className="contact-intro">
                                We're here to help you take the next step in your career journey. Whether you have questions about job listings, partnerships, or just want to say hello — our team is ready to assist you every step of the way.
                            </p>

                            <div className="contact-details-grid">
                                {CONTACT_INFO.map((item, index) => (
                                    <div key={index} className="contact-detail-item">
                                        <item.icon size={22} className="contact-icon" />
                                        <h3 className="contact-label">{item.label}</h3>
                                        <p className="contact-value">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Contact Form */}
                        <div className="contact-form-card">
                            <h2 className="form-title">Get in touch</h2>
                            <p className="form-subtitle">
                                Start working with Hustle that can provide everything you need to generate awareness, drive traffic, connect.
                            </p>

                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstName" className="form-label">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="John"
                                            className="form-input"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="lastName" className="form-label">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Doe"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john.doe@example.com"
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message" className="form-label">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Your message..."
                                        className="form-textarea"
                                        required
                                    />
                                </div>

                                <button type="submit" className="form-submit-btn">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Bottom Map Section */}
                    <div className="map-section">
                        <div className="map-container">
                            {/* Replace with actual Google Maps embed or static map image */}
                            <img
                                src="/images/contact-map.png"
                                alt="Office Location Map"
                                className="map-image"
                            />
                            <div className="map-location-info">
                                <h4 className="map-location-title">London</h4>
                                <p className="map-location-subtitle">London, UK</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactPage;
