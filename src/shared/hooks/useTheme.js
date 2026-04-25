import { useState, useEffect } from 'react'

const STORAGE_KEY = 'hustle-theme'

export function useTheme() {
    const [isDark, setIsDark] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) return stored === 'dark'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    useEffect(() => {
        const html = document.documentElement
        if (isDark) {
            html.setAttribute('data-theme', 'dark')
        } else {
            html.removeAttribute('data-theme')
        }
        localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
    }, [isDark])

    const toggle = () => setIsDark(prev => !prev)

    return { isDark, toggle }
}
