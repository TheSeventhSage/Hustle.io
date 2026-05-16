import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../src/services/api.client.js'

describe('apiClient body serialization', () => {
  const originalFetch = globalThis.fetch
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
    globalThis.fetch = originalFetch
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
    })
    vi.restoreAllMocks()
  })

  it('serializes plain object POST bodies to JSON strings', async () => {
    let capturedBody = null
    let capturedContentType = null

    globalThis.fetch = vi.fn(async (input, init) => {
      if (init?.body != null) {
        capturedBody = typeof init.body === 'string' ? init.body : String(init.body)
        capturedContentType = new Headers(init.headers).get('content-type')
      } else {
        const request = input instanceof Request ? input : new Request(input)
        capturedBody = await request.clone().text()
        capturedContentType = request.headers.get('content-type')
      }

      return new Response(JSON.stringify({ success: true, data: { item: { id: 1 } } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const payload = { title: 'Cleaning agency needed', budget_amount: 25000 }
    const response = await apiClient('/hustles', { method: 'POST', body: payload })

    expect(capturedBody).toBe(JSON.stringify(payload))
    expect(capturedContentType).toBe('application/json')
    expect(response?.data?.success).toBe(true)
  })
})
