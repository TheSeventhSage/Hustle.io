import { Link } from 'react-router-dom'
import { ArrowRight, Facebook, Linkedin, Mail, MapPin, Phone, Twitter as XIcon } from 'lucide-react'
import { HustleLogo } from '../../../shared/components/HustleLogo.jsx'
import '../css/HomePageFooter.css'

const FOOTER_COLUMNS = [
    {
        title: 'Platform',
        links: [
            { label: 'Find Professionals', path: '/services' },
            { label: 'How it Works', path: '/about' },
            { label: 'Become a Hustler', path: '/post-job' },
            { label: 'Contact', path: '/contact' }
        ],
    },
    // {
    //     title: 'Company',
    //     links: [
    //         { label: 'Careers', path: '/careers' },
    //         { label: 'Blog', path: '/blog' },
    // { label: 'Help Center', path: '/help' },
    //         { label: 'Trust & Safety', path: '/community' },
    //         { label: 'Support', path: '/support' },
    //     ],
    // },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy Policy', path: '/privacy-policy' },
            { label: 'Terms of Service', path: '/terms' },
            { label: 'Refund Policy', path: '/refund-policy' },
            { label: 'FAQs', path: '/faq' },
        ],
    },
]

export function HomePageFooter() {
    return (
        <footer className="homepage-footer">
            {/* Top Section - CTA */}
            {/* <div className="footer-cta-section">
                <div className="footer-container">
                    <div className="footer-cta-content">
                        <div className="footer-cta-left">
                            <h2 className="footer-cta-heading">
                                Ready to find your <span className="cta-highlight">next opportunity?</span>
                            </h2>
                            <p className="footer-cta-subtitle">
                                Join thousands of professionals finding their dream jobs on our platform.
                            </p>
                        </div>
                        <div className="footer-cta-right">
                            <Link to="/signup" className="footer-cta-button">
                                Get Started
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Main Footer Content */}
            <div className="footer-main">
                <div className="footer-container">
                    <div className="footer-grid">
                        {/* Brand Column */}
                        <div className="footer-brand-column">
                            <div className="footer-logo-wrapper">
                                <HustleLogo size="36" direction="row" color="white" fontSize="24px" gap="10px" />
                            </div>
                            <p className="footer-brand-description">
                                A modern service marketplace connecting clients with trusted professionals. Find skilled service providers, book securely, and manage your projects with confidence.
                            </p>
                        </div>

                        {/* Link Columns */}
                        {FOOTER_COLUMNS.map((column) => (
                            <div key={column.title} className="footer-link-column">
                                <h4 className="footer-column-title">{column.title}</h4>
                                <ul className="footer-link-list">
                                    {column.links.map((link) => (
                                        <li key={link.path}>
                                            <Link to={link.path} className="footer-link">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Contact Info */}
                        <div className="footer-contact-info footer-brand-column">
                            <div className="footer-contact-item">
                                <MapPin size={18} />
                                <span>123 Innovation Drive, Tech District Accra, Ghana</span>
                            </div>
                            <div className="footer-contact-item">
                                <Phone size={18} />
                                <span>+233 (0) 000 000 000</span>
                            </div>
                            <div className="footer-contact-item">
                                <Mail size={18} />
                                <span>legal@hustleapp.io</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Copyright & Social */}
            <div className="footer-bottom">
                <div className="footer-container">
                    <div className="footer-bottom-content">
                        <p className="footer-copyright">
                            &copy; {new Date().getFullYear()} Hustle IO Ecosystem. All rights reserved.
                        </p>

                        <div className="footer-social-links">
                            <a href="#" className="footer-social-link" aria-label="Facebook">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="footer-social-link" aria-label="Twitter">
                                <XIcon size={20} />
                            </a>
                            <a href="#" className="footer-social-link" aria-label="LinkedIn">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
