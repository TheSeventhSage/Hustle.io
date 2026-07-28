const FALLBACK_CURRENCY_SYMBOLS = {
  NGN: '₦',
  GHS: 'GH₵',
  USD: '$',
}

export function formatMoney(amount, currencyCode = 'NGN') {
  const numericAmount = Number(amount ?? 0)
  const normalizedCurrencyCode = typeof currencyCode === 'string'
    ? currencyCode.trim().toUpperCase()
    : 'USD'

  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: normalizedCurrencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount)
  } catch {
    const fallbackSymbol = FALLBACK_CURRENCY_SYMBOLS[normalizedCurrencyCode] ?? '$'
    return `${fallbackSymbol}${numericAmount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
}

// Never render a full account number after save — prefer the masked value or last4.
export function maskAccountNumber(account) {
  if (!account) return ''
  if (account.masked_account_number) return account.masked_account_number
  if (account.account_number_last4) return `••••${account.account_number_last4}`
  const raw = String(account.account_number ?? '').trim()
  if (!raw) return ''
  return raw.length > 4 ? `••••${raw.slice(-4)}` : raw
}

export function formatWalletAccount(account) {
  if (!account) return 'No bank account linked'

  const bankName = account.bank_name ?? 'Bank'
  const masked = maskAccountNumber(account)

  return masked ? `${bankName} - ${masked}` : `${bankName} - No account number`
}

// Provider-facing status copy from the withdrawal handoff §5. Never map an
// intermediate status to "Paid" — only the API `paid` status is success.
const WITHDRAWAL_STATUS_COPY = {
  pending: 'Awaiting OTP confirmation',
  approved: 'Awaiting payout approval',
  queued: 'Payout queued',
  processing: 'Payout is being processed',
  otp: 'Payout confirmation in progress',
  manual_review: 'Payout under review',
  paid: 'Payout completed',
  failed: 'Payout failed; funds returned',
  reversed: 'Payout reversed; funds returned',
  declined: 'Withdrawal declined; funds returned',
}

export function getWithdrawalStatusCopy(status) {
  return WITHDRAWAL_STATUS_COPY[String(status || '').toLowerCase()] ?? 'Processing'
}

// Final states that release/return funds — used to show refund messaging.
export function isRefundedWithdrawalStatus(status) {
  return ['failed', 'reversed', 'declined'].includes(String(status || '').toLowerCase())
}

export function formatEntryType(entryType) {
  if (!entryType) return '—'
  return entryType.charAt(0).toUpperCase() + entryType.slice(1)
}
