import { apiClient } from './api.client.js'

/**
 * Legal service for fetching legal pages
 */
async function request(path, options = {}) {
    const response = await apiClient(path, options)
    if (response?.error) throw response.error
    return response
}

function normalizeLegalPage(response) {
    const payload = response?.data ?? response ?? {}
    const item = payload?.data?.item ?? payload?.item ?? null

    if (!item) {
        return {
            item: null,
            message: payload?.message ?? '',
            meta: payload?.meta ?? null,
        }
    }

    return {
        item: {
            ...item,
            content: item.body_content ?? item.content ?? '',
            updated_at: item.published_at ?? item.updated_at ?? null,
        },
        message: payload?.message ?? '',
        meta: payload?.meta ?? null,
    }
}

export const legalService = {
    /**
     * Get legal page by type
     * @param {string} pageType - Type of legal page (terms, privacy, refund-policy, faq)
     * @returns {Promise<Object>} Legal page data
     */
    async getLegalPage(pageType) {
        return normalizeLegalPage(await request(`/legal/${pageType}`))
    },
}
