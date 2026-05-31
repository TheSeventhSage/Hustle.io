export function normalizeAccountRole(role) {
  const normalized = typeof role === 'string' ? role.trim().toLowerCase() : ''

  if (!normalized) return null
  if (normalized === 'hustler') return 'artisan'
  if (normalized === 'creator') return 'client'

  return normalized
}

export function isAllowedAccountRole(role, allowedRoles = []) {
  const normalizedRole = normalizeAccountRole(role)
  if (!normalizedRole) return false

  return allowedRoles
    .map((allowedRole) => normalizeAccountRole(allowedRole))
    .includes(normalizedRole)
}
