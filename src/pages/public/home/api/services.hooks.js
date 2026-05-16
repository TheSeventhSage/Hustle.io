import { useQuery } from '@tanstack/react-query'
import { servicesService } from './services.service.js'
import { queryKeys } from '../../../../services/query-keys.js'
import {
    normalizeArtisanServicesPayload,
    normalizePrimaryProvidersCollection,
    normalizeServiceDetailPayload,
    normalizeServicesCollection,
} from '../../../../shared/lib/publicServices.js'

export function useServicesList(params = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.marketplace.services(params),
        queryFn: () => servicesService.list(params),
        select: (response) => normalizeServicesCollection(response),
        staleTime: 2 * 60 * 1000,
        ...options,
    })
}

export function usePrimaryServices(params = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.marketplace.primaryServices(params),
        queryFn: () => servicesService.listPrimary(params),
        select: (response) => normalizePrimaryProvidersCollection(response),
        staleTime: 2 * 60 * 1000,
        ...options,
    })
}

export function useService(id, options = {}) {
    const { enabled = true, ...queryOptions } = options

    return useQuery({
        queryKey: queryKeys.marketplace.serviceDetail(id),
        queryFn: () => servicesService.getById(id),
        select: (response) => normalizeServiceDetailPayload(response),
        enabled: Boolean(id) && enabled,
        staleTime: 60 * 1000,
        ...queryOptions,
    })
}

export function useArtisanServices(id, params = {}, options = {}) {
    const { enabled = true, ...queryOptions } = options

    return useQuery({
        queryKey: queryKeys.marketplace.artisanServices(id, params),
        queryFn: () => servicesService.getArtisanServices(id, params),
        select: (response) => normalizeArtisanServicesPayload(response),
        enabled: Boolean(id) && enabled,
        staleTime: 60 * 1000,
        ...queryOptions,
    })
}
