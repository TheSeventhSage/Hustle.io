import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

/**
 * Toast Component - Reusable notification component
 * @param {Object} props
 * @param {'success' | 'error' | 'warning' | 'info'} props.type - Toast type
 * @param {string} props.message - Toast message
 * @param {string} [props.title] - Optional toast title
 * @param {number} [props.duration=5000] - Auto-dismiss duration in ms (0 = no auto-dismiss)
 * @param {Function} props.onClose - Close handler
 * @param {'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'} [props.position='top-right'] - Toast position
 */
export function Toast({
    type = 'info',
    message,
    title,
    duration = 5000,
    onClose,
    position = 'top-right'
}) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration)
            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info,
    }

    const colors = {
        success: {
            bg: 'bg-success/10',
            border: 'border-success',
            text: 'text-success',
            icon: 'text-success',
        },
        error: {
            bg: 'bg-error/10',
            border: 'border-error',
            text: 'text-error',
            icon: 'text-error',
        },
        warning: {
            bg: 'bg-warning/10',
            border: 'border-warning',
            text: 'text-warning',
            icon: 'text-warning',
        },
        info: {
            bg: 'bg-primary/10',
            border: 'border-primary',
            text: 'text-primary',
            icon: 'text-primary',
        },
    }

    const positions = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    }

    const Icon = icons[type]
    const colorScheme = colors[type]

    return (
        <div
            className={`fixed ${positions[position]} z-[9999] animate-slide-in-right`}
            role="alert"
        >
            <div className={`
                min-w-[320px] max-w-md
                ${colorScheme.bg} 
                border-l-4 ${colorScheme.border}
                rounded-lg shadow-2xl
                p-4
                flex items-start gap-3
                backdrop-blur-sm
            `}>
                {/* Icon */}
                <div className={`flex-shrink-0 ${colorScheme.icon}`}>
                    <Icon size={24} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {title && (
                        <h4 className={`text-sm font-bold ${colorScheme.text} mb-1`}>
                            {title}
                        </h4>
                    )}
                    <p className="text-sm text-text-2 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-text-3 hover:text-text-1 transition-colors"
                    aria-label="Close notification"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    )
}

/**
 * Toast Container - Manages multiple toasts
 */
export function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    )
}
