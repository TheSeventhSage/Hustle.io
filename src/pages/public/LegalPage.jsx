import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileText, AlertCircle } from 'lucide-react'
import SubHeader from './components/SubHeader'
import { HomePageFooter } from './components/HomePageFooter'
import { LegalTOC } from './components/LegalTOC'
import { legalService } from '../../services/legal.service'
import { privacyPolicyHighlights, privacyPolicyMeta, privacyPolicySections } from './privacyPolicyContent'
import './css/LegalPage.css'

const PAGE_TITLES = {
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    'refund-policy': 'Refund Policy',
    faq: "FAQ's",
}

// Renders a single privacy-policy content block.
function LegalBlock({ block }) {
    if (block.type === 'p') {
        return <p>{block.text}</p>
    }
    if (block.type === 'ul') {
        return (
            <ul>
                {block.items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        )
    }
    if (block.type === 'contacts') {
        return (
            <ul className="legal-contacts">
                {block.items.map((contact) => (
                    <li key={contact.email}>
                        <span className="legal-contact-label">{contact.label}</span>
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </li>
                ))}
            </ul>
        )
    }
    return null
}

export default function LegalPage() {
    const { pageType: paramPageType } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const [scrollProgress, setScrollProgress] = useState(0)
    const [activeSection, setActiveSection] = useState(() => {
        const hashId = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
        const exists = privacyPolicySections.some((section) => section.id === hashId)
        return exists ? hashId : (privacyPolicySections[0]?.id ?? '')
    })

    // Extract pageType from URL path if not in params
    const getPageType = () => {
        if (paramPageType) return paramPageType

        const path = location.pathname
        if (path.includes('/terms')) return 'terms'
        if (path.includes('/privacy-policy')) return 'privacy'
        if (path.includes('/refund-policy')) return 'refund-policy'
        if (path.includes('/faq')) return 'faq'

        return null
    }

    const pageType = getPageType()
    const isPrivacy = pageType === 'privacy'

    // Privacy renders the bundled, scroll-tracked content; other pages fetch HTML.
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['legal', pageType],
        queryFn: () => legalService.getLegalPage(pageType),
        enabled: !!pageType && !isPrivacy,
        staleTime: 1000 * 60 * 30, // 30 minutes
    })

    const legalPage = data?.item ?? null

    // Top progress bar — overall scroll through the document.
    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight
            const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0
            setScrollProgress(progress)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Reset to top on page change, unless a section hash is targeted.
    useEffect(() => {
        if (isPrivacy && location.hash && document.getElementById(location.hash.slice(1))) return
        window.scrollTo(0, 0)
    }, [pageType, isPrivacy, location.hash])

    // Scroll-spy: highlight the section currently in view.
    useEffect(() => {
        if (!isPrivacy) return

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
                if (visible[0]) setActiveSection(visible[0].target.id)
            },
            // Activate a section once its top reaches the upper third of the viewport.
            { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
        )

        const elements = privacyPolicySections
            .map((section) => document.getElementById(section.id))
            .filter(Boolean)
        elements.forEach((element) => observer.observe(element))

        // Honour a deep link to a specific section on first load — the observer
        // then keeps the active highlight in sync as the page settles.
        const hashId = location.hash.slice(1)
        if (hashId && document.getElementById(hashId)) {
            requestAnimationFrame(() => document.getElementById(hashId)?.scrollIntoView({ block: 'start' }))
        }

        return () => observer.disconnect()
    }, [isPrivacy, location.hash])

    const handleNavigate = (id) => {
        const element = document.getElementById(id)
        if (!element) return
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        window.history.replaceState(null, '', `#${id}`)
        setActiveSection(id)
    }

    const pageTitle = isPrivacy
        ? privacyPolicyMeta.title
        : legalPage?.title || PAGE_TITLES[pageType] || 'Legal Information'

    const lastUpdatedLabel = isPrivacy
        ? privacyPolicyMeta.effectiveDate
        : legalPage?.updated_at
            ? new Date(legalPage.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            : null

    const tocSections = privacyPolicySections.map(({ id, number, title }) => ({ id, number, title }))

    return (
        <div className="w-full min-h-screen bg-[var(--color-green-muted)]">
            {/* Progress Bar */}
            <div className="legal-progress-bar" style={{ width: `${scrollProgress}%` }} />

            {/* Header */}
            <SubHeader />

            {/* Hero / Breadcrumb Section */}
            <section className="w-full px-[17px] relative z-50">
                <div className="hero-panel w-full max-w-[calc(100%-34px)] mx-auto h-[295px] bg-[var(--color-mint-light)] rounded-3xl relative flex items-center justify-center overflow-visible">
                    <div className="relative z-10 text-center px-5">
                        <div className="legal-icon-hero">
                            <FileText size={48} />
                        </div>
                        <h1 className="text-[68px] font-black text-[#050505] mb-[18px] tracking-tight leading-none">
                            {pageTitle}
                        </h1>
                        {lastUpdatedLabel && (
                            <p className="text-[16px] font-semibold text-[#050505] m-0 opacity-70">
                                Last updated: {lastUpdatedLabel}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <main className="w-full py-[42px] px-[52px] pb-10">
                <div className="w-full max-w-[1400px] mx-auto">
                    {isPrivacy ? (
                        <>
                            <div className="legal-intro">
                                <p className="legal-lead">{privacyPolicyMeta.intro}</p>

                                <div className="legal-highlights">
                                    {privacyPolicyHighlights.map((card) => (
                                        <div key={card.number} className="legal-highlight-card">
                                            <span className="legal-highlight-num">{card.number}</span>
                                            <h3 className="legal-highlight-title">{card.title}</h3>
                                            <p className="legal-highlight-text">{card.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="legal-layout">
                                <aside className="legal-toc-wrap">
                                    <LegalTOC
                                        sections={tocSections}
                                        activeId={activeSection}
                                        onNavigate={handleNavigate}
                                    />
                                </aside>

                                <article className="legal-content-wrapper legal-content-body legal-doc">
                                    {privacyPolicySections.map((section) => (
                                        <section key={section.id} id={section.id} className="legal-section">
                                            <h2 className="legal-section-title">
                                                {section.number}. {section.title}
                                            </h2>
                                            {section.blocks.map((block, index) => (
                                                <LegalBlock key={index} block={block} />
                                            ))}
                                        </section>
                                    ))}
                                </article>
                            </div>
                        </>
                    ) : (
                        <>
                            {isLoading && (
                                <div className="legal-loading">
                                    <div className="legal-spinner" />
                                    <p className="text-[18px] font-medium text-[rgba(255,255,255,0.72)]">
                                        Loading {pageTitle.toLowerCase()}...
                                    </p>
                                </div>
                            )}

                            {isError && (
                                <div className="legal-error">
                                    <div className="legal-error-icon">
                                        <AlertCircle size={64} />
                                    </div>
                                    <h3 className="text-[42px] font-black text-white leading-[1.2] tracking-tight mb-4">
                                        Unable to Load Content
                                    </h3>
                                    <p className="text-[19px] font-medium text-[rgba(255,255,255,0.72)] mb-8 max-w-[600px]">
                                        {error?.message || 'An error occurred while loading this page. Please try again later.'}
                                    </p>
                                    <button onClick={() => navigate('/')} className="legal-error-button">
                                        Return Home
                                    </button>
                                </div>
                            )}

                            {!isLoading && !isError && legalPage && (
                                <article className="legal-content-wrapper">
                                    <div
                                        className="legal-content-body"
                                        dangerouslySetInnerHTML={{ __html: legalPage.content }}
                                    />
                                </article>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            <HomePageFooter />
        </div>
    )
}
