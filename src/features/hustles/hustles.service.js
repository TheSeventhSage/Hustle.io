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

  async getInsuranceRates(params = {}) {
    const response = await apiClient('/insurance/rates', { params })
    if (response?.error) throw response.error
    return response
  },

  // ── Feed / Discovery ──────────────────────────────

  /**
   * GET /hustles — public
   * @param {{ category_id?: number, country_id?: number, city_id?: number, q?: string, page?: number, per_page?: number, limit?: number, preferred_date?: string, date_from?: string, date_to?: string, saved?: boolean }} params
   * @returns {{ success, data: { items: Hustle[] }, meta: { count } }}
   */
  async list(params = {}) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const query = new URLSearchParams()
    if (params.category_id) query.set('category_id', params.category_id)
    if (params.country_id) query.set('country_id', params.country_id)
    if (params.city_id) query.set('city_id', params.city_id)
    if (params.q) query.set('q', params.q)
    if (params.page) query.set('page', params.page)
    if (params.per_page) query.set('per_page', params.per_page)
    if (params.limit && !params.per_page) query.set('per_page', params.limit)
    if (params.saved != null) query.set('saved', params.saved ? '1' : '0')

    const url = `${baseURL}/hustles${query.toString() ? `?${query}` : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json() // { success, data: { items }, meta: { count } }
  },

  async searchMarketplace(params = {}) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const query = new URLSearchParams()
    if (params.q) query.set('q', params.q)
    if (params.type) query.set('type', params.type)
    if (params.category_id) query.set('category_id', params.category_id)
    if (params.city_id) query.set('city_id', params.city_id)
    if (params.country_id) query.set('country_id', params.country_id)
    if (params.location) query.set('location', params.location)
    if (params.preferred_date) query.set('preferred_date', params.preferred_date)
    if (params.preferred_start_time) query.set('preferred_start_time', params.preferred_start_time)
    if (params.preferred_end_time) query.set('preferred_end_time', params.preferred_end_time)
    if (params.date_from) query.set('date_from', params.date_from)
    if (params.date_to) query.set('date_to', params.date_to)
    if (params.sort_by) query.set('sort_by', params.sort_by)
    if (params.skill_level) query.set('skill_level', params.skill_level)
    if (params.rating != null && params.rating !== '' && params.rating !== 'all') query.set('rating', params.rating)
    if (params.verified && params.verified !== 'all') query.set('verified', params.verified)
    if (params.min_budget) query.set('min_budget', params.min_budget)
    if (params.max_budget) query.set('max_budget', params.max_budget)
    if (params.page) query.set('page', params.page)
    if (params.per_page) query.set('per_page', params.per_page)
    if (params.limit) query.set('limit', params.limit)

    const response = await fetch(`${baseURL}/search${query.toString() ? `?${query}` : ''}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
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

  async getMyHustles(params = {}) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const token = storage.getToken()
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.job_status) query.set('job_status', params.job_status)
    if (params.category_id) query.set('category_id', params.category_id)
    if (params.city_id) query.set('city_id', params.city_id)
    if (params.country_id) query.set('country_id', params.country_id)
    if (params.preferred_date) query.set('preferred_date', params.preferred_date)
    if (params.date_from) query.set('date_from', params.date_from)
    if (params.date_to) query.set('date_to', params.date_to)
    if (params.q) query.set('q', params.q)
    if (params.page) query.set('page', params.page)
    if (params.per_page) query.set('per_page', params.per_page)

    const url = `${baseURL}/my/hustles${query.toString() ? `?${query}` : ''}`
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
    const response = await apiClient('/apply', { params })
    return response
  },

  async getAppliedHustles(params = {}) {
    const response = await apiClient('/apply', { params })
    return response
  },

  async getPublicReviews(params = {}) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const query = new URLSearchParams()
    if (params.target_type) query.set('target_type', params.target_type)
    if (params.review_subject_account_id) query.set('review_subject_account_id', params.review_subject_account_id)
    if (params.q) query.set('q', params.q)
    if (params.page) query.set('page', params.page)
    if (params.per_page) query.set('per_page', params.per_page)

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
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
    const response = await fetch(`${baseURL}/hustles/${hustleId}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'X-Idempotency-Key': idempotencyKey,
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

  /**
   * POST /reviews — submit a review for an artisan or company
   * @param {{ target_type: 'artisan'|'company', review_subject_account_id: number, job_id: number, rating: number, feedback_text: string }} data
   */
  async submitJobReview(data) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const token = storage.getToken()
    const response = await fetch(`${baseURL}/reviews`, {
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
}
