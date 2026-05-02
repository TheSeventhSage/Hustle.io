import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Grid3x3, BrushCleaning, Settings, Database, Smartphone, Tv,
    Scissors, Wrench, Zap, Hammer, GraduationCap, Camera, Music,
    Dumbbell, Trees, Car, Baby, BookOpen,
} from 'lucide-react'
import { hustlesService } from '../../hustles/hustles.service.js'
import { HustleCard } from '../../hustles/components/HustleCard.jsx'
import HustleDetailPanel from '../components/HustleDetailPanel.jsx'
import useAuthStore from '../../../features/auth/auth.store.js'

// ── Category icon map ─────────────────────────────────────────────────────────
const ICON_MAP = {
    'cleaning': BrushCleaning, 'laundry': BrushCleaning, 'home cleaning': BrushCleaning,
    'car wash': Settings, 'automotive': Settings, 'automotive services': Settings,
    'computer': Database, 'tech': Database, 'computer & it services': Database,
    'cellphone repair': Smartphone, 'phone repair': Smartphone,
    'tv repair': Tv, 'television repair': Tv,
    'makeup': Scissors, 'beauty': Scissors, 'nails': Scissors, 'hair': Scissors,
    'health & beauty services': Scissors,
    'plumbing': Wrench, 'electrical': Zap, 'plumbing & electrical services': Wrench,
    'building': Hammer, 'building ghs trade services': Hammer,
    'tutoring': GraduationCap, 'education': BookOpen,
    'photography': Camera, 'videography': Camera, 'photography & videography': Camera,
    'dj': Music, 'entertainment': Music, 'dj & entertainment services': Music,
    'fitness': Dumbbell, 'fitness & personal training services': Dumbbell,
    'landscaping': Trees, 'gardening': Trees, 'landscaping & gardening services': Trees,
    'chauffeur': Car, 'airport transfer': Car, 'chauffeur & airport transfer services': Car,
    'child care': Baby, 'child care & education services': Baby,
}

function getCategoryIcon(name) {
    if (!name) return Grid3x3
    const n = name.toLowerCase().trim()
    if (ICON_MAP[n]) return ICON_MAP[n]
    for (const [key, icon] of Object.entries(ICON_MAP)) {
        if (n.includes(key) || key.includes(n)) return icon
    }
    return Grid3x3
}

export default function HustlerHomePage() {
    const user = useAuthStore(s => s.user)
    const [selectedHustleId, setSelectedHustleId] = useState(null)
    const [panelOpen, setPanelOpen] = useState(false)

    // GET /categories — public
    const { data: categoriesData, isLoading: catsLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: hustlesService.getCategories,
        staleTime: Infinity,
    })
    const categories = categoriesData?.data?.items ?? []

    // GET /hustles — public
    const { data: hustlesData, isLoading: hustlesLoading } = useQuery({
        queryKey: ['hustles', 'feed'],
        queryFn: () => hustlesService.list({ limit: 12 }),
        staleTime: 2 * 60 * 1000,
    })
    const hustles = hustlesData?.data?.items ?? []

    const handleViewDetails = (id) => {
        setSelectedHustleId(id)
        setPanelOpen(true)
    }

    return (
        <div className="pb-16">

            {/* ── Hero banner ──────────────────────────────────────────────────── */}
            <section
                className="relative overflow-hidden bg-primary dark:bg-surface sm:mx-6 lg:mx-0 rounded-none sm:rounded-3xl lg:rounded-none"
                style={{ minHeight: '180px' }}
            >
                <div className="relative z-10 px-6 sm:px-10 py-10 max-w-lg">
                    <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest block mb-3">✦</span>
                    <h1 className="text-[22px] sm:text-[28px] font-extrabold text-white leading-tight mb-2">
                        Find your dream job on Hustle.io
                    </h1>
                    <p className="text-white/70 text-[13px] sm:text-[14px] leading-relaxed">
                        We know you want to make so much money with your hustle, that's why we gave you hustle.io
                    </p>
                </div>

                {/* Decorative illustration */}
                <div className="absolute right-6 bottom-0 top-0 hidden md:flex items-center pointer-events-none">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" opacity="0.85">
                        <rect x="10" y="30" width="50" height="60" rx="6" fill="#DEB751" opacity="0.9" />
                        <rect x="14" y="34" width="42" height="52" rx="4" fill="#F5C842" opacity="0.6" />
                        <circle cx="85" cy="55" r="28" fill="#DEB751" />
                        <circle cx="85" cy="55" r="22" fill="#F5C842" opacity="0.8" />
                        <text x="85" y="61" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#8B6914">$</text>
                    </svg>
                </div>
            </section>

            <div className="px-4 sm:px-6 lg:px-8 pt-6 max-w-screen-2xl mx-auto">

                {/* ── Categories — GET /categories ─────────────────────────────────── */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[15px] font-bold text-text-1">Categories</h2>
                        <button className="text-[13px] font-semibold text-primary hover:underline">See More</button>
                    </div>

                    {catsLoading ? (
                        <div className="flex gap-4 overflow-x-auto pb-1">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                                    <div className="w-[90px] h-[80px] rounded-2xl bg-mist animate-pulse" />
                                    <div className="w-16 h-3 bg-mist rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : categories.length === 0 ? (
                        <p className="text-[13px] text-text-4">No categories available.</p>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                            {categories.map(cat => {
                                const Icon = getCategoryIcon(cat.name)
                                return (
                                    <button key={cat.id} className="flex flex-col items-center gap-2 flex-shrink-0 group">
                                        <div className="w-[90px] h-[80px] rounded-2xl overflow-hidden border border-border group-hover:border-primary/30 transition-all bg-primary/5 dark:bg-white/5 flex items-center justify-center">
                                            <Icon size={28} strokeWidth={1.5} className="text-primary dark:text-white" />
                                        </div>
                                        <span className="text-[11px] sm:text-[12px] font-semibold text-text-2 group-hover:text-primary transition-colors text-center leading-tight max-w-[90px]">
                                            {cat.name}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </section>

                {/* ── Hustle cards — GET /hustles ───────────────────────────────────── */}
                <section>
                    {hustlesLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-80 rounded-2xl bg-mist animate-pulse" />
                            ))}
                        </div>
                    ) : hustles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-[16px] font-bold text-text-1 mb-2">No hustles available</p>
                            <p className="text-[13px] text-text-4">Check back soon for new opportunities.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {hustles.map(hustle => (
                                <HustleCard
                                    key={hustle.id}
                                    hustle={hustle}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Hustle detail panel + apply flow */}
            <HustleDetailPanel
                hustleId={selectedHustleId}
                isOpen={panelOpen}
                onClose={() => { setPanelOpen(false); setSelectedHustleId(null) }}
            />
        </div>
    )
}
