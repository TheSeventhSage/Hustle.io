import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Calendar, Info } from 'lucide-react'
import { FormField, TextInput, PrimaryBtn } from './SettingsUI'
import { SettingsSuccessModal } from '../modals/SettingsModals'
import useUIStore from '../../../../shared/store/ui.store.js'

function HowCanWeHelp() {
  const { toastInfo } = useUIStore()
  return (
    <div>
      <p style={{ fontSize: '14px', color: 'var(--color-text-3)', lineHeight: 1.65, marginBottom: '24px', fontFamily: 'var(--ff-body)' }}>
        Talk with one of our agents. They can answer all your questions and help you find hustlers just for you.
      </p>

      {/* Offline banner */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        background: 'rgba(15, 110, 68, 0.12)', border: '1px solid rgba(15, 110, 68, 0.22)',
        borderRadius: '12px', padding: '14px 16px', marginBottom: '20px',
      }}>
        <Info size={18} color='var(--color-info)' style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '13.5px', color: 'var(--color-text-2)', lineHeight: 1.6, fontFamily: 'var(--ff-body)' }}>
          Our agents are currently offline. You can text us and one of our agents will get back to you as soon as possible.
        </p>
      </div>

      {/* Schedule */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '28px' }}>
        <Calendar size={18} color="var(--color-text-4)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '13.5px', color: 'var(--color-text-3)', lineHeight: 1.6, fontFamily: 'var(--ff-body)' }}>
          Our agents will be back online and ready to assist you today from 8am to 5pm. (GMT)
        </p>
      </div>

      <PrimaryBtn
        fullWidth={false}
        style={{ minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
        onClick={() => toastInfo('Support chat is currently offline. Use report an issue instead.')}
      >
        <MessageSquare size={17} /> Text an agent
      </PrimaryBtn>
    </div>
  )
}

function ReportAnIssue() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [successOpen, setSuccessOpen] = useState(false)
  const { toastError, toastSuccess } = useUIStore()

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSubmit = () => {
    if (!form.phone || !form.message.trim()) {
      toastError('Provide your phone number and message before submitting.')
      return
    }

    setSuccessOpen(true)
    toastSuccess('Your issue has been submitted.')
  }

  return (
    <>
      <div>
        <FormField label="Full Name:">
          <TextInput placeholder="" value={form.name} onChange={e => update('name', e.target.value)} />
        </FormField>
        <FormField label="Phone Number:" required>
          <TextInput placeholder="" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} />
        </FormField>
        <FormField label="Message">
          <textarea
            placeholder="Tell us what we can make better"
            value={form.message}
            onChange={e => update('message', e.target.value)}
            style={{
              width: '100%', minHeight: '140px', padding: '12px 14px',
              border: '1.5px solid var(--color-border)', borderRadius: '10px',
              fontSize: '13.5px', color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)',
              background: 'var(--color-surface)', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              transition: 'border-color 0.15s', lineHeight: 1.6,
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-primary)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
          />
        </FormField>
        <PrimaryBtn onClick={handleSubmit}>Report issue</PrimaryBtn>
      </div>
      <SettingsSuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Issue Reported"
        body="Your report has been submitted. Our team will get back to you shortly."
        onBtn={() => setSuccessOpen(false)}
      />
    </>
  )
}

const TABS = [
  { key: 'help', label: 'How can we help' },
  { key: 'report', label: 'Report an issue' },
]

export function ContactSupport() {
  const [activeTab, setActiveTab] = useState('help')

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid var(--color-border)', marginBottom: '28px', gap: '0' }}>
        {TABS.map(tab => {
          const active = activeTab === tab.key
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '10px 0', marginRight: '28px',
              fontSize: '14px', fontWeight: active ? 700 : 500,
              color: active ? 'var(--color-text-1)' : 'var(--color-text-4)',
              background: 'none', border: 'none', cursor: 'pointer',
              position: 'relative', fontFamily: 'var(--ff-body)', transition: 'color 0.15s',
            }}>
              {tab.label}
              {active && (
                <motion.div layoutId="support-tab-line" style={{ position: 'absolute', bottom: '-1.5px', left: 0, right: 0, height: '2.5px', background: 'var(--color-accent-gold)', borderRadius: '2px' }} />
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
          {activeTab === 'help' ? <HowCanWeHelp /> : <ReportAnIssue />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
