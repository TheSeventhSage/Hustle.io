import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../shared/components/Button.jsx'
import { HustleLogoText } from '../../../shared/components/HustleLogo.jsx'

const NAV_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
]

const FOOTER_LINKS = {
    company: [
        { label: 'About Us', path: '/about' },
        { label: 'Contact Us', path: '/contact' },
        { label: 'Careers', path: '/careers' },
    ],
    legal: [
        { label: 'Privacy Policy', path: '/privacy-policy' },
        { label: 'Terms & Conditions', path: '/terms' },
        { label: 'Cancellation Policy', path: '/cancellation-policy' },
        { label: 'Refund Policy', path: '/refund-policy' },
    ],
    services: [
        { label: 'Browse Services', path: '/services' },
        { label: 'Become a Provider', path: '/provider/register' },
        { label: 'How It Works', path: '/how-it-works' },
    ],
}

export function PublicLayout({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    const isActive = (path) => location.pathname === path

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Top Bar */}
            <div className="bg-primary text-white py-2 text-xs">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <a href="tel:+233000000000" className="flex items-center gap-1.5 hover:text-secondary transition-colors">
                                <Phone size={14} />
                                <span>+233 (0) 000 000 000</span>
                            </a>
                            <a href="mailto:hello@hustleapp.com" className="hidden sm:flex items-center gap-1.5 hover:text-secondary transition-colors">
                                <Mail size={14} />
                                <span>hello@hustleapp.com</span>
                            </a>
                        </div>
                        <div className="text-xs">
                            <span className="opacity-90">Available 24/7</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header - Premium Sticky Navigation */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center transform hover:scale-105 transition-transform duration-300">
                            <HustleLogoText size="120px" />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-10">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative text-sm font-semibold transition-colors group ${isActive(link.path)
                                            ? 'text-primary'
                                            : 'text-text-2 hover:text-primary'
                                        }`}
                                >
                                    {link.label}
                                    {/* Underline Animation */}
                                    <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary transform transition-transform duration-300 ${isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                        }`} />
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop CTA */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link to="/sign-in">
                                <Button variant="ghost" className="h-11 px-5 text-sm font-semibold hover:bg-primary/5 transition-all duration-300">
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/sign-up">
                                <Button variant="solid" className="h-11 px-6 text-sm font-bold rounded-full bg-primary hover:bg-primary-sat shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                                    Get Started
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-text-2 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-300"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Enhanced */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-md animate-fade-in">
                        <nav className="container mx-auto px-4 py-6 flex flex-col gap-2">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive(link.path)
                                            ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary'
                                            : 'text-text-2 hover:bg-mist active:scale-95'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-border">
                                <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full h-12 rounded-xl font-semibold border-2 hover:bg-primary/5 transition-all duration-300">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="solid" className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary-sat shadow-lg transition-all duration-300">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-text-1 text-white pt-16 pb-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                        {/* Brand Column */}
                        <div className="lg:col-span-2">
                            <HustleLogoText size="140px" color="#FFFFFF" className="mb-4" />
                            <p className="text-sm text-gray-400 mb-6 leading-relaxed max-w-sm">
                                Your trusted platform for connecting with professional service providers. Quality, reliability, and convenience in one place.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                                    <span className="sr-only">Facebook</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                                    <span className="sr-only">Instagram</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Company Links */}
                        <div>
                            <h4 className="text-sm font-bold mb-4">Company</h4>
                            <ul className="space-y-3">
                                {FOOTER_LINKS.company.map((link) => (
                                    <li key={link.path}>
                                        <Link to={link.path} className="text-sm text-gray-400 hover:text-white transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Services Links */}
                        <div>
                            <h4 className="text-sm font-bold mb-4">Services</h4>
                            <ul className="space-y-3">
                                {FOOTER_LINKS.services.map((link) => (
                                    <li key={link.path}>
                                        <Link to={link.path} className="text-sm text-gray-400 hover:text-white transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal Links */}
                        <div>
                            <h4 className="text-sm font-bold mb-4">Legal</h4>
                            <ul className="space-y-3">
                                {FOOTER_LINKS.legal.map((link) => (
                                    <li key={link.path}>
                                        <Link to={link.path} className="text-sm text-gray-400 hover:text-white transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="border-t border-white/10 pt-8 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <Mail size={20} className="text-secondary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium mb-1">Email Us</p>
                                    <a href="mailto:hello@hustleapp.com" className="text-sm text-gray-400 hover:text-white">
                                        hello@hustleapp.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone size={20} className="text-secondary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium mb-1">Call Us</p>
                                    <a href="tel:+233000000000" className="text-sm text-gray-400 hover:text-white">
                                        +233 (0) 000 000 000
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={20} className="text-secondary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium mb-1">Visit Us</p>
                                    <p className="text-sm text-gray-400">
                                        Accra, Ghana
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="border-t border-white/10 pt-8 text-center">
                        <p className="text-sm text-gray-400">
                            © {new Date().getFullYear()} HustleApp. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
