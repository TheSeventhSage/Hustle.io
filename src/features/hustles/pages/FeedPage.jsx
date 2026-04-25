import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Sparkles, Car, Home, Monitor, Smartphone, Tv,
  Palette, Hand, Scissors, Wrench, Hammer, Users,
  GraduationCap, Camera, Droplet, Zap, Trees, Baby,
  Dumbbell, Heart, Music, BookOpen, Grid3x3, BrushCleaning,
  Database, Settings
} from 'lucide-react'
import Image from '../../../shared/components/Image'
import { TopHustlerCard } from '../components/TopHustlerCard'
import { HustlerCard } from '../components/HustlerCard'
import { SectionHeader } from '../components/SectionHeader'
import { ServiceCard } from '../components/ServiceCard'
import { HustlerProfilePanel } from '../components/HustlerProfilePanel'
import { Button } from '../../../shared/components/Button'
import { hustlesService } from '../hustles.service'

// ── Category Icon Mapping ──────────────────────────────────────────────
const CATEGORY_ICON_MAP = {
  // Cleaning services
  'cleaning': BrushCleaning,
  'laundry': BrushCleaning,
  'home cleaning': BrushCleaning,
  'house cleaning': BrushCleaning,

  // Automotive
  'car wash': Settings,
  'automotive': Settings,
  'automotive services': Settings,

  // Tech & Electronics
  'computer repair': Database,
  'computer': Database,
  'tech': Database,
  'cellphone repair': Smartphone,
  'phone repair': Smartphone,
  'tv repair': Tv,
  'television repair': Tv,
  'computer & it services': Database,

  // Beauty services
  'makeup': Scissors,
  'make up': Scissors,
  'nails': Scissors,
  'nail tech': Scissors,
  'wig installation': Scissors,
  'hair': Scissors,
  'beauty': Scissors,
  'health & beauty services': Scissors,

  // Trade services
  'plumbing': Wrench,
  'electrical': Zap,
  'plumbing & electrical services': Wrench,
  'building': Hammer,
  'building ghs trade services': Hammer,

  // Education & Childcare
  'tutoring': GraduationCap,
  'child care': Baby,
  'education': BookOpen,
  'classes': BookOpen,
  'courses': BookOpen,
  'child care & education services': Baby,
  'tutoring & academic services': GraduationCap,
  'classes & courses': BookOpen,

  // Entertainment
  'dj': Music,
  'entertainment': Music,
  'dj & entertainment services': Music,
  'photography': Camera,
  'videography': Camera,
  'photography & videography': Camera,

  // Fitness & Wellness
  'fitness': Dumbbell,
  'personal training': Dumbbell,
  'fitness & personal training services': Dumbbell,

  // Outdoor services
  'landscaping': Trees,
  'gardening': Trees,
  'landscaping & gardening services': Trees,

  // Transportation
  'chauffeur': Car,
  'airport transfer': Car,
  'chauffeur & airport transfer services': Car,
}

// Function to get icon for a category
const getCategoryIcon = (categoryName) => {
  if (!categoryName) return Grid3x3

  const normalizedName = categoryName.toLowerCase().trim()

  // Direct match
  if (CATEGORY_ICON_MAP[normalizedName]) {
    return CATEGORY_ICON_MAP[normalizedName]
  }

  // Partial match - check if category name contains any key
  for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return icon
    }
  }

  // Default icon
  return Grid3x3
}

// ── Data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Laundry', img: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=200&h=200&fit=crop&auto=format' },
  { label: 'Car wash', img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=200&h=200&fit=crop&auto=format' },
  { label: 'Home Cleaning', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop&auto=format' },
  { label: 'Computer repair', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200&h=200&fit=crop&auto=format' },
  { label: 'Cellphone repair', img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=200&fit=crop&auto=format' },
  { label: 'T.V repair', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834?w=200&h=200&fit=crop&auto=format' },
  { label: 'Make up', img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200&h=200&fit=crop&auto=format' },
  { label: 'Nails', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&h=200&fit=crop&auto=format' },
  { label: 'Wig installation', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop&auto=format' },
]

const MORE_CATEGORIES = [
  'Automotive services',
  'Building GHS Trade services',
  'Chauffeur & Airport transfer services',
  'Child care & Education services',
  'Classes & Courses',
  'Cleaning services',
  'Computer & IT services',
  'DJ & Entertainment services',
  'Fitness & personal training services',
  'Health & Beauty services',
  'Landscaping & Gardening services',
  'Photography & Videography',
  'Plumbing & Electrical services',
  'Tutoring & Academic services',
]

const HUSTLE_CARDS = [
  {
    id: 1,
    name: 'William Howard Taft',
    location: 'Coppell, Virginia',
    rating: 4.6, reviews: 10,
    available: true,
    skills: ['Makeup Artist', 'NailTech', 'Lash Tech'],
    title: 'Lash Extension-Classic, Hybrid or Volume',
    desc: 'Enhance your natural beauty with customized lash extensions tailored to your style — whether you pref...',
    img: 'https://t3.ftcdn.net/jpg/02/38/91/98/360_F_238919888_a3nBxWSSUyQYroPZR1C2blvnYaswiB49.jpg',
    avatar: 'https://t3.ftcdn.net/jpg/02/38/91/98/360_F_238919888_a3nBxWSSUyQYroPZR1C2blvnYaswiB49.jpg',
  },
  {
    id: 2,
    name: 'William Howard Taft',
    location: 'Coppell, Virginia',
    rating: 4.6, reviews: 10,
    available: false,
    skills: ['Makeup Artist', 'NailTech', 'Lash Tec...'],
    title: 'Lash Extension-Classic, Hybrid or Volume',
    desc: 'Enhance your natural beauty with customized lash extensions tailored to your style — whether you pref...',
    img: 'https://www.shutterstock.com/image-photo/beautiful-african-american-model-glowing-600nw-2602580893.jpg',
    avatar: 'https://www.shutterstock.com/image-photo/beautiful-african-american-model-glowing-600nw-2602580893.jpg',
  },
  {
    id: 3,
    name: 'William Howard Taft',
    location: 'Coppell, Virginia',
    rating: 4.6, reviews: 10,
    available: true,
    skills: ['Makeup Artist', 'NailTech', 'Lash Tec...'],
    title: 'Lash Extension-Classic, Hybrid or Volume',
    desc: 'Enhance your natural beauty with customized lash extensions tailored to your style — whether you pref...',
    img: 'https://mirelleinspo.com/images/topic/professional-elegant-office-manicure-workplace-nails.webp',
    avatar: 'https://mirelleinspo.com/images/topic/professional-elegant-office-manicure-workplace-nails.webp',
  },
  {
    id: 4,
    name: 'William Howard Taft',
    location: 'Coppell, Virginia',
    rating: 4.6, reviews: 10,
    available: false,
    skills: ['Makeup Artist', 'NailTech', 'Lash Tec...'],
    title: 'Lash Extension-Classic, Hybrid or Volume',
    desc: 'Enhance your natural beauty with customized lash extensions tailored to your style — whether you pref...',
    img: 'https://t3.ftcdn.net/jpg/02/38/91/98/360_F_238919888_a3nBxWSSUyQYroPZR1C2blvnYaswiB49.jpg',
    avatar: 'https://t3.ftcdn.net/jpg/02/38/91/98/360_F_238919888_a3nBxWSSUyQYroPZR1C2blvnYaswiB49.jpg',
  },
  {
    id: 5,
    name: 'William Howard Taft',
    location: 'Coppell, Virginia',
    rating: 4.6, reviews: 10,
    available: true,
    skills: ['Makeup Artist', 'NailTech', 'Lash Tec...'],
    title: 'Lash Extension-Classic, Hybrid or Volume',
    desc: 'Enhance your natural beauty with customized lash extensions tailored to your style — whether you pref...',
    img: null, // placeholder - will show brand placeholder
    avatar: 'https://www.shutterstock.com/image-photo/beautiful-african-american-model-glowing-600nw-2602580893.jpg',
  },
  {
    id: 6,
    name: 'William Howard Taft',
    location: 'Coppell, Virginia',
    rating: 4.6, reviews: 10,
    available: true,
    skills: ['Makeup Artist', 'NailTech', 'Lash Tec...'],
    title: 'Lash Extension-Classic, Hybrid or Volume',
    desc: 'Enhance your natural beauty with customized lash extensions tailored to your style — whether you pref...',
    img: 'https://www.shutterstock.com/image-photo/beautiful-african-american-model-glowing-600nw-2602580893.jpg',
    avatar: 'https://www.shutterstock.com/image-photo/beautiful-african-american-model-glowing-600nw-2602580893.jpg',
  },
]

const TOP_HUSTLERS = [
  { id: 1, name: 'William Howard Taft', skill: 'Lash Tech', completed: 10, avatar: 'https://img.freepik.com/free-photo/african-american-business-woman-by-window_1303-10869.jpg?semt=ais_hybrid&w=740&q=80' },
  { id: 2, name: 'William Howard Taft', skill: 'Lash Tech', completed: 10, avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=600' },
  { id: 3, name: 'William Howard Taft', skill: 'Lash Tech', completed: 10, avatar: 'https://img.freepik.com/free-photo/african-american-business-woman-by-window_1303-10869.jpg?semt=ais_hybrid&w=740&q=80' },
  { id: 4, name: 'William Howard Taft', skill: 'Lash Tech', completed: 10, avatar: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=600" },
  { id: 5, name: 'William Howard Taft', skill: 'Lash Tech', completed: 10, avatar: 'https://img.freepik.com/free-photo/african-american-business-woman-by-window_1303-10869.jpg?semt=ais_hybrid&w=740&q=80' },
]

const NEARBY_HUSTLERS = [
  {
    id: 1, name: 'William Howard Taft', role: 'Lash Tech',
    skills: ['Makeup Artist', 'NailTech', 'Lash Te...'],
    rating: 4.6, completed: 10, location: 'Coppell, Virginia',
    rate: 'GHS 45.00/hr', rateColor: 'text-primary',
    avatar: 'https://img.freepik.com/free-photo/african-american-business-woman-by-window_1303-10869.jpg?semt=ais_hybrid&w=740&q=80',
  },
  {
    id: 2, name: 'Dianne Russell', role: 'Makeup Artist | NailTech | Lash Te...',
    skills: ['Makeup Artist', 'NailTech', 'Lash Te...'],
    rating: 4.6, completed: 10, location: 'Coppell, Virginia',
    rate: 'From GHS 45.00/hr', rateColor: 'text-[#F59E0B]',
    avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 3, name: 'Courtney Henry', role: 'Makeup Artist | NailTech | Lash Te...',
    skills: ['Makeup Artist', 'NailTech', 'Lash Te...'],
    rating: 4.6, completed: 10, location: 'Coppell, Virginia',
    rate: 'From GHS 45.00/hr', rateColor: 'text-[#F59E0B]',
    avatar: 'https://img.freepik.com/free-photo/african-american-business-woman-by-window_1303-10869.jpg?semt=ais_hybrid&w=740&q=80',
  },
  {
    id: 4, name: 'William Howard Taft', role: 'Lash Tech',
    skills: ['Makeup Artist', 'NailTech', 'Lash Te...'],
    rating: 4.6, completed: 10, location: 'Coppell, Virginia',
    rate: 'GHS 45.00/hr', rateColor: 'text-primary',
    avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 5, name: 'Dianne Russell', role: 'Makeup Artist | NailTech | Lash Te...',
    skills: ['Makeup Artist', 'NailTech', 'Lash Te...'],
    rating: 4.6, completed: 10, location: 'Coppell, Virginia',
    rate: 'From GHS 45.00/hr', rateColor: 'text-[#F59E0B]',
    avatar: 'https://img.freepik.com/free-photo/african-american-business-woman-by-window_1303-10869.jpg?semt=ais_hybrid&w=740&q=80',
  },
  {
    id: 6, name: 'Courtney Henry', role: 'Makeup Artist | NailTech | Lash Te...',
    skills: ['Makeup Artist', 'NailTech', 'Lash Te...'],
    rating: 4.6, completed: 10, location: 'Coppell, Virginia',
    rate: 'From GHS 45.00/hr', rateColor: 'text-[#F59E0B]',
    avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=600',
  },
]

// ── More categories dropdown ──────────────────────────────────────────
function MoreCategoriesDropdown({ onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute top-4.5 right-0 w-[300px] bg-surface border border-border rounded-2xl shadow-xl z-50 py-3"
    >
      <p className="px-5 pb-2 text-[13px] font-bold text-text-1 border-b border-mist">
        More categories
      </p>
      <div className="py-1 max-h-[340px] overflow-y-auto">
        {MORE_CATEGORIES.map((cat) => (
          <button key={cat}
            className="w-full text-left px-5 py-2.5 text-[13px] text-text-2 hover:bg-mist hover:text-text-1 transition-colors">
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────
export default function FeedPage() {
  const [showMoreCats, setShowMoreCats] = useState(false)
  const [selectedHustler, setSelectedHustler] = useState(null)
  const [showWelcome, setShowWelcome] = useState(true)

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: hustlesService.getCategories,
    staleTime: 5 * 60 * 1000,
  })

  const categories = categoriesData?.data?.items || []

  return (
    <>
      <div className="pb-16" style={{ scrollbarWidth: 'none' }}>

        {/* ── 1. HERO BANNER ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-primary dark:bg-surface sm:mx-6 lg:mx-0 mt-0 mb-0 rounded-none sm:rounded-3xl lg:rounded-none"
          style={{ minHeight: '200px' }}>

          {/* Circular decorative rings */}
          {/* Right Section: Graphic & Character grouped together */}
          <div
            className="absolute right-0 bottom-0 h-full w-[55%] hidden md:block pointer-events-none z-10 hero-rings"
          >

            {/* The Character (In front of the graphic) */}
            <Image
              src="/src/assets/images/hero.png"
              alt="Hustle profile setup"
              className="absolute -top-8 right-0 2xl:right-12 object-cover w-[68%] 2xl:w-[40%] object-top-right z-14"
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

        {/* ── PAGE CONTENT ───────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 lg:px- pt-6 max-w-screen-2xl mx-auto">

          {/* ── 2. CATEGORIES ────────────────────────────────────────── */}
          <section className="mb-8">
            <div className="relative">
              <SectionHeader
                title="Categories"
                onSeeMore={() => setShowMoreCats(v => !v)}
              />

              {/* More categories dropdown */}
              {showMoreCats && (
                <MoreCategoriesDropdown onClose={() => setShowMoreCats(false)} />
              )}
            </div>

            {/* Category thumbnails */}
            {categoriesLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="w-[90px] h-[80px] sm:w-[100px] sm:h-[90px] rounded-2xl bg-mist animate-pulse" />
                    <div className="w-16 h-3 bg-mist rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {categories.map((cat) => {
                  const IconComponent = getCategoryIcon(cat.name)
                  return (
                    <button key={cat.id} className="flex flex-col items-center gap-2 flex-shrink-0 group">
                      <div className="w-[90px] h-[80px] sm:w-[90px] sm:h-[80px] rounded-2xl overflow-hidden
                      border border-border group-hover:border-primary/30 transition-all bg-primary/5 dark:bg-white/5 flex items-center justify-center">
                        <div className="bg-[#6fa79da2]border border-border rounded-2xl group-hover:border-primary/30 dark:bg-white/5 p-2">
                          <IconComponent
                            size={28}
                            strokeWidth={1.5}
                            className="text-primary dark:text-secondary"
                          />
                        </div>
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

          {/* ── 3. HUSTLE CARDS GRID ─────────────────────────────────── */}
          <section className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {HUSTLE_CARDS.map(card => (
                <ServiceCard
                  key={card.id}
                  service={card}
                  onBookNow={(card) => setSelectedHustler({ ...card, skills: card.skills })}
                />
              ))}
            </div>
          </section>

          {/* ── 4. TOP HUSTLERS ──────────────────────────────────────── */}
          <section className="mb-10">
            <SectionHeader title="Top Hustlers" />
            <div className="flex gap-5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {TOP_HUSTLERS.map(h => (
                <TopHustlerCard key={h.id} hustler={h} onClick={setSelectedHustler} />
              ))}
            </div>
          </section>

          {/* ── 5. LASH TECHS NEAR YOU ───────────────────────────────── */}
          <section className="mb-10">
            <SectionHeader title="Lash Techs Near You" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {NEARBY_HUSTLERS.map(h => (
                <HustlerCard key={h.id} hustler={h} onClick={setSelectedHustler} />
              ))}
            </div>
          </section>

        </div>

        <style>{`
        ::-webkit-scrollbar { display: none; }
        
        /* Hero rings - light mode */
        .hero-rings {
          background-image: repeating-radial-gradient(
            circle at 75% 50%, 
            transparent 0, 
            transparent 29px, 
            hsla(220, 2%, 67%, 0.51) 29px, 
            hsla(210, 3%, 75%, 0.51) 30px
          );
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 50%);
          mask-image: linear-gradient(to right, transparent 0%, black 50%);
        }
        
        /* Hero rings - dark mode */
        [data-theme="dark"] .hero-rings {
          background-image: repeating-radial-gradient(
            circle at 75% 50%, 
            transparent 0, 
            transparent 28px, 
            rgba(222, 183, 55, 0.08) 29px, 
            rgba(222, 183, 55, 0.08) 30px
          );
        }
      `}</style>
      </div>

      {/* Profile panel */}
      {selectedHustler && (
        <HustlerProfilePanel
          hustler={selectedHustler}
          onClose={() => setSelectedHustler(null)}
        />
      )}

      {/* Welcome onboard modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowWelcome(false)} />
          <div className="relative bg-surface rounded-3xl shadow-2xl w-full max-w-[380px] px-8 py-10 flex flex-col items-center text-center">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-5 right-5 p-2 flex items-center justify-center rounded-full border border-border text-text-3 hover:bg-mist transition-all"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="text-[56px] mb-4 select-none">✋</div>

            <h3 className="text-[18px] font-extrabold text-text-1 mb-3">
              Welcome onboard, Hustler🎉🎊
            </h3>
            <p className="text-[13px] text-text-3 leading-relaxed mb-7">
              You're almost there. To be able to apply for a hustle, you are required to complete your account profile.
            </p>

            <Button
              variant='primary'
              onClick={() => setShowWelcome(false)}
              className="w-full h-12 text-[14px] font-bold rounded-full transition-all active:scale-[0.98]"
            >
              Complete my profile
            </Button
            >
          </div>
        </div>
      )}
    </>
  )
}