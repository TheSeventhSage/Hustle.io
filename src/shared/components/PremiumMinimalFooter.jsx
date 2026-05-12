import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react'
import { Button } from './Button.jsx'
import { HustleLogoText } from './HustleLogo.jsx'

export function PremiumMinimalFooter() {
    return (
        <footer className="relative overflow-hidden border-t border-white/10 bg-[linear-gradient(180deg,#07110d_0%,#050a08_100%)] text-white">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent" />
            <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
                <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
                    <div className="lg:col-span-7">
                        <HustleLogoText size="132px" color="#FFFFFF" />
                        <p className="mt-6 max-w-xl text-sm leading-7 text-white/65">
                            Premium service matching for clients, hustlers, and teams that want clarity, speed, and a cleaner way to get work done.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            {['Verified talent', 'Secure booking flow', 'City-based matching', 'Support that stays live'].map((item) => (
                                <span
                                    key={item}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/75"
                                >
                                    <CheckCircle2 size={14} className="text-secondary" />
                                    {item}
                                </span>
                            ))}
                        </div>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Email</p>
                                <a href="mailto:hello@hustleapp.com" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-secondary">
                                    <Mail size={15} className="text-secondary" />
                                    hello@hustleapp.com
                                </a>
                            </div>
                            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Phone</p>
                                <a href="tel:+233000000000" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-secondary">
                                    <Phone size={15} className="text-secondary" />
                                    +233 (0) 000 000 000
                                </a>
                            </div>
                            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Base</p>
                                <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white">
                                    <MapPin size={15} className="text-secondary" />
                                    Accra, Ghana
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
                            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Platform pulse</p>
                            <h3 className="mt-3 text-2xl font-semibold text-white">Built to feel premium on first glance.</h3>
                            <p className="mt-4 text-sm leading-7 text-white/65">
                                This footer keeps the focus on the brand, the contact path, and the active entry points that actually matter.
                            </p>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                                    <p className="text-2xl font-semibold text-white">24/7</p>
                                    <p className="mt-1 text-xs text-white/50">Support line</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                                    <p className="text-2xl font-semibold text-white">Live</p>
                                    <p className="mt-1 text-xs text-white/50">Matching flow</p>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <Link to="/services" className="flex-1">
                                    <Button variant="solid" className="h-12 w-full rounded-full bg-secondary text-primary font-semibold hover:bg-white">
                                        Browse services
                                        <ArrowRight size={16} />
                                    </Button>
                                </Link>
                                <Link to="/sign-up" className="flex-1">
                                    <Button variant="outline" className="h-12 w-full rounded-full border-white/15 bg-white/5 text-white font-semibold hover:bg-white/10">
                                        Join now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/10 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-white/45">
                        &copy; {new Date().getFullYear()} HustleApp. All rights reserved.
                    </p>
                    <p className="text-xs text-white/45">
                        Clean matching for clients, artisans, and the cities they serve.
                    </p>
                </div>
            </div>
        </footer>
    )
}
