# HustleApp Upgrade Implementation Notes

## Existing database structure reviewed

The uploaded production SQL and bundled `database/schema.sql` already include most of the required domain tables, so this upgrade keeps the current architecture intact.

Relevant existing tables:

- `accounts`, `user_profiles`, `company_profiles`, `account_settings`: user identity, roles, profile image references, and timezone preferences.
- `media_assets`: existing central table for uploaded/profile/listing/portfolio/KYC media references.
- `provider_services`, `portfolio_items`: service and portfolio image references through `primary_image_asset_id` and `image_asset_id`.
- `bookings`: client/artisan request flow, scheduled time, timezone, service address, latitude, and longitude.
- `jobs`, `job_financials`, `payments`: job lifecycle, service amount, platform fee, provider net amount, and payment record.
- `wallets`, `wallet_entries`, `withdrawal_requests`, `payout_bank_accounts`: wallet balance and withdrawal workflow.
- `artisan_availability_rules`, `artisan_availability_exceptions`: existing scheduling tables with timezone support.
- `kyc_submissions`, `kyc_submission_files`, `provider_certifications`: existing KYC and certification review flow.
- `notifications`, `conversations`: used to notify participants when bookings, payments, and releases happen.

## Database changes required

Apply:

```sql
source database/migrations/2026_05_05_upgrade_uploads_payments_scheduling_tracking_kyc.sql;
```

The migration:

- Adds upload audit metadata to `media_assets`: `file_size_bytes`, `checksum_sha256`, and `visibility`.
- Extends `bookings.status` without removing old values. New values include `accepted`, `rejected`, `awaiting_payment`, `paid`, `in_progress`, `completed`, and `disputed`.
- Extends `jobs.status` to support `awaiting_payment` and `paid` while preserving old values.
- Adds optional `provider_service_id` to availability rules and exceptions so an artisan can define general availability or service-specific availability.
- Adds Paystack/gateway audit fields to `payments`: `gateway`, `gateway_transaction_id`, `gateway_status`, `authorization_url`, `access_code`, `gateway_payload_json`, `verified_at`, and `updated_at`.
- Adds `payment_events` for auditable initialization, verification, and webhook records.
- Adds `booking_location_updates` for short-lived booking-specific artisan tracking updates.
- Adds country/provider-aware KYC fields to `kyc_submissions`: `country_id`, `provider_name`, `provider_reference`, `provider_status`, `provider_response_json`, and `verified_at`.

## New and modified API endpoints

### Media upload/retrieval

- `POST /api/v1/media/upload`
  - Authenticated.
  - Multipart form field: `image` or `file`.
  - Body: `asset_type=profile_image|listing_image|portfolio_image|kyc_document|selfie`.
  - Stores only safe image formats: JPG, JPEG, PNG, WebP.
  - Saves file under controlled `storage/uploads/...` path and creates a `media_assets` row.
  - Response includes `asset.id` and API image URL.

- `GET /api/v1/media/{id}/file`
  - Public for listing/profile/portfolio images.
  - Requires owner/admin bearer token for `kyc_document` and `selfie` images.

### Booking/payment flow

- `POST /api/v1/bookings`
  - Existing endpoint updated to normalize scheduled time with the submitted/user timezone and keep the booking `pending`.

- `POST /api/v1/bookings/{id}/confirm`
  - Artisan accepts booking.
  - Booking status becomes `awaiting_payment`.
  - Job stays `pending`; artisan cannot start until payment is verified.

- `POST /api/v1/bookings/{id}/reject`
  - Artisan rejects a pending/awaiting-payment booking.

- `POST /api/v1/bookings/{id}/payment/initialize`
  - Client-only.
  - Initializes Paystack on the backend.
  - Returns `authorization_url`, `access_code`, `reference`, and `payment_id`.

- `POST /api/v1/payments/{reference}/verify`
  - Client-only.
  - Backend verifies the transaction with Paystack.
  - Confirms Paystack transaction status, amount, and currency before updating local records.

- `POST /api/v1/payments/webhooks/paystack`
  - Public webhook endpoint.
  - Verifies `x-paystack-signature` using the Paystack secret key.
  - Handles `charge.success` events idempotently and verifies the transaction server-side before marking paid.

### Wallet/release flow

- `POST /api/v1/jobs/{id}/complete`
  - Existing endpoint changed so only the client/company owner can confirm completion.
  - Requires payment status `approved`.
  - Releases the provider net amount from wallet pending balance to available balance.
  - Adds an auditable `wallet_entries.release` row.

- `GET /api/v1/wallet`
  - Existing endpoint remains.

- `POST /api/v1/wallet/withdrawals`
  - Existing endpoint now requires latest KYC submission to be `approved`.

### Availability/scheduling

- `GET /api/v1/services/{id}/availability?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&timezone_name=Africa/Lagos&slot_minutes=60`
  - Public endpoint for clients to view available service slots.
  - Uses artisan rules, service-specific rules, exceptions, existing bookings, and requested display timezone.

- `GET /api/v1/availability/rules`
- `POST /api/v1/availability/rules`
- `GET /api/v1/availability/exceptions`
- `POST /api/v1/availability/exceptions`
  - Existing endpoints now accept optional `provider_service_id` to make availability service-specific.

### Location tracking

- `POST /api/v1/bookings/{id}/location`
  - Artisan-only.
  - Saves live location only for paid/active bookings.
  - Requires valid latitude/longitude.
  - Location updates expire after 15 minutes.

- `GET /api/v1/bookings/{id}/location`
  - Client/artisan-only for that booking.
  - Returns client destination and latest non-expired artisan location.
  - Does not expose location data for unpaid/inactive bookings.

### KYC

- `GET /api/v1/kyc/status`
  - Existing endpoint updated to return country/provider fields without exposing ID number or provider payload.

- `POST /api/v1/kyc/submissions`
  - Supports `country_id` or `country_iso2`; default is configurable with `KYC_DEFAULT_COUNTRY_ISO2=NG`.
  - Allows only approved document types: `bvn`, `nin`, `passport`, `drivers_license`, `voter_id`, `national_id`.
  - Accepts safe image uploads through `document_file` and `selfie_file`, or previously uploaded `document_media_asset_id` and `selfie_media_asset_id`.
  - Keeps manual/admin review as fallback if no KYC provider URL/key is configured.

## Environment variables added

```env
UPLOAD_MAX_IMAGE_BYTES=5242880
PAYMENT_GATEWAY=paystack
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_BASE_URL=https://api.paystack.co
PAYSTACK_CALLBACK_URL=https://your-domain.example/payment/callback
KYC_DEFAULT_COUNTRY_ISO2=NG
KYC_PROVIDER=manual
KYC_PROVIDER_BASE_URL=
KYC_PROVIDER_API_KEY=
KYC_PROVIDER_APP_ID=
MAPS_PROVIDER=google_maps
MAPS_BROWSER_API_KEY=
```

## Frontend integration points

1. Upload images with `multipart/form-data` before saving profile/service/portfolio/KYC records.
2. Use the returned `asset.id` as `profile_image_asset_id`, `primary_image_asset_id`, `image_asset_id`, `document_media_asset_id`, or `selfie_media_asset_id`.
3. Display uploaded images through the returned `asset.url` or list/detail `image_url` fields.
4. For bookings, show `awaiting_payment` after artisan acceptance and enable the client payment button only then.
5. On payment click, call backend initialize endpoint and redirect/open Paystack with `authorization_url` or SDK `access_code`.
6. After Paystack callback, call backend verify endpoint with the reference. Do not set paid state from frontend alone.
7. For scheduling, call service availability endpoint with the client browser timezone, then submit selected `scheduled_start_at` and `timezone_name` on booking creation.
8. For live tracking, request browser/device geolocation permission only after the job is paid/active; artisan app posts location periodically; client app polls latest location or adapts to WebSocket later.
9. For maps, the API returns `maps.provider` and `maps.browser_api_key`; frontend can load Google Maps or a configured free-tier alternative.

## Security improvements implemented

- File uploads are whitelisted to JPG/JPEG/PNG/WebP only.
- MIME type, extension, image validity, size, random filenames, and controlled directories are enforced.
- KYC/private media is not publicly readable without owner/admin authorization.
- Payment initialization and verification are backend-only.
- Webhooks verify Paystack HMAC signatures.
- Paystack success is not trusted until the backend verifies transaction status, amount, and currency.
- Payment and webhook events are recorded in `payment_events`.
- Wallet funds are held as pending after payment and released only after client/company completion confirmation.
- Location updates are allowed only for paid/active bookings and only to booking participants.
- Withdrawal requests require approved KYC.

## Assumptions

- The customer-facing frontend/mobile app is outside this ZIP; this package exposes the API integration points it needs.
- Existing admin pages are preserved. Admin can continue reviewing KYC/certifications using existing controllers.
- Paystack is the default gateway now, but `payments.gateway` and `PaymentController` are structured so another gateway can be added without changing booking/wallet tables again.
- KYC provider credentials were not included, so the implementation supports configurable provider submission and falls back to current manual review.
- Location tracking is near-real-time polling. A WebSocket server can later consume the same `booking_location_updates` rules and authorization model.
