import { useState } from 'react'
import { X, ArrowLeft, Info, RotateCw, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { RichTextEditor } from '../../../shared/components/RichTextEditor.jsx'
import { FileUploadComponent } from '../../../shared/components/FileUploadComponent.jsx'
import { Button } from '../../../shared/components/Button.jsx'
import { DatePicker } from '../../../shared/components/DatePicker.jsx'
import { TimePicker } from '../../../shared/components/TimePicker.jsx'

/**
 * BookHustlerPanel - Side panel for booking a hustler (from HustlerProfilePanel)
 * Slides in from the right on top of the details panel
 */
export function BookHustlerPanel({ isOpen, onClose, onBack, hustler }) {
    const [step, setStep] = useState(1) // 1: form, 2: loading, 3: success
    const [formData, setFormData] = useState({
        jobTitle: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        description: '',
        files: []
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStep(2)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setStep(3)
    }

    const handleClose = () => {
        setStep(1)
        setFormData({
            jobTitle: '',
            startDate: '',
            endDate: '',
            startTime: '',
            endTime: '',
            description: '',
            files: []
        })
        onClose()
    }

    const handleFileChange = (files) => {
        setFormData(prev => ({ ...prev, files }))
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
                    />

                    {/* Panel */}
                    <motion.div
                        key="panel"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-surface shadow-2xl
              w-full sm:w-[580px] lg:w-[720px]"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5
              border-b border-border bg-surface">
                            <div className="flex items-center gap-3">
                                {step === 3 ? (
                                    <button
                                        onClick={onBack}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4
                      hover:bg-mist hover:text-text-1 transition-all"
                                        aria-label="Back">
                                        <ArrowLeft size={18} />
                                    </button>
                                ) : null}
                                <h2 className="text-[17px] font-bold text-text-1">
                                    {step === 3 ? 'Service Details' : 'Booking hustler'}
                                </h2>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {step === 1 && (
                                    <>
                                        <button className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4
                      hover:bg-mist hover:text-text-1 transition-all">
                                            <RotateCw size={14} />
                                        </button>
                                    </>
                                )}
                                {step === 3 && (
                                    <>
                                        <button
                                            className="px-4 py-2 bg-primary text-white text-[13px] font-semibold rounded-xl
                        hover:bg-primary/90 transition-colors">
                                            Book hustler
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4
                      hover:bg-mist hover:text-text-1 transition-all">
                                            <RotateCw size={14} />
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={handleClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4
                    hover:bg-mist hover:text-text-1 transition-all"
                                    aria-label="Close">
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overscroll-contain">
                            {step === 1 && (
                                <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
                                    {/* Info Banner */}
                                    <div className="bg-primary-sat/10 border border-primary-sat/30 rounded-xl p-4 flex gap-3">
                                        <Info size={18} className="text-primary-sat flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[13px] font-bold text-primary-sat mb-1">Need a quicker response?</p>
                                            <p className="text-[12px] text-primary-sat/80">
                                                For urgent hustle, we recommend messaging or calling the Hustler directly before or after booking.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Job Title */}
                                    <div>
                                        <label className="block text-[12px] font-medium text-text-3 mb-2">Enter Job title</label>
                                        <input
                                            type="text"
                                            value={formData.jobTitle}
                                            onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                                            placeholder="Eg. Lash extension"
                                            className="w-full px-4 py-3 border border-border rounded-xl text-[14px] text-text-1
                        placeholder:text-text-4 focus:outline-none focus:border-primary-sat"
                                            required
                                        />
                                    </div>

                                    {/* Date & Time */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[12px] font-medium text-text-3 mb-2">Preferred date</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <DatePicker
                                                    value={formData.startDate}
                                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                    required
                                                />
                                                <DatePicker
                                                    value={formData.endDate}
                                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-medium text-text-3 mb-2">Preferred time</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <TimePicker
                                                    value={formData.startTime}
                                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                    required
                                                />
                                                <TimePicker
                                                    value={formData.endTime}
                                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-[12px] font-medium text-text-3 mb-2">Hustle description:</label>
                                        <RichTextEditor
                                            value={formData.description}
                                            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                                            placeholder="Describe what you want the hustler to do for you"
                                            className="min-h-[150px]"
                                        />
                                    </div>

                                    {/* File Upload */}
                                    <div>
                                        <label className="block text-[12px] font-medium text-text-3 mb-2">
                                            Upload a picture or document (Optional)
                                        </label>
                                        <FileUploadComponent
                                            files={formData.files}
                                            onChange={handleFileChange}
                                            accept="image/*,.pdf,.doc,.docx"
                                            maxSize={5 * 1024 * 1024}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button type="submit" variant="solid" className="w-full">
                                        Book Hustler
                                    </Button>
                                </form>
                            )}

                            {step === 2 && (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6 mt-32">
                                    <div className="w-16 h-16 border-4 border-border border-t-primary-btn rounded-full animate-spin mb-6"></div>
                                    <h3 className="text-[24px] font-bold text-text-1 mb-2">Sending request...</h3>
                                    <p className="text-text-3 text-[15px]">Please hold on for a second...</p>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6 mt-32">
                                    <div className="w-24 h-24 bg-[#ECFDF3] rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle className="w-12 h-12 text-primary-light" />
                                    </div>
                                    <h3 className="text-[24px] font-bold text-text-1 mb-3">Request sent successfully</h3>
                                    <p className="text-text-3 text-[15px] mb-8 max-w-[280px]">
                                        You can keep track of this request in your messages.
                                    </p>
                                    <Button variant="solid" onClick={handleClose} className="w-full">
                                        Done
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
