import { useState } from 'react'
import { motion } from 'framer-motion'
import { REJECT_REASONS } from './hustleDetailPanel.utils.js'

export function RejectModal({ applicant, onCancel, onConfirm }) {
    const [selected, setSelected] = useState([])
    const [reason, setReason] = useState('')

    const toggle = (r) =>
        setSelected(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 z-10"
            >
                <h3 className="text-[16px] font-bold text-text-1 mb-5">Choose why you rejected this offer</h3>

                <div className="space-y-3 mb-5">
                    {REJECT_REASONS.map(r => (
                        <label key={r} className="flex items-center justify-between cursor-pointer">
                            <span className="text-[13px] text-text-2">{r}</span>
                            <input
                                type="checkbox"
                                checked={selected.includes(r)}
                                onChange={() => toggle(r)}
                                className="w-4 h-4 rounded border-border accent-primary"
                            />
                        </label>
                    ))}
                </div>

                <div className="mb-5">
                    <p className="text-[12px] font-semibold text-text-3 mb-1.5">Enter reason</p>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Write something"
                        className="w-full h-24 px-3 py-2.5 text-[13px] text-text-1 border border-border rounded-xl resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-text-4"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 h-11 border border-border rounded-full text-[13px] font-semibold text-text-2 hover:bg-mist transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(selected, reason)}
                        className="flex-1 h-11 bg-primary hover:bg-primary-sat text-white rounded-full text-[13px] font-bold transition-colors"
                    >
                        Reject proposal
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
