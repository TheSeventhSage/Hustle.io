import { apiClient } from '../../services/api.client.js'
import { storage } from '../../services/storage.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hustleapp.stii.click/api/v1'

function buildHeaders(includeIdempotency = false) {
  const token = storage.getToken()

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(includeIdempotency && typeof crypto !== 'undefined' && crypto.randomUUID
      ? { 'X-Idempotency-Key': crypto.randomUUID() }
      : {}),
  }
}

async function postJson(path, payload, { includeIdempotency = false } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(includeIdempotency),
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`)
  }

  return { data, error: null }
}

export const walletService = {
  async getWallet() {
    const res = await apiClient('/wallet')
    if (res?.error) throw res.error
    return res
  },

  async getEntries() {
    const res = await apiClient('/wallet/entries')
    if (res?.error) throw res.error
    return res
  },

  async getBankAccounts() {
    const res = await apiClient('/wallet/bank-accounts')
    if (res?.error) throw res.error
    return res
  },

  async addBankAccount(data) {
    return postJson('/wallet/bank-accounts', {
      ...data,
      account_number: String(data?.account_number ?? '').trim(),
      country_id: data?.country_id != null ? Number(data.country_id) : data?.country_id,
      is_default: data?.is_default != null ? Number(data.is_default) : data?.is_default,
    })
  },

  async requestWithdrawal(data) {
    return postJson('/wallet/withdrawals', {
      payout_bank_account_id: Number(data?.payout_bank_account_id),
      amount: Number(data?.amount),
    }, { includeIdempotency: true })
  },

  async verifyWithdrawalOtp(withdrawalId, data) {
    return postJson(`/wallet/withdrawals/${withdrawalId}/verify-otp`, {
      otp_code: String(data?.otp_code ?? '').trim(),
    })
  },
}
