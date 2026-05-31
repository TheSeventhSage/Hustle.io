import { useQuery } from '@tanstack/react-query'

import { hustlesService } from '../../../features/hustles/hustles.service.js'
import { queryKeys } from '../../../services/query-keys.js'
import { publicProfileService } from '../../../shared/api/publicProfile.service.js'
import { unwrapData, unwrapItems, unwrapMeta } from '../../../shared/lib/api/response.js'
import {
  normalizeArtisanServicesPayload,
  normalizePrimaryProvidersCollection,
  normalizeServiceDetailPayload,
  normalizeServicesCollection,
} from '../../../shared/lib/publicServices.js'

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
}

function normalizeFaqItems(response) {
  const data = unwrapData(response)
  const items = unwrapItems(response)
  const source = items.length
    ? items
    : Array.isArray(data?.faqs)
      ? data.faqs
      : Array.isArray(data?.questions)
        ? data.questions
        : Array.isArray(data)
          ? data
          : []

  return source
    .map((item) => ({
      q: item?.q ?? item?.question ?? item?.title ?? '',
      a: item?.a ?? item?.answer ?? item?.body ?? item?.content ?? '',
    }))
    .filter((item) => item.q)
}

function normalizeCollection(response, mapItem = (item) => item) {
  return {
    items: unwrapItems(response).map(mapItem),
    meta: unwrapMeta(response),
    raw: response,
  }
}

function normalizeReviewItems(response) {
  return normalizeCollection(response, (item) => {
    const nameParts = [item?.reviewer_first_name, item?.reviewer_last_name].filter(Boolean).join(' ').trim()
    const reviewerName = item?.reviewer_name
      || nameParts
      || item?.client_name
      || item?.author_name
      || 'Verified client'

    return {
      ...item,
      id: item?.id ?? `${reviewerName}-${item?.created_at ?? item?.job_id ?? item?.review_subject_account_id ?? 'review'}`,
      reviewerName,
      comment: item?.feedback_text ?? item?.comment ?? item?.review ?? '',
      rating: Number(item?.rating ?? 0) || 0,
    }
  })
}

export function useMarketplaceCategories(options = {}) {
  return useQuery({
    queryKey: queryKeys.marketplace.categories(),
    queryFn: hustlesService.getCategories,
    select: (response) => unwrapItems(response),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useMarketplaceServices(params = {}, options = {}) {
  const cleanedParams = cleanParams(params)

  return useQuery({
    queryKey: queryKeys.marketplace.services(cleanedParams),
    queryFn: () => hustlesService.listPublicServices(cleanedParams),
    select: (response) => normalizeServicesCollection(response),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export function usePrimaryServices(params = {}, options = {}) {
  const cleanedParams = cleanParams(params)

  return useQuery({
    queryKey: queryKeys.marketplace.primaryServices(cleanedParams),
    queryFn: () => hustlesService.listPrimaryPublicServices(cleanedParams),
    select: (response) => normalizePrimaryProvidersCollection(response),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export function useMarketplaceSearch(params = {}, options = {}) {
  const trimmedQuery = typeof params.q === 'string' ? params.q.trim() : ''
  const cleanedParams = cleanParams({
    ...params,
    q: trimmedQuery,
    type: params.type ?? 'services',
  })

  return useQuery({
    queryKey: queryKeys.marketplace.search(cleanedParams),
    queryFn: () => hustlesService.searchMarketplace(cleanedParams),
    select: (response) => normalizeServicesCollection(response),
    staleTime: 30 * 1000,
    enabled: options.enabled ?? Boolean(trimmedQuery),
    ...options,
  })
}

export function useMarketplaceFaqs(params = {}, options = {}) {
  const cleanedParams = cleanParams(params)

  return useQuery({
    queryKey: ['marketplace', 'faqs', cleanedParams],
    queryFn: () => hustlesService.getFaqs(cleanedParams),
    select: (response) => normalizeFaqItems(response),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useMarketplaceCompanies(params = {}, options = {}) {
  const cleanedParams = cleanParams(params)

  return useQuery({
    queryKey: ['marketplace', 'companies', cleanedParams],
    queryFn: () => hustlesService.listCompanies(cleanedParams),
    select: (response) => normalizeCollection(response),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useMarketplaceReviews(params = {}, options = {}) {
  const cleanedParams = cleanParams(params)

  return useQuery({
    queryKey: ['marketplace', 'reviews', cleanedParams],
    queryFn: () => hustlesService.getPublicReviews(cleanedParams),
    select: (response) => normalizeReviewItems(response),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useMarketplaceServiceDetail(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.marketplace.serviceDetail(id),
    queryFn: () => publicProfileService.getServicePayload(id),
    select: (response) => normalizeServiceDetailPayload(response),
    enabled: options.enabled ?? Boolean(id),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useMarketplaceArtisanServices(id, params = {}, options = {}) {
  const cleanedParams = cleanParams(params)

  return useQuery({
    queryKey: queryKeys.marketplace.artisanServices(id, cleanedParams),
    queryFn: () => publicProfileService.getArtisanServices(id, cleanedParams),
    select: (response) => normalizeArtisanServicesPayload(response),
    enabled: options.enabled ?? Boolean(id),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}
