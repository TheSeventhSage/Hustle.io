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
   * GET /bookings — list bookings for the current artisan (or client)
   */
  async getMyBookings() {
    const response = await apiClient('/bookings')
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
}
