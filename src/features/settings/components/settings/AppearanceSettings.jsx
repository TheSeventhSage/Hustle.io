import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

import { Button } from '../../../../shared/components/Button.jsx'
import { ContentTitle } from './SettingsUI'

const THEMES = [
  { key: 'light', label: 'Light', Icon: Sun },
  { key: 'dark', label: 'Dark', Icon: Moon },
  { key: 'system', label: 'System', Icon: Monitor },
]

export function AppearanceSettings({ settings, isPending, onSave }) {
  const [form, setForm] = useState({
    appearance_mode: settings?.appearance_mode || 'system',
    timezone_name: settings?.timezone_name || 'Africa/Lagos',
  })

  useEffect(() => {
    setForm({
      appearance_mode: settings?.appearance_mode || 'system',
      timezone_name: settings?.timezone_name || 'Africa/Lagos',
    })
  }, [settings])

  return (
    <div>
      <ContentTitle>Appearance settings</ContentTitle>
      <p style={{ fontSize: '13px', color: 'var(--color-text-3)', marginBottom: '18px', fontFamily: 'var(--ff-body)' }}>
        Prefilled from `GET /settings` and updated through `PATCH /settings`.
      </p>

      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '12px', fontFamily: 'var(--ff-body)' }}>Theme</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {THEMES.map((theme) => {
            const active = form.appearance_mode === theme.key
            return (
              <button
                key={theme.key}
                onClick={() => setForm((current) => ({ ...current, appearance_mode: theme.key }))}
                style={{
                  flex: '1 1 150px',
                  height: '64px',
                  borderRadius: '12px',
                  border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: active ? 'var(--color-mist)' : 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <theme.Icon size={18} color={active ? 'var(--color-primary)' : 'var(--color-text-4)'} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: active ? 'var(--color-primary)' : 'var(--color-text-3)', fontFamily: 'var(--ff-body)' }}>{theme.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '12px', fontFamily: 'var(--ff-body)' }}>Timezone</p>
        <input
          value={form.timezone_name}
          onChange={(event) => setForm((current) => ({ ...current, timezone_name: event.target.value }))}
          placeholder="Africa/Lagos"
          style={{
            width: '100%',
            height: '46px',
            padding: '0 14px',
            border: '1.5px solid var(--color-border)',
            borderRadius: '10px',
            fontSize: '14px',
            color: 'var(--color-text-1)',
            background: 'var(--color-surface)',
            fontFamily: 'var(--ff-body)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <Button
        variant="solid"
        isPending={isPending}
        onClick={() => onSave(form)}
        className="w-fit min-w-[220px] px-8 max-sm:w-full"
      >
        Save settings
      </Button>
    </div>
  )
}
