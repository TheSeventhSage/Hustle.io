import { apiClient } from '../../../../services/api.client.js'

/**
 * services.service.js
 * Service-related API calls following the API_package.md
 */
async function request(path, options = {}) {
    const response = await apiClient(path, options)
    if (response?.error) throw response.error
    return response
}

export const servicesService = {
    /**
     * Fetch list of services
     * @param {{ category_id?: string, city_id?: string, q?: string }} params
     */
    async list(params = {}) {
        const response = await request('/services', { params })
        return response // Expected to return { data: [...] }
    },

    /**
     * Fetch grouped primary provider services
     * @param {{ category_id?: string, city_id?: string, country_id?: string, q?: string, page?: number, per_page?: number }} params
     */
    async listPrimary(params = {}) {
        const response = await request('/services/primary', { params })
        return response
    },

    /**
     * Fetch single service details
     * @param {string} id
     */
    async getById(id) {
        const response = await request(`/services/${id}`)
        return response // Expected to return { data: {...} }
    },

    /**
     * Fetch all services by artisan/provider id
     * @param {string|number} id
     * @param {{ q?: string, category_id?: string, city_id?: string, country_id?: string, page?: number, per_page?: number }} params
     */
    async getArtisanServices(id, params = {}) {
        const response = await request(`/artisans/${id}/services`, { params })
        return response
    }
}
