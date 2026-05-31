import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
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
import { logAuthDebug } from '../../auth/authDebug.js'
import { hustlesService } from '../hustles.service'
import { queryKeys } from '../../../services/query-keys.js'
import { unwrapItems } from '../../../shared/lib/api/response.js'
import { normalizePrimaryProvidersCollection } from '../../../shared/lib/publicServices.js'

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

function MoreCategoriesDropdown({ categories, onClose, onSelect }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute top-8 right-0 z-50 w-[300px] rounded-2xl border border-border bg-surface py-3 shadow-xl">
      <p className="border-b border-mist px-5 pb-2 text-[13px] font-bold text-text-1">More categories</p>
      <div className="max-h-[340px] overflow-y-auto py-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect?.(category.id)}
            className="w-full cursor-pointer px-5 py-2.5 text-left text-[13px] text-text-2 transition-colors hover:bg-mist hover:text-text-1"
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}

function ServiceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border-muted)] bg-white shadow-sm animate-pulse dark:border-border dark:bg-surface">
      <div className="h-44 bg-[var(--color-border-subtle)] dark:bg-mist" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-[var(--color-border-muted)] dark:bg-mist" />
        <div className="h-3 w-1/2 rounded bg-[var(--color-border-subtle)] dark:bg-mist" />
        <div className="h-3 w-full rounded bg-[var(--color-border-subtle)] dark:bg-mist" />
        <div className="h-10 rounded-xl bg-[var(--color-border-subtle)] dark:bg-mist" />
      </div>
    </div>
  )
}

function toServiceCard(provider) {
  const primaryService = provider.primaryService ?? {}

  return {
    id: primaryService.id ?? provider.primaryServiceId,
    artisanId: provider.artisanAccountId,
    name: provider.providerName,
    location: provider.locationLabel,
    rating: provider.rating ?? 0,
    reviews: provider.reviewCount ?? 0,
    available: primaryService.isActive ?? true,
    skills: provider.categoryNames?.length ? provider.categoryNames : primaryService.skills ?? [primaryService.categoryName].filter(Boolean),
    title: primaryService.title ?? 'Professional service',
    desc: provider.providerBio ?? primaryService.description ?? '',
    img: primaryService.image ?? null,
    avatar: primaryService.avatar ?? null,
    rate: primaryService.priceLabel ?? null,
    rateColor: 'text-primary',
    _raw: {
      ...primaryService.raw,
      ...primaryService,
      artisan_account_id: provider.artisanAccountId,
      average_rating: provider.rating,
      review_count: provider.reviewCount,
      artisan_name: provider.providerName,
      artisan_bio: provider.providerBio,
    },
  }
}

export default function FeedPage() {
  const [searchParams] = useSearchParams()
  const [showMoreCats, setShowMoreCats] = useState(false)
  const [selectedHustler, setSelectedHustler] = useState(null)
  const [activeCategoryId, setActiveCategoryId] = useState('')
  const pageSearch = searchParams.get('q')?.trim() || ''

  logAuthDebug('FeedPage.render', {
    path: typeof window !== 'undefined' ? window.location.pathname : null,
    search: pageSearch,
  })

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: queryKeys.marketplace.categories(),
    queryFn: hustlesService.getCategories,
    select: (response) => unwrapItems(response),
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: providers = [],
    isLoading: servicesLoading,
    isError: servicesError,
    refetch: refetchServices,
  } = useQuery({
    queryKey: queryKeys.marketplace.primaryServices({ q: pageSearch || undefined, category_id: activeCategoryId || undefined }),
    queryFn: () => hustlesService.listPrimaryPublicServices({
      q: pageSearch || undefined,
      category_id: activeCategoryId || undefined,
    }),
    select: (response) => normalizePrimaryProvidersCollection(response).items,
    staleTime: 2 * 60 * 1000,
  })

  const mainServices = providers.slice(0, 6)
  const nearbyServices = providers.slice(6, 12)

  return (
    <>
      <div className="pb-16" style={{ scrollbarWidth: 'none' }}>
        <section
          className="relative overflow-hidden rounded-none bg-primary dark:bg-surface sm:mx-6 sm:rounded-3xl lg:mx-0 lg:rounded-none"
          style={{ minHeight: '200px' }}
        >
          <div className="hero-rings pointer-events-none absolute right-0 bottom-0 hidden h-full w-[55%] md:block z-10">
            <Image
              src="/images/hero.png"
              alt="Hustle hero"
              className="absolute -top-8 right-0 z-14 w-[68%] object-cover 2xl:right-12 2xl:w-[40%]"
            />
          </div>
          <div className="relative z-10 max-w-lg px-6 py-10 sm:px-10">
            <h1 className="mb-3 text-[24px] font-extrabold leading-tight text-white sm:text-[30px]">
              Find the best talents for your hustle
            </h1>
            <p className="text-[14px] leading-relaxed text-white/70 sm:text-[15px]">
              Need talented hands to get things done? Post your hustle and find the right people
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-8">
          <section className="mb-8">
            <div className="relative">
              <SectionHeader title="Categories" onSeeMore={() => setShowMoreCats((value) => !value)} />
              {showMoreCats ? (
                <MoreCategoriesDropdown
                  categories={categories}
                  onClose={() => setShowMoreCats(false)}
                  onSelect={(id) => {
                    setActiveCategoryId((current) => (current === String(id) ? '' : String(id)))
                    setShowMoreCats(false)
                  }}
                />
              ) : null}
            </div>

            {categoriesLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-1">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex flex-shrink-0 flex-col items-center gap-2">
                    <div className="h-[80px] w-[90px] rounded-2xl border border-[var(--color-border-muted)] bg-white animate-pulse dark:border-border dark:bg-surface" />
                    <div className="h-3 w-16 rounded bg-[var(--color-border-muted)] animate-pulse dark:bg-mist" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.name)
                  const isActive = activeCategoryId === String(category.id)

                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategoryId((current) => (current === String(category.id) ? '' : String(category.id)))}
                      className="group flex flex-shrink-0 cursor-pointer flex-col items-center gap-2"
                    >
                      <div className={`flex h-[80px] w-[90px] items-center justify-center overflow-hidden rounded-2xl border bg-primary/5 transition-all dark:bg-white/5 ${isActive ? 'border-primary/50' : 'border-border group-hover:border-primary/30'}`}>
                        <Icon size={28} strokeWidth={1.5} className="text-primary dark:text-secondary" />
                      </div>
                      <span className={`max-w-[90px] text-center text-[11px] font-semibold leading-tight transition-colors sm:text-[12px] ${isActive ? 'text-primary' : 'text-text-2 group-hover:text-primary'}`}>
                        {category.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <section className="mb-8">
            <SectionHeader title="Available Services" />

            {servicesError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                  <AlertCircle size={24} className="text-red-400" />
                </div>
                <p className="mb-2 text-[15px] font-bold text-text-1">Failed to load services</p>
                <button
                  onClick={() => refetchServices()}
                  className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-primary-sat"
                >
                  <RefreshCw size={14} /> Try again
                </button>
              </div>
            ) : servicesLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <ServiceCardSkeleton key={item} />
                ))}
              </div>
            ) : mainServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="mb-2 text-[15px] font-bold text-text-1">No services available</p>
                <p className="text-[13px] text-text-4">Check back soon for new listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {mainServices.map((provider) => (
                  <ServiceCard key={provider.artisanAccountId} service={toServiceCard(provider)} onBookNow={setSelectedHustler} />
                ))}
              </div>
            )}
          </section>

          {!servicesLoading && nearbyServices.length > 0 ? (
            <section className="mb-10">
              <SectionHeader title="More Near You" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {nearbyServices.map((provider) => (
                  <ServiceCard key={`nearby-${provider.artisanAccountId}`} service={toServiceCard(provider)} onBookNow={setSelectedHustler} />
                ))}
              </div>
            </section>
          ) : null}
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

      {selectedHustler ? (
        <HustlerProfilePanel hustler={selectedHustler} onClose={() => setSelectedHustler(null)} />
      ) : null}
    </>
  )
}
