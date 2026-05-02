import { useRef } from 'react'

/**
 * PinInput
 * Renders 4 individual digit boxes. Handles focus-forwarding.
 * value: string[] of length 4
 * onChange: (newValue: string[]) => void
 * error: boolean — red border state
 */
export function PinInput({ value, onChange, error = false }) {
    const refs = useRef([])

    const handleChange = (idx, e) => {
        const char = e.target.value.replace(/\D/, '').slice(-1)
        const next = [...value]
        next[idx] = char
        onChange(next)
        if (char && idx < 3) refs.current[idx + 1]?.focus()
    }

    const handleKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !value[idx] && idx > 0) {
            refs.current[idx - 1]?.focus()
        }
    }

    const boxStyle = (idx) => ({
        width: '52px', height: '52px',
        border: `1.5px solid ${error ? '#ef4444' : value[idx] ? 'var(--color-primary)' : '#E2E4DD'}`,
        borderRadius: '10px',
        fontSize: '18px', fontWeight: 600,
        textAlign: 'center',
        color: 'var(--color-text-1)',
        background: 'white',
        outline: 'none',
        transition: 'border-color 0.15s',
        fontFamily: 'var(--ff-body)',
        cursor: 'text',
    })

    return (
        <div style={{ display: 'flex', gap: '12px' }}>
            {[0, 1, 2, 3].map(i => (
                <input
                    key={i}
                    ref={el => { refs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ''}
                    onChange={e => handleChange(i, e)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onFocus={e => e.target.select()}
                    style={boxStyle(i)}
                />
            ))}
        </div>
    )
}
