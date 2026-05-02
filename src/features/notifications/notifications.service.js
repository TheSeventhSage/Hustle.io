import { apiClient } from '../../services/api.client.js'

export const notificationsService = {
  async getNotifications() {
    const res = await apiClient('/notifications')
    if (res?.error) throw res.error
    return res
  },

  async markAsRead(id) {
    const res = await apiClient(`/notifications/${id}/read`, { method: 'POST' })
    if (res?.error) throw res.error
    return res
  },
}
