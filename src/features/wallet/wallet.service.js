import { apiClient } from '../../services/api.client.js'

/**
 * wallet.service.js
 * All wallet API calls — balance, PIN, transactions, withdraw, top-up.
 */

export const walletService = {
  async getWallet() {
    const [response, error] = await apiClient.get('/wallet')
    if (error) throw error
    return response  // { balance, inEscrow, available, hasPIN }
  },

  /**
   * @param {{ pin: string, confirmPin: string }} data
   */
  async setPin(data) {
    const [response, error] = await apiClient.post('/wallet/pin', { body: data })
    if (error) throw error
    return response
  },

  async verifyPin(pin) {
    const [response, error] = await apiClient.post('/wallet/pin/verify', { body: { pin } })
    if (error) throw error
    return response  // { valid: boolean }
  },

  /**
   * @param {{ amount: number, pin: string, accountNumber?: string, bankCode?: string }} data
   */
  async withdraw(data) {
    const [response, error] = await apiClient.post('/wallet/withdraw', { body: data })
    if (error) throw error
    return response  // { success, transactionId, newBalance }
  },

  /**
   * @param {{ amount: number, pin: string }} data
   */
  async topUp(data) {
    const [response, error] = await apiClient.post('/wallet/top-up', { body: data })
    if (error) throw error
    return response  // { success, transactionId, newBalance }
  },

  /**
   * @param {{ page?: number, limit?: number, type?: string }} params
   */
  async getTransactions(params = {}) {
    const [response, error] = await apiClient.get('/wallet/transactions', { params })
    if (error) throw error
    return response  // { data: Transaction[], meta }
  },
}
