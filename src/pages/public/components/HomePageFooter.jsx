import { Link } from 'react-router-dom'
import { ArrowRight, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react'
import { Button } from '../../../shared/components/Button.jsx'
import { HustleLogo } from '../../../shared/components/HustleLogo.jsx'

const FOOTER_COLUMNS = [
    {
        title: 'Platform',
        links: [
            { label: 'Browse Directory', path: '/services' },
            { label: 'Search', path: '/search' },
            { label: 'How it Works', path: '/about' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About Us', path: '/about' },
            { label: 'Contact', path: '/contact' },
            { label: 'Terms of Service', path: '/terms' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy Policy', path: '/privacy-policy' },
            { label: 'Refund Policy', path: '/refund-policy' },
            { label: 'Cancellation Policy', path: '/cancellation-policy' },
        ],
    },
]

export function HomePageFooter() {
    return (
        <footer className="relative mt-10 overflow-hidden rounded-t-[3rem] bg-[var(--color-primary-500)] pt-24 pb-12 text-white dark:bg-[var(--color-surface)]">
            <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-[var(--color-secondary)]/5 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[var(--color-primary-400)]/20 blur-[100px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-6">
                <div className="mb-20 grid gap-16 lg:grid-cols-12 lg:gap-8">
                    <div className="space-y-8 lg:col-span-5">
                        <h2 className="text-5xl font-extrabold leading-[1.1] tracking-tight lg:text-7xl">
                            Got an idea? <br />
                            <span className="text-[var(--color-primary-100)]">Let's talk.</span>
                        </h2>

                        <Link to="/contact" className="inline-flex">
                            <Button className="h-14 w-auto rounded-full bg-[var(--color-secondary)] px-8 font-bold text-[var(--color-primary)] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white dark:text-[var(--color-primary-500)]">
                                Contact Us
                                <ArrowRight size={18} />
                            </Button>
                        </Link>

                        <div className="space-y-4 pt-8">
                            <div className="flex items-start gap-3 text-[var(--color-text-4)]">
                                <MapPin size={20} className="mt-1 text-[var(--color-secondary)]" />
                                <p className="text-sm font-light text-[var(--color-primary-100)]">123 Innovation Drive, Tech District<br />Accra, Ghana</p>
                            </div>
                            <div className="flex items-center gap-3 text-[var(--color-text-4)]">
                                <Phone size={20} className="text-[var(--color-secondary)]" />
                                <p className="text-sm font-light text-[var(--color-primary-100)]">+233 (0) 000 000 000</p>
                            </div>
                            <div className="flex items-center gap-3 text-[var(--color-text-4)]">
                                <Mail size={20} className="text-[var(--color-secondary)]" />
                                <p className="text-sm font-light text-[var(--color-primary-100)]">hello@hustle.io</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 lg:col-span-7 md:grid-cols-3 lg:pt-4">
                        {FOOTER_COLUMNS.map((column) => (
                            <div key={column.title}>
                                <h4 className="mb-6 text-sm font-semibold uppercase tracking-widest text-white">{column.title}</h4>
                                <ul className="space-y-4 text-sm font-light text-[var(--color-primary-100)]">
                                    {column.links.map((link) => (
                                        <li key={link.path}>
                                            <Link to={link.path} className="transition-colors hover:text-[var(--color-secondary)]">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
                    <div className="flex items-center gap-2">
                        <HustleLogo size="32" direction="row" color="white" fontSize="22px" gap="8px" />
                    </div>

                    <p className="text-center text-sm font-light text-[var(--color-primary-100)]">
                        &copy; {new Date().getFullYear()} Hustle IO Ecosystem. All rights reserved.
                    </p>

                    <div className="flex gap-4">
                        {[Twitter, Instagram, Linkedin].map((Icon, index) => (
                            <a
                                key={index}
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--color-primary-100)] transition-all hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                            >
                                <Icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
