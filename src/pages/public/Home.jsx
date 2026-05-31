import HeroSection from './components/HeroSection'
import BrowseCategories from "./components/BrowseCategories";
import DiscoveRoles from './components/DiscoverRoles';
import HowItWorks from "./components/HowItWorks";
import CandidateSuccessStories from "./components/CandidateSuccessStories";
import JobOpeningsCTA from "./components/JobOpeningsCTA";
import { HomePageFooter } from './components/HomePageFooter';
import { logAuthDebug } from '../../features/auth/authDebug.js';

/* ─────────────────────────────────────────────────────────────
   BRAND TOKENS  (exact from tokens.css)
───────────────────────────────────────────────────────────── */
const T = {
    p100: "#6FA79D", p200: "#4F9487", p300: "#387D70", p400: "#2F6B60", p500: "#25564D",
    s100: "#F6DE83", s200: "#DEB751", s300: "#C58F2E", s400: "#A67626", s500: "#7F5A1D",
    gold: "#FDBA40",
    bg: "#FAFAF8", surface: "#FFFFFF", mist: "#F4F5F0",
    border: "#E8EAE3", borderMuted: "#D5DCD0",
    t1: "#000F1F", t2: "#3C4855", t3: "#535B65", t4: "#C7C7C7",
};

/* Inline noise SVG for grain texture */
const FF = `'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif`;

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function HustleLanding() {
    logAuthDebug('PublicHome.render', {
        path: typeof window !== 'undefined' ? window.location.pathname : null,
    });

    return (
        <div style={{ fontFamily: FF, background: T.bg, color: T.t1, overflowX: "hidden" }}>

            {/* ── HERO ──────────────────────────────────────────── */}
            <HeroSection />

            {/* ── CATEGORIES ────────────────────────────────────── */}
            <BrowseCategories />

            {/* ── FEATURED PROVIDERS ────────────────────────────── */}
            <DiscoveRoles />

            {/* ── HOW IT WORKS ──────────────────────────────────── */}
            <HowItWorks />

            {/* ── WHY CHOOSE US ─────────────────────────────────── */}
            {/* <WhyChooseUs /> */}

            {/* ── TESTIMONIALS ──────────────────────────────────── */}
            <CandidateSuccessStories />

            {/* ── CTA ───────────────────────────────────────────── */}
            <JobOpeningsCTA />

            {/* ── FOOTER ────────────────────────────────────────── */}
            <HomePageFooter />
        </div>
    );
}
