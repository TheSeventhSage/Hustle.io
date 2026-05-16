import { Link, useLocation } from 'react-router-dom'
import { Mail, Menu, Phone, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../shared/components/Button.jsx'
import { HustleLogo } from '../../../shared/components/HustleLogo.jsx'
import { HomePageFooter } from './HomePageFooter.jsx'

const NAV_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
]

export function PublicLayout({ children, hideHeader = false }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    const isActive = (path) => location.pathname === path

    return (
        <div className="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text-1)]">
            {!hideHeader && (
                <>
                    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/95 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-[var(--color-surface)]/95">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 items-center justify-between">
                                <Link to="/" className="flex items-center transition-opacity duration-200 hover:opacity-80">
                                    <HustleLogo size="110px" text='' />
                                </Link>

                                <nav className="hidden items-center gap-8 md:flex">
                                    {NAV_LINKS.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`text-[15px] font-medium transition-colors ${isActive(link.path) ? 'text-[var(--color-primary)]' : 'text-gray-700 hover:text-[var(--color-primary)] dark:text-gray-300 dark:hover:text-[var(--color-primary)]'}`}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>

                                <div className="hidden items-center gap-4 md:flex">
                                    <Link to="/sign-in">
                                        <button className="rounded-lg px-5 py-2 text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
                                            Sign In
                                        </button>
                                    </Link>
                                    <Link to="/sign-up">
                                        <button className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-[var(--color-primary-sat)] hover:shadow-md">
                                            Get Started
                                        </button>
                                    </Link>
                                </div>

                                <button
                                    onClick={() => setMobileMenuOpen((current) => !current)}
                                    className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 md:hidden"
                                >
                                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </div>
                        </div>

                        {mobileMenuOpen && (
                            <div className="border-t border-gray-200 bg-white dark:border-white/10 dark:bg-[var(--color-surface)] md:hidden">
                                <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
                                    {NAV_LINKS.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`rounded-lg px-4 py-3 text-[15px] font-medium transition-colors ${isActive(link.path) ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'}`}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}

                                    <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-white/10">
                                        <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                                            <button className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5">
                                                Sign In
                                            </button>
                                        </Link>
                                        <Link to="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                                            <button className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-sat)]">
                                                Get Started
                                            </button>
                                        </Link>
                                    </div>
                                </nav>
                            </div>
                        )}
                    </header>
                </>
            )}

            <main className="flex-1">
                {children}
            </main>

            <HomePageFooter />
        </div>
    )
}
