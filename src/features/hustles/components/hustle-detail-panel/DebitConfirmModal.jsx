import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatGHS } from './hustleDetailPanel.utils.js'

export function DebitConfirmModal({ amount, onCancel, onProceed }) {
    const [dontShow, setDontShow] = useState(false)

    return (
        <div className="fixed inset-0 z-[75] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 z-10 text-center"
            >
                <div className="flex justify-center mb-4">
                    <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="9" stroke="#3b82f6" strokeWidth="1.5" />
                            <path d="M10 6v4M10 13v1" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                <p className="text-[13px] text-text-2 leading-relaxed mb-5">
                    You are about to be debited <strong>{formatGHS(amount)}</strong> from your wallet, the money will only be released when the hustler complete their hustle
                </p>

                <label className="flex items-center justify-center gap-2 mb-6 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={dontShow}
                        onChange={e => setDontShow(e.target.checked)}
                        className="w-4 h-4 rounded border-border accent-primary"
                    />
                    <span className="text-[12px] text-text-3">Dont show this message again</span>
                </label>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 h-11 border border-[var(--color-brand-grey)] text-[var(--color-brand-grey)] rounded-full text-[13px] font-semibold hover:bg-[var(--color-mist)] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onProceed}
                        className="flex-1 h-11 bg-primary hover:bg-primary-sat text-white rounded-full text-[13px] font-bold transition-colors"
                    >
                        Proceed
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
