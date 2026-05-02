import { apiClient } from '../../services/api.client.js'

/**
 * auth.service.js
 * All authentication API calls.
 * Components never call apiClient directly — always go through here.
 */

export const authService = {
  /**
   * Fetch countries for signup form
   * @returns {Promise<{countries: Array<{code: string, name: string, dial_code: string}>}>}
   */
  async getCountries() {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
      const response = await fetch(`${baseURL}/meta/countries.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      // API returns: { ok: true, message: "...", data: { countries: [...] } }
      return data?.data ?? { countries: [] }
    } catch (error) {
      console.error('Failed to fetch countries:', error)
      throw error
    }
  },

  /**
   * Register a new user
   * @param {{ email: string, password: string, account_type: string, country_id: number, timezone_name: string, first_name: string, last_name: string, phone_number: string }} data
   * @returns {Promise<{email: string, message: string}>}
   */
  async signUp(data) {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
      const response = await fetch(`${baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // API returns: { success: true, message: "...", data: {...} }
      return {
        email: data.email,
        message: result.message || 'Registration successful',
      }
    } catch (error) {
      console.error('signUp error:', error)
      throw error
    }
  },

  /**
   * Sign in user
   * @param {{ email: string, password: string }} data
   * @returns {Promise<{user: object, token: string}>}
   */
  async signIn(data) {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // API returns: { success: true, message: "...", data: { access_token, token_type, expires_in, account: {...} } }
      if (!result?.data?.access_token) {
        throw new Error('Invalid response from server')
      }

      // Transform API response to match frontend expectations
      return {
        token: result.data.access_token,
        user: {
          id: result.data.account.id,
          email: result.data.account.email,
          role: result.data.account.account_type, // 'artisan', 'client', or 'company'
          first_name: result.data.account.first_name,
          last_name: result.data.account.last_name,
          company_name: result.data.account.company_name,
          status: result.data.account.status,
          email_verified_at: result.data.account.email_verified_at,
        }
      }
    } catch (error) {
      console.error('signIn error:', error)
      throw error
    }
  },

  async signOut() {
    const [, error] = await apiClient.post('/auth/sign-out')
    if (error) throw error
  },

  /**
   * @param {{ email: string }} data
   */
  async forgotPassword(data) {
    const [response, error] = await apiClient.post('/auth/forgot-password', { body: data })
    if (error) throw error
    return response
  },

  /**
   * @param {{ token: string, password: string }} data
   */
  async resetPassword(data) {
    const [response, error] = await apiClient.post('/auth/reset-password', { body: data })
    if (error) throw error
    return response
  },

  /**
   * Verify email using token
   * @param {{ email: string, token: string }} data
   */
  async verifyEmail(data) {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
      const response = await fetch(`${baseURL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // API returns: { success: true, message: "...", data: {...} }
      return {
        success: true,
        message: result.message || 'Email verified successfully',
        data: result.data || {}
      }
    } catch (error) {
      console.error('verifyEmail error:', error)
      throw error
    }
  },

  /**
   * Resend verification email
   * @param {{ email: string }} data
   */
  async resendVerification(data) {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
      const response = await fetch(`${baseURL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // API returns: { success: true, message: "...", data: { resend_after } }
      return {
        success: true,
        message: result.message || 'Verification email sent',
        resend_after: result.data?.resend_after || 60
      }
    } catch (error) {
      console.error('resendVerification error:', error)
      throw error
    }
  },

  /**
   * @param {{ currentPassword: string, newPassword: string }} data
   */
  async changePassword(data) {
    const [response, error] = await apiClient.patch('/auth/password', { body: data })
    if (error) throw error
    return response
  },

  /**
   * @param {{ newEmail: string, currentPassword: string }} data
   */
  async changeEmail(data) {
    const [response, error] = await apiClient.patch('/auth/email', { body: data })
    if (error) throw error
    return response
  },

  async deleteAccount() {
    const [, error] = await apiClient.delete('/auth/account')
    if (error) throw error
  },

  /**
   * Get current authenticated user
   * @returns {Promise<{user: object}>}
   */
  async getMe() {
    try {
      const token = localStorage.getItem('hustle_auth_token') || sessionStorage.getItem('hustle_auth_token')
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'

      const response = await fetch(`${baseURL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // API returns: { success: true, message: "...", data: { account_id, role } }
      if (!result?.data) {
        throw new Error('Invalid response from server')
      }

      // Transform API response to match frontend expectations
      return {
        user: {
          id: result.data.account_id,
          role: result.data.role,
        }
      }
    } catch (error) {
      console.error('getMe error:', error)
      throw error
    }
  },
}
