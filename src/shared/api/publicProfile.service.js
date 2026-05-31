import { unwrapCollection, unwrapProfile, unwrapServicePayload } from '../lib/api/response.js'
import { storage } from '../../services/storage.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-v2.hustleapp.info/api/v1'

function buildUrl(path, params = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${API_BASE_URL}${normalizedPath}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    url.searchParams.set(key, String(value))
  })

  return url.toString()
}

async function request(path, options = {}) {
  const token = storage.getToken()
  const response = await fetch(buildUrl(path, options.params), {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(payload?.message || `HTTP error! status: ${response.status}`)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

function normalizeLinkedPath(endpoint) {
  if (!endpoint) return null

  const raw = typeof endpoint === 'string'
    ? endpoint.trim()
    : endpoint?.endpoint ?? endpoint?.url ?? endpoint?.href ?? endpoint?.path ?? endpoint?.uri ?? null

  if (!raw) return null
  if (raw.startsWith('/')) return raw
  if (!/^https?:\/\//i.test(raw)) return `/${raw}`

  try {
    const url = new URL(raw)
    const base = new URL(API_BASE_URL)

    if (url.origin !== base.origin) {
      return `${url.pathname}${url.search}`
    }

    const basePath = base.pathname.endsWith('/') ? base.pathname.slice(0, -1) : base.pathname
    const fullPath = `${url.pathname}${url.search}`
    return fullPath.startsWith(basePath) ? fullPath.slice(basePath.length) || '/' : fullPath
  } catch {
    return raw
  }
}

export const publicProfileService = {
  async getProfile(id) {
    return unwrapProfile(await request(`/profile/${id}`))
  },

  async listServices(params = {}) {
    return unwrapCollection(await request('/services', { params }))
  },

  async getServicePayload(id) {
    return request(`/services/${id}`)
  },

  async getService(id) {
    return unwrapServicePayload(await request(`/services/${id}`))
  },

  async getArtisanServices(id, params = {}) {
    return await request(`/artisans/${id}/services`, { params })
  },

  async getLinkedResource(endpoint) {
    const path = normalizeLinkedPath(endpoint)
    if (!path) return null
    return unwrapCollection(await request(path))
  },
}
