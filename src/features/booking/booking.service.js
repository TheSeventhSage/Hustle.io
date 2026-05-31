import { apiClient } from '../../services/api.client.js'

/**
 * booking.service.js
 * Booking API calls — GET /bookings, GET /bookings/{id},
 * POST /bookings/{id}/confirm, POST /bookings/{id}/cancel
 *
 * apiClient (callapi) returns { data: <API envelope>, error } — NOT the raw response.
 * The API envelope shape is: { success, message, data: { items | item }, meta }
 * So actual items live at: response.data.data.items
 */

export const bookingService = {
  /**
   * POST /bookings — create a new booking
   * @param {object} payload - booking data
   */
  async createBooking(payload) {
    const response = await apiClient('/bookings', {
      method: 'POST',
      body: payload,
    })
    if (response?.error) throw response.error
    return response
  },

  /**
   * GET /bookings — list bookings for the current artisan (or client)
   */
  async getMyBookings(params = {}) {
    const response = await apiClient('/bookings', { query: params })
    if (response?.error) throw response.error
    return response
  },

  /**
   * GET /bookings/{id} — get one booking detail
   * @param {string|number} id
   */
  async getBookingById(id) {
    const response = await apiClient(`/bookings/${id}`)
    if (response?.error) throw response.error
    return response
  },

  /**
   * POST /bookings/{id}/confirm — artisan confirms/accepts a booking
   * @param {string|number} id
   */
  async confirmBooking(id) {
    const response = await apiClient(`/bookings/${id}/confirm`, { method: 'POST' })
    if (response?.error) throw response.error
    return response
  },

  /**
   * POST /bookings/{id}/reject — artisan rejects a booking
   * @param {string|number} id
   */
  async rejectBooking(id) {
    const response = await apiClient(`/bookings/${id}/reject`, { method: 'POST' })
    if (response?.error) throw response.error
    return response
  },

  /**
   * POST /bookings/{id}/cancel — artisan or client cancels a booking
   * @param {string|number} id
   * @param {{ reason?: string }} data
   */
  async cancelBooking(id, data = {}) {
    const response = await apiClient(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: data,
    })
    if (response?.error) throw response.error
    return response
  },

  /**
   * POST /bookings/{id}/payment/initialize — client initializes payment
   * @param {string|number} id
   */
  async initializePayment(id, data = {}) {
    const response = await apiClient(`/bookings/${id}/payment/initialize`, {
      method: 'POST',
      body: data,
    })
    if (response?.error) throw response.error
    return response
  },

  /**
   * POST /payments/{reference}/verify — verify payment
   * @param {string} reference
   */
  async verifyPayment(reference) {
    const response = await apiClient(`/payments/${reference}/verify`, { method: 'POST' })
    if (response?.error) throw response.error
    return response
  },

  /**
   * POST /bookings/{id}/location — artisan updates location
   * @param {string|number} id
   * @param {object} locationData
   */
  async updateLocation(id, locationData) {
    const response = await apiClient(`/bookings/${id}/location`, {
      method: 'POST',
      body: locationData,
    })
    if (response?.error) throw response.error
    return response
  },

  /**
   * GET /bookings/{id}/location — get booking location
   * @param {string|number} id
   */
  async getBookingLocation(id) {
    const response = await apiClient(`/bookings/${id}/location`)
    if (response?.error) throw response.error
    return response
  },
}
