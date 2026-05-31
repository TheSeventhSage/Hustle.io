function sanitizeDetails(details = {}) {
  return Object.fromEntries(
    Object.entries(details).map(([key, value]) => {
      if (typeof value === 'string' && key.toLowerCase().includes('token')) {
        return [key, value ? `${value.slice(0, 8)}...` : value]
      }

      return [key, value]
    })
  )
}

export function logAuthDebug(step, details = {}) {
  const entry = {
    time: new Date().toISOString(),
    step,
    details: sanitizeDetails(details),
  }

  if (typeof window !== 'undefined') {
    const history = Array.isArray(window.__HUSTLE_AUTH_DEBUG__) ? window.__HUSTLE_AUTH_DEBUG__ : []
    history.push(entry)
    window.__HUSTLE_AUTH_DEBUG__ = history
  }

  console.log(`[AUTH DEBUG] ${step}`, entry.details)
  return entry
}
