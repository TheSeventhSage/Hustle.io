# HustleApp Automated Withdrawals — Mobile and Frontend API Handoff

**Base URL:** `https://api-v2.hustleapp.info/api/v1`  
**Authentication:** `Authorization: Bearer <provider-token>`

## Required provider flow

### 1. Load supported payout banks

```http
GET /wallet/payout-banks?country=ghana&currency=GHS&type=ghipss
```

Use only the `code` returned by the API. Do not hard-code bank codes or allow the provider to type a bank name.

### 2. Resolve the account before saving

```http
POST /wallet/bank-accounts/resolve
Content-Type: application/json

{
  "bank_code": "BANK_CODE_FROM_STEP_1",
  "account_number": "ACCOUNT_NUMBER",
  "currency_code": "GHS",
  "recipient_type": "ghipss"
}
```

Display the resolved account name for confirmation. The app must not send a user-entered beneficiary name as the trusted account name.

### 3. Save the verified payout account

```http
POST /wallet/bank-accounts
Content-Type: application/json

{
  "bank_code": "BANK_CODE_FROM_STEP_1",
  "account_number": "ACCOUNT_NUMBER",
  "currency_code": "GHS",
  "recipient_type": "ghipss"
}
```

The backend resolves the account again, creates/reuses the Paystack transfer recipient, and returns the saved `payout_bank_account_id`.

### 4. Request a withdrawal

```http
POST /wallet/withdrawals
Content-Type: application/json

{
  "amount": "10.00",
  "payout_bank_account_id": 123
}
```

Requirements enforced by the backend:

- Provider KYC must be approved.
- The bank account must be verified and active.
- Currency must be enabled for payouts.
- Amount must satisfy minimum, maximum, daily limit, and wallet balance rules.

### 5. Verify the HustleApp withdrawal OTP

```http
POST /wallet/withdrawals/{withdrawal_id}/verify-otp
Content-Type: application/json

{
  "otp_code": "123456"
}
```

The successful response will be either:

```json
{
  "success": true,
  "message": "Withdrawal confirmed and awaiting administrator approval.",
  "data": {
    "withdrawal_id": 123,
    "status": "approved"
  }
}
```

or, when fully automatic processing is enabled:

```json
{
  "success": true,
  "message": "Withdrawal confirmed and queued for Paystack payout.",
  "data": {
    "withdrawal_id": 123,
    "status": "queued"
  }
}
```

## Status display rules

| API status | Display text | Final? |
|---|---|---:|
| `pending` | Awaiting OTP confirmation | No |
| `approved` | Awaiting payout approval | No |
| `queued` | Payout queued | No |
| `processing` | Paystack is processing payout | No |
| `otp` | Merchant transfer confirmation required | No |
| `manual_review` | Payout under review | No |
| `paid` | Payout completed | Yes |
| `failed` | Payout failed; funds returned | Yes |
| `reversed` | Payout reversed; funds returned | Yes |
| `declined` | Withdrawal declined; funds returned | Yes |

Never display `approved`, `queued`, `processing`, or `otp` as “Paid”.

## App security boundary

The mobile app and React frontend must never receive or store:

- Paystack secret keys.
- Paystack recipient creation credentials.
- Paystack transfer OTP configuration.
- Webhook secrets or signature logic.

All Paystack calls are server-to-server. The app only calls HustleApp API routes.

During deployment, when `PAYSTACK_PAYOUTS_ENABLED=false`, existing legacy bank accounts and the previous administrator payment workflow remain usable. After the feature is enabled, the app must require a Paystack-verified payout account and use the automated status lifecycle below.

## Admin integration

The admin panel should use the dedicated actions instead of accepting an arbitrary transfer reference and manually marking a withdrawal paid:

```text
POST /admin/withdrawals/{id}/approve
POST /admin/withdrawals/{id}/retry
POST /admin/withdrawals/{id}/verify
POST /admin/withdrawals/{id}/finalize-otp
POST /admin/withdrawals/{id}/decline
POST /admin/withdrawals/{id}/manual-review
```

Recommended controls by status:

- `approved`: Approve and queue, Decline.
- `queued` or `processing`: Verify, Manual review.
- `otp`: Finalize OTP, Verify, Manual review.
- `failed`: Verify first; Retry only when the transfer outcome is confirmed safe.
- `manual_review`: Verify, Retry only after reconciliation, Decline only when no Paystack transfer exists.
- `paid`, `reversed`, `declined`: Read-only.

## Testing

Import `docs/postman_collection.json` into Postman. Set:

- `token`
- `adminToken`
- `bankCode`
- `accountNumber`
- `payoutBankAccountId`
- `withdrawalId`
- `withdrawalOtp`

Use a company-controlled Ghana account for the first live payout.
