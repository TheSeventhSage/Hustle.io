import { apiClient } from '../../services/api.client.js'

/**
 * messages.service.js
 * REST calls for conversation list + history.
 * Real-time delivery is handled by socket.client.js.
 */

export const messagesService = {
  async getConversations(params = {}) {
    const [response, error] = await apiClient.get('/messages/conversations', { params })
    if (error) throw error
    return response  // { data: Conversation[] }
  },

  async getMessages(conversationId, params = {}) {
    const [response, error] = await apiClient.get(
      `/messages/conversations/${conversationId}`,
      { params }
    )
    if (error) throw error
    return response  // { data: Message[], meta }
  },

  /**
   * @param {{ conversationId: string, content: string }} data
   */
  async sendMessage(data) {
    const [response, error] = await apiClient.post('/messages', { body: data })
    if (error) throw error
    return response
  },

  /**
   * @param {string} userId
   * @param {{ reason: string }} data
   */
  async reportUser(userId, data) {
    const [response, error] = await apiClient.post(`/users/${userId}/report`, { body: data })
    if (error) throw error
    return response
  },

  async blockUser(userId) {
    const [response, error] = await apiClient.post(`/users/${userId}/block`)
    if (error) throw error
    return response
  },
}
