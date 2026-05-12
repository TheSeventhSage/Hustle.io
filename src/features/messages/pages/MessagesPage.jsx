import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Phone, Info, Paperclip, Send, Menu, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'
import { messagesService } from '../messages.service.js'
import useAuthStore from '../../auth/auth.store.js'
import useUIStore from '../../../shared/store/ui.store.js'
import { getApiMessage } from '../../../shared/utils/apiResponse.js'

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function Avatar({ name, avatar, size = 40, online = false }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {avatar ? (
        <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full text-white font-bold"
          style={{ background: 'linear-gradient(135deg, #1E4D35, #0A2318)', fontSize: size * 0.35 }}
        >
          {getInitials(name)}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
      )}
    </div>
  )
}

function getConversationDisplayName(conv, currentUserId) {
  const other = conv?.participants?.find(p => p.account_id !== currentUserId)
  const participantName = other ? `${other.first_name ?? ''} ${other.last_name ?? ''}`.trim() : ''
  const patchedName = conv?.other_participant_name
    || [conv?.other_participant_first_name, conv?.other_participant_last_name].filter(Boolean).join(' ')
    || conv?.other_participant_company_name

  return participantName || patchedName || conv?.title || 'Conversation'
}

function MessageStatus({ status }) {
  if (!status) return null
  const color = status === 'read' ? '#4ADE80' : '#9AA49E'
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
      <path d="M1 5l3 3 5-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 5l3 3 5-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-text-3"
          style={{ animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  )
}

function ConversationItem({ conv, isActive, onClick, currentUserId }) {
  const displayName = getConversationDisplayName(conv, currentUserId)

  const lastMsg = conv.last_message ?? conv.lastMessage ?? ''
  const timestamp = formatTime(conv.last_message_at ?? conv.updated_at)
  const unread = conv.unread_count ?? 0
  const avatar = conv.other_participant_profile_image_url

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3.5 text-left transition-colors ${isActive ? 'bg-mist' : 'hover:bg-mist/50'}`}
    >
      <div className="flex items-start gap-3">
        <Avatar name={displayName} avatar={avatar} size={42} />
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center justify-between">
            <p className="truncate text-[13px] font-bold text-text-1">{displayName}</p>
            <span className="ml-2 flex-shrink-0 text-[11px] text-text-3">{timestamp}</span>
          </div>
          <p className="line-clamp-2 text-[12px] leading-relaxed text-text-2">{lastMsg}</p>
        </div>
        {unread > 0 && (
          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </div>
    </button>
  )
}

function ChatBubble({ msg, currentUserId, otherName }) {
  const isMe = msg.sender_account_id === currentUserId || msg.senderId === 'me'

  if (msg.isTyping) {
    return (
      <div className="flex items-end gap-2.5 justify-start">
        <Avatar name={otherName} size={32} />
        <div className="rounded-2xl rounded-bl-sm border border-border bg-surface shadow-sm">
          <TypingIndicator />
        </div>
      </div>
    )
  }

  const content = msg.message_body ?? msg.content ?? ''
  const time = formatTime(msg.sent_at ?? msg.timestamp)

  return (
    <div className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && <Avatar name={otherName} size={32} />}
      <div className={`flex max-w-[85%] flex-col sm:max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${isMe
            ? 'bg-primary text-white rounded-br-sm'
            : 'rounded-bl-sm border border-border bg-surface text-text-1 shadow-sm'
            }`}
        >
          {content}
        </div>
        <div className="mt-1 flex items-center gap-1 px-1">
          <span className="text-[10px] text-text-3">{time}</span>
          {isMe && <MessageStatus status={msg.status} />}
        </div>
      </div>
    </div>
  )
}

function EmptyChatState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mist">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </div>
      <div>
        <p className="mb-1 text-[14px] font-bold text-text-1">Select a conversation</p>
        <p className="text-[12px] text-text-4">Choose a conversation from the list to start messaging</p>
      </div>
    </div>
  )
}

function ConvSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 animate-pulse">
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-mist" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/2 rounded bg-mist" />
        <div className="h-3 w-3/4 rounded bg-mist" />
      </div>
    </div>
  )
}

function ConversationsPanel({
  search,
  setSearch,
  convsLoading,
  convsError,
  filteredConvs,
  activeConvId,
  setActiveConvId,
  currentUserId,
  onConversationSelect,
}) {
  return (
    <div className="flex h-full flex-col border-r border-border bg-[var(--color-surface)]">
      <div className="border-b border-border p-3">
        <label className="flex h-10 cursor-text items-center gap-2.5 rounded-xl bg-mist px-3.5 ring-1 ring-transparent transition-all focus-within:bg-[var(--color-surface)] focus-within:ring-primary/20">
          <Search size={14} className="flex-shrink-0 text-text-4" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations"
            className="min-w-0 flex-1 border-none bg-transparent text-[12px] font-medium text-text-1 outline-none placeholder:text-text-4"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto">
        {convsLoading ? (
          [1, 2, 3, 4].map(i => <ConvSkeleton key={i} />)
        ) : convsError ? (
          <div className="p-4 text-center text-[13px] text-text-4">
            Failed to load conversations
          </div>
        ) : filteredConvs.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-text-4">
            No conversations yet
          </div>
        ) : (
          filteredConvs.map(conv => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeConvId}
              onClick={() => {
                setActiveConvId(conv.id)
                onConversationSelect?.()
              }}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const currentUser = useAuthStore(s => s.user)
  const currentUserId = currentUser?.id ?? currentUser?.account_id
  const { id: routeConvId } = useParams()
  const [searchParams] = useSearchParams()

  const [activeConvId, setActiveConvId] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [search, setSearch] = useState('')
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const drawerRef = useRef(null)
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()

  const {
    data: convsData,
    isLoading: convsLoading,
    isError: convsError,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: messagesService.getConversations,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  })

  const conversations = convsData?.data?.data?.items ?? convsData?.data?.items ?? []

  useEffect(() => {
    setSearch(searchParams.get('q') || '')
  }, [searchParams])

  useEffect(() => {
    if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0].id)
    }
  }, [conversations, activeConvId])

  useEffect(() => {
    if (routeConvId) {
      setActiveConvId(Number.isNaN(Number(routeConvId)) ? routeConvId : Number(routeConvId))
    }
  }, [routeConvId])

  useEffect(() => {
    if (routeConvId || activeConvId) {
      setMobileListOpen(false)
    }
  }, [routeConvId, activeConvId])

  useEffect(() => {
    const handler = (e) => {
      if (mobileListOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMobileListOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileListOpen])

  useEffect(() => {
    document.body.style.overflow = mobileListOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileListOpen])

  const {
    data: threadData,
    isLoading: threadLoading,
  } = useQuery({
    queryKey: ['conversations', 'thread', activeConvId],
    queryFn: () => messagesService.getConversation(activeConvId),
    enabled: Boolean(activeConvId),
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
  })

  const threadMessages = threadData?.data?.data?.messages ?? threadData?.data?.messages ?? []
  const activeConvMeta = conversations.find(c => c.id === activeConvId)

  const otherName = getConversationDisplayName(activeConvMeta, currentUserId)
  const otherAvatar = activeConvMeta?.other_participant_profile_image_url

  const { mutate: sendMsg, isPending: sending } = useMutation({
    mutationFn: ({ convId, body }) =>
      messagesService.sendMessage(convId, { message_body: body }),
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ['conversations', 'thread', activeConvId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toastSuccess(getApiMessage(response, 'Message sent.'))
    },
    onError(error) {
      toastError(error?.message ?? 'Failed to send message.')
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadMessages])

  const handleSend = () => {
    if (!inputValue.trim() || !activeConvId || sending) return
    sendMsg({ convId: activeConvId, body: inputValue.trim() })
    setInputValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filteredConvs = conversations.filter(conv => {
    if (!search) return true
    const name = getConversationDisplayName(conv, currentUserId)
    return name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="mx-auto flex h-full max-w-screen-xl flex-col p-4 sm:p-6 lg:p-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight text-text-1">Messages</h1>
        <button
          type="button"
          onClick={() => setMobileListOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 md:hidden"
          style={{ background: 'var(--color-surface)', color: 'var(--color-text-1)' }}
        >
          <Menu size={18} />
          <span className="text-sm font-semibold">Chats</span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-[var(--color-surface)] shadow-sm">
        <div className="hidden flex-shrink-0 w-[250px] md:flex xl:w-[320px]">
          <ConversationsPanel
            search={search}
            setSearch={setSearch}
            convsLoading={convsLoading}
            convsError={convsError}
            filteredConvs={filteredConvs}
            activeConvId={activeConvId}
            setActiveConvId={setActiveConvId}
            currentUserId={currentUserId}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {activeConvId ? (
            <>
              <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-[var(--color-surface)] px-4 py-3.5 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileListOpen(true)}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-text-3 hover:bg-mist md:hidden"
                  >
                    <Menu size={18} />
                  </button>
                  <Avatar name={otherName} avatar={otherAvatar} size={40} />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold leading-tight text-text-1">{otherName}</p>
                    <p className="truncate text-[12px] leading-tight text-text-4">
                      {activeConvMeta?.conversation_type
                        ? activeConvMeta.conversation_type.replace('_', ' ')
                        : 'Direct message'}
                    </p>
                  </div>
                </div>
                <div className="ml-3 flex items-center gap-1">
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl text-text-3 transition-colors hover:bg-mist">
                    <Phone size={17} strokeWidth={1.8} />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-xl text-text-3 transition-colors hover:bg-mist">
                    <Info size={17} strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-[var(--color-bg)] px-4 py-5 sm:px-5">
                {threadLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : threadMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="mb-1 text-[14px] font-semibold text-text-1">No messages yet</p>
                    <p className="text-[12px] text-text-4">Send a message to start the conversation</p>
                  </div>
                ) : (
                  threadMessages.map(msg => (
                    <ChatBubble
                      key={msg.id}
                      msg={msg}
                      currentUserId={currentUserId}
                      otherName={otherName}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex flex-shrink-0 items-center gap-2 border-t border-border bg-[var(--color-surface)] px-3 py-3.5 sm:gap-3 sm:px-4">
                <button className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-text-4 transition-all hover:bg-mist hover:text-text-1">
                  <Paperclip size={17} strokeWidth={1.8} />
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message"
                  className="h-11 min-w-0 flex-1 rounded-xl border-none bg-mist px-4 text-[13px] font-medium text-text-1 outline-none transition-all placeholder:text-text-4 focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-primary/10"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || sending}
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all ${inputValue.trim() && !sending
                    ? 'bg-primary text-white shadow-sm hover:bg-primary-sat active:scale-95'
                    : 'cursor-not-allowed bg-border text-text-3'
                    }`}
                  aria-label="Send message"
                >
                  <Send size={16} strokeWidth={2} />
                </button>
              </div>
            </>
          ) : (
            <EmptyChatState />
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileListOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileListOpen(false)}
              className="fixed inset-0 z-40 bg-black/45 md:hidden"
            />
            <motion.aside
              ref={drawerRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[360px] md:hidden"
              style={{
                background: 'var(--color-surface)',
                borderRight: '1px solid var(--color-border)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
              }}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-border px-4 py-4">
                  <div>
                    <h2 className="text-base font-bold text-text-1">Conversations</h2>
                    <p className="mt-1 text-xs text-text-3">
                      {filteredConvs.length} chat{filteredConvs.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileListOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-2"
                  >
                    <X size={18} />
                  </button>
                </div>

                <ConversationsPanel
                  search={search}
                  setSearch={setSearch}
                  convsLoading={convsLoading}
                  convsError={convsError}
                  filteredConvs={filteredConvs}
                  activeConvId={activeConvId}
                  setActiveConvId={setActiveConvId}
                  currentUserId={currentUserId}
                  onConversationSelect={() => setMobileListOpen(false)}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
