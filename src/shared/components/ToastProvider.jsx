import useUIStore from '../store/ui.store.js'
import { Toast } from './Toast.jsx'

/**
 * ToastProvider - Renders all active toasts from UI store
 * Add this component at the root of your app
 */
export function ToastProvider() {
    const toasts = useUIStore((state) => state.toasts)
    const dismissToast = useUIStore((state) => state.dismissToast)

    if (toasts.length === 0) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto"
                    style={{
                        // Stack toasts with slight offset
                        transform: `translateY(${index * 80}px)`
                    }}
                >
                    <Toast
                        {...toast}
                        onClose={() => dismissToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    )
}
