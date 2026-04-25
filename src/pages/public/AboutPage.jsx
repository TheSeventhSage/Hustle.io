import { Target, Users, Award, TrendingUp, Heart, Shield } from 'lucide-react'
import { PublicLayout } from './components/PublicLayout.jsx'

const VALUES = [
    {
        icon: Heart,
        title: 'Customer First',
        description: 'Every decision we make starts with our customers. Their satisfaction and success drive everything we do.'
    },
    {
        icon: Shield,
        title: 'Trust & Safety',
        description: 'We maintain the highest standards of verification and security to ensure safe, reliable service connections.'
    },
    {
        icon: Award,
        title: 'Quality Excellence',
        description: 'We partner only with skilled professionals who meet our rigorous quality standards and deliver exceptional results.'
    },
    {
        icon: TrendingUp,
        title: 'Continuous Innovation',
        description: 'We constantly evolve our platform to provide better tools, features, and experiences for our community.'
    },
]

const TEAM_STATS = [
    { value: '2019', label: 'Founded' },
    { value: '50+', label: 'Team Members' },
    { value: '5', label: 'Cities' },
    { value: '100K+', label: 'Happy Customers' },
]

export default function AboutPage() {
    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-1 mb-6">
                            About HustleApp
                        </h1>
                        <p className="text-lg text-text-3 leading-relaxed">
                            We're on a mission to transform how people access professional services by creating a trusted marketplace that connects skilled service providers with customers who need them.
                        </p>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-extrabold text-text-1 mb-6">
                                Our Story
                            </h2>
                            <div className="space-y-4 text-text-3 leading-relaxed">
                                <p>
                                    HustleApp was born from a simple observation: finding reliable, professional service providers shouldn't be difficult, time-consuming, or risky. In 2019, we set out to solve this problem by building a platform that brings transparency, trust, and convenience to the service marketplace.
                                </p>
                                <p>
                                    What started as a small team with a big vision has grown into Ghana's leading on-demand service platform. Today, we connect thousands of verified professionals with customers across multiple cities, facilitating over 100,000 successful service bookings.
                                </p>
                                <p>
                                    Our platform empowers service providers to grow their businesses while giving customers peace of mind through verified profiles, transparent pricing, and quality guarantees. We're not just a booking platform—we're building a community of trust.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl overflow-hidden">
                                <img
                                    src="/src/assets/images/workers.png"
                                    alt="HustleApp Team"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-3xl -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-bg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl p-8 border border-border">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <Target size={28} className="text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-1 mb-4">Our Mission</h3>
                            <p className="text-text-3 leading-relaxed">
                                To democratize access to professional services by creating a trusted, efficient marketplace that empowers both service providers and customers. We strive to make quality services accessible, affordable, and reliable for everyone.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 border border-border">
                            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                                <Users size={28} className="text-secondary" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-1 mb-4">Our Vision</h3>
                            <p className="text-text-3 leading-relaxed">
                                To become Africa's most trusted on-demand service platform, where every service need is met with excellence, and every professional has the opportunity to build a thriving business on their own terms.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-1 mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-lg text-text-3 max-w-2xl mx-auto">
                            These principles guide every decision we make and every feature we build
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {VALUES.map((value, index) => (
                            <div key={index} className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                                    <value.icon size={32} className="text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-text-1 mb-2">{value.title}</h3>
                                <p className="text-sm text-text-3 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-primary text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {TEAM_STATS.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-extrabold mb-2">{stat.value}</div>
                                <div className="text-sm opacity-90">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-bg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-extrabold text-text-1 mb-6">
                            Join Our Growing Community
                        </h2>
                        <p className="text-lg text-text-3 mb-10">
                            Whether you're looking for services or want to offer your skills, HustleApp is the platform for you.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="/sign-up"
                                className="inline-flex items-center justify-center h-12 px-8 bg-primary text-white font-semibold rounded-full hover:bg-primary-sat transition-colors"
                            >
                                Get Started as Customer
                            </a>
                            <a
                                href="/provider/register"
                                className="inline-flex items-center justify-center h-12 px-8 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-colors"
                            >
                                Become a Provider
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    )
}
