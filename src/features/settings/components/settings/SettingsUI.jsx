import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export { Toggle } from '../../../../shared/components/Toggle.jsx'

export function FormField({ label, required, children, style = {} }) {
  return (
    <div style={{ marginBottom: '20px', ...style }}>
      {label && (
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>
          {label}{required && <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      {children}
    </div>
  )
}

export function TextInput({ placeholder, type = 'text', value, onChange, prefix, style = {}, ...rest }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {prefix && (
        <span style={{ position: 'absolute', left: '14px', color: 'var(--color-text-4)', fontSize: '14px', display: 'flex', alignItems: 'center' }}>{prefix}</span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          height: '46px',
          padding: prefix ? '0 14px 0 42px' : '0 14px',
          border: '1.5px solid var(--color-border)',
          borderRadius: '10px',
          fontSize: '14px',
          color: 'var(--color-text-1)',
          background: 'var(--color-surface)',
          outline: 'none',
          fontFamily: 'var(--ff-body)',
          transition: 'border-color 0.15s, background 0.15s',
          boxSizing: 'border-box',
          ...style,
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--color-primary-sat)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
        {...rest}
      />
    </div>
  )
}

export function PasswordInput({ placeholder, value, onChange, style = {}, ...rest }) {
  const [show, setShow] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          height: '46px',
          padding: '0 44px 0 14px',
          border: '1.5px solid var(--color-border)',
          borderRadius: '10px',
          fontSize: '14px',
          color: 'var(--color-text-1)',
          background: 'var(--color-surface)',
          outline: 'none',
          fontFamily: 'var(--ff-body)',
          transition: 'border-color 0.15s, background 0.15s',
          boxSizing: 'border-box',
          ...style,
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--color-primary-sat)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-4)', display: 'flex', padding: 0 }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

export function SelectInput({ value, onChange, options = [], prefix, style = {} }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {prefix && <span style={{ position: 'absolute', left: '12px', fontSize: '16px', zIndex: 1 }}>{prefix}</span>}
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          height: '46px',
          padding: prefix ? '0 14px 0 40px' : '0 14px',
          border: '1.5px solid var(--color-border)',
          borderRadius: '10px',
          fontSize: '14px',
          color: 'var(--color-text-1)',
          background: 'var(--color-surface)',
          outline: 'none',
          fontFamily: 'var(--ff-body)',
          cursor: 'pointer',
          boxSizing: 'border-box',
          appearance: 'auto',
          ...style,
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function PrimaryBtn({ children, onClick, type = 'button', fullWidth = true, danger = false, disabled = false, style = {} }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height: '50px',
        padding: '0 28px',
        background: danger ? 'var(--color-brand-neutral-dark)' : disabled ? 'var(--color-disabled)' : 'var(--color-secondary)',
        color: danger ? 'var(--color-white)' : 'var(--color-white)',
        border: 'none',
        borderRadius: '50px',
        fontSize: '15px',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--ff-body)',
        transition: 'background 0.2s, color 0.2s',
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled) e.currentTarget.style.background = danger ? 'var(--color-brand-neutral-dark)' : 'var(--color-secondary-dark)'
      }}
      onMouseLeave={e => {
        if (!disabled) e.currentTarget.style.background = danger ? 'var(--color-brand-neutral)' : 'var(--color-secondary)'
      }}
    >
      {children}
    </button>
  )
}

export function ContentTitle({ children }) {
  return (
    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)', fontFamily: 'var(--ff-body)' }}>
      {children}
    </h3>
  )
}

export function RichToolbar() {
  const btns = ['B', 'I', 'U', 'S', '=', '=', '#']

  return (
    <div style={{ display: 'flex', gap: '4px', padding: '8px 10px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-mist)' }}>
      {btns.map((b, i) => (
        <button key={i} style={{ width: '26px', height: '26px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-surface)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: 'var(--color-text-2)', fontFamily: 'var(--ff-body)' }}>{b}</button>
      ))}
    </div>
  )
}
