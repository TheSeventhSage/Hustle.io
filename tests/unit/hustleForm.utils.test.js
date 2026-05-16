import { describe, expect, it } from 'vitest'
import {
  buildCreateHustlePayload,
  canCancelAwaitingPaymentHustle,
  mergeDefinedRecord,
  REMOTE_LOCATION_TEXT,
} from '../../src/features/hustles/hustleForm.utils.js'

describe('hustleForm.utils', () => {
  it('builds a remote create-hustle payload without city and country ids', () => {
    const payload = buildCreateHustlePayload(
      {
        category_id: '4',
        title: ' Remote content writing ',
        description: 'Clean description',
        is_remote: true,
        country_id: '',
        city_id: '',
        location_text: '',
        duration_minutes: '90',
        required_experience_level: 'mid',
        payment_model: 'full_amount',
        budget_amount: '25000',
        skills: 'Writing, Editing',
        preferred_date: '2026-05-15',
        preferred_start_time: '09:00:00',
        preferred_end_time: '10:30:00',
      },
      { timezone: 'Africa/Lagos' }
    )

    expect(payload).toMatchObject({
      category_id: 4,
      title: 'Remote content writing',
      description: 'Clean description',
      location_text: REMOTE_LOCATION_TEXT,
      duration_minutes: 90,
      budget_amount: 25000,
      timezone_name: 'Africa/Lagos',
      skills: ['Writing', 'Editing'],
    })
    expect(payload.country_id).toBeUndefined()
    expect(payload.city_id).toBeUndefined()
  })

  it('builds an onsite create-hustle payload with city and country ids', () => {
    const payload = buildCreateHustlePayload({
      category_id: '1',
      title: 'Cleaning agency needed',
      description: 'Clean description',
      is_remote: false,
      country_id: '1',
      city_id: '2',
      location_text: 'Lagos Island',
      duration_minutes: '180',
      required_experience_level: 'mid',
      payment_model: 'full_amount',
      budget_amount: '30000',
      skills: '',
      preferred_date: '',
      preferred_start_time: '',
      preferred_end_time: '',
    })

    expect(payload.country_id).toBe(1)
    expect(payload.city_id).toBe(2)
    expect(payload.location_text).toBe('Lagos Island')
  })

  it('matches cancel visibility only for open hustles with pending latest payment and can_cancel', () => {
    expect(
      canCancelAwaitingPaymentHustle({
        can_cancel: true,
        status: 'open',
        latest_payment_status: 'pending',
      })
    ).toBe(true)

    expect(
      canCancelAwaitingPaymentHustle({
        can_cancel: true,
        status: 'closed',
        latest_payment_status: 'pending',
      })
    ).toBe(false)

    expect(
      canCancelAwaitingPaymentHustle({
        can_cancel: true,
        status: 'open',
        latest_payment_status: 'paid',
      })
    ).toBe(false)

    expect(
      canCancelAwaitingPaymentHustle({
        can_cancel: false,
        status: 'open',
        latest_payment_status: 'pending',
      })
    ).toBe(false)
  })

  it('merges fetched detail data with defined list metadata', () => {
    expect(
      mergeDefinedRecord(
        { id: 21, title: 'Cleaning agency needed', description: 'Full detail' },
        { can_cancel: true, status: 'open', latest_payment_status: 'pending', title: undefined }
      )
    ).toEqual({
      id: 21,
      title: 'Cleaning agency needed',
      description: 'Full detail',
      can_cancel: true,
      status: 'open',
      latest_payment_status: 'pending',
    })
  })
})
