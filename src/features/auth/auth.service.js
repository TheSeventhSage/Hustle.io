import { apiClient } from '../../services/api.client.js'
import { storage } from '../../services/storage.js'
import { logAuthDebug } from './authDebug.js'
import { normalizeAccountRole } from './authRole.js'
import { mergeStoredUser } from './authUser.js'

/**
 * auth.service.js
 * All authentication API calls.
 * Components never call apiClient directly — always go through here.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-v2.hustleapp.info/api/v1'

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE_URL}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    url.searchParams.set(key, String(value))
  })
  return url.toString()
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(payload?.message || `HTTP error! status: ${response.status}`)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

async function requestJson(path, { method = 'GET', body, headers = {}, token, params } = {}) {
  const response = await fetch(buildUrl(path, params), {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  return parseResponse(response)
}

async function requestJsonWithFallback(paths, options) {
  let lastError = null

  for (const path of paths) {
    try {
      return await requestJson(path, options)
    } catch (error) {
      lastError = error
      if (error?.status !== 404) throw error
    }
  }

  throw lastError ?? new Error('Request failed.')
}

function mapAccountToUser(account = {}) {
  return mergeStoredUser({
    ...account,
    id: account.id ?? account.account_id ?? null,
    email: account.email ?? null,
    role: normalizeAccountRole(account.account_type ?? account.role),
    first_name: account.first_name ?? null,
    last_name: account.last_name ?? null,
    company_name: account.company_name ?? null,
    status: account.status ?? null,
    country_id: account.country_id ?? account.registration_country_id ?? null,
    registration_country_id: account.registration_country_id ?? account.country_id ?? null,
    email_verified_at: account.email_verified_at ?? null,
    avatar: account.avatar ?? account.avatar_url ?? account.profile_image_url ?? null,
  })
}

function extractAccountPayload(data = {}) {
  if (data?.account) return data.account
  if (data?.user) return data.user
  return data
}

function extractAuthSession(result) {
  const data = result?.data ?? {}
  const token = data.access_token ?? data.token ?? null
  const account = data.account ?? data.user ?? null

  logAuthDebug('authService.extractAuthSession', {
    hasToken: Boolean(token),
    hasAccount: Boolean(account),
    accountType: account?.account_type ?? account?.role ?? null,
  })

  if (!token || !account) {
    throw new Error(result?.message || 'Invalid response from server')
  }

  return {
    token,
    tokenType: data.token_type ?? 'Bearer',
    expiresIn: data.expires_in ?? null,
    user: mapAccountToUser(account),
  }
}

export const authService = {
  /**
   * Fetch countries for signup form
   * @returns {Promise<{countries: Array<{code: string, name: string, dial_code: string}>}>}
   */
  async getCountries() {
    try {
      const response = await fetch(buildUrl('/countries', { per_page: 100 }), {
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
      const items = data?.data?.items ?? data?.data?.countries ?? []
      return { countries: items }
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
      const result = await requestJson('/auth/register', {
        method: 'POST',
        body: data,
      })

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
      logAuthDebug('authService.signIn.request', { email: data?.email || null })
      const result = await requestJson('/auth/login', {
        method: 'POST',
        body: data,
      })

      logAuthDebug('authService.signIn.response', {
        hasData: Boolean(result?.data),
        message: result?.message || null,
        accountType: result?.data?.account?.account_type ?? result?.data?.account?.role ?? result?.data?.user?.account_type ?? result?.data?.user?.role ?? null,
        hasToken: Boolean(result?.data?.access_token ?? result?.data?.token),
      })

      return extractAuthSession(result)
    } catch (error) {
      console.error('signIn error:', error)
      logAuthDebug('authService.signIn.error', {
        message: error?.message || 'Unknown sign-in error',
        status: error?.status ?? null,
      })
      throw error
    }
  },

  async signOut() {
    const [, error] = await apiClient.post('/auth/sign-out')
    if (error) throw error
  },

  /**
   * @param {{ email: string, account_type?: string }} data
   */
  async forgotPassword(data) {
    return requestJsonWithFallback(
      ['/auth/password/forgot', '/auth/forgot-password'],
      {
        method: 'POST',
        body: data,
      }
    )
  },

  /**
   * @param {{ email: string, token: string, password: string, password_confirmation?: string, account_type?: string }} data
   */
  async resetPassword(data) {
    return requestJsonWithFallback(
      ['/auth/password/reset', '/auth/reset-password'],
      {
        method: 'POST',
        body: {
          ...data,
          password_confirmation: data.password_confirmation ?? data.password,
        },
      }
    )
  },

  /**
   * @param {{ account_type?: string, country_id?: number|string, timezone_name?: string }} params
   */
  async getGoogleAuthUrl(params = {}) {
    return requestJson('/auth/google/url', {
      method: 'GET',
      params,
    })
  },

  /**
   * @param {{ code: string, state?: string }} params
   * @returns {Promise<{token: string, tokenType: string, expiresIn: number|null, user: object}>}
   */
  async googleCallback(params) {
    const result = await requestJson('/auth/google/callback', {
      method: 'GET',
      params: {
        code: params?.code,
        state: params?.state,
      },
    })

    return extractAuthSession(result)
  },

  /**
   * Verify email using token
   * @param {{ email: string, token: string }} data
   */
  async verifyEmail(data) {
    try {
      const result = await requestJson('/auth/verify-email', {
        method: 'POST',
        body: data,
      })

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
      const result = await requestJson('/auth/resend-verification', {
        method: 'POST',
        body: data,
      })

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

  async checkDeletionEligibility() {
    return requestJson('/account/deletion-eligibility', {
      method: 'GET',
      token: storage.getToken(),
    })
  },

  async getDeletionStatus() {
    return requestJson('/account/deletion-status', {
      method: 'GET',
      token: storage.getToken(),
    })
  },

  async scheduleAccountDeletion(data) {
    return requestJson('/account/deletion-request', {
      method: 'POST',
      body: data,
      token: storage.getToken(),
    })
  },

  async cancelAccountDeletion() {
    return requestJson('/account/deletion-request', {
      method: 'DELETE',
      token: storage.getToken(),
    })
  },

  /**
   * Get current authenticated user
   * @returns {Promise<{user: object}>}
   */
  async getMe(tokenOverride) {
    try {
      const token = tokenOverride ?? storage.getToken()
      const result = await requestJson('/auth/me', {
        method: 'GET',
        token,
      })

      if (!result?.data) {
        throw new Error('Invalid response from server')
      }

      const account = extractAccountPayload(result.data)

      if (!account?.id && !account?.account_id) {
        throw new Error(result?.message || 'Authenticated account payload is missing.')
      }

      return {
        user: mapAccountToUser(account),
      }
    } catch (error) {
      console.error('getMe error:', error)
      throw error
    }
  },
}
