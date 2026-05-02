import { apiClient } from '../../services/api.client.js'
import { storage } from '../../services/storage.js'

/**
 * hustles.service.js
 * All hustle-related API calls.
 */

export const hustlesService = {
  // ── Categories ────────────────────────────────────
  async getCategories() {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result  // { success: true, data: { items: Category[] }, meta: { count: number } }
  },

  async getCities(countryId) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const query = new URLSearchParams()
    if (countryId) query.set('country_id', countryId)

    const response = await fetch(`${baseURL}/cities${query.toString() ? `?${query}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  // ── Feed / Discovery ──────────────────────────────

  /**
   * GET /hustles — public
   * @param {{ category_id?: number, city_id?: number, q?: string, page?: number, limit?: number }} params
   * @returns {{ success, data: { items: Hustle[] }, meta: { count } }}
   */
  async list(params = {}) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const query = new URLSearchParams()
    if (params.category_id) query.set('category_id', params.category_id)
    if (params.city_id) query.set('city_id', params.city_id)
    if (params.q) query.set('q', params.q)
    if (params.page) query.set('page', params.page)
    if (params.limit) query.set('limit', params.limit)

    const url = `${baseURL}/hustles${query.toString() ? `?${query}` : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json() // { success, data: { items }, meta: { count } }
  },

  /**
   * GET /hustles/:id — public
   */
  async getById(id) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const response = await fetch(`${baseURL}/hustles/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json() // { success, data: { item, skills } }
  },

  // ── My Hustles (company) ─────────────────────────

  /**
   * GET /hustles — filtered to current account's hustles via auth token
   * The API uses the bearer token to return hustles posted by the authenticated company.
   * @param {{ status?: string, page?: number }} params
   */
  async getMyHustles(params = {}) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const token = storage.getToken()
    const query = new URLSearchParams()
    // Don't pass status filter — API doesn't support it on GET /hustles
    if (params.page) query.set('page', params.page)

    const url = `${baseURL}/hustles${query.toString() ? `?${query}` : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json() // { success, data: { items }, meta: { count } }
  },

  /**
   * POST /hustles — company only
   * @param {{ category_id, title, description, city_id, location_text, duration_minutes, required_experience_level, payment_model, budget_amount, currency_code, status }} data
   */
  async create(data) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const token = storage.getToken()
    const response = await fetch(`${baseURL}/hustles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * @param {string} id
   * @param {FormData} formData
   */
  async update(id, formData) {
    const response = await apiClient(`/hustles/${id}`, {
      method: 'PATCH',
      body: formData,
      headers: { 'Content-Type': undefined },
    })
    return response
  },

  async delete(id) {
    await apiClient(`/hustles/${id}`, { method: 'DELETE' })
  },

  async publish(id) {
    const response = await apiClient(`/hustles/${id}/publish`, { method: 'POST' })
    return response
  },

  async markComplete(id) {
    const response = await apiClient(`/hustles/${id}/complete`, { method: 'POST' })
    return response
  },

  async approve(id) {
    const response = await apiClient(`/hustles/${id}/approve`, { method: 'POST' })
    return response
  },

  /**
   * @param {string} id
   * @param {{ reason: string }} data
   */
  async raiseIssue(id, data) {
    const response = await apiClient(`/hustles/${id}/dispute`, {
      method: 'POST',
      body: data
    })
    return response
  },

  // ── Applications (hustler) ────────────────────────

  /**
   * @param {{ page?: number, status?: string }} params
   */
  async getMyApplications(params = {}) {
    const response = await apiClient('/hustles/applications', { params })
    return response
  },

  async getJobs(params = {}) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const token = storage.getToken()
    const query = new URLSearchParams()
    if (params.page) query.set('page', params.page)
    if (params.status) query.set('status', params.status)

    const response = await fetch(`${baseURL}/jobs${query.toString() ? `?${query}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async getJobById(id) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const token = storage.getToken()
    const response = await fetch(`${baseURL}/jobs/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async completeJob(id) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const token = storage.getToken()
    const response = await fetch(`${baseURL}/jobs/${id}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async getPublicReviews(params = {}) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const query = new URLSearchParams()
    if (params.target_type) query.set('target_type', params.target_type)
    if (params.review_subject_account_id) query.set('review_subject_account_id', params.review_subject_account_id)

    const response = await fetch(`${baseURL}/reviews${query.toString() ? `?${query}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * POST /hustles/{id}/applications — artisan only
   * @param {string} hustleId
   * @param {{ pricing_model, offered_amount, currency_code, expected_completion_at, timeline_notes }} data
   */
  async apply(hustleId, data) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const token = storage.getToken()
    const response = await fetch(`${baseURL}/hustles/${hustleId}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  /**
   * POST /hustles/{id}/applications/{applicationId}/decision — company/admin only
   * @param {string|number} hustleId
   * @param {string|number} applicationId
   * @param {'shortlisted'|'accepted'|'rejected'} decision
   */
  async decideApplication(hustleId, applicationId, decision) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const token = storage.getToken()
    const response = await fetch(`${baseURL}/hustles/${hustleId}/applications/${applicationId}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ decision }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async saveHustle(id) {
    const response = await apiClient(`/hustles/${id}/save`, { method: 'POST' })
    return response
  },

  async unsaveHustle(id) {
    await apiClient(`/hustles/${id}/save`, { method: 'DELETE' })
  },

  // ── Reviews ───────────────────────────────────────

  /**
   * @param {string} hustleId
   * @param {{ rating: number, comment: string }} data
   */
  async submitReview(hustleId, data) {
    const response = await apiClient(`/hustles/${hustleId}/review`, {
      method: 'POST',
      body: data
    })
    return response
  },

  async getReviews(hustleId, params = {}) {
    const response = await apiClient(`/hustles/${hustleId}/reviews`, { params })
    return response
  },
}
