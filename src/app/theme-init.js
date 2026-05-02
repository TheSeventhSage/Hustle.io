import { storage } from '../services/storage.js'

function applyTheme(isDark) {
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

export function initializeTheme() {
  const preferredTheme = storage.getTheme()
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const isDark = preferredTheme ? preferredTheme === 'dark' : mediaQuery.matches

  applyTheme(isDark)

  if (!preferredTheme) {
    const handleChange = (event) => applyTheme(event.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange)
    }
  }
}
