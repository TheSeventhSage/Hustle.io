import { apiClient } from '../../services/api.client.js'
import { storage } from '../../services/storage.js'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'

function unwrapProfile(payload) {
  return payload?.data?.data?.profile
    ?? payload?.data?.profile
    ?? payload?.profile
    ?? payload?.data?.data
    ?? payload?.data
    ?? payload
}

function unwrapService(payload) {
  const data = payload?.data?.data ?? payload?.data ?? payload
  const item = data?.item ?? data?.service ?? data ?? null
  const skills = Array.isArray(data?.skills) ? data.skills : Array.isArray(item?.skills) ? item.skills : []
  const reviews = Array.isArray(data?.reviews) ? data.reviews : Array.isArray(item?.reviews) ? item.reviews : []

  return {
    item,
    skills,
    reviews,
    raw: data,
  }
}

function unwrapCollection(payload) {
  return payload?.data?.data?.items
    ?? payload?.data?.data?.docs
    ?? payload?.data?.items
    ?? payload?.data?.docs
    ?? payload?.items
    ?? payload?.data?.data
    ?? payload?.data
    ?? payload
}

function normalizeEndpoint(endpoint) {
  if (!endpoint) return null
  if (typeof endpoint === 'string') return endpoint.trim() || null
  if (typeof endpoint === 'object') {
    return endpoint.endpoint
      ?? endpoint.url
      ?? endpoint.href
      ?? endpoint.path
      ?? endpoint.uri
      ?? null
  }
  return null
}

async function fetchEndpoint(endpoint) {
  const resolved = normalizeEndpoint(endpoint)
  if (!resolved) return null

  const url = /^https?:\/\//i.test(resolved)
    ? resolved
    : `${baseURL}${resolved.startsWith('/') ? resolved : `/${resolved}`}`

  const token = storage.getToken()
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export const publicProfileService = {
  async getProfile(id) {
    const response = await apiClient(`/profile/${id}`)
    if (response?.error) throw response.error
    return unwrapProfile(response)
  },

  async listServices(params = {}) {
    const response = await apiClient('/services', { params })
    if (response?.error) throw response.error
    return unwrapCollection(response)
  },

  async getService(id) {
    const response = await apiClient(`/services/${id}`)
    if (response?.error) throw response.error
    return unwrapService(response)
  },

  async getLinkedResource(endpoint) {
    const response = await fetchEndpoint(endpoint)
    if (response?.error) throw response.error
    return unwrapCollection(response)
  },
}
