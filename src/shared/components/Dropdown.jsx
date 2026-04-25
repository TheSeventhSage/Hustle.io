import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Dropdown({ trigger, children, align = ['right', 'top'], val, className }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const alignmentClasses = {
        top: `top-${val ?? 0}`,
        right: `right-${val ?? 0}`,
        left: `left-${val ?? 0}`,
    }

    return (
        <div className="" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute ${alignmentClasses[align]} z-50 top-full
              bg-surface rounded-2xl shadow-xl py-2 min-w-[200px] ${className}`}
                    >
                        {typeof children === 'function' ? children(() => setIsOpen(false)) : children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function DropdownItem({ icon, label, onClick, variant = 'default', labelClassName = '' }) {
    const variantClasses = {
        default: 'text-text-1 hover:bg-mist',
        danger: 'text-error hover:bg-red-50',
    }

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] font-medium
        transition-colors ${variantClasses[variant]}`}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span className={labelClassName || ''}>{label}</span>
        </button>
    )
}

export function DropdownDivider() {
    return <div className="h-px bg-border my-1.5 mx-2" />
}
