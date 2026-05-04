import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import useUIStore from '../store/ui.store.js'

const ICONS = {
  success: <CheckCircle size={16} />,
  error: <AlertCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
}

const STYLES = {
  success: 'bg-[var(--color-success)] text-white dark:bg-success',
  error: 'bg-[var(--color-error)]   text-white dark:bg-error',
  warning: 'bg-[var(--color-warning)] text-[var(--color-primary)] dark:bg-warning',
  info: 'bg-[var(--color-primary)]  text-white dark:bg-primary',
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useUIStore()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
              text-sm font-medium pointer-events-auto max-w-sm
              ${STYLES[toast.type] ?? STYLES.info}
            `}
          >
            <span className="flex-shrink-0">{ICONS[toast.type]}</span>
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
