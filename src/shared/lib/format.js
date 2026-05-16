export function formatCurrencyCodeAmount(value, currency = 'NGN', locale = 'en-NG') {
  if (value === null || value === undefined || value === '') return '—'

  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'

  return `${currency} ${amount.toLocaleString(locale)}`
}

export function formatCurrencyDisplay(value, currency = 'NGN', locale = 'en-NG') {
  if (value === null || value === undefined || value === '') return '—'

  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatServiceRate(amount, currency, model) {
  if (amount === null || amount === undefined || amount === '') return '—'
  const suffix = model === 'per_hour' ? '/hr' : '/service'
  return `${formatCurrencyCodeAmount(amount, currency ?? 'GHS')}${suffix}`
}

export function formatDate(dateLike, {
  locale = 'en-US',
  month = 'short',
  day = 'numeric',
  year = 'numeric',
  ...options
} = {}) {
  if (!dateLike) return '—'

  const date = new Date(dateLike)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString(locale, {
    month,
    day,
    year,
    ...options,
  })
}

export function formatDateTime(dateLike, {
  locale = 'en-US',
  weekday = 'long',
  month = 'long',
  day = 'numeric',
  year = 'numeric',
  hour = '2-digit',
  minute = '2-digit',
  ...options
} = {}) {
  if (!dateLike) return '—'

  const date = new Date(dateLike)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString(locale, {
    weekday,
    month,
    day,
    year,
    hour,
    minute,
    ...options,
  })
}

export function formatDurationMinutes(minutes) {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes} minutes`

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  return remainder > 0
    ? `${hours} hour${hours > 1 ? 's' : ''} ${remainder} min`
    : `${hours} hour${hours > 1 ? 's' : ''}`
}

export function formatRelativeTime(dateLike) {
  if (!dateLike) return ''

  const timestamp = new Date(dateLike).getTime()
  if (Number.isNaN(timestamp)) return ''

  const diff = Date.now() - timestamp
  const days = Math.floor(diff / 86400000)

  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`

  const months = Math.floor(days / 30)
  return `${months} month${months > 1 ? 's' : ''} ago`
}

export function formatExperienceLevel(value) {
  const raw = String(value || '').toLowerCase()
  if (raw === 'entry' || raw === 'beginner') return 'Beginner'
  if (raw === 'mid' || raw === 'intermediate') return 'Intermediate'
  if (raw === 'senior' || raw === 'advanced') return 'Advanced'
  return value ? String(value) : '—'
}

export function formatStatusLabel(value, fallback = 'Pending') {
  const raw = String(value || '').trim()
  if (!raw) return fallback

  return raw
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}
