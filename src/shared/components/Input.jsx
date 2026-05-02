import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export const Input = forwardRef(function Input(
  { label, type = 'text', placeholder, error, style = {}, ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div style={{ marginBottom: '16px', ...style }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--color-text-2)',
          marginBottom: '6px',
          fontFamily: 'var(--ff-body)',
        }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: '46px',
            padding: isPassword ? '0 44px 0 14px' : '0 14px',
            fontSize: '14px',
            fontFamily: 'var(--ff-body)',
            color: 'var(--color-text-1)',
            background: 'var(--color-surface)',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
            borderRadius: '10px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 150ms, background 150ms',
          }}
          onFocus={(e) => { e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-primary-sat)' }}
          onBlur={(e) => { e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-border)' }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-4)',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
            }}
          >
            {showPassword
              ? <EyeOff size={16} />
              : <Eye size={16} />
            }
          </button>
        )}
      </div>

      {error && (
        <p style={{
          fontSize: '12px',
          color: 'var(--color-error)',
          marginTop: '4px',
          fontFamily: 'var(--ff-body)',
        }}>
          {error}
        </p>
      )}
    </div>
  )
})
