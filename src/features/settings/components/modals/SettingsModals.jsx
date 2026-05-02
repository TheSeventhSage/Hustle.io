import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff } from 'lucide-react'
import { PrimaryBtn } from '../settings/SettingsUI'
import useUIStore from '../../../../shared/store/ui.store.js'

/* Animated dotted-ring check icon */
function SuccessIcon({ size = 72 }) {
  const DOT_COUNT = 12
  const RING_R = size * 0.46
  const DOT_R = size * 0.045
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0, animation: 'spinSlow 8s linear infinite' }}>
        {[...Array(DOT_COUNT)].map((_, i) => {
          const angle = (i / DOT_COUNT) * 2 * Math.PI - Math.PI / 2
          const cx = size / 2 + RING_R * Math.cos(angle)
          const cy = size / 2 + RING_R * Math.sin(angle)
          return <circle key={i} cx={cx} cy={cy} r={DOT_R} fill="#22c55e" opacity={0.25 + (i / DOT_COUNT) * 0.75} />
        })}
      </svg>
      <div style={{ width: size * 0.65, height: size * 0.65, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, boxShadow: '0 4px 20px #22c55e55' }}>
        <svg width={size * 0.32} height={size * 0.32} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12l5 5 11-11" />
        </svg>
      </div>
      <style>{`@keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/**
 * SettingsSuccessModal
 * Generic success modal used for: DetailsUpdated, EmailVerified, PasswordUpdated
 * Props: isOpen, onClose, title, body, btnLabel, onBtn, showClose
 */
export function SettingsSuccessModal({ isOpen, onClose, title, body, btnLabel = 'OK', onBtn }) {
  const handleBtn = () => { if (onBtn) onBtn(); else onClose() }
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="ss-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200 }} />
          <motion.div key="ss-modal" initial={{ opacity: 0, scale: 0.93, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '44px 36px 36px', width: '100%', maxWidth: '360px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div style={{ marginBottom: '20px' }}><SuccessIcon size={76} /></div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '10px', textAlign: 'center', fontFamily: 'var(--ff-body)' }}>{title}</h3>
              {body && <p style={{ fontSize: '14px', color: 'var(--color-text-3)', textAlign: 'center', lineHeight: 1.65, marginBottom: '28px', fontFamily: 'var(--ff-body)' }}>{body}</p>}
              <PrimaryBtn onClick={handleBtn}>{btnLabel}</PrimaryBtn>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * DeleteAccountModal — two states: unchecked (just trash icon) → checked (shows password field)
 */
export function DeleteAccountModal({ isOpen, onClose }) {
  const [confirmed, setConfirmed] = useState(false)
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { toastError, toastSuccess, toastWarning } = useUIStore()

  const handleClose = () => { setConfirmed(false); setPassword(''); onClose() }
  const handleDelete = () => {
    if (!confirmed) {
      toastWarning('Confirm the deletion terms before continuing.')
      return
    }

    if (!password.trim()) {
      toastError('Enter your password to confirm account deletion.')
      return
    }

    toastSuccess('Account deletion request submitted.')
    handleClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="da-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200 }} />
          <motion.div key="da-modal" initial={{ opacity: 0, scale: 0.93, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '36px 36px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative' }}>
              {/* Close */}
              <button onClick={handleClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-3)' }}>
                <X size={15} />
              </button>

              {/* Title */}
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#dc2626', textAlign: 'center', marginBottom: '20px', fontFamily: 'var(--ff-body)' }}>Delete Account</h3>

              {/* Trash icon */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                  </svg>
                </div>
              </div>

              {/* Checkbox */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '20px' }}>
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#dc2626', flexShrink: 0, cursor: 'pointer' }} />
                <span style={{ fontSize: '13.5px', color: 'var(--color-text-2)', lineHeight: 1.65, fontFamily: 'var(--ff-body)' }}>
                  I hereby confirm that If I do not log back in within 14 days, all data associated with my account will be permanently deleted and cannot be recovered
                </span>
              </label>

              {/* Password field — only when confirmed */}
              <AnimatePresence>
                {confirmed && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>Enter Password to Confirm</p>
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                      <input type={showPw ? 'text' : 'password'} placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)}
                        style={{ width: '100%', height: '46px', padding: '0 44px 0 14px', border: '1.5px solid var(--color-border)', borderRadius: '10px', fontSize: '14px', color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)', outline: 'none', boxSizing: 'border-box' }} />
                      <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-4)', display: 'flex', padding: 0 }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={handleDelete} style={{ width: '100%', height: '50px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--ff-body)', transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#b91c1c' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#dc2626' }}>
                Delete Account
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
