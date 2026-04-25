import { describe, it, expect } from 'vitest'
import {
  offerTransition,
  canOfferTransition,
  getAllowedOfferEvents,
  OFFER_STATES,
  OFFER_EVENTS,
} from '../../src/features/hustles/machines/offer.machine.js'

describe('offer.machine — happy paths', () => {
  it('sent → pending on ACKNOWLEDGE', () => {
    expect(offerTransition(OFFER_STATES.SENT, OFFER_EVENTS.ACKNOWLEDGE))
      .toBe(OFFER_STATES.PENDING)
  })

  it('pending → accepted on ACCEPT', () => {
    expect(offerTransition(OFFER_STATES.PENDING, OFFER_EVENTS.ACCEPT))
      .toBe(OFFER_STATES.ACCEPTED)
  })

  it('pending → rejected on REJECT', () => {
    expect(offerTransition(OFFER_STATES.PENDING, OFFER_EVENTS.REJECT))
      .toBe(OFFER_STATES.REJECTED)
  })

  it('accepted → payment_pending on INITIATE_PAY', () => {
    expect(offerTransition(OFFER_STATES.ACCEPTED, OFFER_EVENTS.INITIATE_PAY))
      .toBe(OFFER_STATES.PAYMENT_PENDING)
  })

  it('payment_pending → paid on PAY_SUCCESS', () => {
    expect(offerTransition(OFFER_STATES.PAYMENT_PENDING, OFFER_EVENTS.PAY_SUCCESS))
      .toBe(OFFER_STATES.PAID)
  })

  it('payment_pending → failed on PAY_FAIL', () => {
    expect(offerTransition(OFFER_STATES.PAYMENT_PENDING, OFFER_EVENTS.PAY_FAIL))
      .toBe(OFFER_STATES.FAILED)
  })

  it('failed → payment_pending on RETRY', () => {
    expect(offerTransition(OFFER_STATES.FAILED, OFFER_EVENTS.RETRY))
      .toBe(OFFER_STATES.PAYMENT_PENDING)
  })
})

describe('offer.machine — terminal states', () => {
  it('PAID has no allowed events', () => {
    expect(getAllowedOfferEvents(OFFER_STATES.PAID)).toEqual([])
  })

  it('REJECTED has no allowed events', () => {
    expect(getAllowedOfferEvents(OFFER_STATES.REJECTED)).toEqual([])
  })
})

describe('offer.machine — invalid transitions', () => {
  it('throws on unknown state', () => {
    expect(() => offerTransition('invalid', OFFER_EVENTS.ACCEPT)).toThrow('[offer.machine]')
  })

  it('cannot skip pending — sent directly to accepted', () => {
    expect(() => offerTransition(OFFER_STATES.SENT, OFFER_EVENTS.ACCEPT)).toThrow()
  })

  it('cannot pay before accepting', () => {
    expect(() => offerTransition(OFFER_STATES.PENDING, OFFER_EVENTS.INITIATE_PAY)).toThrow()
  })

  it('canOfferTransition returns false for invalid', () => {
    expect(canOfferTransition(OFFER_STATES.PAID, OFFER_EVENTS.RETRY)).toBe(false)
  })
})
