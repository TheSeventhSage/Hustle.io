/**
 * socket.client.js
 * Lazy-loaded socket.io wrapper. Only imported inside features/messages/.
 * Auto-reconnect, room management, typed event emitters.
 *
 * Usage:
 *   const socket = await getSocket()
 *   socket.joinConversation(conversationId)
 *   socket.onMessage((msg) => handleMessage(msg))
 */

import { storage } from '../../services/storage.js'

let socketInstance = null

async function loadSocketIO() {
  // Dynamic import — socket.io-client never enters the initial bundle
  const { io } = await import('socket.io-client')
  return io
}

export async function getSocket() {
  if (socketInstance?.connected) return socketInstance

  const io = await loadSocketIO()

  socketInstance = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000', {
    auth: { token: storage.getToken() },
    transports:       ['websocket'],
    reconnection:     true,
    reconnectionDelay:1000,
    reconnectionAttempts: 5,
  })

  socketInstance.on('connect_error', (err) => {
    console.error('[socket] connection error:', err.message)
  })

  // Typed API over the raw socket
  return {
    get connected() { return socketInstance.connected },

    joinConversation(conversationId) {
      socketInstance.emit('conversation:join', { conversationId })
    },

    leaveConversation(conversationId) {
      socketInstance.emit('conversation:leave', { conversationId })
    },

    sendMessage(conversationId, content) {
      socketInstance.emit('message:send', { conversationId, content })
    },

    onMessage(cb) {
      socketInstance.on('message:new', cb)
      return () => socketInstance.off('message:new', cb)
    },

    onTyping(cb) {
      socketInstance.on('user:typing', cb)
      return () => socketInstance.off('user:typing', cb)
    },

    emitTyping(conversationId) {
      socketInstance.emit('user:typing', { conversationId })
    },

    disconnect() {
      socketInstance?.disconnect()
      socketInstance = null
    },
  }
}

export function disconnectSocket() {
  socketInstance?.disconnect()
  socketInstance = null
}
