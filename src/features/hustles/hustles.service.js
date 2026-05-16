import { apiClient } from '../../services/api.client.js'

/**
 * hustles.service.js
 * All hustle-related API calls.
 */

async function request(path, options = {}) {
  const response = await apiClient(path, options)
  if (response?.error) throw response.error
  return response
}

export const hustlesService = {
  async getCategories() {
    return request('/categories')
  },

  async getCities(countryId) {
    return request('/cities', {
      params: { country_id: countryId },
    })
  },

  async getInsuranceRates(params = {}) {
    return request('/insurance/rates', { params })
  },

  /**
   * GET /hustles - public
   * @param {{ category_id?: number, country_id?: number, city_id?: number, q?: string, page?: number, per_page?: number, limit?: number, saved?: boolean }} params
   */
  async list(params = {}) {
    return request('/hustles', {
      params: {
        category_id: params.category_id,
        country_id: params.country_id,
        city_id: params.city_id,
        q: params.q,
        page: params.page,
        per_page: params.per_page ?? params.limit,
        saved: params.saved != null ? (params.saved ? '1' : '0') : undefined,
      },
    })
  },

  async listPublicServices(params = {}) {
    return request('/services', { params })
  },

  async listPrimaryPublicServices(params = {}) {
    return request('/services/primary', { params })
  },

  async searchMarketplace(params = {}) {
    const trimmedQuery = typeof params.q === 'string' ? params.q.trim() : ''
    if (!trimmedQuery) {
      return {
        success: true,
        message: 'Search term required before querying marketplace.',
        data: { items: [] },
        meta: {
          total: 0,
          page: Number(params.page ?? 1) || 1,
          per_page: Number(params.per_page ?? params.limit ?? 0) || 0,
          total_pages: 0,
          has_next_page: false,
          has_previous_page: false,
        },
      }
    }

    return request('/search', {
      params: {
        q: trimmedQuery,
        type: params.type,
        category_id: params.category_id,
        city_id: params.city_id,
        country_id: params.country_id,
        location: params.location,
        preferred_date: params.preferred_date,
        preferred_start_time: params.preferred_start_time,
        preferred_end_time: params.preferred_end_time,
        date_from: params.date_from,
        date_to: params.date_to,
        sort_by: params.sort_by,
        skill_level: params.skill_level,
        rating: params.rating != null && params.rating !== '' && params.rating !== 'all' ? params.rating : undefined,
        verified: params.verified && params.verified !== 'all' ? params.verified : undefined,
        min_budget: params.min_budget,
        max_budget: params.max_budget,
        page: params.page,
        per_page: params.per_page,
        limit: params.limit,
      },
    })
  },

  async getById(id) {
    return request(`/hustles/${id}`)
  },

  async getApplicationsByHustle(id) {
    return request(`/hustles/${id}/applications`)
  },

  async getMyHustles(params = {}) {
    return request('/my/hustles', {
      params: {
        status: params.status,
        job_status: params.job_status,
        category_id: params.category_id,
        city_id: params.city_id,
        country_id: params.country_id,
        preferred_date: params.preferred_date,
        date_from: params.date_from,
        date_to: params.date_to,
        q: params.q,
        page: params.page,
        per_page: params.per_page,
      },
    })
  },

  async create(data) {
    return request('/hustles', {
      method: 'POST',
      body: data,
    })
  },

  async update(id, formData) {
    return request(`/hustles/${id}`, {
      method: 'PATCH',
      body: formData,
      headers: { 'Content-Type': undefined },
    })
  },

  async delete(id) {
    await request(`/hustles/${id}`, { method: 'DELETE' })
  },

  async cancel(id, data = {}) {
    return request(`/hustles/${id}/cancel`, {
      method: 'POST',
      body: data,
    })
  },

  async publish(id) {
    return request(`/hustles/${id}/publish`, { method: 'POST' })
  },

  async markComplete(id) {
    return request(`/hustles/${id}/complete`, { method: 'POST' })
  },

  async approve(id) {
    return request(`/hustles/${id}/approve`, { method: 'POST' })
  },

  async raiseIssue(id, data) {
    return request(`/hustles/${id}/dispute`, {
      method: 'POST',
      body: data,
    })
  },

  async getMyApplications(params = {}) {
    return request('/apply', { params })
  },

  async getAppliedHustles(params = {}) {
    return request('/apply', { params })
  },

  async getPublicReviews(params = {}) {
    return request('/reviews', {
      params: {
        target_type: params.target_type,
        review_subject_account_id: params.review_subject_account_id,
        q: params.q,
        page: params.page,
        per_page: params.per_page,
      },
    })
  },

  async apply(hustleId, data) {
    return request(`/hustles/${hustleId}/applications`, {
      method: 'POST',
      headers: typeof crypto !== 'undefined' && crypto.randomUUID
        ? { 'X-Idempotency-Key': crypto.randomUUID() }
        : undefined,
      body: data,
    })
  },

  async decideApplication(hustleId, applicationId, decision) {
    return request(`/hustles/${hustleId}/applications/${applicationId}/decision`, {
      method: 'POST',
      body: { decision },
    })
  },

  async saveHustle(id) {
    return request(`/hustles/${id}/save`, { method: 'POST' })
  },

  async unsaveHustle(id) {
    await request(`/hustles/${id}/save`, { method: 'DELETE' })
  },

  async submitReview(hustleId, data) {
    return request(`/hustles/${hustleId}/review`, {
      method: 'POST',
      body: data,
    })
  },

  async getReviews(hustleId, params = {}) {
    return request(`/hustles/${hustleId}/reviews`, { params })
  },

  async submitJobReview(data) {
    return request('/reviews', {
      method: 'POST',
      body: data,
    })
  },
}
