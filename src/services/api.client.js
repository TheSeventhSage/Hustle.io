import { createFetchClient } from '@zayne-labs/callapi'
import { storage } from './storage.js'

/**
 * Base API client.
 * All feature services import THIS — never import callapi directly.
 * Swap the base URL here and nothing else changes.
 */
export const apiClient = createFetchClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1',

  headers: {
    'Accept': 'application/json',
  },

  // Inject auth token on every request
  onRequest({ request }) {
    const token = storage.getToken()
    if (token) {
      request.headers = {
        ...request.headers,
        Authorization: `Bearer ${token}`
      }
    }
  },

  // Global error hook — feature services handle specific errors,
  // this catches anything that slips through
  onResponseError({ response }) {
    if (response.status === 401) {
      storage.clearToken()
      window.location.href = '/sign-in'
    }
  },

  // Retry once on network failure (not on 4xx/5xx)
  retry: {
    times: 1,
    when: ({ error }) => error instanceof TypeError, // network errors only
  },
})
