export function unwrapData(payload) {
  return payload?.data?.data
    ?? payload?.data
    ?? payload
    ?? null
}

export function unwrapItem(payload) {
  const data = unwrapData(payload)
  return data?.item
    ?? data?.service
    ?? data?.profile
    ?? data?.account
    ?? data
    ?? null
}

export function unwrapItems(payload) {
  const data = unwrapData(payload)
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.docs)) return data.docs
  if (Array.isArray(data)) return data
  return []
}

export function unwrapCollection(payload) {
  const items = unwrapItems(payload)
  return items.length ? items : unwrapData(payload)
}

export function unwrapProfile(payload) {
  const data = unwrapData(payload)
  return data?.profile
    ?? data?.account
    ?? data
    ?? null
}

export function unwrapServicePayload(payload) {
  const data = unwrapData(payload)
  const item = data?.item ?? data?.service ?? data ?? null
  const skills = Array.isArray(data?.skills) ? data.skills : Array.isArray(item?.skills) ? item.skills : []
  const reviews = Array.isArray(data?.reviews) ? data.reviews : Array.isArray(item?.reviews) ? item.reviews : []

  return {
    item,
    skills,
    reviews,
    raw: data,
  }
}

export function unwrapMeta(payload) {
  const data = unwrapData(payload)
  return payload?.meta
    ?? payload?.data?.meta
    ?? payload?.data?.data?.meta
    ?? data?.meta
    ?? null
}
