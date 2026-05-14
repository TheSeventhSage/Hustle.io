import { apiClient } from '../../services/api.client.js'
import { storage } from '../../services/storage.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'

function normalizeCityId(value) {
  if (value == null || value === '') return value
  if (typeof value === 'object') {
    return normalizeCityId(value.id ?? value.city_id)
  }
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : value
}

function buildHeaders(includeIdempotency = false) {
  const token = storage.getToken()
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(includeIdempotency && typeof crypto !== 'undefined' && crypto.randomUUID
      ? { 'X-Idempotency-Key': crypto.randomUUID() }
      : {}),
  }
}

async function jsonRequest(path, { method = 'GET', body, includeIdempotency = false } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(includeIdempotency),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`)
  }

  return { data: payload, error: null }
}

export const cityAccessService = {
  async list(params = {}) {
    const response = await apiClient('/my/city-access', { params })
    if (response?.error) throw response.error
    return response
  },

  async create(payload) {
    const body = {
      ...payload,
      city_id: normalizeCityId(payload?.city_id),
    }

    return jsonRequest('/my/city-access', {
      method: 'POST',
      body,
      includeIdempotency: true,
    })
  },

  async update(id, payload) {
    return jsonRequest(`/my/city-access/${id}`, {
      method: 'PATCH',
      body: payload,
    })
  },

  async deactivate(id) {
    return jsonRequest(`/my/city-access/${id}/deactivate`, {
      method: 'POST',
      body: {},
    })
  },

  async initializePayment(id, data = {}) {
    return jsonRequest(`/my/city-access/${id}/payment/initialize`, {
      method: 'POST',
      body: data,
      includeIdempotency: true,
    })
  },

  async verifyPayment(reference) {
    return jsonRequest(`/city-access/payments/${encodeURIComponent(reference)}/verify`, {
      method: 'POST',
      body: {},
    })
  },
}
