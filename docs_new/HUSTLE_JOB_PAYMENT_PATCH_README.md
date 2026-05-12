# HustleApp Patch: Shared Job Payment for Booking + Hustle

## Why this patch exists

Before this patch, payment initialization was tied to bookings:

```http
POST /bookings/{id}/payment/initialize
```

That blocked the hustle journey because accepted hustle applications create jobs directly and do not have `provider_service_id` or booking records.

This patch keeps booking and hustle as separate entry points, but lets both pay through the shared `jobs` and `payments` layer.

```text
Booking -> Job -> Payment -> Wallet
Hustle Post -> Accepted Application -> Job -> Payment -> Wallet
```

## Files to upload

Upload these files to the same locations on your live server:

```text
src/Bootstrap/Application.php
src/Controllers/PaymentController.php
src/Controllers/HustleController.php
src/Controllers/BookingController.php
src/Controllers/JobController.php
```

## SQL to run

Run this update-only SQL in phpMyAdmin after backing up your database:

```text
database/migrations/2026_05_07_job_payment_hustle_update_only.sql
```

It does not drop or recreate tables.

## New endpoint

```http
POST /api/v1/jobs/{id}/payment/initialize
Authorization: Bearer CLIENT_OR_COMPANY_TOKEN
Content-Type: application/json
X-Idempotency-Key: unique-key-per-payment-attempt
```

This works for:

- booking-created jobs
- accepted hustle-application jobs

## Updated payment verification

```http
POST /api/v1/payments/{reference}/verify
Authorization: Bearer CLIENT_OR_COMPANY_TOKEN
```

The backend still verifies through Paystack. The frontend/mobile app must not decide payment success by itself.

## Updated hustle approval response

When this endpoint accepts an application:

```http
POST /api/v1/hustles/{id}/applications/{applicationId}/decision
```

with:

```json
{
  "decision": "accepted"
}
```

The response now includes:

```json
{
  "application_id": 12,
  "decision": "accepted",
  "job_id": 9,
  "status": "awaiting_payment",
  "payment_required": true,
  "payment_initialize_endpoint": "/jobs/9/payment/initialize"
}
```

Frontend/mobile should then show the Pay button and call:

```http
POST /api/v1/jobs/9/payment/initialize
```

## Recommended frontend/mobile journey

### Booking

```text
Client books provider service
Provider accepts booking
Backend returns/has job_id
Client taps Pay
POST /jobs/{job_id}/payment/initialize
Open Paystack authorization_url
POST /payments/{reference}/verify
Job becomes in_progress after backend verification
Client confirms completion
POST /jobs/{job_id}/complete
Funds release to artisan wallet
```

### Hustle

```text
Client/company creates hustle
Artisans apply
Client/company accepts one application
Backend returns job_id and payment_required=true
Client/company taps Pay
POST /jobs/{job_id}/payment/initialize
Open Paystack authorization_url
POST /payments/{reference}/verify
Job becomes in_progress after backend verification
Client/company confirms completion
POST /jobs/{job_id}/complete
Funds release to artisan wallet
```

## Important notes

- Do not create fake bookings for hustle applications.
- The payment amount comes from `job_financials.total_amount_due`.
- The payer is `jobs.client_account_id` for client jobs or `jobs.company_account_id` for company jobs.
- The artisan cannot initialize payment for their own job.
- Payment status is never trusted from the frontend.
