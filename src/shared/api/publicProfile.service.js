import { apiClient } from '../../services/api.client.js'
import { unwrapCollection, unwrapProfile, unwrapServicePayload } from '../lib/api/response.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'

async function request(path, options = {}) {
  const response = await apiClient(path, options)
  if (response?.error) throw response.error
  return response
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
