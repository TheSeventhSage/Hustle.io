import { apiClient } from '../../services/api.client.js'

/**
 * settings.service.js
 */

export const settingsService = {
  async getNotificationPrefs() {
    const [response, error] = await apiClient.get('/settings/notifications')
    if (error) throw error
    return response
  },

  /**
   * @param {{ email?: boolean, push?: boolean, sms?: boolean }} data
   */
  async updateNotificationPrefs(data) {
    const [response, error] = await apiClient.patch('/settings/notifications', { body: data })
    if (error) throw error
    return response
  },

  async deleteAccount() {
    const [, error] = await apiClient.delete('/settings/account')
    if (error) throw error
  },
}
