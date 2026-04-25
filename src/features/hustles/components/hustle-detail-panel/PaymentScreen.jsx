import { useState } from 'react'
import { formatGHS } from './hustleDetailPanel.utils.js'

export function PaymentScreen({ applicant, onBack, onSuccess }) {
    const [pin, setPin] = useState(['', '', '', ''])
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)
    const inputsRef = useState(() => [])[0]

    const handleDigit = (idx, val) => {
        if (!/^\d?$/.test(val)) return
        const next = [...pin]
        next[idx] = val
        setPin(next)
        setError(false)
        if (val && idx < 3) inputsRef[idx + 1]?.focus()
    }

    const handleKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
            inputsRef[idx - 1]?.focus()
        }
    }

    const handlePay = () => {
        const full = pin.join('')
        if (full.length < 4) { setError(true); return }
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            onSuccess()
        }, 1200)
    }

    return (
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-6">
            {error && (
                <div className="mb-5 px-4 py-3 bg-[var(--color-mist)] border border-[var(--color-brand-grey)] rounded-xl">
                    <p className="text-[13px] font-semibold text-[var(--color-brand-grey)]">Incorrect pin</p>
                </div>
            )}

            <p className="text-[14px] text-text-2 mb-7 leading-relaxed">
                You accepted <strong>{applicant.name}</strong> offer for{' '}
                <strong>{formatGHS(applicant.totalCost)}</strong>
            </p>

            <div className="bg-bg rounded-2xl p-6 mb-7">
                <p className="text-[13px] font-semibold text-text-3 text-center mb-4">Enter PIN to Proceed</p>
                <div className="flex items-center justify-center gap-3 mb-4">
                    {[0, 1, 2, 3].map(i => (
                        <input
                            key={i}
                            ref={el => { inputsRef[i] = el }}
                            type="password"
                            maxLength={1}
                            value={pin[i]}
                            onChange={e => handleDigit(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            className={`w-12 h-12 text-center text-[20px] font-bold rounded-xl border-2 outline-none transition-all ${error ? 'border-[var(--color-brand-grey)] bg-[var(--color-mist)]' : 'border-border bg-white focus:border-primary'
                                }`}
                        />
                    ))}
                </div>
                <button className="block mx-auto text-[12px] text-primary font-semibold hover:underline">
                    Forgot Password?
                </button>
            </div>

            <button
                onClick={handlePay}
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary-sat active:scale-[0.98] text-white text-[14px] font-bold rounded-full transition-all flex items-center justify-center"
            >
                {loading ? (
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 00-12 12h4z" />
                    </svg>
                ) : 'Pay'}
            </button>
        </div>
    )
}
