import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { jobsService } from './jobs.service.js'
import useUIStore from '../store/ui.store.js'
import { queryKeys } from '../../services/query-keys.js'

/**
 * Query: Get jobs list
 */
export function useJobs(params = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.jobs.mine(params),
        queryFn: () => jobsService.getJobs(params),
        staleTime: 60 * 1000,
        select: (res) => res?.data?.data?.items ?? res?.data?.items ?? res?.items ?? [],
        ...options,
    })
}

/**
 * Query: Get single job details
 */
export function useJob(jobId, options = {}) {
    return useQuery({
        queryKey: queryKeys.jobs.detail(jobId),
        queryFn: () => jobsService.getJobById(jobId),
        enabled: Boolean(jobId),
        staleTime: 60 * 1000,
        ...options,
    })
}

/**
 * Mutation: Initialize payment for a job.
 * POST /jobs/{id}/payment/initialize
 */
export function useInitializeJobPayment() {
    const { toastError } = useUIStore()

    return useMutation({
        mutationFn: (vars) => jobsService.initializePayment(vars?.id ?? vars, vars?.data ?? vars?.payload ?? {}),
        onError(err) {
            toastError(err?.message ?? 'Failed to initialize payment.')
        },
    })
}

/**
 * Mutation: Verify payment.
 * POST /payments/{reference}/verify
 */
export function useVerifyJobPayment() {
    const queryClient = useQueryClient()
    const { toastSuccess, toastError } = useUIStore()

    return useMutation({
        mutationFn: (reference) => jobsService.verifyPayment(reference),
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() })
            queryClient.invalidateQueries({ queryKey: queryKeys.hustles.all() })
            toastSuccess('Payment verified successfully!')
        },
        onError(err) {
            toastError(err?.message ?? 'Payment verification failed.')
        },
    })
}

/**
 * Mutation: Complete a job and release funds.
 * POST /jobs/{id}/complete
 */
export function useCompleteJob() {
    const queryClient = useQueryClient()
    const { toastSuccess, toastError } = useUIStore()

    return useMutation({
        mutationFn: (jobId) => jobsService.completeJob(jobId),
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() })
            toastSuccess('Job completed and funds released!')
        },
        onError(err) {
            toastError(err?.message ?? 'Failed to complete job.')
        },
    })
}

