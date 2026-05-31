import { useState } from 'react';
import { Play } from 'lucide-react';
import SubHeader from './components/SubHeader';
import FAQSection from './components/FAQSection';
import { HomePageFooter } from './components/HomePageFooter';
import './css/AboutUsPage.css';

const AboutUsPage = () => {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    const handlePlayVideo = () => {
        setIsVideoPlaying(true);
    };

    return (
        <div className="w-full min-h-screen bg-[var(--color-green-dark)]">
            {/* Header */}
            <SubHeader />

            {/* Custom Hero / Breadcrumb Section */}
            <section className="w-full px-[17px] relative z-50">
                <div className="hero-panel w-full max-w-[calc(100%-34px)] mx-auto h-[295px] bg-[var(--color-mint-light)] rounded-3xl relative flex items-center justify-center overflow-visible">
                    <div className="relative z-10 text-center px-5">
                        <h1 className="text-[68px] font-black text-[#050505] mb-[18px] tracking-tight leading-none">
                            About Us
                        </h1>
                        <p className="text-[20px] font-extrabold text-[#050505] m-0">
                            Home / Pages / About Us
                        </p>
                    </div>
                </div>
            </section>

            {/* About Content Section */}
            <main className="w-full py-[42px] px-[52px] pb-10">
                {/* Headline */}
                <h2 className="text-[80px] font-black leading-[1.08] tracking-tight text-center mt-2.5 mb-12">
                    <span className="text-white">Why </span>
                    <span className="text-[var(--color-green-deep)]">35,000+</span>
                    <span className="text-white"> People Trust Hustle.io</span>
                </h2>

                {/* Body Text */}
                <article className="w-full max-w-[1400px] mx-auto">
                    <p className="text-[19px] font-medium leading-[1.5] text-[rgba(255,255,255,0.72)] mb-6 text-left">
                        Hustle.io was created to make service hiring more reliable, organized, and accessible. We believe skilled people deserve better visibility, and clients deserve a safer way to find the right professionals. Traditional service discovery often relies on random referrals, social media posts, or unreliable contacts, making it difficult for clients to find dependable workers and for professionals to showcase their expertise effectively.
                    </p>

                    <p className="text-[19px] font-medium leading-[1.5] text-[rgba(255,255,255,0.72)] mb-6 text-left">
                        Our platform connects clients with trusted service providers, skilled workers, artisans, freelancers, consultants, and verified professionals through a modern marketplace built on trust and transparency. We help people find reliable talent for different services, compare available providers, book services securely, make protected payments, and manage work from request to completion. For service providers, Hustle.io creates a professional digital space where they can showcase their skills, list their services, receive bookings, manage client requests, build reputation through reviews, and grow their income.
                    </p>

                    <p className="text-[19px] font-medium leading-[1.5] text-[rgba(255,255,255,0.72)] mb-0 text-left">
                        Our mission is to make service hiring simple, trusted, and accessible by connecting clients with reliable professionals and giving skilled people the digital tools they need to grow their work, reputation, and income. We envision becoming a leading service marketplace where anyone can confidently find trusted talent, book quality services, and build meaningful work relationships across local and remote markets.
                    </p>
                </article>
            </main>

            {/* Mission & Vision Video Section */}
            <section className="w-full px-[52px] pb-[60px]">
                <div className="mission-vision-video relative w-full max-w-[1400px] mx-auto h-[560px] rounded-[20px] overflow-hidden">
                    {!isVideoPlaying ? (
                        <>
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: "url('/images/home/hero-video-backdrop.png')" }}
                            ></div>

                            {/* Dark Overlay */}
                            <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]"></div>

                            {/* Content */}
                            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-8">
                                {/* Play Button */}
                                <button
                                    onClick={handlePlayVideo}
                                    className="w-[72px] h-[72px] rounded-full bg-[var(--color-orange)] flex items-center justify-center mb-8 transition-transform hover:scale-110 cursor-pointer border-none"
                                >
                                    <Play size={32} fill="white" stroke="white" className="ml-1" />
                                </button>

                                {/* Text */}
                                <h3 className="text-[42px] font-black text-white leading-[1.2] tracking-tight">
                                    Where Clients Meet Verified Talent
                                </h3>
                                <h3 className="text-[42px] font-black text-white leading-[1.2] tracking-tight mt-2">
                                    and Skilled People Grow
                                </h3>
                            </div>
                        </>
                    ) : (
                        /* Video Player */
                        <video
                            className="absolute inset-0 w-full h-full object-cover"
                            controls
                            autoPlay
                            src="/videos/July102025.mp4"
                        >
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>
            </section>

            {/* <FAQSection /> */}

            {/* Footer */}
            <HomePageFooter />
        </div>
    );
};

export default AboutUsPage;
