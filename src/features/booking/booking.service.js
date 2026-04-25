import { apiClient } from '../../services/api.client.js'

/**
 * booking.service.js
 * Offer creation, acceptance, rejection, and payment flows.
 */

export const bookingService = {
  /**
   * Search hustlers for a specific hustle
   * @param {{ hustleId?: string, search?: string, page?: number }} params
   */
  async searchHustlers(params = {}) {
    const [response, error] = await apiClient.get('/hustlers', { params })
    if (error) throw error
    return response  // { data: Hustler[], meta }
  },

  async getHustlerProfile(hustlerId) {
    const [response, error] = await apiClient.get(`/hustlers/${hustlerId}`)
    if (error) throw error
    return response
  },

  /**
   * Creator books a specific hustler
   * @param {{ hustlerId: string, hustleId: string, message?: string }} data
   */
  async bookHustler(data) {
    const [response, error] = await apiClient.post('/bookings/book-hustler', { body: data })
    if (error) throw error
    return response  // { booking }
  },

  /**
   * Hustler books against an existing hustle posting
   * @param {{ hustleId: string, message?: string }} data
   */
  async bookHustle(data) {
    const [response, error] = await apiClient.post('/bookings/book-hustle', { body: data })
    if (error) throw error
    return response
  },

  /**
   * Send an offer (fixed or per hour)
   * @param {{ bookingId: string, type: 'fixed'|'hourly', amount: number, hours?: number, notes?: string }} data
   */
  async sendOffer(data) {
    const [response, error] = await apiClient.post('/offers', { body: data })
    if (error) throw error
    return response
  },

  async getOffer(offerId) {
    const [response, error] = await apiClient.get(`/offers/${offerId}`)
    if (error) throw error
    return response
  },

  async acceptOffer(offerId) {
    const [response, error] = await apiClient.post(`/offers/${offerId}/accept`)
    if (error) throw error
    return response
  },

  /**
   * @param {string} offerId
   * @param {{ reason: string }} data
   */
  async rejectOffer(offerId, data) {
    const [response, error] = await apiClient.post(`/offers/${offerId}/reject`, { body: data })
    if (error) throw error
    return response
  },

  /**
   * Pay for accepted offer — PIN verified server-side
   * @param {{ offerId: string, pin: string }} data
   */
  async payOffer(data) {
    const [response, error] = await apiClient.post('/payments/pay', { body: data })
    if (error) throw error
    return response  // { success, transactionId }
  },
}
