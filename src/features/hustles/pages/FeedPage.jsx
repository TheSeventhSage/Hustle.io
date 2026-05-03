import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Car, Smartphone, Tv,
  Scissors, Wrench, Hammer,
  GraduationCap, Camera, Zap, Trees, Baby,
  Dumbbell, Music, BookOpen, Grid3x3, BrushCleaning,
  Database, Settings, AlertCircle, RefreshCw,
} from 'lucide-react'
import Image from '../../../shared/components/Image'
import { SectionHeader } from '../components/SectionHeader'
import { ServiceCard } from '../components/ServiceCard'
import { HustlerProfilePanel } from '../components/HustlerProfilePanel'
import { hustlesService } from '../hustles.service'
import { apiClient } from '../../../services/api.client'

// ── Category icon map ─────────────────────────────────────────────────────────
const CATEGORY_ICON_MAP = {
  'cleaning': BrushCleaning, 'laundry': BrushCleaning, 'home cleaning': BrushCleaning,
  'car wash': Settings, 'automotive': Settings, 'automotive services': Settings,
  'computer repair': Database, 'computer': Database, 'tech': Database,
  'cellphone repair': Smartphone, 'phone repair': Smartphone,
  'tv repair': Tv, 'television repair': Tv, 'computer & it services': Database,
  'makeup': Scissors, 'make up': Scissors, 'nails': Scissors, 'nail tech': Scissors,
  'wig installation': Scissors, 'hair': Scissors, 'beauty': Scissors,
  'health & beauty services': Scissors,
  'plumbing': Wrench, 'electrical': Zap, 'plumbing & electrical services': Wrench,
  'building': Hammer, 'building ghs trade services': Hammer,
  'tutoring': GraduationCap, 'child care': Baby, 'education': BookOpen,
  'classes': BookOpen, 'courses': BookOpen,
  'child care & education services': Baby, 'tutoring & academic services': GraduationCap,
  'dj': Music, 'entertainment': Music, 'dj & entertainment services': Music,
  'photography': Camera, 'videography': Camera, 'photography & videography': Camera,
  'fitness': Dumbbell, 'personal training': Dumbbell,
  'fitness & personal training services': Dumbbell,
  'landscaping': Trees, 'gardening': Trees, 'landscaping & gardening services': Trees,
  'chauffeur': Car, 'airport transfer': Car, 'chauffeur & airport transfer services': Car,
}

function getCategoryIcon(name) {
  if (!name) return Grid3x3
  const n = name.toLowerCase().trim()
  if (CATEGORY_ICON_MAP[n]) return CATEGORY_ICON_MAP[n]
  for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (n.includes(key) || key.includes(n)) return icon
  }
  return Grid3x3
}

// ── More categories dropdown ──────────────────────────────────────────────────
function MoreCategoriesDropdown({ categories, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute top-8 right-0 w-[300px] bg-surface border border-border rounded-2xl shadow-xl z-50 py-3">
      <p className="px-5 pb-2 text-[13px] font-bold text-text-1 border-b border-mist">More categories</p>
      <div className="py-1 max-h-[340px] overflow-y-auto">
        {categories.map(cat => (
          <button key={cat.id} className="w-full text-left px-5 py-2.5 text-[13px] text-text-2 hover:bg-mist hover:text-text-1 transition-colors">
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function ServiceCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-mist" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-mist rounded w-3/4" />
        <div className="h-3 bg-mist rounded w-1/2" />
        <div className="h-3 bg-mist rounded w-full" />
        <div className="h-10 bg-mist rounded-xl" />
      </div>
    </div>
  )
}

// ── Map API service → ServiceCard shape ───────────────────────────────────────
function toServiceCard(s) {
  return {
    id: s.id,
    artisanId: s.artisan_account_id,
    name: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || s.title,
    location: s.city_name ?? '',
    rating: s.average_rating ? Number(s.average_rating) : 0,
    reviews: s.review_count ?? 0,
    available: s.is_active ?? true,
    skills: s.skills?.map(sk => sk.name ?? sk) ?? [s.category_name].filter(Boolean),
    title: s.title,
    desc: s.short_description ?? '',
    img: s.image_url ?? null,
    avatar: s.artisan_avatar ?? null,
    rate: s.default_rate_amount
      ? `${s.currency_code ?? 'GHS'} ${Number(s.default_rate_amount).toLocaleString()}/${s.pricing_model_default === 'per_hour' ? 'hr' : 'service'}`
      : null,
    rateColor: 'text-primary',
    _raw: s,
  }
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FeedPage() {
  const [showMoreCats, setShowMoreCats] = useState(false)
  const [selectedHustler, setSelectedHustler] = useState(null)

  // GET /categories — public
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: hustlesService.getCategories,
    staleTime: 5 * 60 * 1000,
  })
  const categories = categoriesData?.data?.items ?? []

  // GET /services — public
  const {
    data: servicesData,
    isLoading: servicesLoading,
    isError: servicesError,
    refetch: refetchServices,
  } = useQuery({
    queryKey: ['services'],
    queryFn: () => apiClient('/services'),
    staleTime: 2 * 60 * 1000,
  })
  const services = servicesData?.data?.data?.items ?? servicesData?.data?.items ?? []
  const mainServices = services.slice(0, 6)
  const nearbyServices = services.slice(6, 12)

  return (
    <>
      <div className="pb-16" style={{ scrollbarWidth: 'none' }}>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden bg-primary dark:bg-surface sm:mx-6 lg:mx-0 rounded-none sm:rounded-3xl lg:rounded-none"
          style={{ minHeight: '200px' }}
        >
          <div className="absolute right-0 bottom-0 h-full w-[55%] hidden md:block pointer-events-none z-10 hero-rings">
            <Image
              src="/images/hero.png"
              alt="Hustle hero"
              className="absolute -top-8 right-0 2xl:right-12 object-cover w-[68%] 2xl:w-[40%] z-14"
            />
          </div>
          <div className="relative z-10 px-6 sm:px-10 py-10 max-w-lg">
            <h1 className="text-[24px] sm:text-[30px] font-extrabold text-white leading-tight mb-3">
              Find the best talents for your hustle
            </h1>
            <p className="text-white/70 text-[14px] sm:text-[15px] leading-relaxed">
              Need talented hands to get things done? Post your hustle and find the right people
            </p>
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-8 pt-6 max-w-screen-2xl mx-auto">

          {/* ── Categories ───────────────────────────────────────────── */}
          <section className="mb-8">
            <div className="relative">
              <SectionHeader title="Categories" onSeeMore={() => setShowMoreCats(v => !v)} />
              {showMoreCats && (
                <MoreCategoriesDropdown categories={categories} onClose={() => setShowMoreCats(false)} />
              )}
            </div>

            {categoriesLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="w-[90px] h-[80px] rounded-2xl bg-mist animate-pulse" />
                    <div className="w-16 h-3 bg-mist rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {categories.map(cat => {
                  const Icon = getCategoryIcon(cat.name)
                  return (
                    <button key={cat.id} className="flex flex-col items-center gap-2 flex-shrink-0 group">
                      <div className="w-[90px] h-[80px] rounded-2xl overflow-hidden border border-border group-hover:border-primary/30 transition-all bg-primary/5 dark:bg-white/5 flex items-center justify-center">
                        <Icon size={28} strokeWidth={1.5} className="text-primary dark:text-secondary" />
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

          {/* ── Services grid ─────────────────────────────────────────── */}
          <section className="mb-8">
            <SectionHeader title="Available Services" />

            {servicesError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <AlertCircle size={24} className="text-red-400" />
                </div>
                <p className="text-[15px] font-bold text-text-1 mb-2">Failed to load services</p>
                <button
                  onClick={() => refetchServices()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-[13px] font-bold rounded-full hover:bg-primary-sat transition-all"
                >
                  <RefreshCw size={14} /> Try again
                </button>
              </div>
            ) : servicesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => <ServiceCardSkeleton key={i} />)}
              </div>
            ) : mainServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-[15px] font-bold text-text-1 mb-2">No services available</p>
                <p className="text-[13px] text-text-4">Check back soon for new listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {mainServices.map(s => (
                  <ServiceCard key={s.id} service={toServiceCard(s)} onBookNow={setSelectedHustler} />
                ))}
              </div>
            )}
          </section>

          {/* ── More near you ─────────────────────────────────────────── */}
          {!servicesLoading && nearbyServices.length > 0 && (
            <section className="mb-10">
              <SectionHeader title="More Near You" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {nearbyServices.map(s => (
                  <ServiceCard key={s.id} service={toServiceCard(s)} onBookNow={setSelectedHustler} />
                ))}
              </div>
            </section>
          )}

        </div>

        <style>{`
          ::-webkit-scrollbar { display: none; }
          .hero-rings {
            background-image: repeating-radial-gradient(
              circle at 75% 50%, transparent 0, transparent 29px,
              hsla(220,2%,67%,0.51) 29px, hsla(210,3%,75%,0.51) 30px
            );
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 50%);
            mask-image: linear-gradient(to right, transparent 0%, black 50%);
          }
          [data-theme="dark"] .hero-rings {
            background-image: repeating-radial-gradient(
              circle at 75% 50%, transparent 0, transparent 28px,
              rgba(222,183,55,0.08) 29px, rgba(222,183,55,0.08) 30px
            );
          }
        `}</style>
      </div>

      {selectedHustler && (
        <HustlerProfilePanel hustler={selectedHustler} onClose={() => setSelectedHustler(null)} />
      )}
    </>
  )
}
