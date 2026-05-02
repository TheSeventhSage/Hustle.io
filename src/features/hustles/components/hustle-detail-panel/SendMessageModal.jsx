import { useState } from 'react'
import { X, Send, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../../../services/api.client.js'
import useUIStore from '../../../../shared/store/ui.store.js'

/**
 * SendMessageModal
 * Opens when the chat icon is clicked on an applicant detail view.
 * Finds the existing conversation (from the application's conversation_id or
 * by scanning GET /conversations) and sends a message via
 * POST /conversations/{id}/messages.
 * On success, navigates to /messages/{conversationId}.
 */
export function SendMessageModal({ isOpen, onClose, applicant }) {
    const [body, setBody] = useState('')
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { toastError, toastSuccess } = useUIStore()

    // The conversation_id may be on the raw application object
    const rawConvId = applicant?._raw?.conversation_id ?? null

    // GET /conversations — find the conversation with this artisan if no direct id
    const { data: convsData } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => apiClient('/conversations'),
        enabled: isOpen && !rawConvId,
        staleTime: 30 * 1000,
    })

    const conversations = convsData?.data?.data?.items ?? convsData?.data?.items ?? []

    // Resolve conversation id — prefer the one on the application, then scan the list
    const artisanAccountId = applicant?._raw?.artisan_account_id
    const resolvedConvId = rawConvId ?? conversations.find(c =>
        c.participants?.some(p => p.account_id === artisanAccountId)
    )?.id ?? null

    // POST /conversations/{id}/messages
    const { mutate: sendMessage, isPending } = useMutation({
        mutationFn: async (messageBody) => {
            if (!resolvedConvId) {
                throw new Error('No conversation found with this artisan. Accept their offer first to start a conversation.')
            }
            // Use fetch directly to avoid any body serialization issues with callapi
            const { storage } = await import('../../../../services/storage.js')
            const token = storage.getToken()
            const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'
            const res = await fetch(`${baseURL}/conversations/${resolvedConvId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ message_body: messageBody }),
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.message || `HTTP ${res.status}`)
            }
            return res.json()
        },
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
            queryClient.invalidateQueries({ queryKey: ['conversations', 'thread', resolvedConvId] })
            toastSuccess('Message sent!')
            setBody('')
            onClose()
            navigate(`/messages/${resolvedConvId}`)
        },
        onError(err) {
            toastError(err?.message ?? 'Failed to send message.')
        },
    })

    const handleSend = () => {
        if (!body.trim() || isPending) return
        sendMessage(body.trim())
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleClose = () => {
        setBody('')
        onClose()
    }

    const artisanName = applicant?.name ?? 'this artisan'

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="msg-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        key="msg-modal"
                        role="dialog"
                        aria-label={`Send message to ${artisanName}`}
                        aria-modal="true"
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 12 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-[440px] pointer-events-auto overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <MessageSquare size={17} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-[15px] font-bold text-text-1">Send a message</h3>
                                        <p className="text-[12px] text-text-4">To: {artisanName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-mist transition-all"
                                    aria-label="Close"
                                >
                                    <X size={15} className="text-text-3" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-5">
                                {!resolvedConvId && (
                                    <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                                        <p className="text-[12px] text-amber-700 font-medium">
                                            A conversation will be available once you accept this applicant's offer.
                                        </p>
                                    </div>
                                )}

                                <textarea
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={`Write a message to ${artisanName}...`}
                                    rows={4}
                                    disabled={!resolvedConvId}
                                    className="w-full px-4 py-3 bg-mist dark:bg-white/5 border border-border rounded-xl text-[13px] text-text-1 placeholder:text-text-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />

                                <p className="text-[11px] text-text-4 mt-1.5 text-right">
                                    Press Enter to send, Shift+Enter for new line
                                </p>

                                {/* Actions */}
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 h-11 border border-border rounded-full text-[14px] font-semibold text-text-2 hover:bg-mist transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={!body.trim() || isPending || !resolvedConvId}
                                        className={`flex-1 h-11 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 transition-all ${body.trim() && !isPending && resolvedConvId
                                            ? 'bg-primary text-white hover:bg-primary-sat active:scale-[0.98]'
                                            : 'bg-border text-text-3 cursor-not-allowed'
                                            }`}
                                    >
                                        {isPending ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={15} />
                                                Send message
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
