import { useEffect, useRef, useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, ChevronDown, X } from 'lucide-react'
import { DateField, ModalActions, ReportModal } from './ReportModal.jsx'
import {
  ALL_TIME_PERIOD,
  PERIOD_PRESETS,
  buildCustomPeriod,
  buildPresetPeriod,
  formatDateRange,
  formatPeriodLabel,
  isAllTime,
  toIsoDate,
  validateDateRange,
} from '../financialReport.utils.js'

/**
 * CustomRangeModal
 * "Select Date Range" dialog from the date filter flow.
 */
export function CustomRangeModal({ isOpen, onClose, ...formProps }) {
  return (
    <ReportModal isOpen={isOpen} onClose={onClose} labelledBy="fr-range-title">
      <CustomRangeForm onClose={onClose} {...formProps} />
    </ReportModal>
  )
}

// Mounted only while the modal is open, so each open starts from fresh state.
function CustomRangeForm({ initialFrom, initialTo, onClose, onApply }) {
  const [from, setFrom] = useState(initialFrom ?? '')
  const [to, setTo] = useState(initialTo ?? '')
  const [error, setError] = useState(null)
  const today = toIsoDate(new Date())

  const handleContinue = () => {
    const message = !from && !to ? 'Select both a start and an end date.' : validateDateRange(from, to)
    if (message) {
      setError(message)
      return
    }
    onApply(buildCustomPeriod(from, to))
  }

  return (
    <>
      <div className="mb-7 flex items-center justify-between">
        <h3 id="fr-range-title" className="text-[19px] font-semibold text-text-1">Select Date Range</h3>
        <button type="button" onClick={onClose} aria-label="Close" className="text-text-3 transition-colors hover:text-text-1">
          <X size={22} />
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <DateField id="fr-range-from" label="Start date" value={from} max={to || today} onChange={(value) => { setFrom(value); setError(null) }} />
        <DateField id="fr-range-to" label="End date" value={to} min={from || undefined} max={today} onChange={(value) => { setTo(value); setError(null) }} />
      </div>

      {error && <p className="mt-4 text-[14px] text-error">{error}</p>}

      <ModalActions onCancel={onClose} onConfirm={handleContinue} confirmLabel="Continue" />
    </>
  )
}

function PillTrigger({ period, open, onToggle, onClear }) {
  if (period.preset === 'custom') {
    return (
      <div className="inline-flex h-[34px] items-center gap-2 rounded-full border border-border bg-mist pl-3 pr-1.5 text-[13px] text-text-1">
        <button type="button" onClick={onToggle} aria-haspopup="listbox" aria-expanded={open} className="inline-flex items-center gap-1.5">
          <CalendarDays size={14} className="text-text-2" />
          <span className="whitespace-nowrap">{formatPeriodLabel(period)}</span>
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear date range"
          className="flex h-6 w-6 items-center justify-center rounded-full text-text-2 transition-colors hover:bg-surface"
        >
          <X size={13} />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-haspopup="listbox"
      aria-expanded={open}
      className="inline-flex h-[34px] items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-[13px] text-text-2 transition-colors hover:bg-mist"
    >
      <span className="whitespace-nowrap">{formatPeriodLabel(period)}</span>
      <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  )
}

// Chart header chip — shows the actual dates ("Jan 14 - Aug 28, 2026").
function ChipTrigger({ period, open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-haspopup="listbox"
      aria-expanded={open}
      className="inline-flex items-center gap-1 rounded-md bg-mist px-2 py-1 text-[12px] text-text-1 transition-colors hover:bg-[var(--color-border)]"
    >
      <span className="whitespace-nowrap">
        {isAllTime(period) ? 'All time' : formatDateRange(period.from, period.to)}
      </span>
      <ChevronDown size={12} className={`text-text-3 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  )
}

/**
 * DateRangeFilter
 * Trigger → preset options → custom range picker → applied range.
 * variant: 'pill' (report header) | 'chip' (chart header)
 */
export function DateRangeFilter({ period, onChange, variant = 'pill' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const handlePreset = (key) => {
    setMenuOpen(false)
    if (key === 'custom') {
      setCustomOpen(true)
      return
    }
    onChange(buildPresetPeriod(key))
  }

  const toggle = () => setMenuOpen((open) => !open)
  const isCustom = period.preset === 'custom'
  // The pill sits left-aligned when the header stacks on phones, right-aligned otherwise.
  const menuPosition = variant === 'pill' ? 'left-0 sm:left-auto sm:right-0' : 'right-0'

  return (
    <div ref={containerRef} className="relative">
      {variant === 'chip'
        ? <ChipTrigger period={period} open={menuOpen} onToggle={toggle} />
        : <PillTrigger period={period} open={menuOpen} onToggle={toggle} onClear={() => onChange(ALL_TIME_PERIOD)} />}

      <AnimatePresence>
        {menuOpen && (
          <Motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className={`absolute top-full z-50 mt-1.5 w-[168px] rounded-xl border border-border bg-surface p-1.5 shadow-[var(--shadow-md)] ${menuPosition}`}
          >
            {PERIOD_PRESETS.map((option) => {
              const selected = period.preset === option.key
              return (
                <li key={option.key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => handlePreset(option.key)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-[13px] text-text-1 transition-colors hover:bg-mist ${selected ? 'bg-mist font-medium' : ''}`}
                  >
                    {option.label}
                  </button>
                </li>
              )
            })}
          </Motion.ul>
        )}
      </AnimatePresence>

      <CustomRangeModal
        isOpen={customOpen}
        initialFrom={isCustom ? period.from : ''}
        initialTo={isCustom ? period.to : ''}
        onClose={() => setCustomOpen(false)}
        onApply={(next) => {
          setCustomOpen(false)
          onChange(next)
        }}
      />
    </div>
  )
}
