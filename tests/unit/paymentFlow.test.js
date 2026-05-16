import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  runPaymentFlow,
  PAYMENT_SESSION_TYPES,
  reconcileStoredPayment,
} from '../../src/shared/utils/paymentFlow.js'
import { storage } from '../../src/services/storage.js'

function buildInitResponse(overrides = {}) {
  return {
    data: {
      success: true,
      data: {
        item: {
          access_code: 'access_code_123',
          reference: 'pay_ref_123',
          authorization_url: 'https://checkout.paystack.com/test',
          status: 'pending',
          ...overrides,
        },
      },
    },
  }
}

describe('paymentFlow', () => {
  const originalLocalStorage = globalThis.localStorage

  afterEach(() => {
    storage.clearAll()
    delete window.PaystackPop
    vi.restoreAllMocks()
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
    })
  })

  it('passes callback_url to initialization and verifies through popup callbacks', async () => {
    const store = new Map()
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
      },
      configurable: true,
    })

    const initializePayment = vi.fn().mockResolvedValue(buildInitResponse())
    const verifyPayment = vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          item: {
            reference: 'pay_ref_123',
            status: 'success',
          },
        },
      },
    })
    const onPaymentSuccess = vi.fn()

    window.PaystackPop = class MockPaystackPop {
      resumeTransaction(reference) {
        expect(reference).toBe('access_code_123')
        queueMicrotask(() => {
          this.onSuccess?.({ reference: 'pay_ref_123' })
        })
      }
    }

    const result = await runPaymentFlow({
      initializePayment,
      verifyPayment,
      sessionType: PAYMENT_SESSION_TYPES.booking,
      returnUrl: 'https://app.example.com/my-hustles?tab=bookings',
      onPaymentSuccess,
    })

    expect(initializePayment).toHaveBeenCalledWith({
      forceNew: false,
      callbackUrl: 'https://app.example.com/my-hustles?tab=bookings',
    })
    expect(verifyPayment).toHaveBeenCalledWith('pay_ref_123')
    expect(onPaymentSuccess).toHaveBeenCalled()
    expect(result.kind).toBe('verified')
    expect(storage.payments.getSession(PAYMENT_SESSION_TYPES.booking)).toBeNull()
  })

  it('verifies redirected payments even when the stored session is missing', async () => {
    const store = new Map()
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
      },
      configurable: true,
    })

    const verifyPayment = vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          item: {
            reference: 'redirect_ref_123',
            status: 'success',
          },
        },
      },
    })
    const onSuccess = vi.fn()
    const setSearchParams = vi.fn()

    const handled = await reconcileStoredPayment({
      sessionType: PAYMENT_SESSION_TYPES.hustle,
      searchParams: new URLSearchParams('tab=pending&reference=redirect_ref_123'),
      setSearchParams,
      verifyPayment,
      onSuccess,
    })

    expect(handled).toBe(true)
    expect(verifyPayment).toHaveBeenCalledWith('redirect_ref_123')
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        pendingPayment: null,
        paymentRef: 'redirect_ref_123',
        status: 'success',
        validationState: 'missing',
      })
    )
    expect(setSearchParams).toHaveBeenCalled()
  })
})
