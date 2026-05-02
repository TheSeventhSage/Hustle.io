import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { walletService } from './wallet.service.js'
import useUIStore from '../../shared/store/ui.store.js'
import { getApiMessage } from '../../shared/utils/apiResponse.js'

const WALLET_KEYS = {
  wallet: () => ['wallet'],
  entries: () => ['wallet', 'entries'],
  bankAccounts: () => ['wallet', 'bank-accounts'],
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

export function useWalletEntries() {
  return useQuery({
    queryKey: WALLET_KEYS.entries(),
    queryFn: walletService.getEntries,
    staleTime: 60 * 1000,
    select: (res) => res?.data?.data?.items ?? res?.data?.items ?? [],
  })
}

export function useBankAccounts() {
  return useQuery({
    queryKey: WALLET_KEYS.bankAccounts(),
    queryFn: walletService.getBankAccounts,
    staleTime: 5 * 60 * 1000,
    select: (res) => res?.data?.data?.items ?? res?.data?.items ?? [],
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

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
