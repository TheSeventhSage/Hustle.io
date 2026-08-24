import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/HeroSection.css';
import { hustlesService } from '../../../features/hustles/hustles.service.js';
import {
  useMarketplaceCompanies,
  useMarketplaceServices,
  usePrimaryServices,
} from '../api/services.hooks.js';
import PublicNavbar from './PublicNavbar.jsx';

const STATS = [
  {
    num: '25,850',
    label: 'Services',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="8" width="20" height="13" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="2" y1="14" x2="22" y2="14" />
        <line x1="12" y1="14" x2="12" y2="17" />
      </svg>
    ),
  },
  {
    num: '10,250',
    label: 'Professionals',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="7" r="3.5" />
        <path d="M2 21v-1a7 7 0 0 1 10.85-5.85" />
        <circle cx="17" cy="14" r="3.5" />
        <path d="M22 21v-1a4 4 0 0 0-8 0v1" />
      </svg>
    ),
  },
  {
    num: '18,400',
    label: 'Clients',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <path d="M3 9h18" />
        <path d="M9 3v18" />
        <rect x="13" y="13" width="3" height="3" rx="0.3" />
        <rect x="13" y="7" width="3" height="3" rx="0.3" />
        <rect x="5" y="13" width="3" height="3" rx="0.3" />
        <rect x="5" y="7" width="3" height="3" rx="0.3" />
      </svg>
    ),
  },
];

const AVATARS = [
  { cls: 'nh-av1', src: '/images/home/hero-fem.jpg' },
  { cls: 'nh-av2', src: '/images/home/hero-male.jpg' },
  { cls: 'nh-av3', src: '/images/home/hero-img.avif' },
  { cls: 'nh-av4', src: '/images/home/hero-fem2.avif' },
  { cls: 'nh-av5', src: '/images/home/hero-fem1.webp' },
  { cls: 'nh-av6', src: '/images/home/hero-male.avif' },
];

function formatStatNumber(value, fallback) {
  const parsed = Number(String(value).replaceAll(',', ''));
  if (!Number.isFinite(parsed)) return fallback;
  return parsed.toLocaleString();
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      aria-hidden="true"
      className="w-5 h-5"
    >
      <circle cx="11" cy="11" r="7.5" />
      <path d="m20.5 20.5-4.8-4.8" />
    </svg>
  );
}

export default function HeroSection({ variant = 'home', title, breadcrumb }) {
  const navigate = useNavigate();
  const [heroQuery, setHeroQuery] = useState('');

  const statsEnabled = variant !== 'breadcrumb';
  const { data: servicesData } = useMarketplaceServices(
    {},
    { enabled: statsEnabled, retry: false }
  );
  const { data: providersData } = usePrimaryServices(
    {},
    { enabled: statsEnabled, retry: false }
  );
  const { data: companiesData } = useMarketplaceCompanies(
    {},
    { enabled: statsEnabled, retry: false }
  );

  const stats = STATS.map((item) => {
    if (item.label === 'Services') {
      return {
        ...item,
        num: formatStatNumber(servicesData?.meta?.total ?? item.num, item.num),
      };
    }

    if (item.label === 'Professionals') {
      return {
        ...item,
        num: formatStatNumber(providersData?.meta?.total ?? item.num, item.num),
      };
    }

    if (item.label === 'Clients') {
      return {
        ...item,
        num: formatStatNumber(companiesData?.meta?.total ?? item.num, item.num),
      };
    }

    return item;
  });

  const handleHeroSearch = async () => {
    const trimmedQuery = heroQuery.trim();
    if (!trimmedQuery) return;

    const next = new URLSearchParams();
    next.set('type', 'services');
    next.set('q', trimmedQuery);

    try {
      await hustlesService.searchMarketplace({
        q: trimmedQuery,
        type: 'services',
        page: 1,
        per_page: 6,
      });
    } catch {
      // Let the search page handle any retry or error state after navigation.
    }

    navigate(`/search?${next.toString()}`);
  };

  if (variant === 'breadcrumb') {
    return (
      <section className="w-full px-[17px] relative z-50">
        <div className="hero-panel w-full max-w-100% mx-auto h-[295px] bg-[rgba(237,255,237,0.98)] rounded-3xl relative flex items-center justify-center overflow-visible md:h-[280px] lg:h-[260px] xl:h-[220px] max-md:h-[200px]">
          <div className="relative z-10 text-center px-5">
            <h1 className="text-[64px] font-black text-[#050505] mb-3 tracking-tight md:text-[58px] lg:text-[52px] xl:text-[42px] max-md:text-[36px]">
              {title}
            </h1>
            <p className="text-[21px] font-extrabold text-[#050505] m-0 md:text-[20px] lg:text-[18px] xl:text-[16px] max-md:text-[14px]">
              {breadcrumb}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="font-['Nunito'] bg-[var(--color-green-dark)] min-h-[95vh] w-full flex flex-col items-center relative overflow-hidden">
      <PublicNavbar className="public-navbar--hero" />

      <div className="relative w-full flex flex-col items-stretch flex-1 my-2.5 mb-11">
        <main className="nh-hero-panel w-full bg-[rgba(237,255,237,0.98)] px-[70px] py-[70px] pb-14 relative flex-1 flex flex-col items-center justify-center overflow-hidden min-h-0 min-md:rounded-b-[40px] max-md:px-5 max-md:py-[30px] max-md:pb-[50px]">
          <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0">
            <source src="/videos/July102025.mp4" type="video/mp4" />
          </video>

          <div className="absolute top-0 left-0 w-full h-full bg-[rgba(15,45,35,0.92)] z-[1]" aria-hidden="true" />

          {AVATARS.map(({ cls, src }) => (
            <div
              key={cls}
              className={`nh-avatar ${cls} absolute rounded-full overflow-hidden z-[8] shadow-[0_8px_28px_rgba(0,0,0,0.13)]`}
              aria-hidden="true"
            >
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover rounded-full block" />
            </div>
          ))}

          <div className="text-center z-10 relative flex flex-col items-center gap-0 max-w-[860px] w-full">
            <h1 className="text-[50px] font-black leading-[1.04] tracking-[-2px] text-[#e7eee7] mb-[18px] whitespace-nowrap max-xl:text-[42px] max-xl:whitespace-normal max-md:text-[32px] max-sm:text-[30px] max-sm:mb-3">
              Trusted Professionals for{' '}
              <span
                className="font-black text-transparent"
                style={{
                  WebkitTextStroke: '2.5px #DEB751',
                  textStroke: '2.5px #DEB751',
                }}
              >
                Every{' '}
              </span>
              <span
                className="font-black"
                style={{
                  background: 'var(--color-gold-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Service
              </span>
            </h1>

            <p className="text-[19px] text-white leading-[1.45] max-w-[680px] mx-auto mb-[34px] font-semibold max-md:text-[16px] max-sm:text-[15px] max-sm:mb-6 max-sm:opacity-95">
              Discover skilled service providers, compare profiles, book securely, and manage your service requests from one simple platform.
            </p>

            <div
              className="flex items-center bg-[var(--color-green-dark)] rounded-full w-[660px] h-16 overflow-hidden mb-8 flex-shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.12)] max-xl:w-[88%] max-md:flex-col max-md:w-[90%] max-md:h-auto max-md:rounded-[20px] max-md:p-2 max-md:gap-1"
              role="search"
            >
              <div className="flex items-center gap-1 px-5 text-[rgba(255,255,255,0.88)] text-[13.5px] font-semibold whitespace-nowrap select-none h-full flex-1 max-md:w-full max-md:py-2.5 max-md:px-3.5 max-sm:text-[13px] max-sm:text-white">
                <input
                  type="search"
                  value={heroQuery}
                  onChange={(event) => setHeroQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleHeroSearch();
                  }}
                  placeholder="Search for a service or provider"
                  aria-label="Search for a service or provider"
                  className="h-full w-full min-w-0 bg-transparent text-[rgba(255,255,255,0.88)] outline-none placeholder:text-[rgba(255,255,255,0.88)] max-md:text-center max-sm:text-white"
                />
              </div>
              <button
                className="h-full px-[26px] flex items-center gap-[7px] font-extrabold text-[14.5px] text-white cursor-pointer whitespace-nowrap rounded-r-full border-none flex-shrink-0 transition-all duration-150 max-md:w-full max-md:justify-center max-md:rounded-[14px] max-md:py-3.5 max-sm:text-[14px] max-sm:py-3"
                type="button"
                aria-label="Search for jobs"
                style={{ background: 'var(--color-gold-gradient)' }}
                onClick={handleHeroSearch}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #DEB751 0%, #C58F2E 50%, #A67626 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-gold-gradient)';
                }}
              >
                <SearchIcon />
                Find Service
              </button>
            </div>

            <div className="flex gap-12 items-start justify-center max-md:gap-6 max-sm:gap-4 max-sm:flex-wrap" aria-label="Platform statistics">
              {stats.map(({ num, label, icon }) => (
                <div key={label} className="flex flex-col items-center gap-[7px] max-sm:gap-1">
                  <div
                    className="w-[52px] h-[52px] rounded-full flex items-center justify-center max-sm:w-11 max-sm:h-11"
                    style={{ background: 'var(--color-gold-gradient)' }}
                  >
                    <div className="[&>svg]:w-[26px] [&>svg]:h-[26px] [&>svg]:stroke-white [&>svg]:fill-none [&>svg]:stroke-[1.7px] [&>svg]:stroke-linecap-round [&>svg]:stroke-linejoin-round max-sm:[&>svg]:w-5 max-sm:[&>svg]:h-5">
                      {icon}
                    </div>
                  </div>
                  <span className="text-[22px] font-black text-white leading-none max-sm:text-[19px]">{num}</span>
                  <span className="text-[13.5px] text-white font-semibold -mt-1 max-sm:text-[12px] max-sm:opacity-90">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
