export function normalizeCollection(payload) {
  if (Array.isArray(payload)) return payload

  const candidate = payload?.items
    ?? payload?.docs
    ?? payload?.data?.items
    ?? payload?.data?.docs
    ?? payload?.data
    ?? []

  return Array.isArray(candidate) ? candidate : []
}

export function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

export function resolveLinkedEndpoint(entity, candidates = []) {
  for (const candidate of candidates) {
    const value = candidate.split('.').reduce((acc, key) => acc?.[key], entity)

    if (typeof value === 'string' && value.trim()) return value

    if (value && typeof value === 'object') {
      const nested = value.endpoint ?? value.url ?? value.href ?? value.path ?? value.uri
      if (typeof nested === 'string' && nested.trim()) return nested
    }
  }

  return null
}

export function serviceBelongsToAccount(service, accountId) {
  if (!service || !accountId) return false

  const candidateIds = [
    service?.artisan_account_id,
    service?.provider_account_id,
    service?.account_id,
    service?.user_account_id,
    service?.artisan?.account_id,
    service?.provider?.account_id,
  ]

  return candidateIds.some((value) => Number(value) === Number(accountId))
}

export function getProfileDisplayName(profile, fallbackLabel = '') {
  return firstDefined(
    profile?.name,
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim(),
    profile?.display_name,
    profile?.company_name,
    fallbackLabel
  )
}

export function getProfileLocation(profile, fallbackLabel = 'Location not provided') {
  return firstDefined(
    profile?.contact?.location_text,
    profile?.location_text,
    profile?.city?.name,
    profile?.city_name,
    profile?.country?.name,
    profile?.country_name,
    profile?.address,
    fallbackLabel
  )
}
