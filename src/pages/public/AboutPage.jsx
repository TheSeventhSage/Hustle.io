import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowRight,
    BadgeCheck,
    BriefcaseBusiness,
    CheckCircle2,
    ChevronDown,
    Play,
    ShieldCheck,
    Sparkles,
    Users2,
} from 'lucide-react'
import { PublicLayout } from './components/PublicLayout.jsx'
import { Button } from '../../shared/components/Button.jsx'

const HOW_IT_WORKS = [
    {
        icon: Users2,
        title: 'Tell us what you need',
        description: 'Clients describe the task, location, timeline, and the quality standard they expect.',
    },
    {
        icon: ShieldCheck,
        title: 'Match with verified talent',
        description: 'We surface trusted service providers with public ratings, service detail, and clear pricing signals.',
    },
    {
        icon: BriefcaseBusiness,
        title: 'Review the exact service',
        description: 'Every provider can publish structured service listings so clients can compare what is actually being offered.',
    },
    {
        icon: BadgeCheck,
        title: 'Book with confidence',
        description: 'The flow is built around transparency, faster response times, and stronger decision making before payment.',
    },
]

const VALUE_POINTS = [
    'Verified providers with clear service listings and review history.',
    'Better discovery across beauty, repairs, creative, technical, and home services.',
    'A cleaner path from browsing to selecting the exact service that fits the brief.',
    'Consistent public and dashboard experiences so users never lose context.',
]

const TRUST_PILLARS = [
    {
        value: '1',
        title: 'Structured discovery',
        description: 'Provider cards, exact service details, and grouped listings reduce guesswork.',
    },
    {
        value: '2',
        title: 'Transparent decisions',
        description: 'Pricing display types, review counts, bios, and service topics show up before booking.',
    },
    {
        value: '3',
        title: 'Marketplace quality',
        description: 'The product is tuned to feel premium while still helping real people make practical choices.',
    },
]

const FAQS = [
    {
        question: 'What makes Hustle different from a generic directory?',
        answer: 'Hustle is designed around verified providers and structured service listings, not loose profile pages. Clients can move from provider discovery to exact service detail without losing pricing, rating, or category context.',
    },
    {
        question: 'Who is the platform built for?',
        answer: 'It serves both sides of the marketplace: clients who need trustworthy professionals, and artisans or service providers who want clearer public visibility for what they actually offer.',
    },
    {
        question: 'Why do service details matter so much?',
        answer: 'A provider may offer multiple services with different price signals, experience levels, and customer feedback. The service detail view makes those differences visible before the client books.',
    },
    {
        question: 'How does the public experience support trust?',
        answer: 'The public pages surface provider bios, service categories, availability, reviews, and published listing details in a consistent format. That reduces ambiguity and gives clients stronger signals earlier in the journey.',
    },
]

function FaqItem({ faq, index, isOpen, onToggle }) {
    return (
        <article className={`rounded-[1.8rem] border px-5 py-5 transition-all duration-300 sm:px-7 ${isOpen ? 'border-[var(--color-secondary)]/45 bg-[var(--color-mist)] shadow-[0_18px_50px_-36px_rgba(7,18,14,0.24)] dark:border-[var(--color-secondary)]/28 dark:bg-white/6' : 'border-[var(--color-border)] bg-[var(--color-surface)] dark:border-white/10 dark:bg-[var(--color-surface)]'}`}>
            <button type="button" onClick={onToggle} className="flex w-full items-start justify-between gap-4 text-left">
                <div className="flex items-start gap-4">
                    <span className="pt-0.5 text-2xl font-black text-[var(--color-primary)]/55 dark:text-white/28">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                        <h3 className="text-lg font-bold text-[var(--color-text-1)] dark:text-white">{faq.question}</h3>
                        {isOpen ? (
                            <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--color-text-3)] dark:text-white/68">
                                {faq.answer}
                            </p>
                        ) : null}
                    </div>
                </div>

                <span className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)] text-[var(--color-primary-500)]' : 'border-[var(--color-border)] text-[var(--color-primary)] dark:border-white/12 dark:text-white/72'}`}>
                    <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </span>
            </button>
        </article>
    )
}

export default function AboutPage() {
    const [openFaq, setOpenFaq] = useState(0)

    return (
        <PublicLayout>
            <div className="bg-[var(--color-bg)] text-[var(--color-text-1)]">
                <section className="relative overflow-hidden bg-[linear-gradient(180deg,var(--color-primary-500)_0%,var(--color-primary-400)_55%,var(--color-primary-500)_100%)] py-24 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(222,183,55,0.2),transparent_30%)]" />
                    <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px]" />

                    <div className="container relative mx-auto px-4 text-center sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl">
                            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-secondary)] backdrop-blur-md">
                                <Sparkles size={14} />
                                About Hustle
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                                Building a cleaner path between clients and skilled service providers.
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/72">
                                Hustle is designed to help people discover, compare, and book service providers with more clarity. The public marketplace, provider pages, and detailed service views are all built to reduce uncertainty.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden py-20">
                    <div className="absolute left-0 top-8 h-56 w-56 rounded-full bg-[var(--color-secondary)]/10 blur-3xl" />
                    <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">One-stop service platform</p>
                                <h2 className="mt-4 text-4xl font-extrabold leading-tight text-[var(--color-primary-500)] dark:text-white sm:text-5xl">
                                    Premium discovery for real-world services, not just pretty profile cards.
                                </h2>
                                <p className="mt-6 text-base leading-8 text-[var(--color-text-3)] dark:text-[var(--color-text-2)]">
                                    The platform combines provider credibility, service structure, and a premium user experience. Clients can evaluate what a provider offers, how the service is priced, and what past customers said before taking the next step.
                                </p>

                                <div className="mt-8 space-y-4">
                                    {VALUE_POINTS.map((point) => (
                                        <div key={point} className="flex items-start gap-3">
                                            <CheckCircle2 size={20} className="mt-1 shrink-0 text-[var(--color-secondary)]" />
                                            <p className="text-sm leading-7 text-[var(--color-text-3)] dark:text-[var(--color-text-2)]">{point}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-[1.02fr_0.98fr]">
                                <div className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_26px_74px_-42px_rgba(7,18,14,0.3)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                    <img src="/images/workers.png" alt="Service providers at work" className="h-full min-h-[420px] w-full object-cover" />
                                </div>

                                <div className="grid gap-5">
                                    <div className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_26px_74px_-42px_rgba(7,18,14,0.28)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                        <img src="/images/pana.png" alt="Client using Hustle" className="h-52 w-full object-cover" />
                                    </div>
                                    <div className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(37,86,77,0.12)_0%,rgba(255,255,255,0.95)_100%)] p-6 shadow-[0_26px_74px_-42px_rgba(7,18,14,0.22)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(16,36,32,0.92)_0%,rgba(11,26,23,0.98)_100%)]">
                                        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[var(--color-secondary)]/18 blur-2xl" />
                                        <p className="relative text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-primary)] dark:text-[var(--color-secondary)]">Trusted flow</p>
                                        <p className="relative mt-4 text-3xl font-black text-[var(--color-primary-500)] dark:text-white">From search to booking without losing context.</p>
                                        <p className="relative mt-4 text-sm leading-7 text-[var(--color-text-3)] dark:text-white/68">
                                            The same design language continues from the home page into listings, provider panels, and exact service details so users always know where they are and what to do next.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl text-center">
                            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">How it works</p>
                            <h2 className="mt-4 text-4xl font-extrabold text-[var(--color-primary-500)] dark:text-white sm:text-5xl">
                                A practical flow for a marketplace built around trust.
                            </h2>
                            <p className="mt-5 text-base leading-8 text-[var(--color-text-3)] dark:text-[var(--color-text-2)]">
                                The product experience is tuned to help clients get to the right provider faster while giving artisans a clearer way to present the services they actually sell.
                            </p>
                        </div>

                        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            {HOW_IT_WORKS.map((step) => (
                                <article key={step.title} className="group rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_22px_68px_-44px_rgba(7,18,14,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-secondary)]/45 dark:border-white/10 dark:bg-[var(--color-surface)]">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-bg)] text-[var(--color-primary)] dark:bg-white/6 dark:text-[var(--color-secondary)]">
                                        <step.icon size={24} />
                                    </div>
                                    <h3 className="mt-6 text-xl font-bold text-[var(--color-text-1)] dark:text-white">{step.title}</h3>
                                    <p className="mt-4 text-sm leading-7 text-[var(--color-text-3)] dark:text-white/68">{step.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-6">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-[2.6rem] bg-[linear-gradient(135deg,rgba(10,31,22,1)_0%,rgba(18,52,44,0.98)_55%,rgba(48,35,12,0.96)_100%)] text-white shadow-[0_36px_110px_-48px_rgba(7,18,14,0.78)]">
                            <div className="relative px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
                                <div className="absolute left-8 top-6 h-28 w-28 rounded-full bg-[var(--color-secondary)]/12 blur-3xl" />
                                <div className="absolute right-10 top-12 h-24 w-24 rounded-full bg-white/8 blur-3xl" />

                                <div className="mx-auto max-w-3xl text-center">
                                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-primary-500)] shadow-[0_18px_48px_-24px_rgba(222,183,55,0.6)]">
                                        <Play size={28} className="ml-1" />
                                    </div>
                                    <h2 className="mt-8 text-4xl font-extrabold leading-tight sm:text-5xl">
                                        Good service decisions start with better visibility.
                                    </h2>
                                    <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70">
                                        Hustle brings together discovery, provider detail, ratings, and service structure so that public browsing feels informed instead of random.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 border-t border-white/10 bg-black/34 px-6 py-6 md:grid-cols-3 md:px-10">
                                {TRUST_PILLARS.map((pillar) => (
                                    <div key={pillar.value} className="flex gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-secondary)] text-lg font-black text-[var(--color-primary-500)]">
                                            {pillar.value}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">{pillar.title}</h3>
                                            <p className="mt-2 text-sm leading-7 text-white/68">{pillar.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl text-center">
                            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">Frequently asked questions</p>
                            <h2 className="mt-4 text-4xl font-extrabold text-[var(--color-primary-500)] dark:text-white sm:text-5xl">
                                The essentials behind the marketplace.
                            </h2>
                            <p className="mt-5 text-base leading-8 text-[var(--color-text-3)] dark:text-[var(--color-text-2)]">
                                These answers describe why the public marketplace is shaped the way it is and what problem the structured service pages are solving.
                            </p>
                        </div>

                        <div className="mt-12 space-y-4">
                            {FAQS.map((faq, index) => (
                                <FaqItem
                                    key={faq.question}
                                    faq={faq}
                                    index={index}
                                    isOpen={openFaq === index}
                                    onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="pb-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
                            <div className="grid gap-5 sm:grid-cols-[0.9fr_1.1fr]">
                                <div className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_24px_72px_-42px_rgba(7,18,14,0.26)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                    <img src="/images/hero.png" alt="Hustle service experience" className="h-full min-h-[360px] w-full object-cover" />
                                </div>
                                <div className="grid gap-5">
                                    <div className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                        <img src="/images/pana.png" alt="Service planning visual" className="h-44 w-full object-cover" />
                                    </div>
                                    <div className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                        <img src="/images/workers.png" alt="Provider network" className="h-44 w-full object-cover" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">Why the experience matters</p>
                                <h2 className="mt-4 text-4xl font-extrabold leading-tight text-[var(--color-primary-500)] dark:text-white sm:text-5xl">
                                    We design for confidence, not just clicks.
                                </h2>
                                <p className="mt-6 text-base leading-8 text-[var(--color-text-3)] dark:text-[var(--color-text-2)]">
                                    A premium interface only matters if it helps users make better decisions. That is why the marketplace emphasizes service topics, provider identity, location, reviews, and pricing context at every step.
                                </p>

                                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-[1.7rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 dark:border-white/10 dark:bg-[var(--color-surface)]">
                                        <p className="text-lg font-bold text-[var(--color-text-1)] dark:text-white">Quality service cards</p>
                                        <p className="mt-3 text-sm leading-7 text-[var(--color-text-3)] dark:text-white/68">
                                            Discovery cards are now built around real backend service data instead of placeholder text.
                                        </p>
                                    </div>
                                    <div className="rounded-[1.7rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 dark:border-white/10 dark:bg-[var(--color-surface)]">
                                        <p className="text-lg font-bold text-[var(--color-text-1)] dark:text-white">Detailed provider context</p>
                                        <p className="mt-3 text-sm leading-7 text-[var(--color-text-3)] dark:text-white/68">
                                            Clients can inspect the exact provider, service category, and review signals before they move forward.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Link to="/services">
                                        <Button variant="solid" className="h-12 w-auto rounded-full bg-primary px-6 text-sm font-bold shadow-lg transition-all duration-300 hover:bg-primary-sat">
                                            Explore services
                                            <ArrowRight size={16} />
                                        </Button>
                                    </Link>
                                    <Link to="/contact">
                                        <Button variant="outline" className="h-12 w-auto rounded-full px-6 text-sm font-semibold">
                                            Talk to us
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    )
}
