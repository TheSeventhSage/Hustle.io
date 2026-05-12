import { storage } from '../../services/storage.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'

function buildHeaders() {
  const token = storage.getToken()
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`)
  }

  return payload
}

function getItems(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  return []
}

function getItem(data) {
  return data?.item ?? data
}

function getData(payload) {
  return payload?.data ?? payload
}

export const settingsService = {
  async getCategories() {
    return getItems(getData(await request('/categories')))
  },

  async getCities() {
    return getItems(getData(await request('/cities')))
  },

  async getAuthMe() {
    const data = getData(await request('/auth/me'))
    return data?.account ?? data
  },

  async getProfile() {
    const data = getData(await request('/profile'))
    return data?.profile ?? data
  },

  async getKycStatus() {
    return getData(await request('/kyc/status'))
  },

  async updateProfile(data) {
    const payload = await request('/profile', { method: 'PATCH', body: data })
    const updated = getData(payload)
    return { profile: updated?.profile ?? updated, message: payload?.message }
  },

  async getSettings() {
    return getData(await request('/settings'))
  },

  async updateSettings(data) {
    const payload = await request('/settings', { method: 'PATCH', body: data })
    return { settings: getData(payload), message: payload?.message }
  },

  async getMyServices() {
    return getItems(getData(await request('/my/services')))
  },

  async createMyService(data) {
    const payload = await request('/my/services', { method: 'POST', body: data })
    return { item: getItem(getData(payload)), message: payload?.message }
  },

  async updateMyService(id, data) {
    const payload = await request(`/my/services/${id}`, { method: 'PATCH', body: data })
    return { item: getItem(getData(payload)), message: payload?.message }
  },

  async getPortfolio() {
    return getItems(getData(await request('/portfolio')))
  },

  async createPortfolioItem(data) {
    const payload = await request('/portfolio', { method: 'POST', body: data })
    return { item: getItem(getData(payload)), message: payload?.message }
  },

  async getAvailabilityRules() {
    return getItems(getData(await request('/availability/rules')))
  },

  async upsertAvailabilityRule(data) {
    const payload = await request('/availability/rules', { method: 'POST', body: data })
    return { item: getItem(getData(payload)), message: payload?.message }
  },

  async getAvailabilityExceptions() {
    return getItems(getData(await request('/availability/exceptions')))
  },

  async createAvailabilityException(data) {
    const payload = await request('/availability/exceptions', { method: 'POST', body: data })
    return { item: getItem(getData(payload)), message: payload?.message }
  },

  async getLegalPage(pageType) {
    const payload = await request(`/legal/${pageType}`)
    return { item: getItem(getData(payload)), message: payload?.message }
  },
}
