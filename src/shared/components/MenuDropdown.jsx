import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * MenuDropdown
 * Generic dropdown menu with configurable placement.
 *
 * Props:
 *   isOpen    — boolean
 *   onClose   — () => void
 *   title     — string (default: 'Menu')
 *   items     — Array<{ label: string, onClick: () => void }>
 *   placement — 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
 *               default: 'bottom-right'
 *
 * Usage: wrap the trigger + this component in a `relative` container.
 */

const PLACEMENT_CLASSES = {
    'bottom-right': 'top-full right-0 mt-2',
    'bottom-left': 'top-full left-0  mt-2',
    'top-right': 'bottom-full right-0 mb-2',
    'top-left': 'bottom-full left-0  mb-2',
}

const ANIMATION_VARIANTS = {
    'bottom-right': { initial: { opacity: 0, scale: 0.95, y: -6 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: -6 } },
    'bottom-left': { initial: { opacity: 0, scale: 0.95, y: -6 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: -6 } },
    'top-right': { initial: { opacity: 0, scale: 0.95, y: 6 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 6 } },
    'top-left': { initial: { opacity: 0, scale: 0.95, y: 6 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 6 } },
}

export function MenuDropdown({
    isOpen,
    onClose,
    title = 'Menu',
    items = [],
    placement = 'bottom-right',
}) {
    const ref = useRef()
    const anim = ANIMATION_VARIANTS[placement] ?? ANIMATION_VARIANTS['bottom-right']
    const posClass = PLACEMENT_CLASSES[placement] ?? PLACEMENT_CLASSES['bottom-right']

    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose()
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={ref}
                    key="menu-dropdown"
                    initial={anim.initial}
                    animate={anim.animate}
                    exit={anim.exit}
                    transition={{ duration: 0.15 }}
                    className={`absolute ${posClass} z-20 min-w-[180px] rounded-2xl border border-border bg-surface shadow-xl py-4`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pb-3 mb-1 border-b border-border">
                        <span className="text-[14px] font-bold text-text-1">{title}</span>
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center text-text-3 hover:text-text-1 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Items */}
                    {items.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => { item.onClick(); onClose() }}
                            className="w-full text-left px-4 py-2.5 text-[14px] font-medium text-text-1 bg-transparent hover:bg-mist transition-colors"
                        >
                            {item.label}
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
