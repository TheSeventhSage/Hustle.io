import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { hustlesService } from './hustles.service.js'
import useHustlesStore from './hustles.store.js'
import useUIStore from '../../shared/store/ui.store.js'
import { queryKeys } from '../../services/query-keys.js'
import { getApiMessage } from '../../shared/utils/apiResponse.js'
import { unwrapItem, unwrapItems } from '../../shared/lib/api/response.js'

function withCollectionMeta(items = [], response) {
  return Object.assign(items, {
    meta: response?.meta ?? response?.data?.meta ?? null,
    raw: response,
  })
}

// Re-export jobs hooks from shared location
export { useJobs, useJob, useCompleteJob } from '../../shared/hustles/jobs.hooks.js'

// ── Queries ──────────────────────────────────────────────

export function useHustlesFeed(params = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.hustles.list(params),
    queryFn: ({ pageParam = 1 }) =>
      hustlesService.list({ ...params, page: pageParam, per_page: params.per_page ?? 12 }),
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta ?? {}
      return meta.has_next_page ? Number(meta.page ?? 1) + 1 : undefined
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useHustle(id) {
  return useQuery({
    queryKey: queryKeys.hustles.detail(id),
    queryFn: () => hustlesService.getById(id),
    select: (response) => unwrapItem(response),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  })
}

export function useMyHustles(params = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.hustles.mine(params),
    queryFn: () => hustlesService.getMyHustles(params),
    staleTime: 60 * 1000,
    select: (response) => withCollectionMeta(unwrapItems(response), response),
    ...options,
  })
}

export function useMyApplications(params = {}) {
  return useQuery({
    queryKey: queryKeys.hustles.applications(params),
    queryFn: () => hustlesService.getMyApplications(params),
    select: (response) => withCollectionMeta(unwrapItems(response), response),
    staleTime: 60 * 1000,
  })
}

export function useHustleReviews(hustleId) {
  return useQuery({
    queryKey: queryKeys.hustles.reviews(hustleId),
    queryFn: () => hustlesService.getReviews(hustleId),
    select: (response) => withCollectionMeta(unwrapItems(response), response),
    enabled: Boolean(hustleId),
  })
}

// ── Mutations ─────────────────────────────────────────────

export function useCreateHustle() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: hustlesService.create,
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.mine() })
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.all() })
      toastSuccess(getApiMessage(data, 'Hustle created successfully!'))
      navigate('/my-hustles')
    },
    onError(err) {
      toastError(err.message ?? 'Failed to create hustle.')
    },
  })
}

export function useUpdateHustle(id) {
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: (formData) => hustlesService.update(id, formData),
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.mine() })
      toastSuccess(getApiMessage(response, 'Hustle updated.'))
    },
    onError(err) {
      toastError(err.message ?? 'Failed to update hustle.')
    },
  })
}

export function useDeleteHustle() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: hustlesService.delete,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.mine() })
      toastSuccess(getApiMessage(response, 'Hustle deleted.'))
      navigate('/my-hustles')
    },
    onError(err) {
      toastError(err.message ?? 'Failed to delete hustle.')
    },
  })
}

export function useCancelHustle() {
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: ({ id, data }) => hustlesService.cancel(id, data),
    onSuccess(response, { id }) {
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.mine() })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() })
      toastSuccess(getApiMessage(response, 'Hustle cancelled.'))
    },
    onError(err) {
      toastError(err.message ?? 'Failed to cancel hustle.')
    },
  })
}

export function useApplyToHustle() {
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: ({ hustleId, data }) => hustlesService.apply(hustleId, data),
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.applications() })
      toastSuccess(getApiMessage(response, 'Application submitted successfully.'))
    },
    onError(err) {
      toastError(err.message ?? 'Failed to submit application.')
    },
  })
}

export function useMarkComplete() {
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: hustlesService.markComplete,
    onSuccess(response, id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.mine() })
      toastSuccess(getApiMessage(response, 'Hustle marked as complete.'))
    },
    onError(err) {
      toastError(err.message ?? 'Failed to mark hustle as complete.')
    },
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: ({ hustleId, data }) => hustlesService.submitReview(hustleId, data),
    onSuccess(response, { hustleId }) {
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.reviews(hustleId) })
      toastSuccess(getApiMessage(response, 'Review submitted. Thank you!'))
    },
    onError(err) {
      toastError(err.message ?? 'Failed to submit review.')
    },
  })
}

export function useSaveHustle() {
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: ({ id, saved }) =>
      saved ? hustlesService.unsaveHustle(id) : hustlesService.saveHustle(id),
    onSuccess(response, { saved }) {
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.all() })
      toastSuccess(getApiMessage(response, saved ? 'Hustle removed from saved.' : 'Hustle saved!'))
    },
    onError(err) {
      toastError(err.message ?? 'Failed to update saved hustle.')
    },
  })
}

export function useDecideApplication() {
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: ({ hustleId, applicationId, decision }) =>
      hustlesService.decideApplication(hustleId, applicationId, decision),
    onSuccess(response, { hustleId, decision }) {
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.detail(hustleId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.mine() })
      queryClient.invalidateQueries({ queryKey: queryKeys.hustles.detailApplications(hustleId) })
      toastSuccess(
        getApiMessage(
          response,
          decision === 'accepted'
            ? 'Applicant accepted successfully.'
            : `Application ${decision}.`
        )
      )
    },
    onError(err) {
      toastError(err.message ?? 'Failed to update application decision.')
    },
  })
}

export function useSubmitJobReview() {
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: ({ jobId, targetType, reviewSubjectAccountId, rating, feedbackText }) =>
      hustlesService.submitJobReview({
        target_type: targetType,
        review_subject_account_id: reviewSubjectAccountId,
        job_id: jobId,
        rating,
        feedback_text: feedbackText,
      }),
    onSuccess(response, { jobId }) {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.reviews() })
      toastSuccess(getApiMessage(response, 'Review submitted successfully. Thank you!'))
    },
    onError(err) {
      toastError(err.message ?? 'Failed to submit review.')
    },
  })
}
