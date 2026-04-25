import { useState, useRef } from 'react'
import { ArrowLeft, RotateCw, MoreVertical, Info, Upload, FileText, Trash2, AlertCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { RichTextEditor } from '../../../shared/components/RichTextEditor.jsx'

function fmtSize(b) {
    return b < 1048576 ? `${Math.round(b / 1024)} KB` : `${(b / 1048576).toFixed(1)} MB`
}

function DateInput({ value, onChange }) {
    return (
        <label className="flex items-center gap-2 h-11 px-3 bg-surface border border-border rounded-xl cursor-pointer hover:border-primary/40 transition-colors min-w-0">
            <input
                type="date"
                value={value}
                onChange={onChange}
                className="flex-1 min-w-0 w-0 bg-transparent border-none outline-none text-[12px] text-text-1 font-medium"
            />
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-text-4">
                <rect x="1" y="2" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M1 6h14" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5 1v2M11 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
        </label>
    )
}

function TimeInput({ value, onChange }) {
    return (
        <label className="flex items-center gap-2 h-11 px-3 bg-surface border border-border rounded-xl cursor-pointer hover:border-primary/40 transition-colors min-w-0">
            <input
                type="time"
                value={value}
                onChange={onChange}
                className="flex-1 min-w-0 w-0 bg-transparent border-none outline-none text-[12px] text-text-1 font-medium"
            />
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-text-4">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </label>
    )
}

function SuccessModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-surface rounded-3xl shadow-2xl w-full max-w-[380px] px-8 py-10 flex flex-col items-center text-center">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-border text-text-3 hover:bg-mist transition-all"
                >
                    <X size={15} />
                </button>

                {/* Animated success icon */}
                <div className="relative w-20 h-20 mb-6">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80" fill="none"
                        style={{ animation: 'spin 3s linear infinite' }}>
                        {Array.from({ length: 12 }).map((_, i) => {
                            const angle = (i * 30 * Math.PI) / 180
                            const x = 40 + 36 * Math.cos(angle - Math.PI / 2)
                            const y = 40 + 36 * Math.sin(angle - Math.PI / 2)
                            return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--color-primary-light)" opacity={0.2 + (i / 12) * 0.8} />
                        })}
                    </svg>
                    <div className="absolute inset-3 rounded-full bg-primary-light flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <path d="M6 14l5.5 5.5L22 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <h3 className="text-[20px] font-extrabold text-text-1 mb-2">Booking request sent</h3>
                <p className="text-[13px] text-text-3 leading-relaxed mb-7">
                    The Hustler will review your request. Once approved, you'll be able notified
                </p>

                <button
                    onClick={onClose}
                    className="w-full h-12 bg-primary hover:bg-primary-sat text-white text-[14px] font-bold rounded-2xl transition-all active:scale-[0.98]"
                >
                    View booking
                </button>
            </div>
        </div>
    )
}

export function BookHustlePanel({ isOpen, onClose, onBack, hustle }) {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [note, setNote] = useState('')
    const [files, setFiles] = useState([])
    const [isDragging, setIsDragging] = useState(false)
    const [timeError, setTimeError] = useState(false)
    const [step, setStep] = useState('form') // 'form' | 'loading' | 'success'
    const fileInputRef = useRef(null)

    const addFiles = (incoming) => {
        setFiles(prev => [...prev, ...Array.from(incoming)].slice(0, 10))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // First submit attempt with times filled → show conflict error
        if (!timeError && startTime && endTime) {
            setTimeError(true)
            return
        }
        setStep('loading')
        await new Promise(r => setTimeout(r, 2000))
        setStep('success')
    }

    const handleClose = () => {
        setStep('form')
        setStartDate(''); setEndDate(''); setStartTime(''); setEndTime('')
        setNote(''); setFiles([]); setTimeError(false)
        onClose()
    }

    const serviceName = hustle?.title || 'Lash Extension Classic'
    const servicePrice = hustle?.price || hustle?.amount || 100
    const serviceDuration = hustle?.duration || '30 mins'

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div key="bd"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={handleClose}
                            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[55]"
                        />

                        <motion.div key="panel"
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 z-[60] flex flex-col bg-surface shadow-2xl w-full sm:w-[580px] lg:w-[620px]"
                        >
                            {/* Header */}
                            <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-7 py-4 border-b border-border bg-surface">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={onBack || handleClose}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl text-text-3 hover:bg-mist transition-all"
                                        aria-label="Back"
                                    >
                                        <ArrowLeft size={17} />
                                    </button>
                                    <h2 className="text-[16px] font-bold text-text-1">Book this hustle</h2>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4 hover:bg-mist transition-all">
                                        <RotateCw size={14} />
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4 hover:bg-mist transition-all">
                                        <MoreVertical size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto overscroll-contain">

                                {/* ── LOADING ── */}
                                {step === 'loading' && (
                                    <div className="flex items-center justify-center h-full">
                                        <svg className="animate-spin w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 00-12 12h4z" />
                                        </svg>
                                    </div>
                                )}

                                {/* ── FORM ── */}
                                {step === 'form' && (
                                    <form onSubmit={handleSubmit} className="px-5 sm:px-7 py-5 space-y-4">

                                        {/* Info banner */}
                                        <div className="flex items-center gap-3 px-4 py-3 bg-primary-sat/10 border border-primary-sat/30 rounded-xl">
                                            <Info size={16} className="text-primary-sat flex-shrink-0" />
                                            <p className="text-[12px] text-primary-sat font-medium">
                                                By booking this hustler, GHS {servicePrice} will be deducted from your wallet
                                            </p>
                                        </div>

                                        {/* Service summary row */}
                                        <div className="flex items-center justify-between px-4 py-3.5 bg-secondary-pale border border-secondary-dark/30 rounded-xl">
                                            <div>
                                                <p className="text-[13px] font-bold text-text-1">{serviceName}</p>
                                                <p className="text-[12px] text-text-4 mt-0.5">{serviceDuration}</p>
                                            </div>
                                            <p className="text-[14px] font-extrabold text-text-1">GHS {servicePrice}</p>
                                        </div>

                                        {/* Time conflict error */}
                                        {timeError && (
                                            <div className="flex items-center gap-3 px-4 py-3 bg-warning/10 border border-warning/30 rounded-xl">
                                                <AlertCircle size={16} className="text-warning flex-shrink-0" />
                                                <p className="text-[12px] text-warning font-medium">
                                                    Oops! Your selected time overlaps with an existing booking. Kindly choose a different time
                                                </p>
                                            </div>
                                        )}

                                        {/* Date + Time */}
                                        <div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[12px] font-semibold text-text-3 mb-2">Preferred date</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <DateInput value={startDate} onChange={e => setStartDate(e.target.value)} />
                                                        <DateInput value={endDate} onChange={e => setEndDate(e.target.value)} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-semibold text-text-3 mb-2">Preferred time</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <TimeInput value={startTime} onChange={e => setStartTime(e.target.value)} />
                                                        <TimeInput value={endTime} onChange={e => setEndTime(e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Note */}
                                        <div>
                                            <p className="text-[12px] font-semibold text-text-3 mb-2">
                                                {timeError ? 'Add note (optional)' : 'Hustle description:'}
                                            </p>
                                            <RichTextEditor
                                                value={note}
                                                onChange={setNote}
                                                placeholder="Describe what you want the hustler to do for you"
                                            />
                                        </div>

                                        {/* File upload zone */}
                                        <div>
                                            <p className="text-[12px] font-semibold text-text-3 mb-2 text-center">
                                                Upload a picture or document (Optional)
                                            </p>
                                            <div
                                                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                                                onDragLeave={() => setIsDragging(false)}
                                                onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`flex flex-col items-center justify-center gap-2 py-7 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 bg-surface'}`}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    multiple
                                                    accept="image/*,.pdf,.doc,.docx"
                                                    className="hidden"
                                                    onChange={e => addFiles(e.target.files)}
                                                />
                                                <Upload size={22} className="text-primary-sat" />
                                                <p className="text-[13px] font-bold text-primary-sat">Drag to drop or Click to upload</p>
                                                <p className="text-[11px] text-text-4">SVG, PNG, JPG or GIF (max. 800×400px)</p>
                                            </div>

                                            {/* Document previews — 2 col grid */}
                                            {files.filter(f => !f.type.startsWith('image/')).length > 0 && (
                                                <div className="grid grid-cols-2 gap-3 mt-3">
                                                    {files.filter(f => !f.type.startsWith('image/')).map((file, idx) => (
                                                        <div key={idx} className="flex items-center gap-2.5 p-3 bg-surface border border-border rounded-xl">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                                                <FileText size={14} className="text-primary-sat" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] font-semibold text-text-1 truncate">{file.name}</p>
                                                                <p className="text-[10px] text-text-4">{fmtSize(file.size)}</p>
                                                                <div className="mt-1 h-1 bg-border rounded-full overflow-hidden">
                                                                    <div className="h-full bg-primary rounded-full w-full" />
                                                                </div>
                                                                <p className="text-[10px] text-text-4 text-right">100%</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                                                                className="text-red-400 hover:text-red-600 flex-shrink-0"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Image thumbnails */}
                                            {files.filter(f => f.type.startsWith('image/')).length > 0 && (
                                                <div className="flex gap-2 flex-wrap mt-3">
                                                    {files.filter(f => f.type.startsWith('image/')).map((file, idx) => {
                                                        const url = URL.createObjectURL(file)
                                                        return (
                                                            <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border flex-shrink-0">
                                                                <img src={url} alt="" className="w-full h-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setFiles(files.filter(f2 => f2 !== file))}
                                                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white"
                                                                >
                                                                    <X size={10} />
                                                                </button>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            className="w-full h-12 bg-primary hover:bg-primary-sat text-white text-[14px] font-bold rounded-2xl transition-all active:scale-[0.98]"
                                        >
                                            Book this hustle
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {step === 'success' && <SuccessModal onClose={handleClose} />}
        </>
    )
}
