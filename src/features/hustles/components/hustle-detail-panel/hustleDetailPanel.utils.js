// ── Helper utilities for HustleDetailPanel ────────────────────────────────────

export function formatGHS(v) {
    return `GHS ${Number(v).toLocaleString('en-GH')}`
}

// ── Mock data ──────────────────────────────────────────────────────────────────
export const MOCK_HUSTLE = {
    id: 'h1',
    title: 'Lash Extension Expert Needed',
    experienceLevel: 'Expert',
    duration: '8 days',
    amount: 2000,
    preferredTime: '03:30pm - 04:00pm',
    preferredDate: 'April 16 2025 - April 24 2025',
    location: 'Accra, Dansoman',
    description:
        'Looking for a skilled lash tech to create natural-looking or volume lash sets for quick, one-off gigs. Must be detail-oriented, gentle, and use quality materials. Experience with classic, hybrid, or volume sets is a plus.',
    skills: ['Carefulness', 'Lash tech', 'On-Demand Beauty'],
    attachments: [{ name: 'Tech design requirements.pdf', size: '200 KB' }],
    images: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop&sat=-30',
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop&sat=-30',
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop&sat=-30',
    ],
    hasVideoAtIdx: 3,
}

export const MOCK_APPLICANTS = [
    {
        id: 'a1', name: 'Darlene Robertson', role: 'Lash Tech',
        rating: 4.6, hustlesCompleted: 10, location: 'Coppell, Virginia',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=80&h=80&fit=crop&crop=face',
        totalCost: 600, duration: '45 mins',
        preferredDate: 'April 16 2025 - April 24 2025', preferredTime: '03:30pm - 04:00pm',
    },
    {
        id: 'a2', name: 'Dianne Russell', role: 'Makeup Artist | NailTech | Lash Te...',
        rating: 4.6, hustlesCompleted: 10, location: 'Coppell, Virginia',
        verified: false,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
        totalCost: 750, duration: '60 mins',
        preferredDate: 'April 16 2025 - April 24 2025', preferredTime: '03:30pm - 04:00pm',
    },
    {
        id: 'a3', name: 'Courtney Henry', role: 'Makeup Artist | NailTech | Lash Te...',
        rating: 4.6, hustlesCompleted: 10, location: 'Coppell, Virginia',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop&crop=face',
        totalCost: 550, duration: '40 mins',
        preferredDate: 'April 16 2025 - April 24 2025', preferredTime: '03:30pm - 04:00pm',
    },
    {
        id: 'a4', name: 'Dianne Russell', role: 'Nursing Assistant',
        rating: 4.6, hustlesCompleted: 10, location: 'Coppell, Virginia',
        verified: false,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
        totalCost: 480, duration: '35 mins',
        preferredDate: 'April 16 2025 - April 24 2025', preferredTime: '03:30pm - 04:00pm',
    },
]

export const REJECT_REASONS = [
    'Unqualified Hustler',
    'Price is too high',
    'Delivery date not favourable',
    'Others',
]
