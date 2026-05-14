import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cityAccessService } from './cityAccess.service.js'
import { getCityAccessItems } from './cityAccess.utils.js'
import { queryKeys } from '../../services/query-keys.js'
import useUIStore from '../../shared/store/ui.store.js'
import { getApiMessage } from '../../shared/utils/apiResponse.js'

export function useCityAccess(params = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.cityAccess.list(params),
    queryFn: () => cityAccessService.list(params),
    select: (response) => getCityAccessItems(response),
    staleTime: 60 * 1000,
    ...options,
  })
}

export function useCreateCityAccess() {
  const queryClient = useQueryClient()
  const { toastError } = useUIStore()

  return useMutation({
    mutationFn: cityAccessService.create,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.cityAccess.all() })
    },
    onError(err) {
      toastError(err?.message ?? 'Failed to create city access.')
    },
  })
}

export function useUpdateCityAccess() {
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: ({ id, data }) => cityAccessService.update(id, data),
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: queryKeys.cityAccess.all() })
      toastSuccess(getApiMessage(response, 'City access updated.'))
    },
    onError(err) {
      toastError(err?.message ?? 'Failed to update city access.')
    },
  })
}

export function useDeactivateCityAccess() {
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: cityAccessService.deactivate,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: queryKeys.cityAccess.all() })
      toastSuccess(getApiMessage(response, 'City access deactivated.'))
    },
    onError(err) {
      toastError(err?.message ?? 'Failed to deactivate city access.')
    },
  })
}

export function useInitializeCityAccessPayment() {
  const { toastError } = useUIStore()

  return useMutation({
    mutationFn: (vars) => cityAccessService.initializePayment(vars?.id ?? vars, vars?.data ?? vars?.payload ?? {}),
    onError(err) {
      toastError(err?.message ?? 'Failed to initialize city access payment.')
    },
  })
}

export function useVerifyCityAccessPayment() {
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: cityAccessService.verifyPayment,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: queryKeys.cityAccess.all() })
      toastSuccess(getApiMessage(response, 'City access payment verified.'))
    },
    onError(err) {
      toastError(err?.message ?? 'City access payment verification failed.')
    },
  })
}
