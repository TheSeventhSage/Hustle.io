/**
 * offer.machine.js
 *
 * State machine for offer / booking lifecycle.
 * sent → pending → accepted → payment_pending → paid
 *               ↘ rejected
 */

export const OFFER_STATES = /** @type {const} */ ({
  SENT:            'sent',
  PENDING:         'pending',
  ACCEPTED:        'accepted',
  REJECTED:        'rejected',
  PAYMENT_PENDING: 'payment_pending',
  PAID:            'paid',
  FAILED:          'failed',
})

export const OFFER_EVENTS = /** @type {const} */ ({
  SEND:          'SEND',           // → sent
  ACKNOWLEDGE:   'ACKNOWLEDGE',    // sent → pending
  ACCEPT:        'ACCEPT',         // pending → accepted
  REJECT:        'REJECT',         // pending → rejected
  INITIATE_PAY:  'INITIATE_PAY',  // accepted → payment_pending
  PAY_SUCCESS:   'PAY_SUCCESS',   // payment_pending → paid
  PAY_FAIL:      'PAY_FAIL',      // payment_pending → failed
  RETRY:         'RETRY',          // failed → payment_pending
})

/** @type {Record<string, Partial<Record<string, string>>>} */
const TRANSITIONS = {
  [OFFER_STATES.SENT]: {
    [OFFER_EVENTS.ACKNOWLEDGE]: OFFER_STATES.PENDING,
  },
  [OFFER_STATES.PENDING]: {
    [OFFER_EVENTS.ACCEPT]: OFFER_STATES.ACCEPTED,
    [OFFER_EVENTS.REJECT]: OFFER_STATES.REJECTED,
  },
  [OFFER_STATES.ACCEPTED]: {
    [OFFER_EVENTS.INITIATE_PAY]: OFFER_STATES.PAYMENT_PENDING,
  },
  [OFFER_STATES.PAYMENT_PENDING]: {
    [OFFER_EVENTS.PAY_SUCCESS]: OFFER_STATES.PAID,
    [OFFER_EVENTS.PAY_FAIL]:    OFFER_STATES.FAILED,
  },
  [OFFER_STATES.FAILED]: {
    [OFFER_EVENTS.RETRY]: OFFER_STATES.PAYMENT_PENDING,
  },
  [OFFER_STATES.REJECTED]: {},
  [OFFER_STATES.PAID]:     {},
}

/**
 * @param {string} currentState
 * @param {string} event
 * @returns {string} next state
 */
export function offerTransition(currentState, event) {
  const stateMap = TRANSITIONS[currentState]

  if (!stateMap) {
    throw new Error(`[offer.machine] Unknown state: "${currentState}"`)
  }

  const nextState = stateMap[event]

  if (!nextState) {
    throw new Error(
      `[offer.machine] Invalid transition: "${currentState}" + "${event}". ` +
      `Allowed: [${Object.keys(stateMap).join(', ')}]`
    )
  }

  return nextState
}

/** @param {string} currentState @param {string} event @returns {boolean} */
export function canOfferTransition(currentState, event) {
  return Boolean(TRANSITIONS[currentState]?.[event])
}

/** @param {string} currentState @returns {string[]} */
export function getAllowedOfferEvents(currentState) {
  return Object.keys(TRANSITIONS[currentState] ?? {})
}
