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

  profiles: {
    public: (id)          => ['profiles', 'public', id],
    certifications: (id, endpoint) => ['profiles', 'public', id, 'certifications', endpoint],
    services: (id, endpoint) => ['profiles', 'public', id, 'services', endpoint],
    publicServices: (id) => ['profiles', 'public', id, 'services-list'],
    serviceDetail: (accountId, serviceId) => ['profiles', 'public', accountId, 'service-detail', serviceId],
  },

  insurance: {
    rates: (params)       => ['insurance', 'rates', params],
  },

  bookings: {
    offer: (id)           => ['bookings', 'offer', id],
  },

  countries: {
    list: (params)        => ['countries', 'list', params],
  },

  cities: {
    list: (params)        => ['cities', 'list', params],
  },

  cityAccess: {
    all:  ()              => ['city-access'],
    list: (params)        => ['city-access', 'list', params],
  },

  jobs: {
    all:         ()       => ['jobs'],
    mine:        (params) => ['jobs', 'mine', params],
    detail:      (id)     => ['jobs', 'detail', id],
    reviews:     (params) => ['jobs', 'reviews', params],
  },

  wallet: {
    summary:      ()      => ['wallet', 'summary'],
    transactions: (params)=> ['wallet', 'transactions', params],
  },

  messages: {
    conversations: ()     => ['messages', 'conversations'],
    thread: (id)          => ['messages', 'thread', id],
  },

  notifications: {
    list: ()              => ['notifications', 'list'],
  },

  settings: {
    notifications: ()     => ['settings', 'notifications'],
  },
}
