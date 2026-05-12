# HustleApp API Patch: Share, Countries, City Access Subscription, Insurance Wallet, Hustle Cancel, Admin Trash

Date: 2026-05-09

This patch is safe for an existing production database. It does not drop or recreate live tables.

## 1. Database migration

Run this first in phpMyAdmin:

```text
database/migrations/2026_05_09_share_country_city_insurance_trash_safe.sql
```

The migration adds:

- `share_links`
- `artisan_city_access_subscriptions`
- subscription columns on `artisan_city_access`
- `insurance_rates`
- `insurance_wallets`
- `insurance_wallet_transactions`
- `admin_trash`
- `job_insurance.insurance_rate_id`
- `job_insurance.currency_code`
- `hustle_posts.status` support for `cancelled`

## 2. Public country API

### `GET /countries`

Returns countries with pagination/search.

Query params:

```text
q optional
page optional, default 1
per_page optional, default 50, max 100
```

Example:

```http
GET /api/v1/countries?q=nigeria&page=1&per_page=50
```

Response:

```json
{
  "success": true,
  "message": "Countries loaded.",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Nigeria",
        "iso2_code": "NG",
        "iso3_code": "NGA"
      }
    ]
  },
  "meta": {
    "page": 1,
    "per_page": 50,
    "total": 1
  }
}
```

## 3. Share API

### `POST /share`

Auth: `client`, `artisan`, `company`

Creates or returns a reusable share link for a public target.

Allowed target types:

```text
service
hustle
company
```

Request:

```json
{
  "target_type": "hustle",
  "target_id": 12,
  "channel": "whatsapp"
}
```

Response includes:

```json
{
  "item": {
    "code": "a1b2c3d4e5f6",
    "target_type": "hustle",
    "target_id": 12,
    "share_url": "https://your-web-domain.com/share/a1b2c3d4e5f6",
    "api_url": "https://hustleapp.stii.click/api/v1/share/a1b2c3d4e5f6",
    "deep_link": "hustleapp://share/a1b2c3d4e5f6"
  }
}
```

### `GET /share/{code}`

Public endpoint. Frontend/mobile can open the share code, increment click count, and retrieve the target summary.

```http
GET /api/v1/share/a1b2c3d4e5f6
```

## 4. Artisan multi-city access/subscription API

### `GET /my/city-access`

Auth: `artisan`

Lists all cities where the artisan can operate.

```http
GET /api/v1/my/city-access?page=1&per_page=20
```

### `POST /my/city-access`

Auth: `artisan`

Adds or updates city access. This supports multiple cities per artisan. The existing unique rule is still one row per artisan/city.

Request:

```json
{
  "city_id": 1,
  "membership_plan_id": 2,
  "is_default_city": false,
  "is_active": true,
  "subscription_status": "active",
  "subscription_reference": "CITY-SUB-REF-001",
  "subscription_amount": 5000,
  "currency_code": "NGN",
  "starts_at": "2026-05-09 00:00:00",
  "ends_at": "2026-06-09 00:00:00"
}
```

Allowed `subscription_status` values:

```text
pending
active
expired
cancelled
```

### `PATCH /my/city-access/{id}`

Auth: `artisan`

Updates a city access row owned by the artisan.

### `POST /my/city-access/{id}/deactivate`

Auth: `artisan`

Cancels/deactivates a city access row.

## 5. Insurance percentage and insurance wallet

### `GET /insurance/rates`

Public. Returns active insurance rates for frontend display.

Query params:

```text
country_id optional
category_id optional
page optional
per_page optional
```

### `GET /admin/insurance/rates`

Auth: `admin`

Lists all insurance percentage rules.

### `POST /admin/insurance/rates`

Auth: `admin`

Creates an insurance percentage rule.

Request:

```json
{
  "country_id": 1,
  "category_id": 1,
  "name": "Nigeria cleaning insurance",
  "percentage_rate": 5,
  "currency_code": "NGN",
  "is_active": true
}
```

Notes:

- `country_id` may be null for a global fallback rate.
- `category_id` may be null for all categories.
- The most specific active match is used first: country + category, then country-only/category-only/global.

### `PATCH /admin/insurance/rates/{id}`

Auth: `admin`

Updates an insurance rate.

### `GET /admin/insurance/wallet`

Auth: `admin`

Shows the insurance wallet balance.

```http
GET /api/v1/admin/insurance/wallet?currency_code=NGN
```

### `GET /admin/insurance/wallet/transactions`

Auth: `admin`

Shows insurance money coming in/out.

When a verified payment includes `job_financials.insurance_amount > 0`, the backend now records an idempotent inflow in `insurance_wallet_transactions` and increases `insurance_wallets.available_balance` once.

## 6. Hustle post cancellation

### `POST /hustles/{id}/cancel`

Auth: `client` or `company`, owner only.

Allows the poster to cancel the hustle if they no longer want to continue.

Request:

```json
{
  "reason": "I no longer need this request."
}
```

Behavior:

- Sets `hustle_posts.status = cancelled`.
- Rejects pending/shortlisted applications.
- Cancels pending/awaiting-payment jobs.
- Declines pending payments.
- Blocks cancellation if the hustle already has a paid/in-progress/completed/disputed job.

## 7. Admin trash / 30-day delete

### `GET /admin/trash`

Auth: `admin`

Lists trashed/restored/purged items.

Query params:

```text
target_type optional
status optional: trashed, restored, purged, purge_failed
page optional
per_page optional
```

### `POST /admin/trash/{targetType}/{id}`

Auth: `admin`

Moves an item to trash for 30 days. Supported `targetType` values:

```text
hustle_post
provider_service
category
skill
city
review
```

Request:

```json
{
  "reason": "Duplicate or policy issue."
}
```

The item is first soft-deleted/deactivated. The row is recorded in `admin_trash` with `purge_after = deleted_at + 30 days`.

### `POST /admin/trash/{id}/restore`

Auth: `admin`

Restores a trashed item before the 30-day purge.

## 8. Cron cleanup

The existing cleanup script now also processes expired trash:

```cron
15 * * * * /usr/bin/php /path/to/hustleapp/scripts/cleanup.php >> /path/to/hustleapp/storage/logs/cleanup.log 2>&1
```

It only attempts hard-delete for the allowed admin trash target types. If MySQL foreign key constraints prevent hard delete, the trash row becomes `purge_failed` instead of breaking the cron.

## 9. Files changed

```text
src/Bootstrap/Application.php
src/Controllers/BaseController.php
src/Controllers/BookingController.php
src/Controllers/HustleController.php
src/Controllers/PaymentController.php
src/Controllers/DiscoveryController.php
src/Controllers/ShareController.php
src/Controllers/CityAccessController.php
src/Controllers/InsuranceController.php
src/Controllers/AdminTrashController.php
scripts/cleanup.php
database/migrations/2026_05_09_share_country_city_insurance_trash_safe.sql
```

## 10. Test checklist

1. Run the migration once.
2. Test `GET /countries`.
3. Create share link with `POST /share` and open `GET /share/{code}`.
4. Add two city access rows for the same artisan using different `city_id` values.
5. Create an admin insurance rate.
6. Create a booking/hustle job and verify `insurance_amount` is calculated.
7. Complete Paystack verification and confirm insurance wallet inflow is recorded once.
8. Cancel an open hustle with `POST /hustles/{id}/cancel`.
9. Move a test item to trash and restore it.
10. Run `php scripts/cleanup.php` and confirm it reports `trash_purged` and `trash_failed` fields.
