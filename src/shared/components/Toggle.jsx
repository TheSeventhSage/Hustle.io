/**
 * Toggle
 * checked: boolean
 * onChange: (newValue: boolean) => void
 */
export function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: '48px',
        height: '26px',
        borderRadius: '13px',
        background: checked ? 'var(--color-primary-btn)' : 'var(--color-border-muted)',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.25s, border-color 0.25s',
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '24px' : '2px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: checked ? 'var(--color-secondary)' : 'var(--color-surface)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          transition: 'left 0.25s, background 0.25s',
        }}
      />
    </button>
  )
}
