import { apiClient } from '../../services/api.client.js'
import { storage } from '../../services/storage.js'
import { buildExportFilename, getFilenameFromDisposition, toPeriodQuery } from './financialReport.utils.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-v2.hustleapp.info/api/v1'
const ENDPOINT = '/provider/financial-report'

// The report owner is resolved from the bearer token — never send an account ID.
async function request(path, query = {}) {
  const response = await apiClient(path, { query })

  if (response?.error) {
    const error = new Error(response.error.errorData?.message || response.error.message || 'Request failed.')
    error.status = response.response?.status ?? null
    error.payload = response.error.errorData ?? null
    throw error
  }

  return response?.data ?? null
}

function toPage(payload) {
  const meta = payload?.meta ?? {}
  return {
    items: Array.isArray(payload?.data?.items) ? payload.data.items : [],
    meta: {
      page: Number(meta.page ?? 1),
      total: Number(meta.total ?? 0),
      totalPages: Number(meta.total_pages ?? 0),
      hasNextPage: Boolean(meta.has_next_page),
    },
  }
}

export const financialReportService = {
  // GET /provider/financial-report — summary, wallet and chart data.
  async getReport(period) {
    const payload = await request(ENDPOINT, toPeriodQuery(period))
    return payload?.data ?? null
  },

  // GET /provider/financial-report/transactions — earnings and completed withdrawals.
  async getTransactions(period, { page = 1, perPage = 20 } = {}) {
    return toPage(await request(`${ENDPOINT}/transactions`, {
      ...toPeriodQuery(period),
      page,
      per_page: perPage,
    }))
  },

  // GET /provider/financial-report/hustles — completed hustles / sales.
  async getHustles(period, { page = 1, perPage = 20 } = {}) {
    return toPage(await request(`${ENDPOINT}/hustles`, {
      ...toPeriodQuery(period),
      page,
      per_page: perPage,
    }))
  },

  // GET /provider/financial-report/export — backend-generated file bytes.
  // Phase 1 supports csv only.
  async exportReport(period, format = 'csv') {
    const params = new URLSearchParams({ ...toPeriodQuery(period), format })
    const token = storage.getToken()

    const response = await fetch(`${BASE_URL}${ENDPOINT}/export?${params}`, {
      headers: {
        Accept: 'text/csv',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      const error = new Error(payload?.message || `Download failed with status ${response.status}`)
      error.status = response.status
      error.payload = payload
      throw error
    }

    return {
      blob: await response.blob(),
      filename: getFilenameFromDisposition(
        response.headers.get('Content-Disposition'),
        buildExportFilename(period, format),
      ),
    }
  },
}
