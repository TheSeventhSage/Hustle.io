/**
 * query-keys.js
 * Central factory for all TanStack Query cache keys.
 * Never write raw string keys in hooks — always import from here.
 *
 * Pattern: queryKeys.feature.operation(params)
 */

export const queryKeys = {
  auth: {
    me: ()                => ['auth', 'me'],
  },

  hustles: {
    all:          ()      => ['hustles'],
    list:         (params)=> ['hustles', 'list', params],
    detail:       (id)    => ['hustles', 'detail', id],
    mine:         (params)=> ['hustles', 'mine', params],
    applications: (params)=> ['hustles', 'applications', params],
    reviews:      (id)    => ['hustles', 'reviews', id],
  },

  hustlers: {
    all:     ()           => ['hustlers'],
    list:    (params)     => ['hustlers', 'list', params],
    profile: (id)         => ['hustlers', 'profile', id],
  },

  bookings: {
    offer: (id)           => ['bookings', 'offer', id],
  },

  wallet: {
    summary:      ()      => ['wallet', 'summary'],
    transactions: (params)=> ['wallet', 'transactions', params],
  },

  messages: {
    conversations: ()     => ['messages', 'conversations'],
    thread: (id)          => ['messages', 'thread', id],
  },

  settings: {
    notifications: ()     => ['settings', 'notifications'],
  },
}
