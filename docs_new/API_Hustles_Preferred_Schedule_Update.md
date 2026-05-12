# Hustle Posts Preferred Schedule API Update

This update adds a company/client preferred work date and time window to hustle posts.

## Database fields added to `hustle_posts`

| Column | Type | Nullable | Purpose |
|---|---:|---:|---|
| `preferred_date` | `DATE` | Yes | The date the company/client prefers the hustle to happen. Format: `YYYY-MM-DD`. |
| `preferred_start_time` | `TIME` | Yes | Preferred start time on `preferred_date`. Format: `HH:MM` or `HH:MM:SS`, 24-hour. |
| `preferred_end_time` | `TIME` | Yes | Preferred end time on `preferred_date`. Must be later than `preferred_start_time`. |
| `timezone_name` | `VARCHAR(100)` | Yes | IANA timezone for the preferred date/time, for example `Africa/Lagos`. |

A new index is added for listing/filtering by schedule:

```sql
idx_hustle_posts_preferred_date_status (preferred_date, status)
```

## Existing database migration

Run:

```text
database/migrations/2026_05_07_hustle_posts_preferred_schedule.sql
```

This migration is safe to run more than once. It checks for existing columns/indexes before adding them.

## `POST /hustles`

### Purpose

Create a hustle post with optional preferred date/time window.

### New request fields

```json
{
  "preferred_date": "2026-05-10",
  "preferred_start_time": "09:00",
  "preferred_end_time": "12:00",
  "timezone_name": "Africa/Lagos"
}
```

### Full request example

```json
{
  "category_id": 1,
  "title": "Weekend Apartment Cleanup",
  "description": "Need a trusted cleaner for a full apartment cleanup this weekend.",
  "city_id": 1,
  "location_text": "Yaba, Lagos",
  "duration_minutes": 180,
  "preferred_date": "2026-05-10",
  "preferred_start_time": "09:00",
  "preferred_end_time": "12:00",
  "timezone_name": "Africa/Lagos",
  "required_experience_level": "mid",
  "payment_model": "full_amount",
  "budget_amount": 18000,
  "currency_code": "NGN",
  "status": "open"
}
```

### Validation

- `preferred_date` must be `YYYY-MM-DD`.
- `preferred_start_time` and `preferred_end_time` must be valid 24-hour times: `HH:MM` or `HH:MM:SS`.
- If one preferred time is sent, both start and end time must be sent.
- `preferred_end_time` must be later than `preferred_start_time`.
- `timezone_name` should be a valid IANA timezone. Invalid/missing timezone falls back to the poster's account timezone, then `Africa/Lagos`.

### Response

The created `item` now includes:

```json
{
  "preferred_date": "2026-05-10",
  "preferred_start_time": "09:00:00",
  "preferred_end_time": "12:00:00",
  "timezone_name": "Africa/Lagos"
}
```

## `GET /hustles`

### Purpose

List open hustle posts. Each item now includes preferred schedule fields.

### Existing filters

- `category_id`
- `city_id`
- `q`

### New optional filters

| Query param | Example | Purpose |
|---|---|---|
| `preferred_date` | `/hustles?preferred_date=2026-05-10` | Return hustles scheduled for one preferred date. |
| `date_from` | `/hustles?date_from=2026-05-10` | Return hustles whose `preferred_date` is on/after this date. |
| `date_to` | `/hustles?date_to=2026-05-15` | Return hustles whose `preferred_date` is on/before this date. |

### Response item fields added

```json
{
  "preferred_date": "2026-05-10",
  "preferred_start_time": "09:00:00",
  "preferred_end_time": "12:00:00",
  "timezone_name": "Africa/Lagos"
}
```

## `GET /hustles/{id}`

### Purpose

Get one hustle post and skills. The `item` now includes the preferred schedule fields.

### Response example excerpt

```json
{
  "success": true,
  "message": "Hustle post loaded.",
  "data": {
    "item": {
      "id": 1,
      "title": "Weekend Apartment Cleanup",
      "preferred_date": "2026-05-10",
      "preferred_start_time": "09:00:00",
      "preferred_end_time": "12:00:00",
      "timezone_name": "Africa/Lagos"
    },
    "skills": []
  }
}
```

## `POST /hustles/{id}/applications`

### Purpose

Artisan applies to an open hustle post. Request body remains backward-compatible.

### Request body

No preferred schedule fields are required on the application. The schedule belongs to the hustle post.

```json
{
  "pricing_model": "full_amount",
  "offered_amount": 17500,
  "currency_code": "NGN",
  "expected_completion_at": "2026-05-10 13:00:00",
  "timeline_notes": "Can complete within the preferred time window."
}
```

### Response update

The response now includes `hustle_post_schedule` so the mobile app can confirm the requested date/time window after applying.

```json
{
  "success": true,
  "message": "Application submitted.",
  "data": {
    "item": {
      "id": 5,
      "hustle_post_id": 1,
      "status": "under_review"
    },
    "hustle_post_schedule": {
      "preferred_date": "2026-05-10",
      "preferred_start_time": "09:00:00",
      "preferred_end_time": "12:00:00",
      "timezone_name": "Africa/Lagos"
    }
  }
}
```

## Company accepts application

When a company/admin accepts an application through:

```http
POST /hustles/{id}/applications/{applicationId}/decision
```

and the decision is `accepted`, the job now inherits the hustle schedule:

- `jobs.timezone_name` = `hustle_posts.timezone_name`
- `jobs.scheduled_start_at` = `preferred_date + preferred_start_time` converted to UTC for DB storage
- `jobs.expected_completion_at` = application `expected_completion_at`, or `preferred_date + preferred_end_time` converted to UTC when application value is missing
- `jobs.expected_duration_minutes` = `hustle_posts.duration_minutes`, or calculated from start/end time when duration is missing

## Frontend/mobile notes

- Show date picker value as `preferred_date` in `YYYY-MM-DD`.
- Show time picker values as `preferred_start_time` and `preferred_end_time` in 24-hour format.
- Send `timezone_name` from the user's profile or device timezone, for example `Intl.DateTimeFormat().resolvedOptions().timeZone` on web.
- Display `preferred_start_time` and `preferred_end_time` together with `timezone_name`.
- Do not send only one time; send both start and end time or omit both.
