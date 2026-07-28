import { normalizeAccountRole } from './authRole.js'

export function getDefaultAuthenticatedRoute(role) {
  return normalizeAccountRole(role) === 'artisan' ? '/hustler' : '/feed'
}

export function getAllowedAuthRedirect(requestedPath, role) {
  // Only honor same-origin internal paths. Reject '/', protocol-relative
  // ('//host'), and absolute URLs ('http://…') to prevent open redirects.
  if (
    typeof requestedPath === 'string' &&
    requestedPath.startsWith('/') &&
    !requestedPath.startsWith('//') &&
    !requestedPath.includes('://') &&
    requestedPath !== '/'
  ) {
    return requestedPath
  }

  return getDefaultAuthenticatedRoute(role)
}
