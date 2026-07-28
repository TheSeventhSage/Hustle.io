import { apiClient } from '../../services/api.client.js'
import { storage } from '../../services/storage.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-v2.hustleapp.info/api/v1'

function buildHeaders({ idempotencyKey } = {}) {
  const token = storage.getToken()

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // A caller-supplied key is reused across timeout retries of the SAME action
    // (see the withdrawal handoff §2). Never generate a fresh key per attempt.
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
    error.code = data?.data?.errors?.code ?? data?.errors?.code ?? null
    error.payload = data
    throw error
  }

  return { data, error: null }
}

// Send money amounts as a decimal major-unit string ("10.00"), per the
// WithdrawalRequest schema — never a floating-point number.
function toDecimalString(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value ?? '')
  return num.toFixed(2)
}

export const walletService = {
  async getWallet() {
    const res = await apiClient('/wallet')
    if (res?.error) throw res.error
    return res
  },

  async getEntries(params = {}) {
    const res = await apiClient('/wallet/entries', { query: params })
    if (res?.error) throw res.error
    return res
  },

  // GET /wallet/payout-banks — Paystack-supported Ghana banks for the picker.
  async getPayoutBanks(params = {}) {
    const query = { country: 'ghana', currency: 'GHS', type: 'ghipss', ...params }
    const res = await apiClient('/wallet/payout-banks', { query })
    if (res?.error) throw res.error
    return res
  },

  async getBankAccounts(params = {}) {
    const res = await apiClient('/wallet/bank-accounts', { query: params })
    if (res?.error) throw res.error
    return res
  },

  // POST /wallet/bank-accounts/resolve — returns the Paystack-verified account name.
  async resolveBankAccount(data = {}) {
    return postJson('/wallet/bank-accounts/resolve', {
      bank_code: String(data?.bank_code ?? '').trim(),
      account_number: String(data?.account_number ?? '').trim(),
    })
  },

  // POST /wallet/bank-accounts — creates/reuses the Paystack recipient.
  // Pass a stable `idempotencyKey` in the data for retry safety.
  async addBankAccount(data = {}) {
    const { idempotencyKey } = data
    return postJson('/wallet/bank-accounts', {
      bank_code: String(data?.bank_code ?? '').trim(),
      account_number: String(data?.account_number ?? '').trim(),
      is_default: Boolean(data?.is_default),
      ...(data?.branch_name ? { branch_name: data.branch_name } : {}),
      ...(data?.swift_code ? { swift_code: data.swift_code } : {}),
    }, { idempotencyKey })
  },

  // POST /wallet/withdrawals — pass a stable `idempotencyKey` in the data.
  async requestWithdrawal(data = {}) {
    const { idempotencyKey } = data
    return postJson('/wallet/withdrawals', {
      payout_bank_account_id: Number(data?.payout_bank_account_id),
      amount: toDecimalString(data?.amount),
    }, { idempotencyKey })
  },

  async verifyWithdrawalOtp(withdrawalId, data) {
    return postJson(`/wallet/withdrawals/${withdrawalId}/verify-otp`, {
      otp_code: String(data?.otp_code ?? '').trim(),
    })
  },
}
