import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { walletService } from './wallet.service.js'
import useWalletStore from './wallet.store.js'
import useUIStore from '../../shared/store/ui.store.js'
import { queryKeys } from '../../services/query-keys.js'

export function useWallet() {
  return useQuery({
    queryKey: queryKeys.wallet.summary(),
    queryFn:  walletService.getWallet,
    staleTime: 30 * 1000, // 30s — balance should be fairly fresh
  })
}

export function useTransactions(params = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.wallet.transactions(params),
    queryFn:  ({ pageParam = 1 }) =>
      walletService.getTransactions({ ...params, page: pageParam, limit: 20 }),
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  })
}

export function useSetPin() {
  const { pinConfirmed } = useWalletStore()
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: walletService.setPin,
    onSuccess() {
      pinConfirmed()
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.summary() })
      toastSuccess("You're all set! Wallet PIN created.")
    },
    onError(err) {
      toastError(err.message ?? 'Failed to create PIN.')
    },
  })
}

export function useWithdraw() {
  const queryClient = useQueryClient()
  const { setActiveModal } = useWalletStore()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: walletService.withdraw,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.summary() })
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.transactions() })
      setActiveModal(null)
      toastSuccess('Withdrawal successful!')
    },
    onError(err) {
      toastError(err.message ?? 'Withdrawal failed.')
    },
  })
}

export function useTopUp() {
  const queryClient = useQueryClient()
  const { setActiveModal } = useWalletStore()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: walletService.topUp,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.summary() })
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.transactions() })
      setActiveModal(null)
      toastSuccess('Top up successful!')
    },
    onError(err) {
      toastError(err.message ?? 'Top up failed.')
    },
  })
}
