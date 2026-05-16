import { apiClient } from '../../services/api.client.js'
import { unwrapItems } from '../lib/api/response.js'

export const locationService = {
  async getCountries(params = {}) {
    const response = await apiClient('/countries', { params })
    if (response?.error) throw response.error
    return response
  },

  async getCities(params = {}) {
    const response = await apiClient('/cities', { params })
    if (response?.error) throw response.error
    return response
  },

  unwrapItems,
}
