import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileText, AlertCircle } from 'lucide-react'
import SubHeader from './components/SubHeader'
import { HomePageFooter } from './components/HomePageFooter'
import { legalService } from '../../services/legal.service'
import './css/LegalPage.css'

const PAGE_TITLES = {
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    'refund-policy': 'Refund Policy',
    faq: "FAQ's",
}

export default function LegalPage() {
    const { pageType: paramPageType } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const [scrollProgress, setScrollProgress] = useState(0)

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

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['legal', pageType],
        queryFn: () => legalService.getLegalPage(pageType),
        enabled: !!pageType,
        staleTime: 1000 * 60 * 30, // 30 minutes
    })

    const legalPage = data?.item ?? null

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight
            const progress = (window.scrollY / totalHeight) * 100
            setScrollProgress(progress)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pageType])

    const pageTitle = legalPage?.title || PAGE_TITLES[pageType] || 'Legal Information'

    return (
        <div className="w-full min-h-screen bg-[var(--color-green-muted)]">
            {/* Progress Bar */}
            <div className="legal-progress-bar" style={{ width: `${scrollProgress}%` }} />

            {/* Header */}
            <SubHeader />

            {/* Hero / Breadcrumb Section */}
            <section className="w-full px-[17px] -mt-5 relative z-50">
                <div className="hero-panel w-full max-w-[calc(100%-34px)] mx-auto h-[295px] bg-[var(--color-mint-light)] rounded-3xl relative flex items-center justify-center overflow-visible">
                    <div className="relative z-10 text-center px-5">
                        <div className="legal-icon-hero">
                            <FileText size={48} />
                        </div>
                        <h1 className="text-[68px] font-black text-[#050505] mb-[18px] tracking-tight leading-none">
                            {pageTitle}
                        </h1>
                        {legalPage?.updated_at && (
                            <p className="text-[16px] font-semibold text-[#050505] m-0 opacity-70">
                                Last updated: {new Date(legalPage.updated_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <main className="w-full py-[42px] px-[52px] pb-10">
                <div className="w-full max-w-[1400px] mx-auto">
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
                </div>
            </main>

            {/* Footer */}
            <HomePageFooter />
        </div>
    )
}
