export function normalizeCityAccessStatus(row = {}) {
  const subscriptionStatus = String(row.subscription_status ?? row.status ?? '').toLowerCase()
  const isActive = row.is_active === true || row.is_active === 1 || row.is_active === '1'

  if (!isActive) return 'inactive'
  if (subscriptionStatus) return subscriptionStatus
  return isActive ? 'active' : 'inactive'
}

export function isCityAccessActive(row = {}, now = new Date()) {
  const status = normalizeCityAccessStatus(row)
  if (status !== 'active') return false

  const isActive = row.is_active === true || row.is_active === 1 || row.is_active === '1'
  if (!isActive) return false

  if (!row.ends_at) return true

  const endsAt = new Date(row.ends_at)
  if (Number.isNaN(endsAt.getTime())) return true

  return endsAt.getTime() > now.getTime()
}

export function getActiveCityAccessRows(rows = [], now = new Date()) {
  return rows.filter((row) => isCityAccessActive(row, now))
}

export function getCityAccessForCity(rows = [], cityId) {
  if (cityId == null || cityId === '') return null
  const target = String(cityId)
  return rows.find((row) => String(row.city_id) === target) ?? null
}

export function hasActiveCityAccess(rows = [], cityId, now = new Date()) {
  const row = getCityAccessForCity(rows, cityId)
  return row ? isCityAccessActive(row, now) : false
}

export function getCityAccessItems(response) {
  const payload = response?.data ?? response
  const data = payload?.data ?? payload
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  return []
}
