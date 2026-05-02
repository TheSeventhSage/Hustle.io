import { useEffect, useState } from 'react'

import { Button } from '../../../../shared/components/Button.jsx'
import { Toggle } from './SettingsUI'

const DAYS = [
  { key: 'Monday', weekdayNumber: 1 },
  { key: 'Tuesday', weekdayNumber: 2 },
  { key: 'Wednesday', weekdayNumber: 3 },
  { key: 'Thursday', weekdayNumber: 4 },
  { key: 'Friday', weekdayNumber: 5 },
  { key: 'Saturday', weekdayNumber: 6 },
  { key: 'Sunday', weekdayNumber: 0 },
]

function buildSchedule(rules, timezone) {
  const byDay = new Map(rules.map((rule) => [rule.weekday_number, rule]))

  return DAYS.reduce((accumulator, day) => {
    const rule = byDay.get(day.weekdayNumber)
    accumulator[day.key] = {
      id: rule?.id,
      weekday_number: day.weekdayNumber,
      enabled: rule ? rule.status !== 'unavailable' : day.weekdayNumber >= 1 && day.weekdayNumber <= 5,
      start_time: rule?.start_time || '09:00:00',
      end_time: rule?.end_time || '17:00:00',
      timezone_name: rule?.timezone_name || timezone || 'Africa/Lagos',
      status: rule?.status || 'available',
    }
    return accumulator
  }, {})
}

function TimeField({ value, onChange }) {
  return (
    <input
      type="time"
      value={value.slice(0, 5)}
      onChange={onChange}
      style={{
        width: '100%',
        height: '44px',
        padding: '0 14px',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        background: 'var(--color-surface)',
        color: 'var(--color-text-1)',
        fontSize: '14px',
        fontFamily: 'var(--ff-body)',
        boxSizing: 'border-box',
      }}
    />
  )
}

export function WorkingHours({ rules, timezoneName, isPending, onSave }) {
  const [schedule, setSchedule] = useState(() => buildSchedule(rules, timezoneName))

  useEffect(() => {
    setSchedule(buildSchedule(rules, timezoneName))
  }, [rules, timezoneName])

  const updateDay = (day, patch) => {
    setSchedule((current) => ({
      ...current,
      [day]: { ...current[day], ...patch },
    }))
  }

  const handleSubmit = () => {
    const payload = DAYS.map(({ key }) => {
      const current = schedule[key]
      return {
        id: current.id,
        weekday_number: current.weekday_number,
        start_time: `${current.start_time.slice(0, 5)}:00`,
        end_time: `${current.end_time.slice(0, 5)}:00`,
        timezone_name: current.timezone_name,
        status: current.enabled ? 'available' : 'unavailable',
      }
    })

    onSave(payload)
  }

  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-1)', marginBottom: '10px', fontFamily: 'var(--ff-body)' }}>
        Working Hours
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--color-text-3)', marginBottom: '18px', fontFamily: 'var(--ff-body)' }}>
        Set your available working hours for each day of the week.
      </p>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
        {DAYS.map(({ key }) => {
          const current = schedule[key]

          return (
            <div key={key} style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: current.enabled ? '12px' : 0 }}>
                <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)' }}>{key}</p>
                <Toggle checked={current.enabled} onChange={(checked) => updateDay(key, { enabled: checked })} />
              </div>

              {current.enabled ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-2)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>
                      Opening time
                    </label>
                    <TimeField value={current.start_time} onChange={(event) => updateDay(key, { start_time: event.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-2)', marginBottom: '8px', fontFamily: 'var(--ff-body)' }}>
                      Closing time
                    </label>
                    <TimeField value={current.end_time} onChange={(event) => updateDay(key, { end_time: event.target.value })} />
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <Button variant="solid" isPending={isPending} onClick={handleSubmit} className="mt-7 w-fit min-w-[260px] px-8 max-sm:w-full">
        Save working hours
      </Button>
    </div>
  )
}
