import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storage } from '../../src/services/storage.js'
import { mergeStoredUser } from '../../src/features/auth/authUser.js'

describe('auth user merging', () => {
  const originalLocalStorage = globalThis.localStorage

  beforeEach(() => {
    const store = new Map()
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
      },
      configurable: true,
    })
  })

  afterEach(() => {
    storage.clearAll()
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
    })
  })

  it('preserves stored first and last names when a refresh payload only contains id and role', () => {
    storage.setUser({
      id: 7,
      role: 'client',
      first_name: 'Ada',
      last_name: 'Client',
      email: 'ada@example.com',
    })

    const merged = mergeStoredUser({
      id: 7,
      role: 'client',
    })

    expect(merged).toEqual({
      id: 7,
      role: 'client',
      first_name: 'Ada',
      last_name: 'Client',
      email: 'ada@example.com',
    })
  })
})
