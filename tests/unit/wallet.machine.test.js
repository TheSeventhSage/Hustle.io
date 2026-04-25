import { describe, it, expect } from 'vitest'
import {
  walletTransition,
  canWalletTransition,
  getAllowedWalletEvents,
  WALLET_STATES,
  WALLET_EVENTS,
  MAX_PIN_ATTEMPTS,
} from '../../src/features/wallet/wallet.machine.js'

describe('wallet.machine — PIN setup flow', () => {
  it('no_pin → entering_pin on START_SETUP', () => {
    expect(walletTransition(WALLET_STATES.NO_PIN, WALLET_EVENTS.START_SETUP))
      .toBe(WALLET_STATES.ENTERING_PIN)
  })

  it('entering_pin → confirming_pin on PIN_ENTERED', () => {
    expect(walletTransition(WALLET_STATES.ENTERING_PIN, WALLET_EVENTS.PIN_ENTERED))
      .toBe(WALLET_STATES.CONFIRMING_PIN)
  })

  it('confirming_pin → pin_set on PIN_CONFIRMED', () => {
    expect(walletTransition(WALLET_STATES.CONFIRMING_PIN, WALLET_EVENTS.PIN_CONFIRMED))
      .toBe(WALLET_STATES.PIN_SET)
  })

  it('confirming_pin → entering_pin on PIN_MISMATCH (retry)', () => {
    expect(walletTransition(WALLET_STATES.CONFIRMING_PIN, WALLET_EVENTS.PIN_MISMATCH))
      .toBe(WALLET_STATES.ENTERING_PIN)
  })
})

describe('wallet.machine — PIN auth flow', () => {
  it('pin_set → awaiting_pin on START_AUTH', () => {
    expect(walletTransition(WALLET_STATES.PIN_SET, WALLET_EVENTS.START_AUTH))
      .toBe(WALLET_STATES.AWAITING_PIN)
  })

  it('awaiting_pin → authorised on PIN_CORRECT', () => {
    expect(walletTransition(WALLET_STATES.AWAITING_PIN, WALLET_EVENTS.PIN_CORRECT))
      .toBe(WALLET_STATES.AUTHORISED)
  })

  it('awaiting_pin → failed on PIN_WRONG', () => {
    expect(walletTransition(WALLET_STATES.AWAITING_PIN, WALLET_EVENTS.PIN_WRONG))
      .toBe(WALLET_STATES.FAILED)
  })

  it('failed → awaiting_pin on RETRY', () => {
    expect(walletTransition(WALLET_STATES.FAILED, WALLET_EVENTS.RETRY))
      .toBe(WALLET_STATES.AWAITING_PIN)
  })

  it('failed → locked on LOCK', () => {
    expect(walletTransition(WALLET_STATES.FAILED, WALLET_EVENTS.LOCK))
      .toBe(WALLET_STATES.LOCKED)
  })
})

describe('wallet.machine — reset flows', () => {
  it('authorised → pin_set on RESET', () => {
    expect(walletTransition(WALLET_STATES.AUTHORISED, WALLET_EVENTS.RESET))
      .toBe(WALLET_STATES.PIN_SET)
  })

  it('locked → no_pin on RESET', () => {
    expect(walletTransition(WALLET_STATES.LOCKED, WALLET_EVENTS.RESET))
      .toBe(WALLET_STATES.NO_PIN)
  })
})

describe('wallet.machine — invalid transitions', () => {
  it('throws on unknown state', () => {
    expect(() => walletTransition('ghost_state', WALLET_EVENTS.START_AUTH))
      .toThrow('[wallet.machine] Unknown state: "ghost_state"')
  })

  it('cannot auth before PIN is set', () => {
    expect(() => walletTransition(WALLET_STATES.NO_PIN, WALLET_EVENTS.START_AUTH))
      .toThrow()
  })

  it('cannot go to authorised from entering_pin directly', () => {
    expect(() => walletTransition(WALLET_STATES.ENTERING_PIN, WALLET_EVENTS.PIN_CORRECT))
      .toThrow()
  })

  it('canWalletTransition returns false for invalid', () => {
    expect(canWalletTransition(WALLET_STATES.LOCKED, WALLET_EVENTS.PIN_CORRECT)).toBe(false)
  })
})

describe('wallet.machine — constants', () => {
  it('MAX_PIN_ATTEMPTS is 3', () => {
    expect(MAX_PIN_ATTEMPTS).toBe(3)
  })

  it('pin_set has exactly START_AUTH as allowed event', () => {
    expect(getAllowedWalletEvents(WALLET_STATES.PIN_SET))
      .toEqual([WALLET_EVENTS.START_AUTH])
  })
})
