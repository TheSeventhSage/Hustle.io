import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../../shared/components/Button.jsx'
import { useCancelBooking } from '../booking.hooks.js'

const REJECT_REASONS = [
    'Schedule conflict',
    'Location too far',
    'Not my area of expertise',
    'Already booked',
    'Other',
]

export default function RejectBookingModal({ bookingId, bookingTitle, isOpen, onClose }) {
    const [selectedReason, setSelectedReason] = useState('')
    const [customReason, setCustomReason] = useState('')

    const { mutate: cancel, isPending } = useCancelBooking()

    const effectiveReason = selectedReason === 'Other' ? customReason.trim() : selectedReason
    const canSubmit = effectiveReason.length > 0

    const handleSubmit = () => {
        if (!canSubmit) return
        cancel(
            { id: bookingId, reason: effectiveReason },
            {
                onSuccess: () => {
                    setSelectedReason('')
                    setCustomReason('')
                    onClose()
                },
            }
        )
    }

    const handleClose = () => {
        if (isPending) return
        setSelectedReason('')
        setCustomReason('')
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="reject-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        key="reject-modal"
                        role="dialog"
                        aria-label="Reject booking"
                        aria-modal="true"
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 12 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-[440px] pointer-events-auto overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle size={17} className="text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <h3 className="text-[16px] font-bold text-text-1">Reject booking</h3>
                                </div>
                                <button
                                    onClick={handleClose}
                                    disabled={isPending}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-mist transition-all disabled:opacity-50"
                                    aria-label="Close"
                                >
                                    <X size={15} className="text-text-3" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 pb-6">
                                {/* Booking title */}
                                {bookingTitle && (
                                    <p className="text-[13px] text-text-4 mb-4 leading-relaxed">
                                        You are about to reject{' '}
                                        <span className="font-semibold text-text-2">"{bookingTitle}"</span>.
                                        Please select a reason below.
                                    </p>
                                )}

                                {/* Reason chips */}
                                <p className="text-[13px] font-semibold text-text-2 mb-3">Reason for rejection</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {REJECT_REASONS.map(reason => (
                                        <button
                                            key={reason}
                                            onClick={() => setSelectedReason(reason)}
                                            className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-all ${selectedReason === reason
                                                ? 'bg-slate-700 dark:bg-slate-600 text-white border-slate-700 dark:border-slate-600'
                                                : 'bg-white dark:bg-surface text-text-2 border-border hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                        >
                                            {reason}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom reason textarea — shown when "Other" is selected */}
                                <AnimatePresence>
                                    {selectedReason === 'Other' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden mb-4"
                                        >
                                            <textarea
                                                value={customReason}
                                                onChange={e => setCustomReason(e.target.value)}
                                                placeholder="Please describe your reason..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-mist dark:bg-white/5 border border-border rounded-xl text-[13px] text-text-1 placeholder:text-text-4 resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 transition-all"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Actions */}
                                <div className="flex gap-3 mt-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleClose}
                                        disabled={isPending}
                                        className="flex-1 h-11 text-[14px] font-bold rounded-full"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="solid"
                                        onClick={handleSubmit}
                                        isPending={isPending}
                                        disabled={!canSubmit}
                                        className="flex-1 h-11 text-[14px] font-bold rounded-full bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 border-none text-white"
                                    >
                                        Reject booking
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
