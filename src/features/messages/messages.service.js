import { apiClient } from '../../services/api.client.js'
import { storage } from '../../services/storage.js'

/**
 * messages.service.js
 * Consumes the live API endpoints:
 *   GET  /conversations          — list conversations
 *   GET  /conversations/{id}     — get conversation + messages (marks as read)
 *   POST /conversations/{id}/messages — send a message
 *
 * apiClient returns { data: <envelope>, error } — NOT a tuple.
 */

export const messagesService = {
  /**
   * GET /conversations
   * Returns: { success, data: { items: Conversation[] } }
   */
  async getConversations() {
    const res = await apiClient('/conversations')
    if (res?.error) throw res.error
    return res
  },

  /**
   * GET /conversations/{id}
   * Returns: { success, data: { conversation, messages: Message[] } }
   * Also marks the conversation as read.
   */
  async getConversation(id) {
    const res = await apiClient(`/conversations/${id}`)
    if (res?.error) throw res.error
    return res
  },

  /**
   * POST /conversations/initiate
   * @param {{
   *   participant_account_id: string|number,
   *   conversation_type?: string,
   *   booking_id?: string|number,
   *   hustle_post_id?: string|number,
   *   job_id?: string|number,
   * }} data
   * Returns: { success, data: { conversation } | { item } }
   */
  async initiateConversation(data) {
    const token = storage.getToken()
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(typeof crypto !== 'undefined' && crypto.randomUUID ? { 'X-Idempotency-Key': crypto.randomUUID() } : {}),
    }

    const res = await fetch(`${baseURL}/conversations/initiate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `HTTP ${res.status}`)
    }

    return res.json()
  },

  /**
   * POST /conversations/{id}/messages
   * @param {string|number} conversationId
   * @param {{ message_body: string }} data
   * Returns: { success, data: { item: Message } }
   */
  async sendMessage(conversationId, data) {
    const token = storage.getToken()
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
    const res = await fetch(`${baseURL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(typeof crypto !== 'undefined' && crypto.randomUUID ? { 'X-Idempotency-Key': crypto.randomUUID() } : {}),
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
    return res.json()
  },
}
