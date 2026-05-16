export const REMOTE_LOCATION_TEXT = 'Remote/Online'

export function mergeDefinedRecord(base = null, overrides = null) {
  const merged = { ...(base ?? {}) }

  Object.entries(overrides ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      merged[key] = value
    }
  })

  return Object.keys(merged).length > 0 ? merged : null
}

export function canCancelAwaitingPaymentHustle(hustle) {
  const hustleStatus = String(hustle?.status ?? '').toLowerCase()
  const latestPaymentStatus = String(
    hustle?.latest_payment_status ?? hustle?.latestPaymentStatus ?? ''
  ).toLowerCase()

  return Boolean(hustle?.can_cancel ?? hustle?.canCancel)
    && hustleStatus === 'open'
    && latestPaymentStatus === 'pending'
}

export function buildCreateHustlePayload(data, { imageUrl = null, timezone = 'Africa/Lagos' } = {}) {
  const isRemote = Boolean(data?.is_remote)
  const payload = {
    category_id: Number(data.category_id),
    title: data.title.trim(),
    description: data.description.trim(),
    location_text: isRemote ? REMOTE_LOCATION_TEXT : data.location_text.trim(),
    duration_minutes: Number(data.duration_minutes),
    required_experience_level: data.required_experience_level,
    payment_model: data.payment_model,
    budget_amount: Number(data.budget_amount),
    currency_code: 'NGN',
    status: 'open',
    ...(imageUrl ? { image_url: imageUrl } : {}),
  }

  if (!isRemote) {
    if (data.country_id) {
      payload.country_id = Number(data.country_id)
    }

    if (data.city_id) {
      payload.city_id = Number(data.city_id)
    }
  }

  if (data.skills && data.skills.trim() !== '') {
    const skills = data.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)

    if (skills.length > 0) {
      payload.skills = skills
    }
  }

  if (data.preferred_date && data.preferred_date.trim() !== '') {
    payload.preferred_date = data.preferred_date
    payload.timezone_name = timezone
  }

  if (data.preferred_start_time && data.preferred_start_time.trim() !== '') {
    payload.preferred_start_time = data.preferred_start_time
  }

  if (data.preferred_end_time && data.preferred_end_time.trim() !== '') {
    payload.preferred_end_time = data.preferred_end_time
  }

  return payload
}
