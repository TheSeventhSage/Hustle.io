import { apiClient } from '../../../../services/api.client.js'

/**
 * services.service.js
 * Service-related API calls following the API_package.md
 */
export const servicesService = {
    /**
     * Fetch list of services
     * @param {{ category_id?: string, city_id?: string, q?: string }} params
     */
    async list(params = {}) {
        const response = await apiClient('/services', { params })
        return response // Expected to return { data: [...] }
    },

    /**
     * Fetch single service details
     * @param {string} id
     */
    async getById(id) {
        const response = await apiClient(`/services/${id}`)
        return response // Expected to return { data: {...} }
    }
}