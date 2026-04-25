/**
 * hustle.machine.js
 *
 * Pure state machine for hustle lifecycle.
 * No React, no Zustand — just a transition function.
 * Test this in complete isolation.
 *
 * States:   draft → active → in_progress → pending_approval → completed
 *                                        ↘ disputed
 *           any state → cancelled
 */

export const HUSTLE_STATES = /** @type {const} */ ({
  DRAFT:            'draft',
  ACTIVE:           'active',
  IN_PROGRESS:      'in_progress',
  PENDING_APPROVAL: 'pending_approval',
  DISPUTED:         'disputed',
  COMPLETED:        'completed',
  CANCELLED:        'cancelled',
})

export const HUSTLE_EVENTS = /** @type {const} */ ({
  PUBLISH:    'PUBLISH',    // draft → active
  ASSIGN:     'ASSIGN',     // active → in_progress
  COMPLETE:   'COMPLETE',   // in_progress → pending_approval
  RAISE_ISSUE:'RAISE_ISSUE',// in_progress → disputed
  APPROVE:    'APPROVE',    // pending_approval → completed
  DISPUTE:    'DISPUTE',    // pending_approval → disputed
  RESOLVE:    'RESOLVE',    // disputed → completed
  CANCEL:     'CANCEL',     // any → cancelled
})

/** @type {Record<string, Partial<Record<string, string>>>} */
const TRANSITIONS = {
  [HUSTLE_STATES.DRAFT]: {
    [HUSTLE_EVENTS.PUBLISH]: HUSTLE_STATES.ACTIVE,
    [HUSTLE_EVENTS.CANCEL]:  HUSTLE_STATES.CANCELLED,
  },
  [HUSTLE_STATES.ACTIVE]: {
    [HUSTLE_EVENTS.ASSIGN]:  HUSTLE_STATES.IN_PROGRESS,
    [HUSTLE_EVENTS.CANCEL]:  HUSTLE_STATES.CANCELLED,
  },
  [HUSTLE_STATES.IN_PROGRESS]: {
    [HUSTLE_EVENTS.COMPLETE]:    HUSTLE_STATES.PENDING_APPROVAL,
    [HUSTLE_EVENTS.RAISE_ISSUE]: HUSTLE_STATES.DISPUTED,
    [HUSTLE_EVENTS.CANCEL]:      HUSTLE_STATES.CANCELLED,
  },
  [HUSTLE_STATES.PENDING_APPROVAL]: {
    [HUSTLE_EVENTS.APPROVE]: HUSTLE_STATES.COMPLETED,
    [HUSTLE_EVENTS.DISPUTE]: HUSTLE_STATES.DISPUTED,
  },
  [HUSTLE_STATES.DISPUTED]: {
    [HUSTLE_EVENTS.RESOLVE]: HUSTLE_STATES.COMPLETED,
    [HUSTLE_EVENTS.CANCEL]:  HUSTLE_STATES.CANCELLED,
  },
  [HUSTLE_STATES.COMPLETED]:  {},
  [HUSTLE_STATES.CANCELLED]:  {},
}

/**
 * Transition the hustle to a new state.
 * @param {string} currentState
 * @param {string} event
 * @returns {string} next state
 * @throws {Error} if the transition is invalid
 */
export function hustleTransition(currentState, event) {
  const stateMap = TRANSITIONS[currentState]

  if (!stateMap) {
    throw new Error(`[hustle.machine] Unknown state: "${currentState}"`)
  }

  const nextState = stateMap[event]

  if (!nextState) {
    throw new Error(
      `[hustle.machine] Invalid transition: "${currentState}" + "${event}". ` +
      `Allowed events: [${Object.keys(stateMap).join(', ')}]`
    )
  }

  return nextState
}

/**
 * Check whether an event is valid from the current state.
 * @param {string} currentState
 * @param {string} event
 * @returns {boolean}
 */
export function canHustleTransition(currentState, event) {
  return Boolean(TRANSITIONS[currentState]?.[event])
}

/**
 * Get all valid events from the current state.
 * Use this to conditionally render action buttons.
 * @param {string} currentState
 * @returns {string[]}
 */
export function getAllowedHustleEvents(currentState) {
  return Object.keys(TRANSITIONS[currentState] ?? {})
}
