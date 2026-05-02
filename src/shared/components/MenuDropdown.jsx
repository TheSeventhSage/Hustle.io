import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * MenuDropdown
 * Generic dropdown menu that slides out from the right.
 * isOpen: boolean
 * onClose: () => void
 * title: string (default: 'Menu')
 * items: Array<{ label: string, onClick: () => void }>
 */
export function MenuDropdown({ isOpen, onClose, title = 'Menu', items = [] }) {
    const ref = useRef()

    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={ref}
                    key="menu-dropdown"
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.15 }}
                    style={{
                        position: 'absolute', top: 0, right: 0,
                        background: 'white',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        padding: '16px 0',
                        minWidth: '180px',
                        boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
                        zIndex: 20,
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0 16px 12px',
                        borderBottom: '1px solid var(--color-border)', marginBottom: '4px',
                    }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)' }}>{title}</span>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', display: 'flex' }}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Menu Items */}
                    {items.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => { item.onClick(); onClose() }}
                            style={menuItemStyle}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-mist)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {item.label}
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const menuItemStyle = {
    display: 'block', width: '100%',
    padding: '10px 16px',
    fontSize: '14px', fontWeight: 500,
    color: 'var(--color-text-1)',
    background: 'transparent', border: 'none',
    textAlign: 'left', cursor: 'pointer',
    fontFamily: 'var(--ff-body)',
    transition: 'background 0.15s',
}
