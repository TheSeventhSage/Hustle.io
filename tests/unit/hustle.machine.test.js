import { describe, it, expect } from 'vitest'
import {
  hustleTransition,
  canHustleTransition,
  getAllowedHustleEvents,
  HUSTLE_STATES,
  HUSTLE_EVENTS,
} from '../../src/features/hustles/machines/hustle.machine.js'

describe('hustle.machine — transitions', () => {
  it('draft → active on PUBLISH', () => {
    expect(hustleTransition(HUSTLE_STATES.DRAFT, HUSTLE_EVENTS.PUBLISH))
      .toBe(HUSTLE_STATES.ACTIVE)
  })

  it('active → in_progress on ASSIGN', () => {
    expect(hustleTransition(HUSTLE_STATES.ACTIVE, HUSTLE_EVENTS.ASSIGN))
      .toBe(HUSTLE_STATES.IN_PROGRESS)
  })

  it('in_progress → pending_approval on COMPLETE', () => {
    expect(hustleTransition(HUSTLE_STATES.IN_PROGRESS, HUSTLE_EVENTS.COMPLETE))
      .toBe(HUSTLE_STATES.PENDING_APPROVAL)
  })

  it('in_progress → disputed on RAISE_ISSUE', () => {
    expect(hustleTransition(HUSTLE_STATES.IN_PROGRESS, HUSTLE_EVENTS.RAISE_ISSUE))
      .toBe(HUSTLE_STATES.DISPUTED)
  })

  it('pending_approval → completed on APPROVE', () => {
    expect(hustleTransition(HUSTLE_STATES.PENDING_APPROVAL, HUSTLE_EVENTS.APPROVE))
      .toBe(HUSTLE_STATES.COMPLETED)
  })

  it('disputed → completed on RESOLVE', () => {
    expect(hustleTransition(HUSTLE_STATES.DISPUTED, HUSTLE_EVENTS.RESOLVE))
      .toBe(HUSTLE_STATES.COMPLETED)
  })

  it('any cancellable state → cancelled on CANCEL', () => {
    const cancellable = [
      HUSTLE_STATES.DRAFT,
      HUSTLE_STATES.ACTIVE,
      HUSTLE_STATES.IN_PROGRESS,
      HUSTLE_STATES.DISPUTED,
    ]
    cancellable.forEach((state) => {
      expect(hustleTransition(state, HUSTLE_EVENTS.CANCEL))
        .toBe(HUSTLE_STATES.CANCELLED)
    })
  })
})

describe('hustle.machine — invalid transitions throw', () => {
  it('throws on unknown state', () => {
    expect(() => hustleTransition('bogus_state', HUSTLE_EVENTS.PUBLISH))
      .toThrow('[hustle.machine] Unknown state: "bogus_state"')
  })

  it('throws on invalid event for state', () => {
    expect(() => hustleTransition(HUSTLE_STATES.COMPLETED, HUSTLE_EVENTS.PUBLISH))
      .toThrow('[hustle.machine]')
  })

  it('cannot ASSIGN from completed', () => {
    expect(() => hustleTransition(HUSTLE_STATES.COMPLETED, HUSTLE_EVENTS.ASSIGN))
      .toThrow()
  })

  it('cannot APPROVE from in_progress directly', () => {
    expect(() => hustleTransition(HUSTLE_STATES.IN_PROGRESS, HUSTLE_EVENTS.APPROVE))
      .toThrow()
  })
})

describe('hustle.machine — canHustleTransition', () => {
  it('returns true for valid transitions', () => {
    expect(canHustleTransition(HUSTLE_STATES.DRAFT, HUSTLE_EVENTS.PUBLISH)).toBe(true)
    expect(canHustleTransition(HUSTLE_STATES.ACTIVE, HUSTLE_EVENTS.CANCEL)).toBe(true)
  })

  it('returns false for invalid transitions', () => {
    expect(canHustleTransition(HUSTLE_STATES.COMPLETED, HUSTLE_EVENTS.PUBLISH)).toBe(false)
    expect(canHustleTransition(HUSTLE_STATES.CANCELLED, HUSTLE_EVENTS.ASSIGN)).toBe(false)
  })
})

describe('hustle.machine — getAllowedHustleEvents', () => {
  it('returns correct events for draft', () => {
    const events = getAllowedHustleEvents(HUSTLE_STATES.DRAFT)
    expect(events).toContain(HUSTLE_EVENTS.PUBLISH)
    expect(events).toContain(HUSTLE_EVENTS.CANCEL)
    expect(events).not.toContain(HUSTLE_EVENTS.APPROVE)
  })

  it('returns empty array for terminal states', () => {
    expect(getAllowedHustleEvents(HUSTLE_STATES.COMPLETED)).toEqual([])
    expect(getAllowedHustleEvents(HUSTLE_STATES.CANCELLED)).toEqual([])
  })
})
