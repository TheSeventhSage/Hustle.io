import { useState } from 'react'
import { Check, Download } from 'lucide-react'
import { DateField, FieldLabel, ModalActions, ReportModal, SelectField } from './ReportModal.jsx'
import {
  PERIOD_PRESETS,
  buildCustomPeriod,
  buildPresetPeriod,
  toIsoDate,
  validateDateRange,
} from '../financialReport.utils.js'

// Phase 1 API exports CSV only; PDF is rendered from the same backend data.
// XLSX stays visible (per design) but disabled until the API enables it.
const FORMATS = [
  { key: 'xlsx', label: 'Excel (.xlsx)', enabled: false },
  { key: 'csv', label: 'CSV (.csv)', enabled: true },
  { key: 'pdf', label: 'PDF', enabled: true },
]

const FOCUS_RING = 'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary-sat)] peer-focus-visible:ring-offset-1'

function Checkbox({ checked, disabled, onChange, label }) {
  return (
    <label className={`inline-flex items-center gap-3 text-[15px] text-text-1 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span className={`flex h-5 w-5 items-center justify-center rounded-[4px] border-[1.5px] ${FOCUS_RING} ${checked ? 'border-[var(--color-primary-btn)] bg-[var(--color-primary-btn)] text-white' : 'border-border-muted bg-surface'}`}>
        {checked && <Check size={14} strokeWidth={3} />}
      </span>
      {label}
    </label>
  )
}

function Radio({ checked, disabled, onChange, label, hint }) {
  return (
    <label className={`inline-flex items-center gap-3 text-[15px] text-text-1 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <input type="radio" name="fr-format" className="peer sr-only" checked={checked} disabled={disabled} onChange={onChange} />
      <span className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${FOCUS_RING} ${checked ? 'border-[var(--color-primary-btn)]' : 'border-border-muted'}`}>
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary-btn)]" />}
      </span>
      <span>
        {label}
        {hint && <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-[12px] text-text-3">{hint}</span>}
      </span>
    </label>
  )
}

/**
 * DownloadReportModal
 * Period, sections and file format for the financial report download.
 * Defaults to the period currently selected on the screen (handoff §13).
 */
export function DownloadReportModal({ isOpen, onClose, isPending, ...formProps }) {
  return (
    <ReportModal isOpen={isOpen} onClose={isPending ? () => {} : onClose} labelledBy="fr-download-title" maxWidth={460}>
      <DownloadReportForm onClose={onClose} isPending={isPending} {...formProps} />
    </ReportModal>
  )
}

// Mounted only while the modal is open, so each open starts from the
// screen's current period.
function DownloadReportForm({ onClose, initialPeriod, onDownload, isPending }) {
  const [preset, setPreset] = useState(initialPeriod.preset)
  const [from, setFrom] = useState(initialPeriod.from ?? '')
  const [to, setTo] = useState(initialPeriod.to ?? '')
  const [include, setInclude] = useState({ transactions: true, hustles: true })
  const [format, setFormat] = useState('csv')
  const [error, setError] = useState(null)
  const today = toIsoDate(new Date())

  // The backend CSV always contains every section; the toggles only shape the PDF.
  const includeLocked = format === 'csv'

  const handleSubmit = () => {
    let period
    if (preset === 'custom') {
      const message = !from && !to ? 'Select both a start and an end date.' : validateDateRange(from, to)
      if (message) {
        setError(message)
        return
      }
      period = buildCustomPeriod(from, to)
    } else {
      period = buildPresetPeriod(preset)
    }

    if (!includeLocked && !include.transactions && !include.hustles) {
      setError('Select at least one section to include.')
      return
    }

    onDownload({
      period,
      format,
      include: includeLocked ? { transactions: true, hustles: true } : include,
    })
  }

  const toggleInclude = (key) => (checked) => {
    setInclude((prev) => ({ ...prev, [key]: checked }))
    setError(null)
  }

  return (
    <>
      <div className="mb-8 flex items-center gap-3.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-text-1">
          <Download size={20} />
        </span>
        <h3 id="fr-download-title" className="text-[19px] font-semibold text-text-1">Download financial report</h3>
      </div>

      <div>
        <FieldLabel htmlFor="fr-download-period">Period</FieldLabel>
        <SelectField
          id="fr-download-period"
          value={preset}
          options={PERIOD_PRESETS}
          onChange={(value) => { setPreset(value); setError(null) }}
        />
        {preset === 'custom' && (
          <div className="mt-4 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
            <DateField id="fr-download-from" label="Start date" value={from} max={to || today} onChange={(value) => { setFrom(value); setError(null) }} />
            <DateField id="fr-download-to" label="End date" value={to} min={from || undefined} max={today} onChange={(value) => { setTo(value); setError(null) }} />
          </div>
        )}
      </div>

      <fieldset className="mt-7">
        <FieldLabel as="legend">Include</FieldLabel>
        <div className="mt-1 grid grid-cols-2 gap-4">
          <Checkbox label="Transactions" checked={include.transactions} disabled={includeLocked} onChange={toggleInclude('transactions')} />
          <Checkbox label="Hustles" checked={include.hustles} disabled={includeLocked} onChange={toggleInclude('hustles')} />
        </div>
        {includeLocked && <p className="mt-3 text-[13.5px] text-text-3">CSV exports always include both sections.</p>}
      </fieldset>

      <fieldset className="mt-7">
        <FieldLabel as="legend">File Format</FieldLabel>
        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-4">
          {FORMATS.map((option) => (
            <Radio
              key={option.key}
              label={option.label}
              hint={option.enabled ? null : 'Soon'}
              checked={format === option.key}
              disabled={!option.enabled}
              onChange={() => { setFormat(option.key); setError(null) }}
            />
          ))}
        </div>
      </fieldset>

      {error && <p className="mt-5 text-[14px] text-error">{error}</p>}

      <ModalActions onCancel={onClose} onConfirm={handleSubmit} confirmLabel="Download Report" pending={isPending} />
    </>
  )
}
