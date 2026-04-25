import { useState, useEffect } from 'react';
import {
    CheckCircle2, ShieldCheck, Zap, Star, ArrowRight, Quote,
    Search, CreditCard, Lock, Award, FileCheck, MapPin, Phone, Mail, Instagram, Twitter, Linkedin, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ServicesGridSection } from './Service'

export default function HustleIOPremiumSections() {
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    const testimonials = [
        {
            quote: "Hustle IO fundamentally changed how we source elite contractors. The precision of their matching algorithm and the caliber of the professionals is entirely unmatched in the industry.",
            name: "Sarah Reynolds",
            title: "VP of Operations, TechFlow Inc.",
            initials: "SR",
            image: "https://media.istockphoto.com/id/1587604256/photo/portrait-lawyer-and-black-woman-with-tablet-smile-and-happy-in-office-workplace-african.jpg?s=612x612&w=0&k=20&c=n9yulMNKdIYIQC-Qns8agFj6GBDbiKyPRruaUTh4MKs="
        },
        {
            quote: "The quality of talent on Hustle IO is exceptional. We've completed over 20 projects with zero issues. The escrow system gives us complete peace of mind when working with new providers.",
            name: "Michael Chen",
            title: "CTO, StartupLabs",
            initials: "MC",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqtsDqP7BNUnCz5weoD7rNfzuANyrlR5ak8Q&s"
        },
        {
            quote: "As a business owner, time is money. Hustle IO's matching algorithm connected me with the perfect developer in under 5 minutes. The project was delivered ahead of schedule and exceeded expectations.",
            name: "Amara Okafor",
            title: "Founder, Digital Ventures",
            initials: "AO",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz_uqRN4IrxD2iOizt6s316JT5B3dhWIJeUw&s"
        }
    ];

    // Auto-play functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 6000); // Change every 6 seconds

        return () => clearInterval(interval);
    }, [testimonials.length]);

    const nextTestimonial = () => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <div className="bg-[var(--color-bg)] font-sans text-[var(--color-text-2)] overflow-hidden">

            {/* Custom Keyframes for Premium Floating & Orbit Micro-Interactions */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes float-subtle { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes float-slow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(2deg); } }
        @keyframes orbit-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbit-spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }

        .animate-float { animation: float-subtle 5s ease-in-out infinite; }
        .animate-float-delayed { animation: float-slow 7s ease-in-out infinite 2s; }
        .animate-orbit { animation: orbit-spin 40s linear infinite; }
        .animate-orbit-reverse { animation: orbit-spin-reverse 50s linear infinite; }
      `}} />

            {/* =========================================
          1. ABOUT SECTION (Editorial Asymmetry)
      ========================================= */}
            <AboutSection />

            {/* =========================================
          2. WHY CHOOSE US (Circular Cluster)
      ========================================= */}
            <WhyChooseUsSection />

            {/* =========================================
          3. MARKETPLACE PREVIEW (Fiverr Structure)
      ========================================= */}
            <ServicesGridSection />

            {/* =========================================
          4. HOW IT WORKS (Horizontal Step Flow)
      ========================================= */}
            <section className="py-24 bg-white border-y border-[var(--color-border)] relative z-10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-extrabold text-[var(--color-primary)] mb-16 tracking-tight">Deploy talent in three stages.</h2>

                    <div className="grid md:grid-cols-3 gap-10 relative">
                        {/* Connecting Dashed Line (Desktop) */}
                        <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[1px] border-t-2 border-dashed border-[var(--color-border)] z-0" />

                        {[
                            { num: "01", title: "Discover", desc: "Use our intelligent matching algorithm to pinpoint exact expertise.", icon: Search },
                            { num: "02", title: "Transact", desc: "Securely fund the escrow milestone. Work begins immediately.", icon: Lock },
                            { num: "03", title: "Approve", desc: "Review the output, approve release, and scale your business.", icon: FileCheck }
                        ].map((step, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center bg-white">
                                <div className="w-20 h-20 bg-[var(--color-bg)] border-2 border-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-full flex items-center justify-center mb-6 text-[var(--color-primary)]">
                                    <step.icon size={30} strokeWidth={1.5} />
                                </div>
                                <h4 className="text-xl font-bold text-[var(--color-primary)] mb-3 flex items-center gap-2">
                                    <span className="text-xs text-[var(--color-secondary)] font-bold">{step.num}</span> {step.title}
                                </h4>
                                <p className="text-[var(--color-text-3)] font-light text-center max-w-xs">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================================
          5. TRUST & SECURITY (Deep Green Section)
      ========================================= */}
            <section className="py-24 bg-[var(--color-primary)] relative overflow-hidden">
                {/* Soft geometric light overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--color-primary-200)]/50 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
                    <div>
                        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-6">Uncompromising Security Standard.</h2>
                        <p className="text-[var(--color-primary-100)] text-lg font-light mb-10 max-w-md">
                            We built our infrastructure to protect high-value transactions. Your data, funds, and intellectual property are encrypted and secured.
                        </p>
                        <div className="space-y-6">
                            {[
                                { title: "KYC Verification", desc: "Government ID validation for all providers." },
                                { title: "PCI DSS Escrow", desc: "Bank-level encryption for all fund routing." },
                                { title: "Dispute Arbitration", desc: "Impartial moderation team available 24/7." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="mt-1"><CheckCircle2 className="text-[var(--color-secondary)]" size={20} /></div>
                                    <div>
                                        <h4 className="text-white font-semibold text-lg">{item.title}</h4>
                                        <p className="text-[var(--color-primary-100)] font-light text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-[var(--color-primary-400)] border border-white/10 rounded-[2rem] p-10 shadow-2xl backdrop-blur-sm relative z-20">
                            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                                <div>
                                    <p className="text-[var(--color-primary-100)] text-sm uppercase tracking-widest font-semibold mb-1">Escrow Status</p>
                                    <p className="text-white text-2xl font-bold">Funds Secured</p>
                                </div>
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                    <Lock className="text-[var(--color-secondary)]" size={20} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 bg-white/5 rounded-xl border border-white/5 flex items-center px-4 justify-between">
                                    <span className="text-[var(--color-primary-100)] text-sm">Milestone 1</span>
                                    <span className="text-white font-semibold">$1,500.00</span>
                                </div>
                                <div className="h-12 bg-white/5 rounded-xl border border-white/5 flex items-center px-4 justify-between">
                                    <span className="text-[var(--color-primary-100)] text-sm">Milestone 2</span>
                                    <span className="text-white font-semibold">$2,500.00</span>
                                </div>
                            </div>
                        </div>
                        {/* Abstract decorative shape behind card */}
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[var(--color-secondary)]/20 rounded-full blur-2xl z-10" />
                    </div>
                </div>
            </section>

            {/* =========================================
          6. TESTIMONIAL (Signature Rovix Design)
      ========================================= */}
            <section className="py-24 bg-[var(--color-surface)] relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-[var(--color-primary)] mb-4 tracking-tight">Trust built on delivery.</h2>
                        <p className="text-lg text-[var(--color-text-3)] max-w-2xl mx-auto font-light">See why top tier businesses and individuals rely on Hustle IO for their critical service needs.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Left: The Reference-Style Orbit Visual */}
                        <div className="relative h-[450px] w-full flex items-center justify-center hidden md:flex">
                            <div className="absolute w-[380px] h-[380px] border-2 border-dashed border-[var(--color-border)] rounded-full animate-orbit" />

                            <div className="relative w-64 h-64 rounded-full p-2 bg-white shadow-2xl z-20 transition-all duration-700">
                                <img
                                    src={testimonials[activeTestimonial].image}
                                    alt="Client"
                                    className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                />
                            </div>

                            {/* Orbit Nodes */}
                            <div className="absolute top-[5%] left-[45%] w-12 h-12 bg-white rounded-full p-1.5 shadow-lg z-30 animate-float-2">
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqtsDqP7BNUnCz5weoD7rNfzuANyrlR5ak8Q&s" className="w-full h-full rounded-full" />
                            </div>
                            <div className="absolute bottom-[20%] right-[10%] w-14 h-14 bg-white rounded-full p-1.5 shadow-lg z-30 animate-float-3">
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz_uqRN4IrxD2iOizt6s316JT5B3dhWIJeUw&s" className="w-full h-full rounded-full" />
                            </div>
                            <div className="absolute bottom-[10%] left-[20%] w-10 h-10 bg-white rounded-full p-1 shadow-md z-30 animate-float-1">
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqtsDqP7BNUnCz5weoD7rNfzuANyrlR5ak8Q&s" className="w-full h-full rounded-full" />
                            </div>
                        </div>

                        {/* Right: The Premium Soft Card */}
                        <div className="relative">
                            {/* Subtle background glow for the card */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 rounded-[2.5rem] blur-xl opacity-70" />

                            <div className="relative bg-white rounded-[2rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[var(--color-border)] hover:-translate-y-1 transition-transform duration-500 min-h-[400px]">
                                <Quote size={48} className="text-[var(--color-secondary)] mb-6 opacity-30" />

                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-[var(--color-secondary)] text-[var(--color-secondary)]" />)}
                                </div>

                                <p className="text-2xl text-[var(--color-text-2)] font-medium leading-relaxed mb-8 transition-all duration-500">
                                    {testimonials[activeTestimonial].quote}
                                </p>

                                <div className="flex items-center gap-4 pt-6 border-t border-[var(--color-border)]">
                                    <div className="w-14 h-14 rounded-full bg-[var(--color-primary)] text-[var(--color-secondary)] flex items-center justify-center font-bold text-xl shadow-md">
                                        {testimonials[activeTestimonial].initials}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-[var(--color-primary)]">{testimonials[activeTestimonial].name}</h4>
                                        <p className="text-[var(--color-text-3)] text-sm">{testimonials[activeTestimonial].title}</p>
                                    </div>
                                </div>

                                {/* Slider Controls */}
                                <div className="flex items-center justify-between mt-10">
                                    {/* Nav Dots */}
                                    <div className="flex gap-2">
                                        {testimonials.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setActiveTestimonial(index)}
                                                className={`h-2 rounded-full transition-all duration-300 ${index === activeTestimonial
                                                    ? 'w-8 bg-[var(--color-secondary)]'
                                                    : 'w-2 bg-[var(--color-border)] hover:bg-[var(--color-secondary)]/50'
                                                    }`}
                                                aria-label={`Go to testimonial ${index + 1}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Arrow Navigation */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={prevTestimonial}
                                            className="w-10 h-10 rounded-full bg-[var(--color-mist)] hover:bg-[var(--color-primary)] text-[var(--color-text-3)] hover:text-[var(--color-secondary)] flex items-center justify-center transition-all duration-300 group"
                                            aria-label="Previous testimonial"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={nextTestimonial}
                                            className="w-10 h-10 rounded-full bg-[var(--color-mist)] hover:bg-[var(--color-primary)] text-[var(--color-text-3)] hover:text-[var(--color-secondary)] flex items-center justify-center transition-all duration-300 group"
                                            aria-label="Next testimonial"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* =========================================
          7. FINAL CTA
      ========================================= */}
            <section className="py-24 border-t border-[var(--color-border)] bg-white relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--color-secondary)]/10 to-transparent opacity-50" />

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-8">
                        <Award size={14} className="text-[var(--color-secondary)]" /> Start Transacting
                    </div>
                    <h2 className="text-5xl font-extrabold text-[var(--color-primary)] tracking-tight mb-8">
                        Ready to elevate your execution?
                    </h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="h-14 px-8 bg-[var(--color-primary)] text-white font-bold rounded-full shadow-[0_10px_20px_rgba(56,125,112,0.15)] hover:shadow-[0_15px_30px_rgba(56,125,112,0.25)] hover:-translate-y-1 transition-all duration-300">
                            Find a Professional
                        </button>
                        <button className="h-14 px-8 bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold rounded-full hover:bg-[var(--color-bg)] transition-all duration-300">
                            Apply as Talent
                        </button>
                    </div>
                </div>
            </section>

            {/* =========================================
          8. FOOTER
      ========================================= */}
            <FooterSection />
        </div>
    );
}


// =========================================
// 1. ABOUT SECTION (Based on Reference: "Built differently. Built for success")
// =========================================
export function AboutSection() {
    const vettedTeams = [
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=100",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100",
        "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=100",
    ]
    return (
        <section className="py-24 lg:py-32 bg-white relative z-10 overflow-hidden border-b border-[var(--color-border)]">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                {/* Left: Text Content */}
                <div className="space-y-8 relative z-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-primary)]/5 rounded-full text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest border border-[var(--color-primary)]/10">
                        Who We Are
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--color-primary)] leading-[1.1] tracking-tight">
                        Built differently. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-300)]">Built for success.</span>
                    </h2>

                    <p className="text-lg text-[var(--color-text-3)] leading-relaxed font-light max-w-lg">
                        Hustle IO is a premier digital marketplace connecting ambitious businesses with vetted, top-tier professionals. We remove the friction of sourcing and managing talent, engineering a trusted ecosystem where quality and speed intersect seamlessly.
                    </p>

                    <div className="pt-4 flex gap-6">
                        <button className="h-12 px-8 bg-[var(--color-primary)] text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                            Discover More
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {vettedTeams.map((i) => (
                                    <img key={i} src={i} alt="Team" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                                ))}
                            </div>
                            <p className="text-sm font-semibold text-[var(--color-primary)]">50+ Core Team</p>
                        </div>
                    </div>
                </div>

                {/* Right: Asymmetrical Masonry Grid */}
                <div className="relative h-[500px] lg:h-[600px] w-full grid grid-cols-2 gap-4 lg:gap-6 z-10">
                    {/* Subtle background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-[var(--color-secondary)]/10 to-transparent rounded-full blur-3xl -z-10" />

                    {/* Left Stacked Images */}
                    <div className="flex flex-col gap-4 lg:gap-6 pt-12">
                        <div className="h-48 lg:h-56 rounded-[2rem] overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-500">
                            <img src="https://www.shutterstock.com/image-photo/business-professionals-collaborate-modern-office-260nw-2436078695.jpg" className="w-full h-full object-cover" alt="Team collaborating" />
                        </div>
                        <div className="h-56 lg:h-64 rounded-[2rem] overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-500">
                            <img src="https://t4.ftcdn.net/jpg/03/05/75/87/360_F_305758760_a52KVUdvqXQwTk49mczDHpmRXmED70VX.jpg" className="w-full h-full object-cover" alt="Modern office" />
                        </div>
                    </div>

                    {/* Right Tall Image */}
                    <div className="h-[400px] lg:h-[500px] rounded-[2rem] overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 mt-0">
                        <img src="https://t4.ftcdn.net/jpg/02/68/88/77/360_F_268887784_ZbKFyYN8YNEt8Yo56SBmzObI9IgKZzfy.jpg" className="w-full h-full object-cover" alt="Professional workspace" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/60 to-transparent flex items-end p-6">
                            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-4 w-full">
                                <p className="text-white font-bold text-lg mb-1">Global Reach</p>
                                <p className="text-white/80 text-sm font-light">Operating in 5 major cities.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

// =========================================
// 2. WHY CHOOSE US SECTION (Cards & Grid)
// =========================================
export function WhyChooseUsSection() {
    const features = [
        { icon: ShieldCheck, title: "100% Satisfaction Guarantee", desc: "Your project is protected. If you're not satisfied, our remediation team steps in immediately." },
        { icon: Zap, title: "Frictionless Matching", desc: "Our algorithm connects you to the precise expertise you need in under 3 minutes." },
        { icon: Award, title: "Rigorous Vetting", desc: "We only onboard the top 3% of applicants, ensuring elite quality across all categories." },
        { icon: CreditCard, title: "Secure Escrow", desc: "Funds are held securely and only released when predetermined milestones are approved." }
    ];

    return (
        <section className="py-24 bg-[var(--color-bg)] relative z-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-4xl font-extrabold text-[var(--color-primary)] tracking-tight mb-4">
                        Why you should choose us
                    </h2>
                    <p className="text-[var(--color-text-3)] text-lg font-light">
                        We built Hustle IO to solve the reliability problem in digital marketplaces. Here is how we ensure your success.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <div key={idx} className="bg-white rounded-[2rem] p-8 border border-[var(--color-border)] hover:shadow-[0_20px_40px_rgba(56,125,112,0.06)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                            {/* Subtle hover gradient background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-secondary)]/5 rounded-bl-full translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:-translate-y-0 transition-transform duration-500" />

                            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/5 flex items-center justify-center mb-6 group-hover:bg-[var(--color-primary)] transition-colors duration-500 relative z-10">
                                <feature.icon className="text-[var(--color-primary)] group-hover:text-[var(--color-secondary)] transition-colors duration-500" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-text-1)] mb-3 relative z-10 leading-tight">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-[var(--color-text-3)] leading-relaxed font-light relative z-10">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


// =========================================
// 4. FOOTER SECTION (Based on Dark Layout Reference)
// =========================================
export function FooterSection() {
    return (
        <footer className="bg-[var(--color-primary-500)] pt-24 pb-12 rounded-t-[3rem] mt-10 text-white relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-secondary)]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-primary-400)]/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Top Grid: Bold CTA + Links */}
                <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 mb-20">

                    {/* Left Column: Bold CTA */}
                    <div className="lg:col-span-5 space-y-8">
                        <h2 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                            Got an idea? <br />
                            <span className="text-[var(--color-primary-100)]">Let's talk.</span>
                        </h2>
                        <button className="h-14 px-8 bg-[var(--color-secondary)] text-[var(--color-primary)] font-bold rounded-full shadow-lg hover:shadow-[var(--color-secondary)]/20 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                            Contact Us <ArrowRight size={18} />
                        </button>

                        <div className="pt-8 space-y-4">
                            <div className="flex items-start gap-3 text-[var(--color-primary-100)]">
                                <MapPin size={20} className="mt-1 text-[var(--color-secondary)]" />
                                <p className="text-sm font-light">123 Innovation Drive, Tech District<br />Accra, Ghana</p>
                            </div>
                            <div className="flex items-center gap-3 text-[var(--color-primary-100)]">
                                <Phone size={20} className="text-[var(--color-secondary)]" />
                                <p className="text-sm font-light">+233 (0) 000 000 000</p>
                            </div>
                            <div className="flex items-center gap-3 text-[var(--color-primary-100)]">
                                <Mail size={20} className="text-[var(--color-secondary)]" />
                                <p className="text-sm font-light">hello@hustle.io</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Columns: Links */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 lg:pt-4">
                        <div>
                            <h4 className="font-semibold text-white mb-6 uppercase tracking-widest text-sm">Platform</h4>
                            <ul className="space-y-4 text-[var(--color-primary-100)] text-sm font-light">
                                <li><a href="#" className="hover:text-[var(--color-secondary)] transition-colors">Browse Directory</a></li>
                                <li><a href="#" className="hover:text-[var(--color-secondary)] transition-colors">Enterprise Solutions</a></li>
                                <li><a href="#" className="hover:text-[var(--color-secondary)] transition-colors">Provider Application</a></li>
                                <li><a href="#" className="hover:text-[var(--color-secondary)] transition-colors">How it Works</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-6 uppercase tracking-widest text-sm">Company</h4>
                            <ul className="space-y-4 text-[var(--color-primary-100)] text-sm font-light">
                                <li><a href="#" className="hover:text-[var(--color-secondary)] transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-[var(--color-secondary)] transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-[var(--color-secondary)] transition-colors">Press & Media</a></li>
                                <li><a href="#" className="hover:text-[var(--color-secondary)] transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-6 uppercase tracking-widest text-sm">Legal</h4>
                            <ul className="space-y-4 text-[var(--color-primary-100)] text-sm font-light">
                                <li><a href="#" className="hover:text-[var(--color-secondary)] transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-[var(--color-secondary)] transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-[var(--color-secondary)] transition-colors">Refund Policy</a></li>
                                <li><a href="#" className="hover:text-[var(--color-secondary)] transition-colors">Escrow Rules</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Area: Brand & Copyright */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--color-primary-400)] rounded-xl flex items-center justify-center">
                            <span className="text-[var(--color-secondary)] font-bold text-xl leading-none">H</span>
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-white">Hustle.IO</span>
                    </div>

                    <p className="text-sm text-[var(--color-primary-100)] font-light text-center">
                        © {new Date().getFullYear()} Hustle IO Ecosystem. All rights reserved.
                    </p>

                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-primary-100)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-secondary)] transition-all">
                            <Twitter size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-primary-100)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-secondary)] transition-all">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-primary-100)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-secondary)] transition-all">
                            <Linkedin size={18} />
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
}
