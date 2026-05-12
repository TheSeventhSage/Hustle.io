# HustleApp Patch: Fix GET /jobs SQLSTATE[HY093]

## Problem

After the shared job-payment/hustle payment update, this endpoint can fail for client accounts:

```http
GET /api/v1/jobs?status=pending
```

Error:

```text
SQLSTATE[HY093]: Invalid parameter number
```

## Cause

`src/Controllers/JobController.php` reused the same PDO named placeholder twice in the same SQL statement:

```sql
(j.client_account_id = :account_id OR j.company_account_id = :account_id)
```

Because the database connection uses `PDO::ATTR_EMULATE_PREPARES => false`, MySQL/PDO can reject repeated named placeholders and throw `HY093`.

## Files to replace

Upload these files to the same paths on the server:

```text
src/Controllers/JobController.php
src/Controllers/BookingController.php
```

## Database changes

No SQL migration is required for this patch.

## What changed

### GET /jobs

Fixed repeated placeholders by using separate names:

```sql
j.client_account_id = :client_account_id
OR j.company_account_id = :client_company_account_id
```

Added supported status filtering:

```http
GET /api/v1/jobs?status=pending
GET /api/v1/jobs?status=awaiting_payment
GET /api/v1/jobs?status=in_progress
GET /api/v1/jobs?status=completed
```

Allowed job statuses:

```text
pending, accepted, rejected, awaiting_payment, paid, in_progress, completed, disputed, cancelled
```

The jobs list also now joins only the latest payment row per job to avoid duplicate jobs when more than one payment attempt exists.

### GET /bookings

No HY093 bug was found in the old booking list query, but this patch also improves `/bookings` by adding safe status filtering:

```http
GET /api/v1/bookings?status=pending
GET /api/v1/bookings?status=awaiting_payment
GET /api/v1/bookings?status=paid
```

Allowed booking statuses:

```text
pending, accepted, rejected, awaiting_payment, paid, in_progress, completed, disputed, cancelled, confirmed
```

## After upload, test

Login as client, then test:

```http
GET /api/v1/jobs
GET /api/v1/jobs?status=pending
GET /api/v1/bookings
GET /api/v1/bookings?status=pending
```

Also test with artisan/company tokens where applicable.
