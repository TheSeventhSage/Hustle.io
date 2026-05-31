import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getPaymentStatus,
  isCompletedPaymentStatus,
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
    delete window.Paystack
    window.PaystackPop = class MockPaystackPop {}
    vi.restoreAllMocks()
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
    })
  })

  it('verifies through inline popup callbacks without requiring callback_url', async () => {
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
      resumeTransaction(reference, callbacks) {
        expect(reference).toBe('access_code_123')
        queueMicrotask(() => {
          callbacks?.onSuccess?.({ reference: 'pay_ref_123' })
        })
      }
    }

    const result = await runPaymentFlow({
      initializePayment,
      verifyPayment,
      sessionType: PAYMENT_SESSION_TYPES.booking,
      onPaymentSuccess,
    })

    expect(initializePayment).toHaveBeenCalledWith({ forceNew: false })
    expect(verifyPayment).toHaveBeenCalledWith('pay_ref_123')
    expect(onPaymentSuccess).toHaveBeenCalled()
    expect(result.kind).toBe('verified')
    expect(storage.payments.getSession(PAYMENT_SESSION_TYPES.booking)).toBeNull()
  })

  it('verifies through an existing window.Paystack object client', async () => {
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

    window.Paystack = {
      resumeTransaction(reference, callbacks) {
        expect(reference).toBe('access_code_123')
        queueMicrotask(() => {
          callbacks?.onSuccess?.({ reference: 'pay_ref_123' })
        })
      },
    }

    const result = await runPaymentFlow({
      initializePayment,
      verifyPayment,
      sessionType: PAYMENT_SESSION_TYPES.hustle,
    })

    expect(verifyPayment).toHaveBeenCalledWith('pay_ref_123')
    expect(result.kind).toBe('verified')
  })

  it('confirms a Paystack popup reference only once if Paystack returns twice', async () => {
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

    window.PaystackPop = class MockPaystackPop {
      resumeTransaction(_reference, callbacks) {
        queueMicrotask(() => {
          callbacks?.onSuccess?.({ reference: 'pay_ref_123' })
          callbacks?.onSuccess?.({ reference: 'pay_ref_123' })
        })
      }
    }

    await runPaymentFlow({
      initializePayment,
      verifyPayment,
      sessionType: PAYMENT_SESSION_TYPES.booking,
      returnUrl: 'https://app.example.com/my-hustles?tab=bookings',
    })

    expect(verifyPayment).toHaveBeenCalledTimes(1)
    expect(verifyPayment).toHaveBeenCalledWith('pay_ref_123')
  })

  it('stores recoverable inline errors for manual verification', async () => {
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
    const onRecoverablePaymentError = vi.fn()
    const onPaymentError = vi.fn()

    window.PaystackPop = class MockPaystackPop {
      resumeTransaction(_reference, callbacks) {
        queueMicrotask(() => {
          callbacks?.onError?.({ message: 'This transaction has already been paid' })
        })
      }
    }

    const result = await runPaymentFlow({
      initializePayment,
      verifyPayment: vi.fn(),
      sessionType: PAYMENT_SESSION_TYPES.cityAccess,
      sessionData: { cityAccessId: 10 },
      onRecoverablePaymentError,
      onPaymentError,
    })

    const session = storage.payments.getSession(PAYMENT_SESSION_TYPES.cityAccess)

    expect(result.kind).toBe('recoverable_error')
    expect(onRecoverablePaymentError).toHaveBeenCalledWith(
      expect.objectContaining({
        reference: 'pay_ref_123',
        message: expect.stringContaining('already been paid'),
      })
    )
    expect(onPaymentError).toHaveBeenCalled()
    expect(session).toEqual(expect.objectContaining({
      cityAccessId: 10,
      reference: 'pay_ref_123',
      requiresManualVerification: true,
      forceNewOnRetry: false,
    }))
  })

  it('verifies after a Paystack inline error when recovery is enabled', async () => {
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
      resumeTransaction(_reference, callbacks) {
        queueMicrotask(() => {
          callbacks?.onError?.({ message: 'Popup closed unexpectedly' })
        })
      }
    }

    const result = await runPaymentFlow({
      initializePayment,
      verifyPayment,
      sessionType: PAYMENT_SESSION_TYPES.booking,
      recoverInlineErrorWithVerification: true,
      onPaymentSuccess,
    })

    expect(verifyPayment).toHaveBeenCalledWith('pay_ref_123')
    expect(onPaymentSuccess).toHaveBeenCalledWith(expect.objectContaining({
      reference: 'pay_ref_123',
      status: 'success',
    }))
    expect(result.kind).toBe('verified_after_error')
  })

  it('treats popup close reported via onError as cancellation and skips verification retry', async () => {
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
    const verifyPayment = vi.fn()
    const onPaymentCancelled = vi.fn()

    window.PaystackPop = class MockPaystackPop {
      resumeTransaction(_reference, callbacks) {
        queueMicrotask(() => {
          callbacks?.onError?.({ message: 'Window closed by user' })
        })
      }
    }

    const result = await runPaymentFlow({
      initializePayment,
      verifyPayment,
      sessionType: PAYMENT_SESSION_TYPES.booking,
      recoverInlineErrorWithVerification: true,
      onPaymentCancelled,
    })

    expect(result.kind).toBe('cancelled')
    expect(verifyPayment).not.toHaveBeenCalled()
    expect(onPaymentCancelled).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'closed' })
    )
    expect(storage.payments.getSession(PAYMENT_SESSION_TYPES.booking)).toBeNull()
  })

  it('retries once with force_new after inline error when backend does not confirm payment', async () => {
    const store = new Map()
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
      },
      configurable: true,
    })

    const initializePayment = vi
      .fn()
      .mockResolvedValueOnce(buildInitResponse())
      .mockResolvedValueOnce(buildInitResponse({
        access_code: 'access_code_456',
        reference: 'pay_ref_456',
      }))
    const verifyPayment = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            item: {
              reference: 'pay_ref_123',
              status: 'pending',
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            item: {
              reference: 'pay_ref_456',
              status: 'success',
            },
          },
        },
      })

    let popupRuns = 0
    window.PaystackPop = class MockPaystackPop {
      resumeTransaction(reference, callbacks) {
        popupRuns += 1
        queueMicrotask(() => {
          if (popupRuns === 1) {
            expect(reference).toBe('access_code_123')
            callbacks?.onError?.({ message: 'Payment failed on popup' })
            return
          }

          expect(reference).toBe('access_code_456')
          callbacks?.onSuccess?.({ reference: 'pay_ref_456' })
        })
      }
    }

    const result = await runPaymentFlow({
      initializePayment,
      verifyPayment,
      sessionType: PAYMENT_SESSION_TYPES.hustle,
      recoverInlineErrorWithVerification: true,
    })

    expect(initializePayment).toHaveBeenNthCalledWith(1, { forceNew: false })
    expect(initializePayment).toHaveBeenNthCalledWith(2, { forceNew: true })
    expect(verifyPayment).toHaveBeenNthCalledWith(1, 'pay_ref_123')
    expect(verifyPayment).toHaveBeenNthCalledWith(2, 'pay_ref_456')
    expect(result.kind).toBe('verified')
  })

  it('stores manual verification state when initialize returns an existing checkout message', async () => {
    const store = new Map()
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
      },
      configurable: true,
    })

    const initializePayment = vi.fn().mockResolvedValue({
      data: {
        success: true,
        message: 'Existing city access payment checkout returned.',
        data: {
          item: {
            access_code: 'access_code_123',
            reference: 'pay_ref_123',
            status: 'pending',
          },
        },
      },
    })
    const onNeedsVerification = vi.fn()
    const verifyPayment = vi.fn()

    const result = await runPaymentFlow({
      initializePayment,
      verifyPayment,
      sessionType: PAYMENT_SESSION_TYPES.cityAccess,
      sessionData: { cityAccessId: 77 },
      shouldRequireManualVerificationOnInitialize: ({ message, forceNew }) => (
        !forceNew && message.toLowerCase() === 'existing city access payment checkout returned.'
      ),
      onNeedsVerification,
    })

    expect(result).toEqual(expect.objectContaining({
      kind: 'needs_verification',
      reference: 'pay_ref_123',
      message: 'Existing city access payment checkout returned.',
    }))
    expect(verifyPayment).not.toHaveBeenCalled()
    expect(onNeedsVerification).toHaveBeenCalledWith(expect.objectContaining({
      reference: 'pay_ref_123',
      message: 'Existing city access payment checkout returned.',
    }))
    expect(storage.payments.getSession(PAYMENT_SESSION_TYPES.cityAccess)).toEqual(expect.objectContaining({
      cityAccessId: 77,
      reference: 'pay_ref_123',
      requiresManualVerification: true,
      forceNewOnRetry: false,
    }))
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

  it('confirms a redirected reference once while verification is already in flight', async () => {
    const store = new Map()
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
      },
      configurable: true,
    })

    let resolveVerification
    const verifyPayment = vi.fn().mockReturnValue(new Promise((resolve) => {
      resolveVerification = resolve
    }))
    const setSearchParams = vi.fn()
    const searchParams = new URLSearchParams('section=my-subscription&payment_ref=city_ref_123')

    const first = reconcileStoredPayment({
      sessionType: PAYMENT_SESSION_TYPES.cityAccess,
      searchParams,
      setSearchParams,
      verifyPayment,
    })
    const second = await reconcileStoredPayment({
      sessionType: PAYMENT_SESSION_TYPES.cityAccess,
      searchParams,
      setSearchParams,
      verifyPayment,
    })

    resolveVerification({
      data: {
        success: true,
        data: {
          item: {
            reference: 'city_ref_123',
            subscription_status: 'active',
          },
        },
      },
    })

    await first

    expect(second).toBe(false)
    expect(verifyPayment).toHaveBeenCalledTimes(1)
    expect(verifyPayment).toHaveBeenCalledWith('city_ref_123')
  })

  it('treats city access active subscription verification as a completed payment', () => {
    const store = new Map()
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
      },
      configurable: true,
    })

    const response = {
      data: {
        success: true,
        data: {
          item: {
            reference: 'CITYACC-10-ABC123',
            subscription_status: 'active',
          },
        },
      },
    }

    const status = getPaymentStatus(response)

    expect(status).toBe('active')
    expect(isCompletedPaymentStatus(status)).toBe(true)
  })

})
