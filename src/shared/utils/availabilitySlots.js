export function getSlotStartValue(slot) {
  return slot?.display_start || slot?.start
}

export function getSlotEndValue(slot) {
  return slot?.display_end || slot?.end
}

export function getSlotKey(slot) {
  return `${getSlotStartValue(slot)}|${getSlotEndValue(slot)}`
}

export function sortSlotsByStart(items = []) {
  return [...items].sort((a, b) => new Date(getSlotStartValue(a)) - new Date(getSlotStartValue(b)))
}

export function buildSelectedRange(rangeSlots, firstSlot, lastSlot) {
  if (!firstSlot || !lastSlot) return null

  const orderedSlots = sortSlotsByStart(rangeSlots)
  const firstIndex = orderedSlots.findIndex((slot) => getSlotKey(slot) === getSlotKey(firstSlot))
  const lastIndex = orderedSlots.findIndex((slot) => getSlotKey(slot) === getSlotKey(lastSlot))

  if (firstIndex === -1 || lastIndex === -1) return null

  const startIndex = Math.min(firstIndex, lastIndex)
  const endIndex = Math.max(firstIndex, lastIndex)
  return orderedSlots.slice(startIndex, endIndex + 1)
}

function getSlotDurationMinutes(slot) {
  const start = new Date(getSlotStartValue(slot))
  const end = new Date(getSlotEndValue(slot))
  const minutes = Math.round((end - start) / 60000)
  return minutes > 0 ? minutes : 60
}

export function getSelectedSlotRangeMinutes(range = []) {
  const orderedRange = sortSlotsByStart(range)
  if (orderedRange.length === 0) return 0
  if (orderedRange.length === 1) return getSlotDurationMinutes(orderedRange[0])

  const firstStart = new Date(getSlotStartValue(orderedRange[0]))
  const lastStart = new Date(getSlotStartValue(orderedRange[orderedRange.length - 1]))
  const minutes = Math.round((lastStart - firstStart) / 60000)
  return minutes > 0 ? minutes : getSlotDurationMinutes(orderedRange[0])
}

export function calculateSelectedSlotDurationMinutes(range = []) {
  return getSelectedSlotRangeMinutes(range)
}

export function resolveNextSelectedSlots({ availableSlots = [], selectedSlots = [], clickedSlot }) {
  const orderedSelection = sortSlotsByStart(selectedSlots)
  const clickedSlotKey = getSlotKey(clickedSlot)
  const clickedIndex = orderedSelection.findIndex((slot) => getSlotKey(slot) === clickedSlotKey)

  if (clickedIndex !== -1) {
    if (orderedSelection.length <= 1) {
      return []
    }

    if (clickedIndex === 0) {
      return orderedSelection.slice(1)
    }

    if (clickedIndex === orderedSelection.length - 1) {
      return orderedSelection.slice(0, -1)
    }

    return [clickedSlot]
  }

  if (orderedSelection.length === 0) {
    return [clickedSlot]
  }

  const firstSelected = orderedSelection[0]
  const lastSelected = orderedSelection[orderedSelection.length - 1]
  const clickedStart = new Date(getSlotStartValue(clickedSlot))
  const firstStart = new Date(getSlotStartValue(firstSelected))
  const lastStart = new Date(getSlotStartValue(lastSelected))

  if (clickedStart < firstStart) {
    return buildSelectedRange(availableSlots, clickedSlot, lastSelected) ?? [clickedSlot]
  }

  if (clickedStart > lastStart) {
    return buildSelectedRange(availableSlots, firstSelected, clickedSlot) ?? [clickedSlot]
  }

  const completedRange = buildSelectedRange(availableSlots, firstSelected, clickedSlot)
  if (completedRange && completedRange.some((slot) => getSlotKey(slot) === clickedSlotKey)) {
    return completedRange
  }

  return [clickedSlot]
}
