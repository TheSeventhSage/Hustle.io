import { useQuery } from '@tanstack/react-query'
import { availabilityService } from './availability.service.js'

/**
 * Fetch service availability slots
 * GET /services/{id}/availability
 */
export function useServiceAvailability(serviceId, params, options = {}) {
    return useQuery({
        queryKey: ['services', serviceId, 'availability', params],
        queryFn: () => availabilityService.getServiceAvailability(serviceId, params),
        enabled: Boolean(serviceId) && Boolean(params?.start_date) && Boolean(params?.end_date) && (options.enabled !== false),
        staleTime: 5 * 60 * 1000, // 5 minutes
        select: (res) => res?.data?.data?.items ?? res?.data?.items ?? [],
    })
}
