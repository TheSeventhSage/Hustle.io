import { useState } from 'react'
import { X, MapPin, Star, ChevronLeft, MoreVertical, RefreshCw } from 'lucide-react'
import { VerifiedBadge } from './VerifiedBadge'
import { Button } from '../../../shared/components/Button'
import { ShareDropdown } from './ShareDropdown.jsx'
import { MoreActionsDropdown } from './MoreActionsDropdown.jsx'
import { BookHustlerPanel } from './BookHustlerPanel.jsx'
import useUIStore from '../../../shared/store/ui.store.js'

/**
 * HustlerProfilePanel
 * Side panel displaying hustler profile with tabs and modals
 */
export function HustlerProfilePanel({ hustler, onClose }) {
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedService, setSelectedService] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('Lash Tech')
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportReason, setReportReason] = useState('')
    const { toastSuccess } = useUIStore()

    if (!hustler) return null

    // Mock data
    const serviceCategories = ['Lash Tech', 'Nails']

    const services = [
        {
            id: 1,
            category: 'Lash Tech',
            title: 'Lash Extension',
            price: 'From GHS 200',
            description: 'Looking for were you will do your lashes be it hybris, volume or classic, we are here for you',
            image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
            detailImages: [
                'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
            ],
            duration: '30 mins'
        },
        {
            id: 2,
            category: 'Lash Tech',
            title: 'Lash Extension',
            price: 'From GHS 200',
            description: 'Looking for were you will do your lashes be it hybris, volume or classic, we are here for you',
            image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop',
            detailImages: [],
            duration: '30 mins'
        },
        {
            id: 3,
            category: 'Lash Tech',
            title: 'Lash Extension',
            price: 'From GHS 200',
            description: 'Looking for were you will do your lashes be it hybris, volume or classic, we are here for you',
            image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
            detailImages: [],
            duration: '30 mins'
        },
        {
            id: 4,
            category: 'Lash Tech',
            title: 'Lash Extension',
            price: 'From GHS 200',
            description: 'Looking for were you will do your lashes be it hybris, volume or classic, we are here for you',
            image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
            detailImages: [],
            duration: '30 mins'
        },
    ]

    const reviews = [
        {
            id: 1,
            title: 'House cleaner needed, 3 times a week',
            author: 'Dan James',
            rating: 5,
            date: '5 days ago',
            comment: 'Lorem ipsum dolor sit amet consectetur. Turpis faucib us mi tristique elit. Libero risus malesuada incidunt egestas a nullam'
        },
        {
            id: 2,
            title: 'Plumber needed for a bathroom fix for quick gigs',
            author: 'Dan James',
            rating: 5,
            date: '5 days ago',
            comment: 'Lorem ipsum dolor sit amet consectetur. Turpis faucib us mi tristique elit. Libero risus malesuada incidunt egestas a nullam'
        },
        {
            id: 3,
            title: 'Plumber needed for a bathroom fix for quick gigs',
            author: 'Dan James',
            rating: 5,
            date: '5 days ago',
            comment: 'Lorem ipsum dolor sit amet consectetur. Turpis faucib us mi tristique elit. Libero risus malesuada incidunt egestas a nullam'
        },
        {
            id: 4,
            title: 'Plumber needed for a bathroom fix for quick gigs',
            author: 'Dan James',
            rating: 5,
            date: '5 days ago',
            comment: 'Lorem ipsum dolor sit amet consectetur. Turpis faucib us mi tristique elit. Libero risus malesuada incidunt egestas a nullam'
        },
    ]

    const filteredServices = services.filter(s => s.category === selectedCategory)

    // Service detail view
    if (selectedService) {
        return (
            <>
                {/* Overlay */}
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedService(null)} />

                {/* Panel */}
                <div className="fixed inset-y-0 right-0 w-full sm:w-[600px] bg-mist shadow-2xl z-50 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-border">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedService(null)}
                                className="p-1 hover:bg-mist rounded-lg transition-colors"
                            >
                                <ChevronLeft size={20} className="text-text-1" />
                            </button>
                            <h3 className="text-[15px] font-bold text-text-1">Service Details</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-mist rounded-lg transition-colors">
                                <RefreshCw size={18} className="text-text-3" />
                            </button>
                            <button className="p-2 hover:bg-mist rounded-lg transition-colors">
                                <MoreVertical size={18} className="text-text-3" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-mist">
                        <div className="p-6 bg-surface">
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-[22px] font-bold text-text-1">Lash Extension Classic</h2>
                                <div className="text-right">
                                    <p className="text-[18px] font-bold text-text-1">GHS 100</p>
                                    <p className="text-[13px] text-text-4">{selectedService.duration}</p>
                                </div>
                            </div>

                            <p className="text-[14px] text-text-3 leading-relaxed mb-6">
                                Enhance your natural beauty with custom lash extensions designed to complement your eye shape and style. Whether you want a subtle lift or full-on glam, I offer classic, hybrid, and volume lash sets using high-quality, lightweight lashes for a flawless finish that feels like your own.
                            </p>

                            {/* Image gallery - 2 columns, 3 rows */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {selectedService.detailImages.map((img, idx) => (
                                    <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-mist">
                                        <img
                                            src={img}
                                            alt={`${selectedService.title} ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {idx === 3 && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <button className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <Button variant="primary" className="w-full">
                                Book this service
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    // Main profile panel
    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-[600px] bg-mist shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="relative flex items-center justify-between px-3 md:px-6 py-4 bg-surface border-b border-border">
                    <h3 className="text-[15px] font-bold text-text-1">Details</h3>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="solid"
                            className="h-9 px-6 text-[13px]"
                            onClick={() => setShowBookingModal(true)}
                        >
                            Book hustler
                        </Button>
                        <button className="p-2 hover:bg-mist rounded-lg transition-colors">
                            <RefreshCw size={18} className="text-text-3" />
                        </button>
                        <ShareDropdown hustlerId={hustler.id} hustlerName={hustler.name} />
                        <MoreActionsDropdown
                            className='mr-4'
                            onShare={() => {
                                const url = `${window.location.origin}/hustler/${hustler.id}`
                                navigator.clipboard?.writeText(url).then(() => toastSuccess('Link copied!'))
                            }}
                            onHide={() => toastSuccess('Hustler hidden')}
                            onReport={() => setShowReportModal(true)}
                        />
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-mist rounded-lg transition-colors"
                        >
                            <X size={20} className="text-text-1" />
                        </button>
                    </div>
                </div>

                {/* Profile header */}
                <div className="px-6 py-5 bg-surface border-b border-border">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                        <div className="flex gap-4">
                            <div className="relative h-fit flex-shrink-0">
                                <img
                                    src={hustler.avatar}
                                    alt={hustler.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <span className="absolute -bottom-1 -right-1">
                                    <VerifiedBadge size={18} />
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-[16px] font-bold text-text-1 mb-1">{hustler.name}</h2>
                                <p className="text-[13px] text-text-3 mb-2">
                                    {hustler.skills?.join(' | ') || 'Makeup Artist | NailTech | Lash Tech'}
                                </p>
                                <div className="flex items-center gap-1.5 text-[12px] text-text-4 mb-2">
                                    <MapPin size={12} strokeWidth={2} />
                                    <span>{hustler.location}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-[14px] font-bold text-text-1 mb-1">From GHS 20.00/hr</p>
                            <div className="flex items-center gap-1 justify-end mb-2">
                                <Star size={13} className="text-secondary fill-secondary" />
                                <span className="text-[13px] font-semibold text-text-1">{hustler.rating}</span>
                                <span className="text-[11px] text-text-4">({hustler.completed || 10} hustles completed)</span>
                            </div>
                            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#16A34A] justify-end">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-light" />
                                Available now
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-surface border-b border-border px-6">
                    {[
                        { key: 'overview', label: 'Overview' },
                        { key: 'services', label: 'Services' },
                        { key: 'history', label: 'Hustles history' },
                        { key: 'reviews', label: 'Reviews history' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-3 text-[13px] font-semibold transition-colors relative ${activeTab === tab.key
                                ? 'text-primary-sat'
                                : 'text-text-4 hover:text-text-3'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.key && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-sat" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'overview' && (
                        <div className="p-6 bg-surface">
                            <h4 className="text-[15px] font-bold text-text-1 mb-3">Who is {hustler.name}?</h4>
                            <p className="text-[13px] text-text-3 leading-relaxed mb-4">
                                A multi-talented beauty professional offering nail care, lash enhancements, and flawless makeup artistry — all in one. With an eye for detail and a passion for elevating confidence, I deliver personalized beauty experiences tailored to your unique features and preferences.
                            </p>
                            <p className="text-[13px] text-text-3 leading-relaxed mb-4">
                                Whether you're getting ready for a special occasion, a shoot, or just treating yourself, I'm here to bring out your best glow — from polished nails to dramatic lashes to a camera-ready beat. Hygiene, quality products, and client comfort are my top priorities.
                            </p>
                            <p className="text-[13px] text-text-3 leading-relaxed mb-6">
                                Book one service or bundle all three for the ultimate beauty transformation
                            </p>

                            <h4 className="text-[15px] font-bold text-text-1 mb-3">Skills and Expertise</h4>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {['Mobile Beauty Services', 'Lash Tech', 'Makeup Artist', 'Nail Art', 'Full Face Beat'].map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 bg-mist text-text-2 text-[12px] font-medium rounded-lg"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <h4 className="text-[15px] font-bold text-text-1 mb-3">Working Hours</h4>
                            <div className="space-y-2.5">
                                {[
                                    { day: 'Monday', hours: '09:00am - 8:30pm' },
                                    { day: 'Tuesday', hours: '09:00am - 8:30pm' },
                                    { day: 'Wednesday', hours: '09:00am - 8:30pm' },
                                    { day: 'Thursday', hours: '09:00am - 8:30pm' },
                                    { day: 'Friday', hours: '09:00am - 8:30pm' },
                                    { day: 'Saturday', hours: 'Closed' },
                                    { day: 'Sunday', hours: 'Closed' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-[13px]">
                                        <span className="text-text-4">{item.day}</span>
                                        <span className="text-text-1 font-medium">{item.hours}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="p-6 bg-surface">
                            {/* Category filters */}
                            <div className="flex gap-2 mb-5">
                                {serviceCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors ${selectedCategory === cat
                                            ? 'bg-primary text-white'
                                            : 'bg-mist text-text-3 hover:bg-border'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Service cards - 2 column grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {filteredServices.map(service => (
                                    <div
                                        key={service.id}
                                        className="bg-surface border border-border rounded-xl overflow-hidden"
                                    >
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-32 object-cover"
                                        />
                                        <div className="p-3">
                                            <h5 className="text-[14px] font-bold text-text-1 mb-1">{service.title}</h5>
                                            <p className="text-[13px] font-semibold text-primary-sat mb-2">{service.price}</p>
                                            <p className="text-[11px] text-text-4 leading-relaxed mb-3 line-clamp-2">
                                                {service.description}
                                            </p>
                                            <button
                                                onClick={() => setSelectedService(service)}
                                                className="w-full h-8 bg-primary-sat hover:bg-primary-btn text-white text-[12px] font-semibold rounded-lg transition-colors"
                                            >
                                                View service
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="p-6 bg-surface">
                            <p className="text-[13px] text-text-4 text-center py-8">No hustles history available</p>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="p-6 space-y-4 bg-surface">
                            {reviews.map(review => (
                                <div
                                    key={review.id}
                                    className="bg-mist border border-border rounded-xl p-4"
                                >
                                    <h5 className="text-[14px] font-bold text-text-1 mb-2">{review.title}</h5>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[13px] font-semibold text-text-2">{review.author}</p>
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    className={i < review.rating ? 'text-secondary fill-secondary' : 'text-text-4 fill-text-4'}
                                                />
                                            ))}
                                            <span className="text-[12px] font-semibold text-text-1 ml-1">{review.rating}.0</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-text-4 mb-2">{review.date}</p>
                                    <p className="text-[12px] text-text-3 leading-relaxed">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Panel */}
            <BookHustlerPanel
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                onBack={() => setShowBookingModal(false)}
                hustler={hustler}
            />

            {/* Report Modal */}
            {showReportModal && (
                <>
                    {/* Compact Modal */}
                    <div className="fixed top-20 right-6 w-[340px] bg-surface shadow-2xl z-[70] rounded-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <h4 className="text-[15px] font-bold text-text-1">Reason for report</h4>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="p-1.5 hover:bg-mist rounded-lg transition-colors"
                            >
                                <X size={18} className="text-text-1" />
                            </button>
                        </div>

                        {/* Content & Footer Combined */}
                        <div className="p-5">
                            <label className="block text-[13px] font-medium text-text-3 mb-2">
                                Enter reason
                            </label>
                            <textarea
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                placeholder="Write something"
                                className="w-full h-28 px-4 py-3 border border-border rounded-xl text-[14px] text-text-1
                                    placeholder:text-text-4 focus:outline-none focus:border-primary-sat resize-none mb-4"
                            />
                            <Button
                                variant="solid"
                                className="w-full"
                                disabled={!reportReason.trim()}
                                onClick={() => {
                                    toastSuccess('Report submitted successfully')
                                    setShowReportModal(false)
                                    setReportReason('')
                                }}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
