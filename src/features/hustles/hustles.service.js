import { apiClient } from '../../services/api.client.js'

/**
 * hustles.service.js
 * All hustle-related API calls.
 */

export const hustlesService = {
  // ── Categories ────────────────────────────────────
  async getCategories() {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`, {
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

  // ── Feed / Discovery ──────────────────────────────

  /**
   * @param {{ page?: number, limit?: number, search?: string, category?: string, skillLevel?: string }} params
   */
  async list(params = {}) {
    const response = await apiClient('/hustles', { params })
    return response  // { data: Hustle[], meta: { page, total, totalPages } }
  },

  async getById(id) {
    const response = await apiClient(`/hustles/${id}`)
    return response  // { data: Hustle }
  },

  // ── My Hustles (creator) ──────────────────────────

  /**
   * @param {{ status?: string, page?: number }} params
   */
  async getMyHustles(params = {}) {
    const response = await apiClient('/hustles/mine', { params })
    return response
  },

  /**
   * @param {FormData} formData
   */
  async create(formData) {
    const response = await apiClient('/hustles', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': undefined }, // let browser set multipart boundary
    })
    return response  // { data: Hustle }
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

  /**
   * @param {string} hustleId
   * @param {{ coverLetter: string }} data
   */
  async apply(hustleId, data) {
    const response = await apiClient(`/hustles/${hustleId}/apply`, {
      method: 'POST',
      body: data
    })
    return response
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
