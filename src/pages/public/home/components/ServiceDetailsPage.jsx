import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, Clock, MapPin, ChevronLeft } from 'lucide-react';
import { Button } from '../../../../shared/components/Button.jsx';

const DUMMY_SERVICES = {
    'd1': {
        id: 'd1',
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200",
        title: "Enterprise Software Engineering",
        description: "I will engineer a robust, scalable enterprise application tailored directly to your business architecture. From backend infrastructure to high-end frontend delivery, expect uncompromising quality and attention to detail.",
        price: "2,500",
        rating: 4.9,
        category: "Technology",
        author: "Marcus V.",
        location: "Lagos, Nigeria"
    },
    'd2': {
        id: 'd2',
        image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=1200",
        title: "Luxury Brand Architecture",
        description: "Transform your brand identity with sophisticated design systems that resonate with premium audiences. Complete brand strategy, visual identity, and implementation guidelines.",
        price: "1,800",
        rating: 5.0,
        category: "Design",
        author: "Studio Gold",
        location: "Accra, Ghana"
    },
    'd3': {
        id: 'd3',
        image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=1200",
        title: "Financial Modeling & Strategy",
        description: "Comprehensive financial analysis and strategic planning for startups and established businesses. Expert modeling, forecasting, and investment strategy development.",
        price: "3,200",
        rating: 4.9,
        category: "Finance",
        author: "Elena Tech",
        location: "Nairobi, Kenya"
    },
    'd4': {
        id: 'd4',
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=1200",
        title: "Corporate Legal Structuring",
        description: "Professional legal consultation for business formation, contracts, and compliance. Specialized in tech startups and international business structures.",
        price: "1,500",
        rating: 4.8,
        category: "Legal",
        author: "Legal Flow",
        location: "Cape Town, South Africa"
    }
};

export default function ServiceDetailsPage() {
    const { id } = useParams();
    const service = DUMMY_SERVICES[id] || DUMMY_SERVICES['d1'];

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-6">

                <Link to="/" className="inline-flex items-center gap-2 text-[var(--color-brand-grey)] hover:text-[var(--color-primary-300)] transition-colors mb-10 font-medium">
                    <ChevronLeft size={20} /> Back to Marketplace
                </Link>

                <div className="grid lg:grid-cols-3 gap-16">

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* High-res image container */}
                        <div className="w-full aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(37,86,77,0.1)]">
                            <img
                                src={service.image}
                                alt={service.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="px-4 py-1.5 bg-[var(--color-secondary-100)]/30 text-[var(--color-secondary-500)] font-bold text-xs uppercase tracking-widest rounded-full">
                                    {service.category}
                                </span>
                                <div className="flex items-center gap-1 text-[var(--color-primary-500)] font-bold text-sm">
                                    <Star className="fill-[var(--color-secondary-200)] text-[var(--color-secondary-200)]" size={16} />
                                    {service.rating} (120+ Reviews)
                                </div>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-extrabold text-[var(--color-primary-500)] tracking-tight leading-tight">
                                {service.title}
                            </h1>

                            <p className="text-lg text-gray-600 leading-relaxed font-light">
                                {service.description}
                            </p>

                            <div className="pt-8 border-t border-gray-200">
                                <h2 className="text-2xl font-bold text-[var(--color-primary-500)] mb-4">What's Included</h2>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <ShieldCheck className="text-[var(--color-success)] flex-shrink-0 mt-1" size={20} />
                                        <span className="text-gray-600">Complete project delivery with documentation</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <ShieldCheck className="text-[var(--color-success)] flex-shrink-0 mt-1" size={20} />
                                        <span className="text-gray-600">Unlimited revisions until satisfaction</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <ShieldCheck className="text-[var(--color-success)] flex-shrink-0 mt-1" size={20} />
                                        <span className="text-gray-600">30-day post-delivery support</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <ShieldCheck className="text-[var(--color-success)] flex-shrink-0 mt-1" size={20} />
                                        <span className="text-gray-600">Source files and full ownership rights</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Action Sidebar */}
                    <div className="relative">
                        <div className="sticky top-32 bg-white border border-gray-200 p-8 rounded-[2rem] shadow-xl">
                            <div className="mb-8 border-b border-gray-100 pb-8">
                                <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-2">Investment</p>
                                <h3 className="text-4xl font-extrabold text-[var(--color-primary-500)]">
                                    ${service.price}
                                </h3>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Clock size={20} className="text-[var(--color-primary-300)]" />
                                    <span className="font-medium">Delivery: 14 Days</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <ShieldCheck size={20} className="text-[var(--color-success)]" />
                                    <span className="font-medium">Escrow Protected</span>
                                </div>
                            </div>

                            <Button variant="solid" className="w-full shadow-lg">
                                Continue to Booking
                            </Button>

                            {/* Provider Info inside the card */}
                            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[var(--color-secondary-200)]">
                                    <img src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" alt="Provider" />
                                </div>
                                <div>
                                    <p className="font-bold text-[var(--color-primary-500)]">{service.author}</p>
                                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                                        <MapPin size={12} /> {service.location}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
