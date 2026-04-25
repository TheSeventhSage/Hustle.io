import { create } from 'zustand'

/**
 * Toast Store - Global state for toast notifications
 */
const useToastStore = create((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Date.now() + Math.random()
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id }]
        }))
        return id
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id)
        }))
    },
    clearToasts: () => set({ toasts: [] }),
}))

/**
 * useToast Hook - Easy toast notifications
 * @returns {Object} Toast methods
 */
export function useToast() {
    const { addToast, removeToast, clearToasts } = useToastStore()

    const toast = {
        success: (message, options = {}) => {
            return addToast({
                type: 'success',
                message,
                title: options.title || 'Success',
                duration: options.duration ?? 5000,
                position: options.position || 'top-right',
            })
        },
        error: (message, options = {}) => {
            return addToast({
                type: 'error',
                message,
                title: options.title || 'Error',
                duration: options.duration ?? 7000,
                position: options.position || 'top-right',
            })
        },
        warning: (message, options = {}) => {
            return addToast({
                type: 'warning',
                message,
                title: options.title || 'Warning',
                duration: options.duration ?? 5000,
                position: options.position || 'top-right',
            })
        },
        info: (message, options = {}) => {
            return addToast({
                type: 'info',
                message,
                title: options.title || 'Info',
                duration: options.duration ?? 5000,
                position: options.position || 'top-right',
            })
        },
        custom: (options) => {
            return addToast(options)
        },
        dismiss: (id) => {
            removeToast(id)
        },
        clear: () => {
            clearToasts()
        },
    }

    return toast
}

/**
 * Hook to get all toasts for rendering
 */
export function useToasts() {
    return useToastStore((state) => ({
        toasts: state.toasts,
        removeToast: state.removeToast,
    }))
}
