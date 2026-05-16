import { describe, expect, it } from 'vitest'
import {
  buildSelectedRange,
  calculateSelectedSlotDurationMinutes,
  getSlotKey,
  resolveNextSelectedSlots,
} from '../../src/shared/utils/availabilitySlots.js'

function makeSlot(hour) {
  const start = `2026-05-15T${String(hour).padStart(2, '0')}:00:00`
  const end = `2026-05-15T${String(hour + 1).padStart(2, '0')}:00:00`

  return {
    start,
    end,
    display_start: start,
    display_end: end,
  }
}

describe('availabilitySlots utils', () => {
  it('builds a selected range across the ordered available slots', () => {
    const slots = [makeSlot(9), makeSlot(10), makeSlot(11), makeSlot(12)]

    const range = buildSelectedRange(slots, slots[0], slots[2])

    expect(range.map(getSlotKey)).toEqual([
      getSlotKey(slots[0]),
      getSlotKey(slots[1]),
      getSlotKey(slots[2]),
    ])
  })

  it('extends a selected range when a third consecutive slot is clicked', () => {
    const slots = [makeSlot(9), makeSlot(10), makeSlot(11), makeSlot(12)]

    const firstSelection = resolveNextSelectedSlots({
      availableSlots: slots,
      selectedSlots: [],
      clickedSlot: slots[0],
    })
    const secondSelection = resolveNextSelectedSlots({
      availableSlots: slots,
      selectedSlots: firstSelection,
      clickedSlot: slots[1],
    })
    const thirdSelection = resolveNextSelectedSlots({
      availableSlots: slots,
      selectedSlots: secondSelection,
      clickedSlot: slots[2],
    })

    expect(secondSelection.map(getSlotKey)).toEqual([
      getSlotKey(slots[0]),
      getSlotKey(slots[1]),
    ])
    expect(thirdSelection.map(getSlotKey)).toEqual([
      getSlotKey(slots[0]),
      getSlotKey(slots[1]),
      getSlotKey(slots[2]),
    ])
  })

  it('extends the selection to the clicked slot based on available slot order', () => {
    const slots = [makeSlot(9), makeSlot(10), makeSlot(12)]

    const initialSelection = [slots[0], slots[1]]
    const nextSelection = resolveNextSelectedSlots({
      availableSlots: slots,
      selectedSlots: initialSelection,
      clickedSlot: slots[2],
    })

    expect(nextSelection.map(getSlotKey)).toEqual([
      getSlotKey(slots[0]),
      getSlotKey(slots[1]),
      getSlotKey(slots[2]),
    ])
  })

  it('calculates duration from the first selected start to the latest selected start', () => {
    const selection = [makeSlot(9), makeSlot(10), makeSlot(11)]

    expect(calculateSelectedSlotDurationMinutes(selection)).toBe(120)
  })

  it('allows range growth when the next available slot is two hours after the first', () => {
    const slotA = {
      start: '2026-05-15T08:03:00',
      end: '2026-05-15T09:03:00',
      display_start: '2026-05-15T08:03:00',
      display_end: '2026-05-15T09:03:00',
    }
    const slotB = {
      start: '2026-05-15T10:03:00',
      end: '2026-05-15T11:03:00',
      display_start: '2026-05-15T10:03:00',
      display_end: '2026-05-15T11:03:00',
    }

    const selection = resolveNextSelectedSlots({
      availableSlots: [slotA, slotB],
      selectedSlots: [slotA],
      clickedSlot: slotB,
    })

    expect(selection.map(getSlotKey)).toEqual([
      getSlotKey(slotA),
      getSlotKey(slotB),
    ])
    expect(calculateSelectedSlotDurationMinutes(selection)).toBe(120)
  })
})
