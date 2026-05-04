import { Star } from 'lucide-react';
import { Button } from '../../../../shared/components/Button.jsx';
import { useServicesList } from '../api/services.hooks.js';

import { Link } from 'react-router-dom';
// =========================================
export function ServicesGridSection() {
    const { data: apiResponse, isLoading } = useServicesList();

    // Extract fetched services or default to empty array
    const fetchedServices = Array.isArray(apiResponse?.data) ? apiResponse.data : [];

    // Dummy data with high-quality Black professional imagery
    const DUMMY_SERVICES = [
        { id: 'd1', image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=600", title: "Enterprise Software Engineering", price: "2,500", rating: 4.9, author: "Marcus V." },
        { id: 'd2', image: "https://img.freepik.com/premium-photo/stylish-black-american-male-dressed-suit-grey-background_926199-2648947.jpg?semt=ais_hybrid&w=740&q=80", title: "Luxury Brand Architecture", price: "1,800", rating: 5.0, author: "Studio Gold" },
        { id: 'd3', image: "https://www.shutterstock.com/image-photo/face-portrait-manager-happy-black-600nw-2278812777.jpg", title: "Financial Modeling & Strategy", price: "3,200", rating: 4.9, author: "Elena Tech" },
        { id: 'd4', image: "https://img.freepik.com/free-photo/african-american-business-woman-by-window_1303-10869.jpg?semt=ais_hybrid&w=740&q=80", title: "Corporate Legal Structuring", price: "1,500", rating: 4.8, author: "Legal Flow" },
    ];

    // Pad the array if backend returns less than 4 items
    const displayServices = fetchedServices.length >= 4
        ? fetchedServices
        : [...fetchedServices, ...DUMMY_SERVICES.slice(fetchedServices.length, 4)];

    return (
        <section className="py-24 bg-white dark:bg-surface max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div className="max-w-2xl">
                    <h2 className="text-4xl font-extrabold text-[var(--color-primary-500)] dark:text-white tracking-tight mb-4">Elite capabilities, instantly accessible.</h2>
                    <p className="text-[var(--color-brand-grey)] text-lg font-light">Select from meticulously categorized, high-performance service tiers.</p>
                </div>
                <Button variant="outline" className="max-[600px]:hidden w-auto px-6 border-[var(--color-primary-300)] text-[var(--color-primary-300)]">
                    View the full directory
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><span className="animate-spin h-8 w-8 border-4 border-[var(--color-secondary-200)] border-t-transparent rounded-full" /></div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayServices.map((gig, i) => (
                        <Link
                            to={`/services/${gig.id}`}
                            state={{ image: gig.image || gig.img, service: gig }}
                            key={gig.id || i}
                            className="group flex flex-col bg-white dark:bg-mist rounded-2xl dark:border-primary-light border border-gray-200 overflow-hidden hover:shadow-[0_20px_40px_rgba(37,86,77,0.08)] hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                <img src={gig.image || gig.img} alt={gig.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[var(--color-primary-500)] flex items-center gap-1">
                                    <Star size={12} className="fill-[var(--color-secondary-200)] text-[var(--color-secondary-200)]" /> {gig.rating || "5.0"}
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                        {/* Randomizing avatars with black professionals based on index */}
                                        <img src={gig.image || gig.img} alt={gig.title} className="w-full h-full object-cover object-top" />
                                    </div>
                                    <span className="text-xs dark:text-text-3 text-gray-500 font-medium">{gig.author || "Verified Pro"}</span>
                                </div>
                                <h3 className="text-base font-bold text-[var(--color-primary-500)] dark:text-text-2 leading-tight mb-6 line-clamp-2 group-hover:text-[var(--color-secondary-300)] transition-colors">{gig.title}</h3>
                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-primry-light flex items-center justify-between">
                                    <span className="text-xs text-gray-400 dark:text-text-2 uppercase tracking-widest font-semibold">Starting at</span>
                                    <span className="text-lg font-bold text-[var(--color-primary-500)] dark:text-text-2">${gig.price || "100"}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <Button variant="outline" className="min-[610px]:hidden mt-8    w-full px-6 border-[var(--color-primary-300)] text-[var(--color-primary-300)]">
                View the full directory
            </Button>
        </section>
    );
}
