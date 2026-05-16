import { useState } from 'react'
import { ArrowRight, Clock3, Mail, MapPin, Phone, Send, Sparkles } from 'lucide-react'
import { PublicLayout } from './components/PublicLayout.jsx'
import { Button } from '../../shared/components/Button.jsx'

const CONTACT_CHANNELS = [
    {
        icon: Phone,
        title: 'Call for inquiry',
        primary: '+233 (0) 000 000 000',
        secondary: 'Available Monday to Saturday',
    },
    {
        icon: Mail,
        title: 'Send us email',
        primary: 'hello@hustle.io',
        secondary: 'support@hustle.io',
    },
    {
        icon: Clock3,
        title: 'Opening hours',
        primary: 'Mon - Fri: 8AM - 6PM',
        secondary: 'Sat: 10AM - 4PM',
    },
    {
        icon: MapPin,
        title: 'Office',
        primary: 'Accra, Ghana',
        secondary: 'Innovation Drive, Tech District',
    },
]

const TRUST_STRIP = ['Fast replies', 'Verified marketplace', 'Provider support', 'Client success']

export default function ContactPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: '',
    })

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((current) => ({ ...current, [name]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const fullName = `${formData.firstName} ${formData.lastName}`.trim()
        const subject = `Hustle contact request from ${fullName || 'website visitor'}`
        const body = [
            `Name: ${fullName || 'Not provided'}`,
            `Email: ${formData.email || 'Not provided'}`,
            '',
            formData.message,
        ].join('\n')

        if (typeof window !== 'undefined') {
            const query = new URLSearchParams({ subject, body }).toString()
            window.location.href = `mailto:hello@hustle.io?${query}`
        }
    }

    return (
        <PublicLayout>
            <div className="bg-[var(--color-bg)] text-[var(--color-text-1)]">
                <section className="relative overflow-hidden bg-[linear-gradient(180deg,var(--color-primary-500)_0%,var(--color-primary-400)_55%,var(--color-primary-500)_100%)] py-24 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(222,183,55,0.18),transparent_30%)]" />
                    <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px]" />

                    <div className="container relative mx-auto px-4 text-center sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl">
                            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-secondary)] backdrop-blur-md">
                                <Sparkles size={14} />
                                Contact Hustle
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                                Talk to the team behind the marketplace.
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/72">
                                Whether you are exploring partnerships, need product support, or want to discuss provider growth on the platform, this is the right place to start.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden py-20">
                    <div className="absolute right-0 top-12 h-56 w-56 rounded-full bg-[var(--color-secondary)]/10 blur-3xl" />
                    <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-start">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">Direct contact</p>
                                <h2 className="mt-4 text-4xl font-extrabold leading-tight text-[var(--color-primary-500)] dark:text-white sm:text-5xl">
                                    You will get clarity quickly, not a vague support loop.
                                </h2>
                                <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-text-3)] dark:text-[var(--color-text-2)]">
                                    The platform is built around service trust and clean decision making, so the contact experience should follow the same standard. Reach out for product questions, partnerships, provider onboarding, or operational help.
                                </p>

                                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                                    {CONTACT_CHANNELS.map((channel) => (
                                        <article key={channel.title} className="rounded-[1.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_54px_-40px_rgba(7,18,14,0.2)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg)] text-[var(--color-primary)] dark:bg-white/6 dark:text-[var(--color-secondary)]">
                                                <channel.icon size={22} />
                                            </div>
                                            <h3 className="mt-5 text-xl font-bold text-[var(--color-text-1)] dark:text-white">{channel.title}</h3>
                                            <p className="mt-3 text-base font-semibold text-[var(--color-primary-500)] dark:text-white">{channel.primary}</p>
                                            <p className="mt-2 text-sm leading-7 text-[var(--color-text-3)] dark:text-white/68">{channel.secondary}</p>
                                        </article>
                                    ))}
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-[2.3rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(237,247,245,0.96)_0%,rgba(245,250,249,0.96)_100%)] p-6 shadow-[0_32px_90px_-48px_rgba(7,18,14,0.3)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,35,31,0.96)_0%,rgba(11,26,23,0.98)_100%)] sm:p-8">
                                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[var(--color-secondary)]/18 blur-3xl" />
                                <div className="relative">
                                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-primary)] dark:text-[var(--color-secondary)]">Contact form</p>
                                    <h3 className="mt-3 text-3xl font-extrabold text-[var(--color-primary-500)] dark:text-white">Send your message</h3>
                                    <p className="mt-3 text-sm leading-7 text-[var(--color-text-3)] dark:text-white/68">
                                        Share the goal, the problem, or the partnership idea. The team can take it from there.
                                    </p>

                                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-semibold text-[var(--color-text-2)] dark:text-white/82">First name</span>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Your first name"
                                                    className="h-12 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text-1)] outline-none transition-colors placeholder:text-[var(--color-text-4)] focus:border-[var(--color-primary)] dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/30"
                                                />
                                            </label>

                                            <label className="block">
                                                <span className="mb-2 block text-sm font-semibold text-[var(--color-text-2)] dark:text-white/82">Last name</span>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Your last name"
                                                    className="h-12 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text-1)] outline-none transition-colors placeholder:text-[var(--color-text-4)] focus:border-[var(--color-primary)] dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/30"
                                                />
                                            </label>
                                        </div>

                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-[var(--color-text-2)] dark:text-white/82">Email address</span>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="you@example.com"
                                                className="h-12 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text-1)] outline-none transition-colors placeholder:text-[var(--color-text-4)] focus:border-[var(--color-primary)] dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/30"
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-[var(--color-text-2)] dark:text-white/82">Message</span>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows={6}
                                                placeholder="Tell us what you need."
                                                className="w-full rounded-[1.6rem] border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-1)] outline-none transition-colors placeholder:text-[var(--color-text-4)] focus:border-[var(--color-primary)] dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/30"
                                            />
                                        </label>

                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <Button type="submit" variant="solid" className="h-12 w-auto rounded-full bg-primary px-6 text-sm font-bold shadow-lg transition-all duration-300 hover:bg-primary-sat">
                                                Send message
                                                <Send size={16} />
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="pb-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-[2.4rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_30px_90px_-46px_rgba(7,18,14,0.28)] dark:border-white/10 dark:bg-[var(--color-surface)]">
                            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                                <div className="relative min-h-[340px] overflow-hidden bg-[linear-gradient(135deg,rgba(245,250,249,1)_0%,rgba(233,244,241,1)_100%)] dark:bg-[linear-gradient(135deg,rgba(10,31,22,0.96)_0%,rgba(18,52,44,0.98)_100%)]">
                                    <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(37,86,77,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(37,86,77,0.09)_1px,transparent_1px)] [background-size:36px_36px] dark:opacity-25" />
                                    <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_18px_44px_-20px_rgba(37,86,77,0.5)]">
                                        <MapPin size={26} />
                                    </div>
                                    <div className="absolute left-[18%] top-[28%] rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] shadow-lg dark:border-white/10 dark:bg-black/30 dark:text-[var(--color-secondary)]">
                                        Provider support
                                    </div>
                                    <div className="absolute bottom-[24%] left-[14%] rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] shadow-lg dark:border-white/10 dark:bg-black/30 dark:text-[var(--color-secondary)]">
                                        Client success
                                    </div>
                                    <div className="absolute right-[14%] top-[34%] rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] shadow-lg dark:border-white/10 dark:bg-black/30 dark:text-[var(--color-secondary)]">
                                        Partnerships
                                    </div>
                                </div>

                                <div className="p-7 sm:p-8">
                                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">Coverage and office</p>
                                    <h3 className="mt-4 text-3xl font-extrabold text-[var(--color-primary-500)] dark:text-white">
                                        Reach the team that supports the marketplace.
                                    </h3>
                                    <p className="mt-4 text-sm leading-7 text-[var(--color-text-3)] dark:text-white/68">
                                        This side of the product supports provider onboarding, marketplace quality, public content, and client communication.
                                    </p>

                                    <div className="mt-8 space-y-4">
                                        <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 dark:border-white/10 dark:bg-[var(--color-bg)]">
                                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-text-4)]">Office base</p>
                                            <p className="mt-2 text-lg font-bold text-[var(--color-text-1)] dark:text-white">Accra, Ghana</p>
                                            <p className="mt-1 text-sm text-[var(--color-text-3)] dark:text-white/68">Innovation Drive, Tech District</p>
                                        </div>
                                        <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 dark:border-white/10 dark:bg-[var(--color-bg)]">
                                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-text-4)]">What this channel handles</p>
                                            <p className="mt-2 text-sm leading-7 text-[var(--color-text-3)] dark:text-white/68">
                                                Product questions, issue reporting, growth conversations, provider support, and public marketplace feedback.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-3">
                                        {TRUST_STRIP.map((item) => (
                                            <span
                                                key={item}
                                                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)] dark:border-white/10 dark:bg-white/6 dark:text-white/82"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-8">
                                        <a href="mailto:hello@hustle.io" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)]">
                                            Start a direct conversation
                                            <ArrowRight size={16} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    )
}
