/**
 * wallet.machine.js
 *
 * State machine for wallet PIN setup + authorisation flows.
 *
 * Setup:  no_pin → entering_pin → confirming_pin → pin_set
 * Auth:   pin_set → awaiting_pin → authorised
 *                              ↘ failed (max 3 attempts → locked)
 */

export const WALLET_STATES = /** @type {const} */ ({
  NO_PIN:        'no_pin',
  ENTERING_PIN:  'entering_pin',
  CONFIRMING_PIN:'confirming_pin',
  PIN_SET:       'pin_set',
  AWAITING_PIN:  'awaiting_pin',
  AUTHORISED:    'authorised',
  FAILED:        'failed',
  LOCKED:        'locked',
})

export const WALLET_EVENTS = /** @type {const} */ ({
  START_SETUP:    'START_SETUP',     // no_pin → entering_pin
  PIN_ENTERED:    'PIN_ENTERED',     // entering_pin → confirming_pin
  PIN_CONFIRMED:  'PIN_CONFIRMED',   // confirming_pin → pin_set (pins match)
  PIN_MISMATCH:   'PIN_MISMATCH',    // confirming_pin → entering_pin (retry)
  START_AUTH:     'START_AUTH',      // pin_set → awaiting_pin
  PIN_CORRECT:    'PIN_CORRECT',     // awaiting_pin → authorised
  PIN_WRONG:      'PIN_WRONG',       // awaiting_pin → failed
  RETRY:          'RETRY',           // failed → awaiting_pin (if attempts < 3)
  LOCK:           'LOCK',            // failed → locked (attempts >= 3)
  RESET:          'RESET',           // authorised / locked → pin_set / no_pin
})

/** @type {Record<string, Partial<Record<string, string>>>} */
const TRANSITIONS = {
  [WALLET_STATES.NO_PIN]: {
    [WALLET_EVENTS.START_SETUP]: WALLET_STATES.ENTERING_PIN,
  },
  [WALLET_STATES.ENTERING_PIN]: {
    [WALLET_EVENTS.PIN_ENTERED]: WALLET_STATES.CONFIRMING_PIN,
  },
  [WALLET_STATES.CONFIRMING_PIN]: {
    [WALLET_EVENTS.PIN_CONFIRMED]: WALLET_STATES.PIN_SET,
    [WALLET_EVENTS.PIN_MISMATCH]:  WALLET_STATES.ENTERING_PIN,
  },
  [WALLET_STATES.PIN_SET]: {
    [WALLET_EVENTS.START_AUTH]: WALLET_STATES.AWAITING_PIN,
  },
  [WALLET_STATES.AWAITING_PIN]: {
    [WALLET_EVENTS.PIN_CORRECT]: WALLET_STATES.AUTHORISED,
    [WALLET_EVENTS.PIN_WRONG]:   WALLET_STATES.FAILED,
  },
  [WALLET_STATES.FAILED]: {
    [WALLET_EVENTS.RETRY]: WALLET_STATES.AWAITING_PIN,
    [WALLET_EVENTS.LOCK]:  WALLET_STATES.LOCKED,
  },
  [WALLET_STATES.AUTHORISED]: {
    [WALLET_EVENTS.RESET]: WALLET_STATES.PIN_SET,
  },
  [WALLET_STATES.LOCKED]: {
    [WALLET_EVENTS.RESET]: WALLET_STATES.NO_PIN,
  },
}

export const MAX_PIN_ATTEMPTS = 3

/**
 * @param {string} currentState
 * @param {string} event
 * @returns {string}
 */
export function walletTransition(currentState, event) {
  const stateMap = TRANSITIONS[currentState]

  if (!stateMap) {
    throw new Error(`[wallet.machine] Unknown state: "${currentState}"`)
  }

  const nextState = stateMap[event]

  if (!nextState) {
    throw new Error(
      `[wallet.machine] Invalid transition: "${currentState}" + "${event}". ` +
      `Allowed: [${Object.keys(stateMap).join(', ')}]`
    )
  }

  return nextState
}

/** @param {string} currentState @param {string} event @returns {boolean} */
export function canWalletTransition(currentState, event) {
  return Boolean(TRANSITIONS[currentState]?.[event])
}

/** @param {string} currentState @returns {string[]} */
export function getAllowedWalletEvents(currentState) {
  return Object.keys(TRANSITIONS[currentState] ?? {})
}
