import { describe, expect, it } from 'vitest'
import {
  getActiveCityAccessRows,
  getCityAccessForCity,
  hasActiveCityAccess,
  isCityAccessActive,
  normalizeCityAccessStatus,
} from '../../src/features/city-access/cityAccess.utils.js'

const NOW = new Date('2026-05-09T12:00:00.000Z')

describe('cityAccess.utils', () => {
  it('treats active rows without end date as usable city access', () => {
    const row = { city_id: 2, is_active: 1, subscription_status: 'active' }

    expect(normalizeCityAccessStatus(row)).toBe('active')
    expect(isCityAccessActive(row, NOW)).toBe(true)
  })

  it('rejects inactive, pending, and expired access rows', () => {
    expect(isCityAccessActive({ is_active: 0, subscription_status: 'active' }, NOW)).toBe(false)
    expect(isCityAccessActive({ is_active: 1, subscription_status: 'pending' }, NOW)).toBe(false)
    expect(isCityAccessActive({
      is_active: 1,
      subscription_status: 'active',
      ends_at: '2026-05-01T00:00:00.000Z',
    }, NOW)).toBe(false)
  })

  it('matches city ids using numeric or string values', () => {
    const rows = [
      { city_id: '1', is_active: 1, subscription_status: 'active' },
      { city_id: 2, is_active: 1, subscription_status: 'pending' },
    ]

    expect(getCityAccessForCity(rows, 1)).toBe(rows[0])
    expect(hasActiveCityAccess(rows, '1', NOW)).toBe(true)
    expect(hasActiveCityAccess(rows, '2', NOW)).toBe(false)
  })

  it('returns only active rows', () => {
    const rows = [
      { city_id: 1, is_active: 1, subscription_status: 'active' },
      { city_id: 2, is_active: 1, subscription_status: 'cancelled' },
    ]

    expect(getActiveCityAccessRows(rows, NOW)).toEqual([rows[0]])
  })
})
