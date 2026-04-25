import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  WALLET_STATES,
  WALLET_EVENTS,
  walletTransition,
  MAX_PIN_ATTEMPTS,
} from './wallet.machine.js'

/**
 * wallet.store.js
 * Owns the PIN state machine + attempt counter.
 * Transaction data lives in TanStack Query.
 */

const useWalletStore = create(
  devtools(
    (set, get) => ({
      // ── PIN machine state ─────────────────────────────
      pinState:    WALLET_STATES.NO_PIN,
      pinAttempts: 0,
      pinError:    null,

      // ── Actions ──────────────────────────────────────
      startPinSetup() {
        const next = walletTransition(get().pinState, WALLET_EVENTS.START_SETUP)
        set({ pinState: next, pinError: null })
      },

      pinEntered() {
        const next = walletTransition(get().pinState, WALLET_EVENTS.PIN_ENTERED)
        set({ pinState: next, pinError: null })
      },

      pinConfirmed() {
        const next = walletTransition(get().pinState, WALLET_EVENTS.PIN_CONFIRMED)
        set({ pinState: next, pinAttempts: 0, pinError: null })
      },

      pinMismatch() {
        const next = walletTransition(get().pinState, WALLET_EVENTS.PIN_MISMATCH)
        set({ pinState: next, pinError: 'PINs do not match. Please try again.' })
      },

      startAuth() {
        const next = walletTransition(get().pinState, WALLET_EVENTS.START_AUTH)
        set({ pinState: next, pinAttempts: 0, pinError: null })
      },

      pinCorrect() {
        const next = walletTransition(get().pinState, WALLET_EVENTS.PIN_CORRECT)
        set({ pinState: next, pinAttempts: 0, pinError: null })
      },

      pinWrong() {
        const { pinAttempts } = get()
        const newAttempts = pinAttempts + 1

        if (newAttempts >= MAX_PIN_ATTEMPTS) {
          const next = walletTransition(get().pinState, WALLET_EVENTS.PIN_WRONG)
          const locked = walletTransition(next, WALLET_EVENTS.LOCK)
          set({
            pinState:    locked,
            pinAttempts: newAttempts,
            pinError:    'Too many incorrect attempts. Wallet locked.',
          })
        } else {
          const next = walletTransition(get().pinState, WALLET_EVENTS.PIN_WRONG)
          set({
            pinState:    next,
            pinAttempts: newAttempts,
            pinError:    `Incorrect PIN. ${MAX_PIN_ATTEMPTS - newAttempts} attempt(s) remaining.`,
          })
        }
      },

      retryAuth() {
        const next = walletTransition(get().pinState, WALLET_EVENTS.RETRY)
        set({ pinState: next, pinError: null })
      },

      resetPin() {
        set({
          pinState:    WALLET_STATES.NO_PIN,
          pinAttempts: 0,
          pinError:    null,
        })
      },

      // ── Active modal ──────────────────────────────────
      activeModal: null,  // 'withdraw' | 'topup' | 'setup_pin' | null
      setActiveModal: (modal) => set({ activeModal: modal }),
    }),
    { name: 'WalletStore' }
  )
)

export default useWalletStore
