import { motion } from 'framer-motion'

export function ResultModal({ type, applicantName, onDone }) {
    const isSuccess = type === 'payment_success'
    const isRejected = type === 'rejected'

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/30" />
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.22 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 z-10 text-center"
            >
                {/* Animated check icon */}
                <div className="flex justify-center mb-4">
                    <div className="relative w-16 h-16">
                        {/* Dotted ring */}
                        <svg className="absolute inset-0 w-16 h-16 animate-spin-slow" viewBox="0 0 64 64">
                            {[...Array(12)].map((_, i) => (
                                <circle
                                    key={i}
                                    cx={32 + 28 * Math.cos((i * 30 * Math.PI) / 180)}
                                    cy={32 + 28 * Math.sin((i * 30 * Math.PI) / 180)}
                                    r="2.5"
                                    fill="#22c55e"
                                    opacity={0.3 + (i / 12) * 0.7}
                                />
                            ))}
                        </svg>
                        <div className="absolute inset-2 bg-green-500 rounded-full flex items-center justify-center">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                <path d="M4 11l5 5 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <h3 className="text-[18px] font-extrabold text-text-1 mb-2">
                    {isSuccess ? 'Offer Accepted' : isRejected ? 'Offer Rejected' : 'Done'}
                </h3>

                {isSuccess && (
                    <p className="text-[13px] text-text-3 mb-6 leading-relaxed">
                        Payment was completed and the applicant has been accepted successfully.
                    </p>
                )}

                {isRejected && (
                    <p className="text-[13px] text-text-3 mb-6 leading-relaxed">
                        You have successfully rejected the proposal submitted by &ldquo;{applicantName}&rdquo;.
                    </p>
                )}

                <button
                    onClick={onDone}
                    className="w-full h-12 bg-primary hover:bg-primary-sat text-white text-[14px] font-bold rounded-full transition-colors"
                >
                    {isSuccess ? 'Done' : 'Got it'}
                </button>
            </motion.div>
        </div>
    )
}
