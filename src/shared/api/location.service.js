import { apiClient } from '../../services/api.client.js'

function unwrapItems(response) {
  const payload = response?.data ?? response
  const data = payload?.data ?? payload
  return data?.items ?? []
}

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
