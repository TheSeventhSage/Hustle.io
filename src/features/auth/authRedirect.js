import { normalizeAccountRole } from './authRole.js'

export function getDefaultAuthenticatedRoute(role) {
  return normalizeAccountRole(role) === 'artisan' ? '/hustler' : '/feed'
}

export function getAllowedAuthRedirect(requestedPath, role) {
  if (requestedPath && requestedPath !== '/') {
    return requestedPath
  }

  return getDefaultAuthenticatedRoute(role)
}
