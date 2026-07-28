import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { walletService } from './wallet.service.js'
import useUIStore from '../../shared/store/ui.store.js'
import { getApiMessage } from '../../shared/utils/apiResponse.js'

const WALLET_KEYS = {
  wallet: () => ['wallet'],
  entries: (params = {}) => ['wallet', 'entries', params],
  bankAccounts: (params = {}) => ['wallet', 'bank-accounts', params],
  payoutBanks: (params = {}) => ['wallet', 'payout-banks', params],
}

function withCollectionMeta(items = [], res) {
  return Object.assign(items, {
    meta: res?.meta ?? res?.data?.meta ?? null,
    raw: res,
  })
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useWallet() {
  return useQuery({
    queryKey: WALLET_KEYS.wallet(),
    queryFn: walletService.getWallet,
    staleTime: 60 * 1000,
    // apiClient returns { data: <envelope>, error }
    // envelope shape: { success, data: { wallet: {...} } }
    select: (res) => res?.data?.data?.wallet ?? res?.data?.wallet ?? null,
  })
}

export function useWalletEntries(params = {}, options = {}) {
  return useQuery({
    queryKey: WALLET_KEYS.entries(params),
    queryFn: () => walletService.getEntries(params),
    staleTime: 60 * 1000,
    select: (res) => withCollectionMeta(res?.data?.data?.items ?? res?.data?.items ?? [], res),
    ...options,
  })
}

export function useBankAccounts(params = {}, options = {}) {
  return useQuery({
    queryKey: WALLET_KEYS.bankAccounts(params),
    queryFn: () => walletService.getBankAccounts(params),
    staleTime: 5 * 60 * 1000,
    select: (res) => withCollectionMeta(res?.data?.data?.items ?? res?.data?.items ?? [], res),
    ...options,
  })
}

export function usePayoutBanks(params = {}, options = {}) {
  return useQuery({
    queryKey: WALLET_KEYS.payoutBanks(params),
    queryFn: () => walletService.getPayoutBanks(params),
    staleTime: 30 * 60 * 1000, // bank list rarely changes
    select: (res) => res?.data?.data?.items ?? res?.data?.items ?? [],
    ...options,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useResolveBankAccount() {
  const { toastError } = useUIStore()

  return useMutation({
    mutationFn: walletService.resolveBankAccount,
    onError(err) {
      toastError(err?.message ?? 'We could not verify that account. Check the number and bank.')
    },
  })
}

export function useRequestWithdrawal() {
  const { toastSuccess, toastError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: walletService.requestWithdrawal,
    onSuccess(res) {
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.wallet() })
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.entries() })
      toastSuccess(getApiMessage(res, 'Withdrawal request submitted. Check your email for the OTP.'))
      return res?.data?.data ?? res?.data ?? res
    },
    onError(err) {
      toastError(err?.message ?? 'Withdrawal failed.')
    },
  })
}

export function useVerifyWithdrawalOtp() {
  const { toastSuccess, toastError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ withdrawalId, otp_code }) =>
      walletService.verifyWithdrawalOtp(withdrawalId, { otp_code }),
    onSuccess(res) {
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.wallet() })
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.entries() })
      toastSuccess(getApiMessage(res, 'Withdrawal approved successfully.'))
    },
    onError(err) {
      toastError(err.message ?? 'OTP verification failed.')
    },
  })
}

export function useAddBankAccount() {
  const { toastSuccess, toastError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: walletService.addBankAccount,
    onSuccess(res) {
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.bankAccounts() })
      toastSuccess(getApiMessage(res, 'Bank account added.'))
    },
    onError(err) {
      toastError(err.message ?? 'Failed to add bank account.')
    },
  })
}
