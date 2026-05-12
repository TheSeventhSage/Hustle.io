import { apiClient } from '../../services/api.client.js'

/**
 * availability.service.js
 * Service availability API calls
 */

export const availabilityService = {
    /**
     * GET /services/{id}/availability — get available slots for a service
     * @param {string|number} id - service ID
     * @param {object} params - query parameters
     * @param {string} params.start_date - YYYY-MM-DD
     * @param {string} params.end_date - YYYY-MM-DD
     * @param {string} params.timezone_name - e.g., "Africa/Lagos"
     * @param {number} params.slot_minutes - slot duration in minutes
     */
    async getServiceAvailability(id, params) {
        const queryString = new URLSearchParams(params).toString()
        const response = await apiClient(`/services/${id}/availability?${queryString}`)
        if (response?.error) throw response.error
        return response
    },
}
