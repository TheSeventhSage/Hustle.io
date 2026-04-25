import { useState, useRef, useEffect } from 'react'
import { Search, Phone, Info, Paperclip, Send, MoreVertical } from 'lucide-react'

// ── Seed data ────────────────────────────────────────────────────────────────
const SEED_CONVERSATIONS = [
  {
    id: 'c1',
    user: { id: 'u1', name: 'Wade Warren', avatar: null },
    lastMessage: "I'm doing well, thank you! How can I help you today?",
    timestamp: '08:16 AM',
    unread: 1,
  },
  {
    id: 'c2',
    user: { id: 'u2', name: 'Blessed Jane', avatar: null },
    lastMessage: "I'm doing well, thank you! How can I help you today?",
    timestamp: '08:16 AM',
    unread: 0,
  },
  {
    id: 'c3',
    user: { id: 'u3', name: 'Wade Warren', avatar: null },
    lastMessage: "I'm doing well, thank you! How can I help you today?",
    timestamp: '08:16 AM',
    unread: 0,
  },
  {
    id: 'c4',
    user: { id: 'u4', name: 'Wade Warren', avatar: null },
    lastMessage: "I'm doing well, thank you! How can I help you today?",
    timestamp: '08:16 AM',
    unread: 0,
  },
]

const SEED_MESSAGES = {
  c2: [
    { id: 'm1', senderId: 'me', content: 'Hello, how are you doing?', timestamp: '08:15 AM', status: 'read' },
    { id: 'm2', senderId: 'u2', content: "I'm doing well, thank you! How can I help you today?", timestamp: '08:16 AM', status: null },
    { id: 'm3', senderId: 'u2', content: null, isTyping: true, timestamp: '08:16 AM', status: null },
    { id: 'm4', senderId: 'me', content: 'Hello, how are you doing?', timestamp: '08:15 AM', status: 'sent' },
  ],
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ name, avatar, size = 40, online = false }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-white font-bold"
          style={{ background: 'linear-gradient(135deg, #1E4D35, #0A2318)', fontSize: size * 0.35 }}
        >
          {initials}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success ring-2 ring-white" />
      )}
    </div>
  )
}

function MessageStatus({ status }) {
  if (!status) return null
  if (status === 'read') {
    return (
      <span className="flex items-center gap-0.5">
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <path d="M1 5l3 3 5-6" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 5l3 3 5-6" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  return (
    <span className="flex items-center gap-0.5">
      <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
        <path d="M1 5l3 3 5-6" stroke="#9AA49E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 5l3 3 5-6" stroke="#9AA49E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-text-3"
          style={{ animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  )
}

// ── Conversation list item ────────────────────────────────────────────────────
function ConversationItem({ conv, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors ${isActive ? 'bg-mist' : 'hover:bg-mist/50'}`}
    >
      <Avatar name={conv.user.name} avatar={conv.user.avatar} size={42} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-[13px] font-bold text-text-1 truncate">{conv.user.name}</p>
          <span className="text-[11px] text-text-3 flex-shrink-0 ml-2">{conv.timestamp}</span>
        </div>
        <p className="text-[12px] text-text-2 line-clamp-2 leading-relaxed">{conv.lastMessage}</p>
      </div>
      {conv.unread > 0 && (
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
          {conv.unread}
        </span>
      )}
    </button>
  )
}

// ── Chat bubble ───────────────────────────────────────────────────────────────
function ChatBubble({ msg, convUser }) {
  const isMe = msg.senderId === 'me'

  if (msg.isTyping) {
    return (
      <div className="flex items-end gap-2.5 justify-start">
        <Avatar name={convUser.name} avatar={convUser.avatar} size={32} />
        <div className="bg-surface border border-border rounded-2xl rounded-bl-sm shadow-sm">
          <TypingIndicator />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && <Avatar name={convUser.name} avatar={convUser.avatar} size={32} />}
      <div className={`max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${isMe
            ? 'bg-primary text-white rounded-br-sm'
            : 'bg-surface border border-border text-text-1 rounded-bl-sm shadow-sm'
            }`}
        >
          {msg.content}
        </div>
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[10px] text-text-3">{msg.timestamp}</span>
          {isMe && <MessageStatus status={msg.status} />}
        </div>
      </div>
    </div>
  )
}

// ── Empty chat state ──────────────────────────────────────────────────────────
function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
      <div className="w-16 h-16 rounded-full bg-mist flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </div>
      <div>
        <p className="text-[14px] font-bold text-text-1 mb-1">Select a conversation</p>
        <p className="text-[12px] text-[#9AA49E]">Choose a conversation from the list to start messaging</p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const [conversations] = useState(SEED_CONVERSATIONS)
  const [activeConvId, setActiveConvId] = useState('c2')
  const [messages, setMessages] = useState(SEED_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef(null)

  const activeConv = conversations.find(c => c.id === activeConvId)
  const activeMessages = activeConvId ? (messages[activeConvId] || []) : []

  const filteredConvs = conversations.filter(c =>
    c.user.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages])

  const handleSend = () => {
    if (!inputValue.trim() || !activeConvId) return
    const newMsg = {
      id: `m${Date.now()}`,
      senderId: 'me',
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    }
    setMessages(prev => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg],
    }))
    setInputValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Determine online status (mock: c2 is online)
  const isOnline = activeConvId === 'c2'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto h-full flex flex-col">
      <h1 className="text-xl font-extrabold text-[#0A1A12] tracking-tight mb-5">Messages</h1>

      <div className="flex-1 min-h-0 flex rounded-2xl border border-[#E8EAE4] bg-white overflow-hidden shadow-sm">

        {/* ── Conversation list ─────────────────────────────────── */}
        <div className="w-[300px] xl:w-[320px] flex-shrink-0 flex flex-col border-r border-[#EAECE6]">
          {/* Search */}
          <div className="p-3 border-b border-[#EAECE6]">
            <label className="flex items-center gap-2.5 h-10 bg-[#F4F5F0] rounded-xl px-3.5 ring-1 ring-transparent focus-within:ring-[#0A2318]/20 focus-within:bg-white transition-all cursor-text">
              <Search size={14} className="text-[#9AA49E] flex-shrink-0" strokeWidth={2} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for messages or hustlers"
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-[12px] text-[#0A1A12] placeholder:text-[#9AA49E] font-medium"
              />
            </label>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map(conv => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                onClick={() => setActiveConvId(conv.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Chat area ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeConv ? (
            <>
              {/* Chat header */}
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-[#EAECE6] bg-white">
                <div className="flex items-center gap-3">
                  <Avatar name={activeConv.user.name} avatar={activeConv.user.avatar} size={40} online={isOnline} />
                  <div>
                    <p className="text-[14px] font-bold text-[#0A1A12] leading-tight">{activeConv.user.name}</p>
                    {isOnline ? (
                      <p className="text-[12px] text-[#4ADE80] font-medium leading-tight">Online</p>
                    ) : (
                      <p className="text-[12px] text-[#9AA49E] leading-tight">Last seen 10 mins ago</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="w-9 h-9 flex items-center justify-center rounded-xl text-[#5A6A60] hover:bg-[#F0F2EC] transition-colors">
                    <Phone size={17} strokeWidth={1.8} />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-xl text-[#5A6A60] hover:bg-[#F0F2EC] transition-colors">
                    <Info size={17} strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                {activeMessages.map(msg => (
                  <ChatBubble key={msg.id} msg={msg} convUser={activeConv.user} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5 border-t border-[#EAECE6] bg-white">
                <button className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-[#9AA49E] hover:text-[#0A2318] hover:bg-[#F0F2EC] transition-all">
                  <Paperclip size={17} strokeWidth={1.8} />
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message"
                  className="flex-1 min-w-0 h-11 px-4 bg-[#F4F5F0] rounded-xl border-none outline-none text-[13px] text-[#0A1A12] placeholder:text-[#9AA49E] font-medium focus:bg-white focus:ring-2 focus:ring-[#0A2318]/10 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${inputValue.trim()
                    ? 'bg-primary hover:bg-primary-btn active:scale-95 text-white shadow-sm'
                    : 'bg-border text-text-3 cursor-not-allowed'
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

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
