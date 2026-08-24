import { apiClient } from '../../services/api.client.js'
import { storage } from '../../services/storage.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-v2.hustleapp.info/api/v1'

function buildHeaders({ idempotencyKey } = {}) {
  const token = storage.getToken()

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {}),
  }
}

async function postJson(path, payload, { idempotencyKey } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders({ idempotencyKey }),
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`)
    error.status = response.status
    error.payload = data
    throw error
  }

  return { data, error: null }
}

export const kycService = {
  // GET /kyc/status — latest submission; sensitive fields are never returned.
  async getStatus() {
    const res = await apiClient('/kyc/status')
    if (res?.error) throw res.error
    return res
  },

  // POST /kyc/submissions — JSON body with previously uploaded media asset IDs.
  // Pass a stable `idempotencyKey` in data for retry safety.
  async submit(data = {}) {
    const { idempotencyKey } = data
    return postJson('/kyc/submissions', {
      document_type: data?.document_type,
      id_number: String(data?.id_number ?? '').trim(),
      first_name: String(data?.first_name ?? '').trim(),
      last_name: String(data?.last_name ?? '').trim(),
      date_of_birth: data?.date_of_birth,
      ...(data?.country_iso2 ? { country_iso2: data.country_iso2 } : {}),
      ...(data?.middle_name ? { middle_name: data.middle_name } : {}),
      ...(data?.gender ? { gender: data.gender } : {}),
      ...(data?.document_media_asset_id ? { document_media_asset_id: data.document_media_asset_id } : {}),
      ...(data?.selfie_media_asset_id ? { selfie_media_asset_id: data.selfie_media_asset_id } : {}),
    }, { idempotencyKey })
  },

  // GET /kyc/certifications — optional { status, category_id, q, page, per_page }
  async getCertifications(params = {}) {
    const res = await apiClient('/kyc/certifications', { query: params })
    if (res?.error) throw res.error
    return res
  },

  // POST /kyc/certifications — media_asset_id from a prior /media/upload call.
  async submitCertification(data = {}) {
    return postJson('/kyc/certifications', {
      certification_type_id: Number(data?.certification_type_id),
      ...(data?.certification_number ? { certification_number: data.certification_number } : {}),
      ...(data?.media_asset_id ? { media_asset_id: data.media_asset_id } : {}),
      ...(data?.issued_at ? { issued_at: data.issued_at } : {}),
      ...(data?.expires_at ? { expires_at: data.expires_at } : {}),
    })
  },

  // GET /certification-types — public lookup used to populate the certification type picker.
  async getCertificationTypes(params = {}) {
    const res = await apiClient('/certification-types', { query: { per_page: 100, ...params } })
    if (res?.error) throw res.error
    return res
  },
}
