# HustleApp Patch: Restore My Hustles + Prevent Duplicate Pending Payments

## Problem fixed

1. `GET /api/v1/my/hustles` disappeared after later full-update packages overwrote the route/controller method.
2. Clicking payment again after an incomplete Paystack checkout could create another pending checkout instead of returning the existing pending payment session.

## Files changed

```text
src/Bootstrap/Application.php
src/Controllers/HustleController.php
src/Controllers/PaymentController.php
database/migrations/2026_05_10_restore_my_hustles_payment_reuse_safe.sql
```

## SQL

Run this migration after database backup:

```text
database/migrations/2026_05_10_restore_my_hustles_payment_reuse_safe.sql
```

It only adds indexes if missing and marks older duplicate pending checkout sessions as `gateway_status = abandoned`. It does not delete payments.

## Restored endpoint

```http
GET /api/v1/my/hustles
Authorization: Bearer CLIENT_OR_COMPANY_TOKEN
```

Query filters:

```http
GET /api/v1/my/hustles?page=1&per_page=20
GET /api/v1/my/hustles?status=open
GET /api/v1/my/hustles?status=cancelled
GET /api/v1/my/hustles?job_status=awaiting_payment
GET /api/v1/my/hustles?q=cleaning
GET /api/v1/my/hustles?city_id=1
GET /api/v1/my/hustles?country_id=1
```

Response includes cancellation/payment helpers:

```json
{
  "success": true,
  "message": "My hustle posts loaded.",
  "data": {
    "items": [
      {
        "id": 15,
        "title": "Apartment Cleaning",
        "status": "open",
        "applications_count": 3,
        "latest_job_id": 22,
        "latest_job_status": "awaiting_payment",
        "latest_payment_id": 44,
        "latest_payment_status": "pending",
        "latest_payment_gateway_status": "initialized",
        "can_cancel": true,
        "cancel_endpoint": "/hustles/15/cancel",
        "applications_endpoint": "/hustles/15/applications",
        "payment_initialize_endpoint": "/jobs/22/payment/initialize"
      }
    ]
  },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

## Payment behavior after patch

Payment initialization now behaves like this:

```text
If job already has approved payment:
  return approved payment; do not initialize again.

If job has an existing pending initialized Paystack checkout:
  return the same authorization_url and payment_id; do not create a duplicate payment.

If frontend sends force_new=true:
  mark previous open pending checkout as abandoned and create a fresh Paystack reference.
```

Endpoint:

```http
POST /api/v1/jobs/{id}/payment/initialize
Authorization: Bearer CLIENT_OR_COMPANY_TOKEN
Content-Type: application/json
```

Normal retry request:

```json
{}
```

If the existing checkout link is truly expired and the user needs a fresh one:

```json
{
  "force_new": true
}
```

Frontend should not call `force_new` by default. Use it only when the existing Paystack checkout cannot be opened or the user explicitly restarts payment.

