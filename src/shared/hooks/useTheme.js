import { useState, useEffect } from 'react'
import { storage } from '../../services/storage.js'

export function useTheme() {
    const storedTheme = storage.getTheme()
    const [isDark, setIsDark] = useState(() => {
        if (storedTheme) return storedTheme === 'dark'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })
    const [hasExplicitPreference, setHasExplicitPreference] = useState(Boolean(storedTheme))

    useEffect(() => {
        const html = document.documentElement
        if (isDark) {
            html.setAttribute('data-theme', 'dark')
        } else {
            html.removeAttribute('data-theme')
        }
        if (hasExplicitPreference) {
            storage.setTheme(isDark ? 'dark' : 'light')
        } else {
            storage.clearTheme()
        }
    }, [hasExplicitPreference, isDark])

    useEffect(() => {
        if (hasExplicitPreference) return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (event) => setIsDark(event.matches)

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleChange)
            return () => mediaQuery.removeEventListener('change', handleChange)
        }

        if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(handleChange)
            return () => mediaQuery.removeListener(handleChange)
        }
    }, [hasExplicitPreference])

    const toggle = () => {
        setHasExplicitPreference(true)
        setIsDark(prev => !prev)
    }

    return { isDark, toggle }
}
