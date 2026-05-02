import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, BriefcaseBusiness, ChevronDown, MessageSquareText, ShieldCheck, Wallet, X } from 'lucide-react'

const TYPE_CONFIG = {
    withdrawal_requested: {
        label: 'Wallet',
        icon: Wallet,
        tone: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/12 dark:text-emerald-200 dark:border-emerald-500/25',
    },
    admin_message: {
        label: 'Admin',
        icon: MessageSquareText,
        tone: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/12 dark:text-amber-200 dark:border-amber-500/25',
    },
    application_decision: {
        label: 'Application',
        icon: BriefcaseBusiness,
        tone: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/12 dark:text-blue-200 dark:border-blue-500/25',
    },
    account_status_changed: {
        label: 'Account',
        icon: ShieldCheck,
        tone: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/12 dark:text-violet-200 dark:border-violet-500/25',
    },
    general: {
        label: 'Notification',
        icon: Bell,
        tone: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-white/10 dark:text-white dark:border-white/10',
    },
}

function getTypeConfig(type) {
    return TYPE_CONFIG[type] || TYPE_CONFIG.general
}

function NotifRow({ notif, onClick, isPending }) {
    const config = getTypeConfig(notif.type)
    const Icon = config.icon

    return (
        <button
            type="button"
            onClick={() => onClick?.(notif)}
            className={`w-full text-left rounded-[24px] px-6 py-5 border shadow-[0_10px_30px_rgba(16,24,40,0.04)] transition-colors ${notif.read
                ? 'bg-[var(--color-surface)] border-border'
                : 'bg-[#F6F8F7] border-[#E1E6E3] dark:bg-[rgba(255,255,255,0.06)] dark:border-white/10'
                } ${isPending ? 'opacity-70 cursor-wait' : 'cursor-pointer hover:bg-mist dark:hover:bg-white/10'}`}
        >
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center flex-shrink-0 ${config.tone}`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.tone}`}>
                                    {config.label}
                                </span>
                                {!notif.read && <span className="inline-flex h-2 w-2 rounded-full bg-primary" />}
                            </div>
                            <p className="text-[14px] font-bold text-text-1">{notif.title}</p>
                        </div>
                        <span className="text-[12px] text-text-4 whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-[13px] text-text-3 leading-relaxed">{notif.body}</p>
                    {notif.deliveredAt && (
                        <p className="mt-3 text-[12px] text-text-4">{notif.deliveredAt}</p>
                    )}
                </div>
            </div>
        </button>
    )
}

export function NotificationPanel({
    isOpen,
    onClose,
    notifications = [],
    isLoading = false,
    isError = false,
    onRetry,
    onNotificationClick,
    pendingNotificationId = null,
}) {
    const [filter, setFilter] = useState('unread')
    const [dropOpen, setDropOpen] = useState(false)
    const dropRef = useRef(null)

    useEffect(() => {
        if (!dropOpen) return
        const handler = (event) => {
            if (dropRef.current && !dropRef.current.contains(event.target)) {
                setDropOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [dropOpen])

    const filteredNotifications = filter === 'unread'
        ? notifications.filter((notification) => !notification.read)
        : notifications
    const unreadCount = notifications.filter((notification) => !notification.read).length

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        key="notifications-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-[2px]"
                    />

                    <motion.div
                        key="notifications-panel"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className="fixed top-0 right-0 bottom-0 z-[91] w-full md:w-[560px] bg-white dark:bg-surface border-l border-border shadow-2xl flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-6 lg:px-7 py-5 border-b border-border flex-shrink-0">
                            <h4 className="text-[14px] font-bold text-text-1">My notification({unreadCount})</h4>

                            <div className="flex items-center gap-4">
                                <div ref={dropRef} className="relative">
                                    <button
                                        onClick={() => setDropOpen((open) => !open)}
                                        className="h-9 px-4 rounded-full border border-border text-[13px] font-medium text-text-2 bg-[var(--color-surface)] dark:bg-[rgba(255,255,255,0.04)] flex items-center gap-1.5 shadow-sm"
                                    >
                                        {filter === 'all' ? 'All' : 'Unread'}
                                        <ChevronDown size={13} />
                                    </button>

                                    <AnimatePresence>
                                        {dropOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                className="absolute top-[110%] right-0 bg-[var(--color-surface)] dark:bg-[#18211C] border border-border rounded-[18px] shadow-xl z-10 min-w-[190px] overflow-hidden"
                                            >
                                                {[{ key: 'all', label: 'All notifications' }, { key: 'unread', label: 'Unread' }].map((option) => (
                                                    <button
                                                        key={option.key}
                                                        onClick={() => {
                                                            setFilter(option.key)
                                                            setDropOpen(false)
                                                        }}
                                                        className={`block w-full px-4 py-3 text-[13px] text-left transition-colors ${filter === option.key
                                                            ? 'font-bold text-primary bg-mist dark:bg-white/10'
                                                            : 'font-medium text-text-2 hover:bg-mist dark:hover:bg-white/5'
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button onClick={onClose} className="text-text-1 hover:text-primary transition-colors" aria-label="Close notifications">
                                    <X size={22} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 lg:px-7 py-4 space-y-4 bg-[#FAFAFA] dark:bg-surface">
                            {isLoading ? (
                                <div className="py-12 text-center text-[14px] text-text-4">Loading notifications...</div>
                            ) : isError ? (
                                <div className="py-12 text-center">
                                    <p className="text-[14px] text-text-3 mb-3">Failed to load notifications</p>
                                    <button
                                        onClick={() => onRetry?.()}
                                        className="px-4 py-2 rounded-full border border-primary bg-primary text-white text-[12px] font-bold"
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="py-12 text-center text-[14px] text-text-4">No notifications</div>
                            ) : (
                                filteredNotifications.map((notification) => (
                                    <NotifRow
                                        key={notification.id}
                                        notif={notification}
                                        isPending={pendingNotificationId === notification.id}
                                        onClick={onNotificationClick}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
