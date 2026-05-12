# HustleApp Production Hardening Report - 2026-05-08

## Scope
This patch focuses on backend/database production readiness. It does not rebuild the app and does not make UI changes.

## Changed files

Upload these backend files from the patch package:

```text
src/Database/Database.php
src/Controllers/BaseController.php
src/Controllers/AuthController.php
src/Controllers/DiscoveryController.php
src/Controllers/PaymentController.php
src/Controllers/JobController.php
src/Controllers/WalletController.php
src/Controllers/AdminController.php
src/Controllers/ConversationController.php
src/Controllers/NotificationController.php
scripts/queue_worker.php
scripts/cleanup.php
```

Run this safe migration first:

```text
database/migrations/2026_05_08_production_hardening_safe_indexes_wallet_queue.sql
```

Optional verification script:

```text
database/migrations/2026_05_08_provider_search_explain_checks.sql
```

Production seed script:

```text
database/production/production_safe_seed.sql
```

## Database changes

### High-traffic indexes added safely
The migration checks `information_schema.STATISTICS` before adding indexes, so duplicate-index errors are avoided.

Provider/service search:

```text
idx_provider_services_category_active_artisan
idx_provider_services_artisan_active
idx_provider_services_active_posted
idx_artisan_city_access_city_active_artisan
idx_artisan_city_access_artisan_active
idx_provider_service_skills_skill_service
idx_provider_service_skills_service_skill
```

Booking/job dashboards:

```text
idx_bookings_status_scheduled
idx_bookings_scheduled_start
idx_bookings_client_status
idx_bookings_artisan_status
idx_jobs_client_status
idx_jobs_company_status
idx_jobs_artisan_status
idx_jobs_status_scheduled
idx_jobs_booking
idx_jobs_hustle
```

Notifications/messages:

```text
idx_notifications_account_read_created
idx_notifications_account_created
idx_messages_conversation_sent_id
```

Disputes/reviews/admin finance:

```text
idx_disputes_status_opened
idx_reviews_target_visible_created
idx_payments_payer_status_created
idx_withdrawals_status_requested
idx_withdrawals_wallet_status
```

Tokens/OTPs:

```text
uniq_email_verification_token_hash
idx_email_verification_account_consumed_expires
idx_email_verification_expires
idx_email_otps_account_purpose_expires
idx_email_otps_expires
```

### Wallet/payment idempotency columns

Added to `wallet_entries` if missing:

```text
reference_type VARCHAR(50)
reference_id VARCHAR(120)
uniq_wallet_entry_reference (wallet_id, reference_type, reference_id, entry_type)
```

This prevents duplicate balance movements for the same payment or withdrawal reference.

### Payment event audit fields

`payment_events` now supports:

```text
event_hash
is_duplicate
processed_at
```

The code records duplicate callbacks safely instead of allowing duplicate wallet updates.

### Queue/cache tables

```text
job_queue
app_cache
```

`job_queue` is used for email and future push/SMS/Telegram/webhook retry work. `app_cache` is available for DB-backed cache on shared hosting; current code uses file cache for public static data.

## Payment and wallet safety changes

### Payment verification/webhook idempotency

`PaymentController::finalizeVerifiedPayment()` now:

- verifies Paystack status server-side before changing local state;
- checks amount and currency against the local payment record;
- locks the payment row with `FOR UPDATE` inside a transaction;
- returns success without reprocessing if payment is already approved;
- records every gateway response in `payment_events`;
- detects duplicate payment events using an event hash;
- inserts escrow wallet hold using `INSERT IGNORE` plus `reference_type='payment'` and `reference_id=<gateway reference>`;
- increases wallet pending balance only if the wallet entry insert succeeds.

### Job completion/funds release idempotency

`JobController::markComplete()` now:

- locks the job/payment row during completion;
- requires verified payment before completion;
- inserts a single wallet release entry per payment reference;
- increases available balance only if that release entry is newly inserted;
- prevents duplicate completion calls from crediting the wallet twice.

### Withdrawal safety

`WalletController::verifyWithdrawalOtp()` now:

- locks the withdrawal/wallet rows;
- checks available balance inside the transaction;
- inserts a withdrawal ledger entry with a unique reference;
- updates the wallet balance only after the unique ledger entry succeeds.

`AdminController::processPayout()` now:

- locks the withdrawal/wallet rows;
- refunds only withdrawals that were already approved/deducted;
- prevents duplicate refund credits through `reference_type='withdrawal_refund'`.

## Search and pagination changes

Provider search/listing now supports optimized filters:

```http
GET /api/v1/services?category_id=1&city_id=1&skill_id=1&available_weekday=1&available_time=09:00&min_rating=4&page=1&per_page=20
```

The service listing avoids `SELECT *` and returns only frontend-needed fields.

Default pagination remains 20 records. Default max is now 50 records unless a controller explicitly overrides for static lookup data.

Cursor-style pagination was added where most useful:

```http
GET /api/v1/notifications?before_id=100&per_page=20
GET /api/v1/conversations/10?before_id=500&per_page=50
```

## Queue/background jobs

Email sending is moved out of request/response for:

- registration email verification;
- withdrawal OTP email.

The request saves the main DB record, queues the email, and returns immediately. The worker sends the email later.

Recommended cron:

```cron
* * * * * /usr/bin/php /path/to/hustleapp/scripts/queue_worker.php --limit=25 >> /path/to/hustleapp/storage/logs/queue.log 2>&1
```

Cleanup cron:

```cron
15 * * * * /usr/bin/php /path/to/hustleapp/scripts/cleanup.php >> /path/to/hustleapp/storage/logs/cleanup.log 2>&1
```

## Caching

File cache was added through `BaseController::cacheRemember()`.

Currently cached:

- public categories: 20 minutes;
- public cities: 20 minutes;
- legal pages: 45 minutes.

Recommended future additions:

- skills: 20 minutes;
- certification types: 30 minutes;
- membership plans: 30 minutes;
- homepage stats: 5 to 15 minutes.

## Production seed strategy

Use:

```text
database/production/production_safe_seed.sql
```

It seeds only:

- countries;
- cities;
- categories;
- skills;
- certification types;
- category certification requirements;
- membership plans;
- legal pages;
- one admin account.

It does not seed test users, bookings, jobs, payments, wallet entries, withdrawals, notifications, messages, KYC files, location updates, or admin logs.

Change the seeded admin password before production launch.

## Security and production readiness checklist

Set on live:

```env
APP_ENV=production
APP_DEBUG=false
INSTALLER_ENABLED=false
```

Keep these only in `.env`:

```env
JWT_SECRET=
DB_PASSWORD=
PAYSTACK_SECRET_KEY=
KYC_PROVIDER_API_KEY=
```

Server recommendations:

```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0
```

Also enable:

- HTTPS only;
- MySQL slow query log;
- daily DB backup;
- application error logs;
- rate limiting for login, OTP, payment callbacks, and password reset;
- cron worker and cleanup jobs.

## Tests/checks run in this patch environment

Static checks run:

```text
php -l src/Database/Database.php
php -l src/Controllers/BaseController.php
php -l src/Controllers/AuthController.php
php -l src/Controllers/DiscoveryController.php
php -l src/Controllers/PaymentController.php
php -l src/Controllers/JobController.php
php -l src/Controllers/WalletController.php
php -l src/Controllers/AdminController.php
php -l src/Controllers/ConversationController.php
php -l src/Controllers/NotificationController.php
php -l scripts/queue_worker.php
php -l scripts/cleanup.php
```

Expected live tests after upload:

1. Send the same Paystack webhook/reference twice. Wallet pending balance must increase once only.
2. Call `/jobs/{id}/complete` twice. Wallet available balance must increase once only.
3. Verify withdrawal OTP twice. Available balance must reduce once only.
4. Run `database/migrations/2026_05_08_provider_search_explain_checks.sql` and confirm provider queries use the new indexes.
5. Test `/notifications?before_id=...` and `/conversations/{id}?before_id=...` pagination.
6. Run `scripts/queue_worker.php --limit=1` and confirm queued emails move from `pending` to `done`.

## Remaining risks

- Live `EXPLAIN` results must be checked on the real production database after migration because index choice depends on actual data volume and cardinality.
- Existing rows created before this patch may not have `wallet_entries.reference_type/reference_id`. New payment/withdrawal rows will have them.
- If any old duplicate `email_verification_tokens.token_hash` rows exist, the unique index can fail. This is unlikely because token hashes are generated randomly, but backup before running the migration.
- The queue worker is database-backed for shared hosting compatibility. For larger scale, Redis/SQS/Beanstalkd or a managed queue should replace it later.
