import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { FAQS, TERMS_OF_USE, PRIVACY_POLICY } from '../../settingsData'
// import { settingsService } from '../../../../shared/api/settings.service.js'
// import useUIStore from '../../../../shared/store/ui.store.js'

/* ── FAQ accordion item ──────────────────────────────────────────────────── */
function FaqItem({ faq }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: 'var(--color-surface)', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--ff-body)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-1)',
          textAlign: 'left', transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-mist)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface)' }}
      >
        <span>{faq.q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0 }}>
          <ChevronDown size={16} color="var(--color-text-4)" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 16px', fontSize: '13.5px', color: 'var(--color-text-3)', lineHeight: 1.7, fontFamily: 'var(--ff-body)', borderTop: '1px solid var(--color-mist)' }}>
              <div style={{ paddingTop: '12px' }}>{faq.a}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Markdown-ish renderer (simple bold/newline) ─────────────────────────── */
function MarkdownText({ text }) {
  const lines = text.trim().split('\n')
  return (
    <div>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: '10px' }} />
        const isBold = line.startsWith('**') && line.endsWith('**')
        const content = isBold ? line.slice(2, -2) : line.replace(/\*\*(.*?)\*\*/g, '$1')
        return (
          <p key={i} style={{
            fontSize: isBold ? '15px' : '14px',
            fontWeight: isBold ? 700 : 400,
            color: isBold ? 'var(--color-text-1)' : 'var(--color-text-3)',
            lineHeight: 1.75,
            marginBottom: isBold ? '8px' : '6px',
            fontFamily: 'var(--ff-body)',
          }}>
            {content}
          </p>
        )
      })}
    </div>
  )
}

const TABS = [
  { key: 'faqs', label: 'FAQs' },
  { key: 'terms', label: 'Terms of use' },
  { key: 'privacy', label: 'Privacy policy' },
]

export function Others() {
  const [activeTab, setActiveTab] = useState('faqs')
  // const [termsContent, setTermsContent] = useState(null)
  // const [privacyContent, setPrivacyContent] = useState(null)
  // const [loading, setLoading] = useState(false)
  // const { toastError } = useUIStore()

  // useEffect(() => {
  //   const fetchLegalPage = async (pageType) => {
  //     setLoading(true)
  //     try {
  //       const response = await settingsService.getLegalPage(pageType)
  //       const content = response.item?.body_content || response.item?.content || ''

  //       if (pageType === 'terms') {
  //         setTermsContent(content)
  //       } else if (pageType === 'privacy') {
  //         setPrivacyContent(content)
  //       }
  //     } catch (error) {
  //       toastError(`Failed to load ${pageType === 'terms' ? 'Terms of Use' : 'Privacy Policy'}`)
  //       console.error(`Error fetching ${pageType}:`, error)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   // Fetch legal pages when tabs are switched
  //   if (activeTab === 'terms' && !termsContent) {
  //     fetchLegalPage('terms')
  //   } else if (activeTab === 'privacy' && !privacyContent) {
  //     fetchLegalPage('privacy')
  //   }
  // }, [activeTab, termsContent, privacyContent, toastError])

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid var(--color-border)', marginBottom: '24px', gap: '0' }}>
        {TABS.map(tab => {
          const active = activeTab === tab.key
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '10px 0', marginRight: '24px',
              fontSize: '13.5px', fontWeight: active ? 700 : 500,
              color: active ? 'var(--color-text-1)' : 'var(--color-text-4)',
              background: 'none', border: 'none', cursor: 'pointer',
              position: 'relative', fontFamily: 'var(--ff-body)', transition: 'color 0.15s',
            }}>
              {tab.label}
              {active && (
                <motion.div layoutId="others-tab-line" style={{ position: 'absolute', bottom: '-1.5px', left: 0, right: 0, height: '2.5px', background: 'var(--color-accent-gold)', borderRadius: '2px' }} />
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
          {activeTab === 'faqs' && (
            <div>{FAQS.map((faq, i) => <FaqItem key={i} faq={faq} />)}</div>
          )}
          {activeTab === 'terms' && (
            <MarkdownText text={TERMS_OF_USE} />
          )}
          {activeTab === 'privacy' && (
            <MarkdownText text={PRIVACY_POLICY} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
