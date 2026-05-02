import { Search, MapPin, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HustleIOPremiumHero() {
    return (
        <div className="relative min-h-[95vh] md:min-h-screen flex flex-col overflow-hidden bg-[var(--color-primary-400)] selection:bg-[var(--color-secondary-200)]/30 selection:text-white">

            {/* Custom Keyframes for Premium Floating & Orbit Micro-Interactions */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes float-1 { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-12px) scale(1.02); } }
        @keyframes float-2 { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-18px) scale(1.03); } }
        @keyframes float-3 { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(10px) scale(1.01); } }
        
        .animate-float-1 { animation: float-1 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 8s ease-in-out infinite 1s; }
        .animate-float-3 { animation: float-3 7s ease-in-out infinite 2s; }
        
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-slow-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        
        .animate-orbit { animation: spin-slow 35s linear infinite; }
        .animate-orbit-reverse { animation: spin-slow-reverse 45s linear infinite; }
      `}} />

            {/* =========================================
          1. CINEMATIC VIDEO BACKGROUND SYSTEM
      ========================================= */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[var(--color-primary-500)]">
                {/* YouTube video embed */}
                <iframe
                    className="absolute inset-0 w-full h-full opacity-80"
                    src="https://www.youtube.com/embed/TWXnj7p-uLM?autoplay=1&mute=1&loop=1&playlist=TWXnj7p-uLM&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1"
                    title="Hustle.io Background Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                        pointerEvents: 'none',
                        objectFit: 'cover',
                        minWidth: '100%',
                        minHeight: '100%',
                        width: '100vw',
                        height: '100vh'
                    }}
                />

                {/* Fallback gradient if video doesn't load */}
                <div className="absolute inset-0 bg-[var(--color-primary-500)]" style={{ zIndex: -1 }} />

                {/* --- Multi-Layer Gradient Overlays --- */}
                {/* Deep Green Tint to align with brand colors */}
                <div className="absolute inset-0 bg-[var(--color-primary-500)]/70 mix-blend-multiply" />

                {/* Soft radial fade to ensure text readability on the left */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-500)] via-[var(--color-primary-500)]/80 to-transparent" />

                {/* Ambient Blur Layer to push video to the background */}
                <div className="absolute inset-0 backdrop-blur-[6px]" />
            </div>

            {/* =========================================
          NAVBAR
      ========================================= */}
            <nav className="relative z-20 w-full py-6">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black text-white tracking-tight">
                            Hustle<span className="text-[var(--color-secondary-200)]">.</span>io
                        </span>
                    </Link>

                    {/* Nav Links & Actions */}
                    <div className="flex items-center gap-6">
                        <Link
                            to="/sign-in"
                            className="text-white/90 hover:text-white font-semibold transition-colors hidden sm:block px-4 py-2 text-sm"
                        >
                            Sign In
                        </Link>
                        <Link to="/sign-up">
                            <button className="px-8 py-3 bg-[var(--color-secondary-200)] text-[var(--color-primary-500)] font-bold rounded-full hover:bg-white hover:scale-[1.02] transition-all duration-300 shadow-[0_8px_20px_rgba(222,183,81,0.3)] hover:shadow-[0_12px_30px_rgba(222,183,81,0.4)] text-sm">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* =========================================
          2. FOREGROUND CONTENT & VISUALS
      ========================================= */}
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 flex-1 py-12">

                {/* --- LEFT: Primary Content --- */}
                <div className="flex flex-col items-start space-y-8">

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)] animate-float-3">
                        <Star size={16} className="text-[var(--color-secondary-200)] fill-[var(--color-secondary-200)]" />
                        <span className="text-sm font-semibold text-white tracking-wide">Premium Service Ecosystem</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
                        Find Trusted <br />
                        Professionals. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-secondary-100)] to-[var(--color-secondary-300)] inline-block mt-2">
                            Get Work Done.
                        </span>
                    </h1>

                    <p className="text-xl text-white/80 leading-relaxed max-w-lg font-light">
                        Bypass the noise. Connect directly with highly vetted, top-tier experts ready to execute your most ambitious projects seamlessly.
                    </p>

                    {/* Glassmorphism Intelligent Search */}
                    <div className="w-full max-w-md relative group mt-4">
                        {/* Focus Glow */}
                        <div className="absolute inset-0 bg-[var(--color-secondary-200)]/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />

                        <div className="relative flex items-center h-16 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl p-2 hover:bg-white/15 transition-colors duration-300">
                            <div className="pl-4 pr-2">
                                <Search size={20} className="text-white/60" />
                            </div>
                            <input
                                type="text"
                                placeholder="What expertise do you need?"
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/50 font-medium text-lg"
                            />
                            <button className="h-12 w-12 rounded-full bg-[var(--color-secondary-200)] text-[var(--color-primary-500)] flex items-center justify-center shadow-[0_4px_15px_rgba(222,183,81,0.3)] hover:bg-white hover:scale-105 transition-all duration-300 shrink-0">
                                <ArrowRight size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-6">
                        <div className="flex -space-x-3">
                            {/* Vetted Client Avatars */}
                            <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=100" alt="Client" className="w-10 h-10 rounded-full border-2 border-[var(--color-primary-400)] object-cover shadow-sm" />
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" alt="Client" className="w-10 h-10 rounded-full border-2 border-[var(--color-primary-400)] object-cover shadow-sm" />
                            <img src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=100" alt="Client" className="w-10 h-10 rounded-full border-2 border-[var(--color-primary-400)] object-cover shadow-sm" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1 text-[var(--color-secondary-200)]">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-current" />)}
                            </div>
                            <span className="text-sm font-medium text-white/70 mt-0.5">Rated 4.9/5 by 10k+ clients</span>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: Cinematic Visual Orbit Composition --- */}
                <div className="relative h-[500px] lg:h-[650px] w-full flex items-center justify-center hidden md:flex">

                    {/* Ambient Inner Glow to separate from video background */}
                    <div className="absolute w-[400px] h-[400px] bg-[var(--color-primary-300)]/40 rounded-full blur-[100px] pointer-events-none z-0" />

                    {/* Dashed Orbit Rings */}
                    <div className="absolute w-[450px] h-[450px] border border-dashed border-white/10 rounded-full animate-orbit z-0" />
                    <div className="absolute w-[300px] h-[300px] border border-dashed border-[var(--color-secondary-200)]/20 rounded-full animate-orbit-reverse z-0" />

                    {/* Main Center Image (Glass Framed) */}
                    <div className="relative w-72 h-72 rounded-full p-3 bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.4)] z-20 animate-float-1">
                        <div className="w-full h-full rounded-full overflow-hidden relative">
                            <img
                                src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=600"
                                alt="Elite Professional"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-500)]/60 to-transparent" />
                        </div>

                        {/* Gold Verified Badge */}
                        <div className="absolute bottom-2 right-6 w-14 h-14 bg-[var(--color-secondary-200)] rounded-full border-4 border-[var(--color-primary-500)] flex items-center justify-center shadow-lg">
                            <CheckCircle2 size={24} className="text-[var(--color-primary-500)]" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Orbiting Secondary Avatars (Floating Glass) */}
                    <div className="absolute top-[10%] left-[15%] w-16 h-16 rounded-full border-2 border-white/20 shadow-2xl overflow-hidden animate-float-2 z-30">
                        <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=200" alt="Avatar 1" className="w-full h-full object-cover" />
                    </div>

                    <div className="absolute bottom-[20%] left-[5%] w-14 h-14 rounded-full border-2 border-[var(--color-secondary-200)]/50 shadow-2xl overflow-hidden animate-float-3 z-30">
                        <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200" alt="Avatar 2" className="w-full h-full object-cover" />
                    </div>

                    <div className="absolute top-[25%] right-[5%] w-20 h-20 rounded-full p-1 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl animate-float-1 z-30">
                        <img src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=200" alt="Avatar 3" className="w-full h-full rounded-full object-cover" />
                    </div>

                    {/* Glass Floating Meta Badge */}
                    <div className="absolute top-[50%] -right-8 bg-white/10 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-3 animate-float-3 z-40 border border-white/20">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-secondary-200)]/20 flex items-center justify-center">
                            <MapPin size={18} className="text-[var(--color-secondary-200)]" />
                        </div>
                        <div>
                            <p className="text-xs text-white/70 font-medium tracking-wide uppercase">Active Zone</p>
                            <p className="text-sm font-bold text-white">Global Network</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}