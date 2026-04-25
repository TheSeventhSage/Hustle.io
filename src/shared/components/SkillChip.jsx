import { X } from 'lucide-react'

/**
 * SkillChip
 * Pill-shaped chip displaying a skill label with optional remove button
 * Variants: default (filled), outlined
 */
export function SkillChip({ label, onRemove, variant = 'default' }) {
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: onRemove ? '6px 8px 6px 12px' : '6px 12px',
        borderRadius: '999px',
        fontSize: '13px',
        fontWeight: 500,
        fontFamily: 'var(--ff-body)',
        transition: 'all 150ms',
    }

    const variants = {
        default: {
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
        },
        outlined: {
            background: 'transparent',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-primary)',
        },
    }

    return (
        <span style={{ ...baseStyles, ...variants[variant] }}>
            {label}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label={`Remove ${label}`}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: 'inherit',
                        opacity: 0.7,
                        transition: 'opacity 150ms',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = 1 }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.7 }}
                >
                    <X size={14} />
                </button>
            )}
        </span>
    )
}
