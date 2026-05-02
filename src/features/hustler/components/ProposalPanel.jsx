import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApplyToHustle } from '../../hustles/hustles.hooks.js'
import useUIStore from '../../../shared/store/ui.store.js'

const PRICING_MODELS = [
    { value: 'full_amount', label: 'Per service / full amount' },
    { value: 'per_hour', label: 'Per hour' },
]

const SERVICE_FEE_PCT = 0.05

export default function ProposalPanel({ isOpen, hustle, onClose, onSubmit, canApply = false, isCheckingKyc = false }) {
    const [pricingModel, setPricingModel] = useState('full_amount')
    const [amount, setAmount] = useState('')
    const [hours, setHours] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [duration, setDuration] = useState('')

    const { mutate: applyToHustle, isPending } = useApplyToHustle()
    const { toastError, toastWarning } = useUIStore()

    // Auto-calculate duration from dates
    useEffect(() => {
        if (startDate && endDate) {
            const diff = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000)
            if (diff > 0) setDuration(`${diff} day${diff > 1 ? 's' : ''}`)
        }
    }, [startDate, endDate])

    const bidAmount = pricingModel === 'per_hour'
        ? (parseFloat(amount) || 0) * (parseFloat(hours) || 0)
        : parseFloat(amount) || 0
    const serviceFee = bidAmount * SERVICE_FEE_PCT
    const youReceive = bidAmount - serviceFee

    const isValid = pricingModel === 'per_hour'
        ? !!(amount && hours && startDate && endDate)
        : !!(amount && startDate && endDate)

    const handleSubmit = () => {
        if (!isValid || !hustle) return
        if (isCheckingKyc) {
            toastWarning('Checking KYC status. Please wait.')
            return
        }
        if (!canApply) {
            toastError('Your KYC must be verified before you can apply for a hustle.')
            return
        }

        // API: POST /hustles/{id}/applications
        // Required: offered_amount, pricing_model, currency_code, expected_completion_at, timeline_notes
        const payload = {
            pricing_model: pricingModel,
            offered_amount: bidAmount,
            currency_code: hustle.currency_code || 'NGN',
            expected_completion_at: `${endDate} ${endTime || '23:59:00'}`,
            timeline_notes: duration || `${startDate} to ${endDate}`,
        }

        applyToHustle(
            { hustleId: hustle.id, data: payload },
            {
                onSuccess() {
                    // Only fire onSubmit when API actually succeeds
                    onSubmit({
                        ...payload,
                        startDate, endDate, startTime, endTime,
                    })
                },
                // onError is handled in the hook — toast shown there
            }
        )
    }

    const inp = 'w-full h-12 px-4 text-[14px] text-text-1 bg-mist dark:bg-white/5 rounded-xl border border-transparent outline-none focus:border-primary transition-all'

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        key="proposal-bd"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 z-[55]"
                        onClick={onClose}
                    />
                    <motion.div
                        key="proposal-panel"
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 bottom-0 z-[56] w-full sm:w-[560px] bg-white dark:bg-surface flex flex-col shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                            <span className="text-[15px] font-bold text-text-1">Proposal details</span>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-mist transition-all">
                                <X size={15} className="text-text-3" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                            {!canApply && !isCheckingKyc && (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-700">
                                    Your KYC must be verified before you can submit a proposal for a hustle.
                                </div>
                            )}

                            <p className="text-[13px] text-text-3">
                                Your general profile will be submitted with this offer.{' '}
                                <button className="text-primary font-semibold hover:underline">Click here to update</button>
                            </p>

                            {/* Pricing model */}
                            <div>
                                <p className="text-[13px] font-semibold text-text-2 mb-2">How would you want to charge for this hustle?</p>
                                <div className="relative">
                                    <select
                                        value={pricingModel}
                                        onChange={e => { setPricingModel(e.target.value); setAmount(''); setHours('') }}
                                        className={`${inp} appearance-none pr-10 cursor-pointer`}
                                    >
                                        {PRICING_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-4">▾</span>
                                </div>
                            </div>

                            {/* Per hour: hours */}
                            {pricingModel === 'per_hour' && (
                                <div>
                                    <p className="text-[13px] font-semibold text-text-2 mb-2">How many hours will this take you to complete?</p>
                                    <input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="0" className={inp} />
                                </div>
                            )}

                            {/* Delivery dates */}
                            <div>
                                <p className="text-[13px] font-semibold text-text-2 mb-2">Choose delivery date</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inp} />
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inp} />
                                </div>
                            </div>

                            {/* Per service: time + amount */}
                            {pricingModel === 'full_amount' && (
                                <>
                                    <div>
                                        <p className="text-[13px] font-semibold text-text-2 mb-2">Choose delivery time</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inp} />
                                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inp} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold text-text-2 mb-2">What is the amount you'd like to bid for this hustle?</p>
                                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="GHS  enter amount" className={inp} />
                                    </div>
                                </>
                            )}

                            {/* Per hour: rate */}
                            {pricingModel === 'per_hour' && (
                                <div>
                                    <p className="text-[13px] font-semibold text-text-2 mb-2">How much are you charging per hour for this hustle?</p>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="GHS  35.00" className={inp} />
                                </div>
                            )}

                            {/* Service fee */}
                            <div>
                                <p className="text-[13px] font-semibold text-text-2 mb-2">5% platform service fee</p>
                                <input readOnly value={serviceFee > 0 ? `GHS  ${serviceFee.toFixed(2)}` : 'GHS  00.00'} className={`${inp} text-text-4 cursor-default`} />
                            </div>

                            {/* You'll receive */}
                            <div>
                                <p className="text-[13px] font-semibold text-text-2 mb-1">You'll receive</p>
                                <p className="text-[12px] text-text-4 mb-2">The estimated amount you'll receive after service fee.</p>
                                <input readOnly value={youReceive > 0 ? `GHS ${youReceive.toFixed(2)}` : 'GHS'} className={`${inp} text-text-4 cursor-default`} />
                            </div>

                            {/* Duration */}
                            <div>
                                <p className="text-[13px] font-semibold text-text-2 mb-2">Duration</p>
                                <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 8 days" className={inp} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-border flex-shrink-0">
                            <button
                                onClick={handleSubmit}
                                disabled={!isValid || isPending || !canApply || isCheckingKyc}
                                className={`w-full h-12 rounded-full text-[14px] font-bold transition-all ${isValid && !isPending
                                        ? 'bg-primary text-white hover:bg-primary-sat cursor-pointer'
                                        : 'bg-disabled text-white cursor-not-allowed'
                                    }`}
                            >
                                {isCheckingKyc ? 'Checking KYC...' : isPending ? 'Submitting...' : 'Submit a proposal'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
