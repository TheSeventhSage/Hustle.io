/**
 * RadioGroup
 * Props:
 *   name    — form field name
 *   value   — currently selected value
 *   options — [{ label, value }] or string[]
 *   onChange — (value) => void
 */
export function RadioGroup({ name, value, options = [], onChange }) {
  const normalised = options.map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o
  )

  return (
    <div className="flex flex-col gap-2.5">
      {normalised.map((opt) => {
        const checked = value === opt.value
        return (
          <label
            key={opt.value}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${checked
                  ? 'border-primary-sat bg-primary-sat'
                  : 'border-text-4 bg-surface group-hover:border-primary-sat/50'
                }`}
            >
              {checked && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </span>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span
              className={`text-[13px] transition-colors ${checked ? 'font-semibold text-text-1' : 'text-text-3 group-hover:text-text-1'
                }`}
            >
              {opt.label}
            </span>
          </label>
        )
      })}
    </div>
  )
}
