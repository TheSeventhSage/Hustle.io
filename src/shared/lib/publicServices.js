import { unwrapData, unwrapItems, unwrapMeta, unwrapServicePayload } from './api/response.js'
import { formatCurrencyCodeAmount, formatExperienceLevel, formatServiceRate, formatStatusLabel } from './format.js'
import { firstDefined } from './normalize.js'

const FALLBACK_IMAGE = '/images/workers.png'

function joinLocation(...parts) {
  return parts
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(', ')
}

function splitSummary(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function getServiceProviderName(service = {}) {
  const personName = [service?.first_name, service?.last_name].filter(Boolean).join(' ').trim()

  return firstDefined(
    service?.provider_name,
    service?.artisan_name,
    service?.provider?.name,
    service?.profile?.display_name,
    service?.company_name,
    personName,
    'Verified professional'
  )
}

export function getServiceImage(service = {}) {
  return firstDefined(
    service?.image_url,
    service?.primary_image_url,
    service?.primary_image?.url,
    service?.media_asset?.url,
    service?.media?.url,
    service?.cover_image_url,
    FALLBACK_IMAGE
  )
}

export function getServiceAvatar(service = {}) {
  return firstDefined(
    service?.artisan_avatar,
    service?.provider_avatar,
    service?.profile_image_url,
    service?.provider?.avatar_url,
    getServiceImage(service)
  )
}

export function getServiceLocation(service = {}) {
  return firstDefined(
    service?.location_text,
    joinLocation(service?.city_name, service?.country_name),
    service?.city?.name,
    service?.country?.name,
    'Location not specified'
  )
}

export function getServiceCategoryName(service = {}) {
  return firstDefined(
    service?.category_name,
    service?.category?.name,
    service?.category_title,
    'Professional service'
  )
}

export function getServicePricingLabel(model) {
  const raw = String(model || '').trim().toLowerCase()
  if (!raw) return 'Pricing on request'
  if (raw === 'per_hour') return 'Hourly pricing'
  if (raw === 'per_service' || raw === 'full_amount' || raw === 'fixed') return 'Fixed service pricing'
  if (raw === 'starting_from') return 'Starting from'
  if (raw === 'range') return 'Price range'
  return formatStatusLabel(raw, 'Pricing on request')
}

function formatMarketplacePrice(service = {}) {
  const currency = service?.currency_code ?? 'NGN'
  const pricingType = String(service?.pricing_display_type || '').trim().toLowerCase()
  const minAmount = Number(firstDefined(service?.rate_min_amount, service?.default_rate_amount, service?.starting_price, 0) || 0)
  const maxAmount = Number(firstDefined(service?.rate_max_amount, 0) || 0)

  if (pricingType === 'range' && minAmount && maxAmount) {
    return `${formatCurrencyCodeAmount(minAmount, currency)} - ${formatCurrencyCodeAmount(maxAmount, currency)}`
  }

  if (pricingType === 'starting_from' && minAmount) {
    return `From ${formatCurrencyCodeAmount(minAmount, currency)}`
  }

  if (pricingType === 'fixed' && minAmount) {
    return formatCurrencyCodeAmount(minAmount, currency)
  }

  if (minAmount) {
    return service?.pricing_model_default
      ? formatServiceRate(minAmount, currency, service?.pricing_model_default)
      : formatCurrencyCodeAmount(minAmount, currency)
  }

  return 'Pricing on request'
}

export function normalizeServiceSkill(skill) {
  if (typeof skill === 'string') return skill

  return firstDefined(
    skill?.name,
    skill?.title,
    skill?.label,
    skill?.skill_name,
    ''
  )
}

function normalizeReview(review = {}) {
  const reviewerName = firstDefined(
    review?.reviewer_name,
    [review?.reviewer_first_name, review?.reviewer_last_name].filter(Boolean).join(' ').trim(),
    review?.client_name,
    review?.author_name,
    'Verified client'
  )

  return {
    ...review,
    reviewerName,
    comment: firstDefined(review?.feedback_text, review?.comment, review?.review, ''),
    rating: Number(review?.rating ?? 0) || 0,
  }
}

export function normalizeService(service = {}) {
  const skills = Array.isArray(service?.skills)
    ? service.skills.map(normalizeServiceSkill).filter(Boolean)
    : []
  const reviews = Array.isArray(service?.reviews)
    ? service.reviews.map(normalizeReview)
    : []
  const rating = Number(firstDefined(service?.average_rating, service?.rating, 0) || 0)
  const priceAmount = Number(firstDefined(service?.default_rate_amount, service?.starting_price, service?.rate_min_amount, 0) || 0)
  const experienceLabel = formatExperienceLevel(service?.experience_level)

  return {
    ...service,
    id: firstDefined(service?.id, service?.service_id, service?.provider_service_id, null),
    title: firstDefined(service?.title, service?.service_name, 'Untitled service'),
    description: firstDefined(service?.short_description, service?.description, 'No description provided yet.'),
    image: getServiceImage(service),
    avatar: getServiceAvatar(service),
    providerName: getServiceProviderName(service),
    locationLabel: getServiceLocation(service),
    categoryName: getServiceCategoryName(service),
    pricingLabel: getServicePricingLabel(service?.pricing_model_default ?? service?.pricing_display_type),
    experienceLabel: experienceLabel === 'â€”' ? 'Experience not specified' : experienceLabel,
    priceLabel: formatMarketplacePrice(service),
    priceAmount,
    rating,
    reviewCount: Number(firstDefined(service?.review_count, reviews.length, 0) || 0),
    skills,
    reviews,
    isActive: Boolean(service?.is_active ?? true),
    availabilityLabel: service?.is_active === 0 || service?.is_active === false
      ? 'Currently unavailable'
      : 'Available for bookings',
  }
}

export function normalizePrimaryProvider(provider = {}) {
  const primaryService = normalizeService({
    ...provider?.primary_service,
    artisan_account_id: provider?.artisan_account_id,
    artisan_name: provider?.artisan_name,
    artisan_first_name: provider?.artisan_first_name,
    artisan_last_name: provider?.artisan_last_name,
    average_rating: provider?.average_rating,
    review_count: provider?.review_count,
  })

  return {
    ...provider,
    id: provider?.artisan_account_id ?? provider?.id ?? null,
    artisanAccountId: provider?.artisan_account_id ?? provider?.id ?? null,
    providerName: firstDefined(
      provider?.artisan_name,
      [provider?.artisan_first_name, provider?.artisan_last_name].filter(Boolean).join(' ').trim(),
      primaryService.providerName,
      'Verified professional'
    ),
    providerBio: firstDefined(provider?.artisan_bio, primaryService.description, 'No provider bio available yet.'),
    rating: Number(provider?.average_rating ?? primaryService.rating ?? 0) || 0,
    reviewCount: Number(provider?.review_count ?? primaryService.reviewCount ?? 0) || 0,
    servicesCount: Number(provider?.services_count ?? 0) || 0,
    categoryNames: splitSummary(provider?.category_names),
    cityNames: splitSummary(provider?.city_names),
    countryNames: splitSummary(provider?.country_names),
    locationLabel: firstDefined(
      primaryService.locationLabel !== 'Location not specified' ? primaryService.locationLabel : null,
      joinLocation(splitSummary(provider?.city_names).join(', '), splitSummary(provider?.country_names).join(', ')),
      'Location not specified'
    ),
    primaryServiceId: provider?.primary_service_id ?? primaryService.id ?? null,
    primaryService,
    servicesEndpoint: provider?.services_endpoint ?? null,
  }
}

export function normalizeServicesCollection(payload) {
  return {
    items: unwrapItems(payload).map(normalizeService),
    meta: unwrapMeta(payload),
    raw: payload,
  }
}

export function normalizePrimaryProvidersCollection(payload) {
  return {
    items: unwrapItems(payload).map(normalizePrimaryProvider),
    meta: unwrapMeta(payload),
    raw: payload,
  }
}

export function normalizeServiceDetailPayload(payload) {
  const detail = unwrapServicePayload(payload)
  const item = detail?.item ?? {}
  const service = normalizeService({
    ...item,
    skills: detail?.skills?.length ? detail.skills : item?.skills,
    reviews: detail?.reviews?.length ? detail.reviews : item?.reviews,
  })

  return {
    ...service,
    raw: item,
    rawPayload: detail?.raw ?? null,
  }
}

export function normalizeArtisanServicesPayload(payload) {
  const data = unwrapData(payload) ?? {}
  const artisan = data?.artisan ?? {}
  const items = Array.isArray(data?.items) ? data.items.map(normalizeService) : []
  const leadService = items[0] ?? null

  return {
    artisanAccountId: artisan?.artisan_account_id ?? artisan?.id ?? null,
    providerName: firstDefined(
      artisan?.artisan_name,
      [artisan?.first_name, artisan?.last_name].filter(Boolean).join(' ').trim(),
      leadService?.providerName,
      'Verified professional'
    ),
    providerBio: firstDefined(artisan?.bio, leadService?.description, 'No provider bio available yet.'),
    rating: Number(artisan?.average_rating ?? leadService?.rating ?? 0) || 0,
    reviewCount: Number(artisan?.review_count ?? leadService?.reviewCount ?? 0) || 0,
    servicesCount: Number(artisan?.services_count ?? items.length ?? 0) || 0,
    items,
    leadService,
    raw: data,
  }
}
