import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { kycService } from './kyc.service.js'
import useUIStore from '../../shared/store/ui.store.js'
import { getApiMessage } from '../../shared/utils/apiResponse.js'
import { queryKeys } from '../../services/query-keys.js'

function withCollectionMeta(items = [], res) {
  return Object.assign(items, {
    meta: res?.meta ?? res?.data?.meta ?? null,
    raw: res,
  })
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useKycStatus(options = {}) {
  return useQuery({
    queryKey: queryKeys.kyc.status(),
    queryFn: kycService.getStatus,
    staleTime: 60 * 1000,
    // apiClient returns { data: <envelope>, error }
    // envelope shape: { success, data: { submission } } (submission is null when nothing was submitted yet)
    select: (res) => res?.data?.data?.submission ?? res?.data?.submission ?? null,
    ...options,
  })
}

export function useKycCertifications(params = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.kyc.certifications(params),
    queryFn: () => kycService.getCertifications(params),
    staleTime: 60 * 1000,
    select: (res) => withCollectionMeta(res?.data?.data?.items ?? res?.data?.items ?? [], res),
    ...options,
  })
}

export function useCertificationTypes(params = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.kyc.certificationTypes(params),
    queryFn: () => kycService.getCertificationTypes(params),
    staleTime: 30 * 60 * 1000, // lookup data, rarely changes
    select: (res) => res?.data?.data?.items ?? res?.data?.items ?? [],
    ...options,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useSubmitKyc() {
  const { toastSuccess, toastError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: kycService.submit,
    onSuccess(res) {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.status() })
      toastSuccess(getApiMessage(res, 'KYC submission received. We will review it shortly.'))
      return res?.data?.data ?? res?.data ?? res
    },
    onError(err) {
      toastError(err?.message ?? 'KYC submission failed.')
    },
  })
}

export function useSubmitCertification() {
  const { toastSuccess, toastError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: kycService.submitCertification,
    onSuccess(res) {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.certifications({}) })
      toastSuccess(getApiMessage(res, 'Certification submitted for review.'))
    },
    onError(err) {
      toastError(err?.message ?? 'Certification submission failed.')
    },
  })
}
