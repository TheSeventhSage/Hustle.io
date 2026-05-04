export function formatMoney(value, currency = 'NGN') {
  if (value === null || value === undefined || value === '') return '—'
  return `${currency} ${Number(value).toLocaleString()}`
}

export function formatNGN(value) {
  return formatMoney(value, '₦')
}

export function formatDatePart(dateStr) {
  if (!dateStr) return '—'
  const normalized = dateStr.includes('T') || dateStr.includes(' ')
    ? dateStr.replace(' ', 'T')
    : `${dateStr}T00:00:00`
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTimePart(dateStr) {
  if (!dateStr) return '—'
  const normalized = dateStr.includes('T') || dateStr.includes(' ')
    ? dateStr.replace(' ', 'T')
    : `1970-01-01T${dateStr}`
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase()
}

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
    currencyCode: 'GHS',
  },
  {
    id: 'a2', name: 'Dianne Russell', role: 'Makeup Artist | NailTech | Lash Te...',
    rating: 4.6, hustlesCompleted: 10, location: 'Coppell, Virginia',
    verified: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    totalCost: 750, duration: '60 mins',
    preferredDate: 'April 16 2025 - April 24 2025', preferredTime: '03:30pm - 04:00pm',
    currencyCode: 'GHS',
  },
]

export const REJECT_REASONS = [
  'Unqualified Hustler',
  'Price is too high',
  'Delivery date not favourable',
  'Others',
]
