/**
 * financialReport.utils.js
 * Pure helpers for the hustler financial report: reporting periods, display
 * formatting and download helpers. The backend is the financial source of
 * truth — nothing here recalculates totals.
 */

export const PERIOD_PRESETS = [
  { key: 'all', label: 'All time' },
  { key: 'last7', label: 'Last 7 days' },
  { key: 'last30', label: 'Last 30 days' },
  { key: 'thisYear', label: 'This year' },
  { key: 'custom', label: 'Custom' },
]

export const ALL_TIME_PERIOD = Object.freeze({ preset: 'all', from: null, to: null })

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Local-time YYYY-MM-DD (toISOString would shift the day across timezones).
export function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseIsoDate(value) {
  if (!ISO_DATE_RE.test(String(value ?? ''))) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getMonth() === month - 1 ? date : null
}

// Backend timestamps look like "2026-08-12 18:14:53".
export function parseApiDateTime(value) {
  if (!value) return null
  const date = new Date(String(value).replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? null : date
}

function shiftDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function buildPresetPeriod(preset, now = new Date()) {
  const today = toIsoDate(now)

  switch (preset) {
    case 'last7': return { preset, from: toIsoDate(shiftDays(now, -6)), to: today }
    case 'last30': return { preset, from: toIsoDate(shiftDays(now, -29)), to: today }
    case 'thisYear': return { preset, from: `${now.getFullYear()}-01-01`, to: today }
    default: return ALL_TIME_PERIOD
  }
}

export function buildCustomPeriod(from, to) {
  return { preset: 'custom', from, to }
}

// Mirrors the API rules: both dates or neither, and from <= to.
export function validateDateRange(from, to) {
  if (!from && !to) return null
  if (!from || !to) return 'Select both a start and an end date.'
  if (!parseIsoDate(from) || !parseIsoDate(to)) return 'Enter valid dates.'
  if (from > to) return 'Start date cannot be later than end date.'
  return null
}

export function isAllTime(period) {
  return !period?.from || !period?.to
}

// Query params shared by every reporting endpoint. All time → no params.
export function toPeriodQuery(period) {
  return isAllTime(period) ? {} : { from: period.from, to: period.to }
}

function formatShortDate(date, withYear) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  })
}

// "Oct 12 - Oct 19, 2023" or "Dec 28, 2025 - Jan 3, 2026".
export function formatDateRange(from, to) {
  const start = parseIsoDate(from)
  const end = parseIsoDate(to)
  if (!start || !end) return ''

  const sameYear = start.getFullYear() === end.getFullYear()
  return `${formatShortDate(start, !sameYear)} - ${formatShortDate(end, true)}`
}

export function formatPeriodLabel(period) {
  if (isAllTime(period)) return 'All time'
  if (period.preset === 'custom') return formatDateRange(period.from, period.to)
  return PERIOD_PRESETS.find((item) => item.key === period.preset)?.label
    ?? formatDateRange(period.from, period.to)
}

export function formatReportDate(value) {
  const date = parseApiDateTime(value) ?? parseIsoDate(value)
  return date ? formatShortDate(date, true) : '—'
}

export function formatReportDateTime(value) {
  const date = parseApiDateTime(value)
  if (!date) return '—'
  // "Jan 15, 2025  09:00am" as in the design.
  const time = date
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    .replace(/\s?(AM|PM)$/i, (_, meridiem) => meridiem.toLowerCase())
  return `${formatShortDate(date, true)}  ${time}`
}

// "GHS 1,800.00" — the API sends decimal strings, never recompute them.
export function formatReportAmount(value, currency = 'GHS') {
  const amount = Number(value)
  if (value === null || value === undefined || value === '' || !Number.isFinite(amount)) return '—'
  const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return currency ? `${currency} ${formatted}` : formatted
}

// Summary-card style: "GHS 228,500" when there are no cents, else "GHS 228,500.50".
export function formatSummaryAmount(value, currency = 'GHS') {
  return formatReportAmount(value, currency).replace(/\.00$/, '')
}

export function formatCount(value) {
  const count = Number(value)
  return Number.isFinite(count) ? count.toLocaleString('en-US') : '—'
}

// Compact axis label: 1200 → "1.2k", 4000000 → "4m".
export function formatCompactNumber(value) {
  const amount = Number(value) || 0
  const abs = Math.abs(amount)
  const trim = (n) => String(Number(n.toFixed(1)))
  if (abs >= 1_000_000) return `${trim(amount / 1_000_000)}m`
  if (abs >= 1_000) return `${trim(amount / 1_000)}k`
  return trim(amount)
}

const STATUS_TONES = {
  success: ['approved', 'completed', 'paid', 'released', 'success', 'successful'],
  pending: ['pending', 'processing', 'in_review', 'queued', 'awaiting_otp'],
  failed: ['failed', 'rejected', 'cancelled', 'canceled', 'reversed', 'refunded'],
}

export function getStatusTone(status) {
  const raw = String(status ?? '').trim().toLowerCase()
  if (STATUS_TONES.success.includes(raw)) return { tone: 'success', label: 'Successful' }
  if (STATUS_TONES.failed.includes(raw)) return { tone: 'failed', label: raw === 'failed' ? 'Failed' : capitalize(raw) }
  return { tone: 'pending', label: raw ? capitalize(raw) : 'Pending' }
}

function capitalize(value) {
  return value.replaceAll('_', ' ').replace(/^\w/, (char) => char.toUpperCase())
}

// Use `direction` for money-in/out — never infer it from the sign or title.
export function isCredit(transaction) {
  return String(transaction?.direction ?? '').toLowerCase() === 'credit'
}

export function toChartSeries(points = [], valueKey = 'amount') {
  return (Array.isArray(points) ? points : [])
    .map((point) => ({ date: point?.date, value: Number(point?.[valueKey]) || 0 }))
    .filter((point) => parseIsoDate(point.date))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
}

export function buildExportFilename(period, extension = 'csv') {
  const suffix = isAllTime(period) ? 'all-time' : `${period.from}-to-${period.to}`
  return `hustler-financial-report-${suffix}.${extension}`
}

export function getFilenameFromDisposition(header, fallback) {
  const raw = String(header ?? '')
  const encoded = raw.match(/filename\*=(?:UTF-8'')?([^;]+)/i)
  if (encoded) {
    try { return decodeURIComponent(encoded[1].trim().replace(/"/g, '')) } catch { /* fall through */ }
  }
  const plain = raw.match(/filename="?([^";]+)"?/i)
  return plain ? plain[1].trim() : fallback
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
