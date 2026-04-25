/**
 * storage.js — localStorage wrapper.
 * Single place to change key names or swap to sessionStorage / cookies.
 * Nothing else in the app touches localStorage directly.
 */

const KEYS = {
  TOKEN:       'hustle_token',
  REFRESH:     'hustle_refresh',
  USER:        'hustle_user',
  THEME:       'hustle_theme',
}

export const storage = {
  // ── Auth tokens ────────────────────────────────────
  getToken:      ()      => localStorage.getItem(KEYS.TOKEN),
  setToken:      (token) => localStorage.setItem(KEYS.TOKEN, token),
  getRefresh:    ()      => localStorage.getItem(KEYS.REFRESH),
  setRefresh:    (token) => localStorage.setItem(KEYS.REFRESH, token),

  clearToken() {
    localStorage.removeItem(KEYS.TOKEN)
    localStorage.removeItem(KEYS.REFRESH)
  },

  // ── User ───────────────────────────────────────────
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.USER) ?? 'null')
    } catch {
      return null
    }
  },
  setUser:  (user) => localStorage.setItem(KEYS.USER, JSON.stringify(user)),
  clearUser:()     => localStorage.removeItem(KEYS.USER),

  // ── Theme ──────────────────────────────────────────
  getTheme: ()      => localStorage.getItem(KEYS.THEME) ?? 'light',
  setTheme: (theme) => localStorage.setItem(KEYS.THEME, theme),

  // ── Full clear (on logout) ─────────────────────────
  clearAll() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  },
}
