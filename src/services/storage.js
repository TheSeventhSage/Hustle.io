/**
 * storage.js - localStorage wrapper.
 * Single place to change key names or swap to sessionStorage / cookies.
 */

const KEYS = {
  TOKEN: 'hustle_token',
  REFRESH: 'hustle_refresh',
  USER: 'hustle_user',
  THEME: 'hustle_theme',
}

const PAYMENT_SESSION_KEYS = {
  booking: 'pending_payment',
  hustle: 'pending_hustle_payment',
  cityAccess: 'pending_city_access_payment',
}

function getJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null')
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

export const storage = {
  getToken: () => localStorage.getItem(KEYS.TOKEN),
  setToken: (token) => localStorage.setItem(KEYS.TOKEN, token),
  getRefresh: () => localStorage.getItem(KEYS.REFRESH),
  setRefresh: (token) => localStorage.setItem(KEYS.REFRESH, token),

  clearToken() {
    localStorage.removeItem(KEYS.TOKEN)
    localStorage.removeItem(KEYS.REFRESH)
  },

  getUser() {
    return getJSON(KEYS.USER)
  },
  setUser: (user) => localStorage.setItem(KEYS.USER, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(KEYS.USER),

  getTheme: () => localStorage.getItem(KEYS.THEME),
  setTheme: (theme) => localStorage.setItem(KEYS.THEME, theme),
  clearTheme: () => localStorage.removeItem(KEYS.THEME),

  payments: {
    getSession(type) {
      const key = PAYMENT_SESSION_KEYS[type]
      return key ? getJSON(key) : null
    },
    setSession(type, value) {
      const key = PAYMENT_SESSION_KEYS[type]
      if (!key) return
      localStorage.setItem(key, JSON.stringify(value))
    },
    clearSession(type) {
      const key = PAYMENT_SESSION_KEYS[type]
      if (!key) return
      localStorage.removeItem(key)
    },
  },

  clearAll() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
    Object.values(PAYMENT_SESSION_KEYS).forEach((key) => localStorage.removeItem(key))
  },
}
