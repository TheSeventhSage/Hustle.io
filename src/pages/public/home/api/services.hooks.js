import { useQuery } from '@tanstack/react-query'
import { servicesService } from './services.service.js'
import { queryKeys } from '../../../../services/query-keys.js' // Assuming this exists based on your structure

export function useServicesList(params = {}) {
    return useQuery({
        queryKey: ['services', 'list', params], // Fallback if queryKeys.services.list is not set
        queryFn: () => servicesService.list(params),
        staleTime: 2 * 60 * 1000,
    })
}

export function useService(id) {
    return useQuery({
        queryKey: ['services', 'detail', id],
        queryFn: () => servicesService.getById(id),
        enabled: Boolean(id),
        staleTime: 60 * 1000,
    })
}