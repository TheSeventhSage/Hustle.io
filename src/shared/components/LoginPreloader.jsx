import { useEffect, useState } from 'react'
import { HustleLogo } from './HustleLogo.jsx'
import './LoginPreloader.css'

export function LoginPreloader({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        // Show preloader for 2 seconds
        const timer = setTimeout(() => {
            setIsVisible(false)
            if (onComplete) {
                onComplete()
            }
        }, 2000)

        return () => clearTimeout(timer)
    }, [onComplete])

    if (!isVisible) return null

    return (
        <div className="login-preloader">
            <div className="login-preloader-content">
                <HustleLogo
                    size="64"
                    direction="column"
                    color="var(--color-primary)"
                    fontSize="32px"
                    gap="16px"
                />
            </div>
        </div>
    )
}
