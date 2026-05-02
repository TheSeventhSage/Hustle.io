export function formatMoney(amount, currencyCode = 'NGN') {
  const numericAmount = Number(amount ?? 0)

  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount)
  } catch {
    return `${currencyCode} ${numericAmount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
}

export function formatWalletAccount(account) {
  if (!account) return 'No bank account linked'

  const bankName = account.bank_name ?? 'Bank'
  const accountNumber = String(account.account_number ?? '').trim()

  return accountNumber
    ? `${bankName} - ${accountNumber}`
    : `${bankName} - No account number`
}

export function formatEntryType(entryType) {
  if (!entryType) return '—'
  return entryType.charAt(0).toUpperCase() + entryType.slice(1)
}
