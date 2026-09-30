import { useEffect } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { CalendarDays } from 'lucide-react'

/**
 * ReportModal
 * Centered modal shell shared by the financial report dialogs.
 */
export function ReportModal({ isOpen, onClose, labelledBy, maxWidth = 440, children }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div
            key="fr-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/35"
          />
          <Motion.div
            key="fr-modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="pointer-events-none fixed inset-0 z-[201] flex items-center justify-center p-4"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelledBy}
              className="pointer-events-auto max-h-[90vh] w-full overflow-y-auto rounded-[24px] bg-surface p-6 shadow-[var(--shadow-lg)] sm:p-8"
              style={{ maxWidth }}
            >
              {children}
            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function FieldLabel({ htmlFor, children, as: Tag = 'label' }) {
  return (
    <Tag {...(Tag === 'label' ? { htmlFor } : {})} className="mb-3 block text-[15px] font-medium text-text-1">
      {children}
    </Tag>
  )
}

const INPUT_CLASS = 'h-12 w-full rounded-xl border-[1.5px] border-border bg-surface pl-12 pr-4 text-[15px] text-text-1 outline-none transition-colors focus:border-[var(--color-primary-sat)]'

// Stretch Chrome/Edge's native picker button invisibly over the whole field:
// one calendar icon (ours, per design) and the entire field opens the picker.
const NATIVE_PICKER_OVERLAY = 'relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0'

export function DateField({ label, value, onChange, max, min, id }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-2.5 block text-[13px] font-medium uppercase tracking-wide text-text-3">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <CalendarDays size={18} className="pointer-events-none absolute left-4 z-10 text-text-3" />
        <input
          id={id}
          type="date"
          value={value ?? ''}
          min={min}
          max={max}
          onChange={(event) => onChange(event.target.value)}
          className={`${INPUT_CLASS} ${NATIVE_PICKER_OVERLAY}`}
        />
      </div>
    </div>
  )
}

export function SelectField({ id, value, onChange, options }) {
  return (
    <div className="relative flex items-center">
      <CalendarDays size={18} className="pointer-events-none absolute left-4 text-text-3" />
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${INPUT_CLASS} cursor-pointer`}>
        {options.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
      </select>
    </div>
  )
}

export function ModalActions({ onCancel, onConfirm, confirmLabel, disabled = false, pending = false }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="h-12 rounded-full border border-border bg-surface text-[15px] font-medium text-text-2 transition-colors hover:bg-mist"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled || pending}
        className="h-12 rounded-full bg-[var(--color-primary-btn)] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-sat)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Please wait...' : confirmLabel}
      </button>
    </div>
  )
}
