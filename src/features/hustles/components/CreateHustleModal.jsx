import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, X } from 'lucide-react'
import { CreateHustleForm } from './CreateHustleForm.jsx'
import useHustlesStore from '../hustles.store.js'

export function CreateHustleModal() {
  const { createModalOpen, closeCreateModal } = useHustlesStore()

  useEffect(() => {
    document.body.style.overflow = createModalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [createModalOpen])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && createModalOpen) closeCreateModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [createModalOpen, closeCreateModal])

  return (
    <AnimatePresence>
      {createModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCreateModal}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-white dark:bg-surface shadow-2xl
              w-full sm:w-[580px] lg:w-[620px]"
          >
            {/* Sticky header */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5
              border-b border-[#EAECE6] bg-white dark:bg-mist sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={closeCreateModal}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-[#5A6A60]
                    hover:bg-[#F0F2EC] hover:text-[#0A1A12] transition-all"
                  aria-label="Go back"
                >
                  <ArrowLeft size={17} />
                </button>
                <h2 className="text-[17px] sm:text-[18px] font-bold text-[#0A1A12] dark:text-text-1 font-display">
                  Create a hustle
                </h2>
              </div>
              <button
                onClick={closeCreateModal}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-[#8A9A91]
                  hover:bg-[#F0F2EC] hover:text-[#0A1A12] transition-all"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <CreateHustleForm onClose={closeCreateModal} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
