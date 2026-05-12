import { apiClient } from '../../services/api.client.js'

/**
 * jobs.service.js
 * Shared job-related API calls for both clients and hustlers.
 */

export const jobsService = {
    /**
     * GET /jobs — list jobs for current account
     * @param {{ status?: string, page?: number }} params
     */
    async getJobs(params = {}) {
        // Map pending_approval to pending for the API
        const apiParams = { ...params }
        if (apiParams.status === 'pending_approval') {
            apiParams.status = 'pending'
        }

        const response = await apiClient('/jobs', { params: apiParams })
        return response
    },

    /**
     * GET /jobs/{id} — get single job details
     * @param {string|number} jobId
     */
    async getJobById(jobId) {
        const response = await apiClient(`/jobs/${jobId}`)
        return response
    },

    /**
     * POST /jobs/{id}/payment/initialize
     * Initialize payment for a job.
     * @param {string|number} jobId
     */
    async initializePayment(jobId) {
        const idempotencyKey = `job-${jobId}-pay-${Date.now()}`

        const response = await apiClient(`/jobs/${jobId}/payment/initialize`, {
            method: 'POST',
            headers: {
                'X-Idempotency-Key': idempotencyKey,
            },
            body: {},
        })

        return response
    },

    /**
     * POST /payments/{reference}/verify
     * Verify payment from backend.
     * @param {string} reference
     */
    async verifyPayment(reference) {
        const response = await apiClient(`/payments/${encodeURIComponent(reference)}/verify`, {
            method: 'POST',
            body: {},
        })

        return response
    },

    /**
     * POST /jobs/{id}/complete
     * Complete a job and release funds.
     * @param {string|number} jobId
     */
    async completeJob(jobId) {
        const response = await apiClient(`/jobs/${jobId}/complete`, {
            method: 'POST',
            body: {},
        })

        return response
    },
}

