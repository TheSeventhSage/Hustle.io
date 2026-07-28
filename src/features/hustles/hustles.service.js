import { apiClient } from '../../services/api.client.js'

/**
 * hustles.service.js
 * All hustle-related API calls.
 */

async function request(path, options = {}) {
  const normalizedOptions = { ...options }

  if (normalizedOptions.query) {
    normalizedOptions.query = Object.fromEntries(
      Object.entries(normalizedOptions.query).filter(([, value]) => value !== undefined && value !== null && value !== '')
    )

    if (!Object.keys(normalizedOptions.query).length) {
      delete normalizedOptions.query
    }
  }

  const response = await apiClient(path, normalizedOptions)
  if (response?.error) throw response.error
  return response
}

function toQueryString(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    searchParams.set(key, String(value))
  })

  return searchParams.toString()
}

export const hustlesService = {
  async getCategories() {
    return request('/categories')
  },

  // Load the full city list (all=1) so dropdowns aren't capped. See §6.
  async getCities(countryId) {
    return request('/cities', {
      query: { country_id: countryId, all: 1 },
    })
  },

  async getInsuranceRates(params = {}) {
    return request('/insurance/rates', { query: params })
  },

  /**
   * GET /provider/hustle-feed — personalized provider/hustler marketplace feed.
   * Returns open, client-created hustles matched to the signed-in provider's
   * active city access and service categories. This is the recommended
   * hustler-side feed (do NOT use /jobs, which is for accepted/assigned jobs).
   * @param {{ category_id?: number, country_id?: number, city_id?: number, q?: string, page?: number, per_page?: number, limit?: number }} params
   */
  async getProviderHustleFeed(params = {}) {
    return request('/provider/hustle-feed', {
      query: {
        city_id: params.city_id,
        country_id: params.country_id,
        category_id: params.category_id,
        q: params.q,
        page: params.page,
        per_page: params.per_page ?? params.limit,
      },
    })
  },

  /**
   * GET /hustles - public
   * @param {{ category_id?: number, country_id?: number, city_id?: number, q?: string, page?: number, per_page?: number, limit?: number, saved?: boolean }} params
   */
  async list(params = {}) {
    return request('/hustles', {
      query: {
        status: params.status,
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
    return request('/services', {
      query: {
        q: params.q,
        category_id: params.category_id,
        city_id: params.city_id,
        artisan_account_id: params.artisan_account_id,
        page: params.page,
        per_page: params.per_page,
      },
    })
  },

  async listCompanies(params = {}) {
    return request('/companies', { query: params })
  },

  async listPrimaryPublicServices(params = {}) {
    return request('/services/primary', { query: params })
  },

  async getFaqs(params = {}) {
    return request('/faqs', { query: params })
  },

  async searchMarketplace(params = {}) {
    const trimmedQuery = typeof params.q === 'string' ? params.q.trim() : ''
    if (!trimmedQuery) {
      return {
        success: false,
        message: 'q search term is required.',
        data: {
          errors: {
            q: 'Send q=your search text.',
          },
          items: [],
        },
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

    const queryString = toQueryString({
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
    })

    return request(`/search?${queryString}`)
  },

  async getById(id) {
    return request(`/hustles/${id}`)
  },

  async getApplicationsByHustle(id) {
    return request(`/hustles/${id}/applications`)
  },

  async getMyHustles(params = {}) {
    return request('/my/hustles', {
      query: {
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
    return request('/apply', { query: params })
  },

  async getAppliedHustles(params = {}) {
    return request('/apply', { query: params })
  },

  async getPublicReviews(params = {}) {
    return request('/reviews', {
      query: {
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
    return request(`/hustles/${hustleId}/reviews`, { query: params })
  },

  async submitJobReview(data) {
    return request('/reviews', {
      method: 'POST',
      body: data,
    })
  },
}
