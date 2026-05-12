import { Link } from 'react-router-dom'
import { ArrowRight, Search, MapPin, Star } from 'lucide-react'
import { useState } from 'react'
import { PublicLayout } from './components/PublicLayout.jsx'
import { ServiceCard } from './components/ServiceCard.jsx'
import { Button } from '../../shared/components/Button.jsx'

const ALL_SERVICES = [
    {
        id: 1,
        title: 'Beauty & Wellness',
        description: 'Professional beauty services delivered to your doorstep. From hair styling to makeup artistry, our verified experts bring salon-quality results to you.',
        subcategories: ['Hair Styling', 'Makeup', 'Nails', 'Spa Services', 'Massage Therapy', 'Skincare'],
        zones: 5,
        icon: '💄',
        image: '/images/workers.png',
        providers: 450
    },
    {
        id: 2,
        title: 'Catering Services',
        description: 'Exceptional culinary experiences for every occasion. Our professional chefs and catering teams deliver restaurant-quality meals for your events.',
        subcategories: ['Private Chef', 'Event Catering', 'Meal Prep', 'Baking', 'Bartending', 'Food Delivery'],
        zones: 3,
        icon: '👨‍🍳',
        image: '/images/workers.png',
        providers: 320
    },
    {
        id: 3,
        title: 'Media Production',
        description: 'Capture your moments with professional media services. From photography to videography, our creative experts bring your vision to life.',
        subcategories: ['Photography', 'Videography', 'Editing', 'Drone Services', 'Live Streaming', 'Animation'],
        zones: 4,
        icon: '📸',
        image: '/images/workers.png',
        providers: 280
    },
    {
        id: 4,
        title: 'Home Services',
        description: 'Keep your home in perfect condition with our trusted professionals. From cleaning to repairs, we handle all your household needs.',
        subcategories: ['Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Gardening'],
        zones: 5,
        icon: '🏠',
        image: '/images/workers.png',
        providers: 520
    },
    {
        id: 5,
        title: 'Event Planning',
        description: 'Create unforgettable events with our experienced planners. From weddings to corporate events, we manage every detail professionally.',
        subcategories: ['Wedding Planning', 'Corporate Events', 'Birthday Parties', 'Decorations', 'MC Services', 'Sound & Lighting'],
        zones: 4,
        icon: '🎉',
        image: '/images/workers.png',
        providers: 180
    },
    {
        id: 6,
        title: 'Transportation',
        description: 'Reliable transportation services for all your needs. Professional drivers and well-maintained vehicles ensure safe, comfortable journeys.',
        subcategories: ['Ride Services', 'Delivery', 'Moving Services', 'Airport Transfer', 'Chauffeur', 'Logistics'],
        zones: 5,
        icon: '🚗',
        image: '/images/workers.png',
        providers: 390
    },
    {
        id: 7,
        title: 'Fitness & Training',
        description: 'Achieve your fitness goals with certified trainers. Personalized workout plans and nutrition guidance delivered to your location.',
        subcategories: ['Personal Training', 'Yoga', 'Pilates', 'Nutrition Coaching', 'Group Classes', 'Sports Coaching'],
        zones: 3,
        icon: '💪',
        image: '/images/workers.png',
        providers: 150
    },
    {
        id: 8,
        title: 'Tech Support',
        description: 'Expert technical assistance for all your devices. From repairs to setup, our certified technicians solve your tech problems quickly.',
        subcategories: ['Computer Repair', 'Phone Repair', 'Network Setup', 'Software Installation', 'Data Recovery', 'IT Consulting'],
        zones: 4,
        icon: '💻',
        image: '/images/workers.png',
        providers: 210
    },
    {
        id: 9,
        title: 'Tutoring & Education',
        description: 'Quality education from experienced tutors. Personalized learning plans for students of all ages and subjects.',
        subcategories: ['Academic Tutoring', 'Language Classes', 'Music Lessons', 'Art Classes', 'Test Prep', 'Skills Training'],
        zones: 5,
        icon: '📚',
        image: '/images/workers.png',
        providers: 340
    },
]

const POPULAR_SEARCHES = [
    'Hair Styling',
    'Event Catering',
    'Photography',
    'House Cleaning',
    'Personal Training',
    'Plumbing',
]

export default function ServicesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    const filteredServices = selectedCategory === 'all'
        ? ALL_SERVICES
        : ALL_SERVICES.filter(service => service.id === parseInt(selectedCategory))

    return (
        <PublicLayout>
            {/* Hero Section with Search */}
            <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(222,183,55,0.18),transparent_34%),linear-gradient(180deg,#04100c_0%,#091611_100%)] py-20 text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
                            Explore Our Services
                        </h1>
                        <p className="text-lg text-white/70 mb-10 leading-relaxed">
                            Browse through our comprehensive range of professional services. Find the perfect expert for your needs.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <div className="flex items-center gap-3 rounded-full border border-white/12 bg-white/6 p-2 shadow-2xl shadow-black/20 backdrop-blur-md hover:border-secondary/40 transition-colors">
                                <Search size={20} className="ml-4 text-white/55" />
                                <input
                                    type="text"
                                    placeholder="Search for services..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 h-10 px-2 outline-none text-sm bg-transparent text-white placeholder:text-white/40"
                                />
                                <Button variant="solid" className="h-10 px-6 rounded-full font-semibold bg-secondary text-primary hover:bg-white">
                                    Search
                                </Button>
                            </div>
                        </div>

                        {/* Popular Searches */}
                        <div className="mt-6">
                            <p className="text-xs text-white/45 mb-3">Popular searches:</p>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {POPULAR_SEARCHES.map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => setSearchQuery(term)}
                                        className="px-4 py-1.5 rounded-full border border-white/10 bg-white/6 text-xs font-medium text-white/78 transition-colors hover:border-secondary/40 hover:text-white"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="border-y border-white/10 bg-[#050d0a] py-8 text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-center gap-8 text-center">
                        <div>
                            <div className="text-2xl font-extrabold text-secondary mb-1">2,500+</div>
                            <div className="text-xs text-white/45">Verified Providers</div>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden sm:block" />
                        <div>
                            <div className="text-2xl font-extrabold text-secondary mb-1">50+</div>
                            <div className="text-xs text-white/45">Service Categories</div>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden sm:block" />
                        <div>
                            <div className="text-2xl font-extrabold text-secondary mb-1">5</div>
                            <div className="text-xs text-white/45">Cities Covered</div>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden sm:block" />
                        <div>
                            <div className="text-2xl font-extrabold text-secondary mb-1">4.9/5</div>
                            <div className="text-xs text-white/45">Average Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-20 bg-[#07110d] text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-extrabold text-white mb-2">
                                All Services
                            </h2>
                            <p className="text-white/50">
                                {ALL_SERVICES.length} categories • {ALL_SERVICES.reduce((sum, s) => sum + s.providers, 0)}+ providers
                            </p>
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-10 px-4 rounded-lg border border-white/10 bg-white/6 text-sm text-white outline-none transition-colors focus:border-secondary/50"
                        >
                            <option value="all">All Categories</option>
                            {ALL_SERVICES.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredServices.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-[#060d0b] text-white border-y border-white/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-white/55 max-w-2xl mx-auto">
                            Book professional services in three simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-white/10 bg-white/5 text-2xl font-extrabold text-secondary mb-4">
                                1
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Choose a Service</h3>
                            <p className="text-sm text-white/55 leading-relaxed">
                                Browse our categories and select the service you need. View provider profiles and ratings.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-white/10 bg-white/5 text-2xl font-extrabold text-secondary mb-4">
                                2
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Book & Schedule</h3>
                            <p className="text-sm text-white/55 leading-relaxed">
                                Select your preferred date and time. Confirm booking details and make secure payment.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-white/10 bg-white/5 text-2xl font-extrabold text-secondary mb-4">
                                3
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Get Service Done</h3>
                            <p className="text-sm text-white/55 leading-relaxed">
                                Meet your provider at the scheduled time. Enjoy quality service and rate your experience.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[linear-gradient(135deg,#08130f_0%,#102118_55%,#050a08_100%)] text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-lg mb-10 text-white/68 leading-relaxed">
                            Join thousands of satisfied customers who trust HustleApp for their service needs
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/sign-up">
                                <Button variant="solid" className="h-14 px-8 text-base font-bold rounded-full bg-white text-primary hover:bg-gray-50">
                                    Book a Service
                                    <ArrowRight size={20} className="ml-2" />
                                </Button>
                            </Link>
                            <Link to="/provider/register">
                                <Button variant="outline" className="h-14 px-8 text-base font-semibold rounded-full border-2 border-white text-white hover:bg-white/10">
                                    Become a Provider
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    )
}

