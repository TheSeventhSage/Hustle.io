import { X, Star } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/Button'

export function ReviewPanel({ isOpen, onClose, onSubmit, targetName, isSubmitting = false }) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [feedback, setFeedback] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (rating === 0) return
        onSubmit({ rating, feedback })
    }

    const handleClose = () => {
        setRating(0)
        setHoveredRating(0)
        setFeedback('')
        onClose()
    }

    if (!isOpen) return null

    const displayRating = hoveredRating || rating

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-surface shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-bold text-text-1">Leave a Review</h2>
                    <button
                        onClick={handleClose}
                        className="w-9 h-9 rounded-lg hover:bg-mist transition-colors flex items-center justify-center"
                        aria-label="Close panel"
                        disabled={isSubmitting}
                    >
                        <X size={20} className="text-text-3" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Target Info */}
                        <div className="bg-mist rounded-xl p-4">
                            <p className="text-sm text-text-4 mb-1">Reviewing</p>
                            <p className="text-base font-bold text-text-1">{targetName || 'Service Provider'}</p>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-base font-semibold text-text-1 mb-3">
                                How would you rate this service? <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                    >
                                        <Star
                                            size={40}
                                            className={`transition-colors ${star <= displayRating
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-border'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {rating > 0 && (
                                <p className="text-sm text-text-3 mt-2">
                                    {rating === 1 && 'Poor'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 3 && 'Good'}
                                    {rating === 4 && 'Very Good'}
                                    {rating === 5 && 'Excellent'}
                                </p>
                            )}
                        </div>

                        {/* Feedback */}
                        <div>
                            <label htmlFor="feedback" className="block text-base font-semibold text-text-1 mb-2">
                                Share your experience (optional)
                            </label>
                            <textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Tell us about your experience with this service provider..."
                                rows={6}
                                className="w-full px-4 py-3 bg-white dark:bg-surface border border-border rounded-xl text-base text-text-1 placeholder:text-text-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-text-4 mt-2">
                                {feedback.length} / 500 characters
                            </p>
                        </div>

                        {/* Guidelines */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                            <p className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                Review Guidelines
                            </p>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                <li>• Be honest and constructive</li>
                                <li>• Focus on your experience with the service</li>
                                <li>• Avoid personal attacks or offensive language</li>
                                <li>• Reviews help others make informed decisions</li>
                            </ul>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-border space-y-3">
                    <Button
                        variant="solid"
                        onClick={handleSubmit}
                        disabled={rating === 0 || isSubmitting}
                        className="w-full h-11 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="w-full h-11 font-bold rounded-xl"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </>
    )
}
