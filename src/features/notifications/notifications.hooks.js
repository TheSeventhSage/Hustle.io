import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from './notifications.service.js'
import { queryKeys } from '../../services/query-keys.js'
import useUIStore from '../../shared/store/ui.store.js'

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: notificationsService.getNotifications,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const { toastError } = useUIStore()

  return useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() })
    },
    onError(error) {
      toastError(error.message ?? 'Failed to mark notification as read.')
    },
  })
}
