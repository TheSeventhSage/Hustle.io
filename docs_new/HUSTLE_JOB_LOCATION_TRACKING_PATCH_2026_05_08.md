# HustleApp API Patch — Job-Level Location Tracking for Booking + Hustle Jobs

## Reason for this patch

The old tracking API was booking-only:

```http
POST /bookings/{id}/location
GET /bookings/{id}/location
```

That worked for normal booking flow, but it did not work for hustle/application flow because an accepted hustle application creates a `job`, not a `booking`.

This patch adds job-level tracking so both flows use the same location pipeline after payment.

## Database changes

Run this update-only migration:

```text
database/migrations/2026_05_08_job_level_location_tracking_hustle_safe.sql
```

It does not drop or recreate tables.

It adds:

```sql
hustle_posts.latitude
hustle_posts.longitude
jobs.destination_latitude
jobs.destination_longitude
job_location_updates
```

Existing booking jobs are backfilled from `bookings.latitude` and `bookings.longitude`.

## New API endpoints

### Artisan sends live job location

```http
POST /api/v1/jobs/{id}/location
Authorization: Bearer ARTISAN_TOKEN
Content-Type: application/json
```

Body:

```json
{
  "latitude": 6.5244,
  "longitude": 3.3792,
  "accuracy_meters": 12.5,
  "heading_degrees": 82.4,
  "speed_mps": 4.2,
  "captured_at": "2026-05-08 10:30:00",
  "timezone_name": "Africa/Lagos"
}
```

Success:

```json
{
  "success": true,
  "message": "Location update saved.",
  "data": {
    "location_update_id": 25,
    "job_id": 9,
    "booking_id": null,
    "hustle_post_id": 5,
    "accepted_application_id": 12,
    "source_type": "hustle"
  }
}
```

Rules:

- Only the assigned artisan can post live location.
- Job must have verified payment.
- Job must be `paid`, `in_progress`, or recently `completed`.
- Location updates expire after about 15 minutes.

### Client/company/artisan gets latest job location

```http
GET /api/v1/jobs/{id}/location
Authorization: Bearer CLIENT_OR_COMPANY_OR_ARTISAN_TOKEN
```

Success:

```json
{
  "success": true,
  "message": "Latest location loaded.",
  "data": {
    "job": {
      "id": 9,
      "source_type": "hustle",
      "booking_id": null,
      "hustle_post_id": 5,
      "accepted_application_id": 12,
      "status": "in_progress",
      "payment_status": "approved",
      "title": "Weekend Apartment Cleanup"
    },
    "client_destination": {
      "latitude": 6.5244,
      "longitude": 3.3792,
      "address": "Yaba, Lagos"
    },
    "latest_location": {
      "id": 25,
      "job_id": 9,
      "artisan_account_id": 2,
      "latitude": "6.5300000",
      "longitude": "3.3900000",
      "accuracy_meters": "12.50",
      "captured_at": "2026-05-08 09:30:00",
      "expires_at": "2026-05-08 09:45:00"
    },
    "maps": {}
  }
}
```

Rules:

- Booking job: client and artisan can view.
- Hustle job: client/company poster and assigned artisan can view.
- Unauthorized users cannot view tracking data.

## Backward-compatible booking location endpoints

These still work:

```http
POST /api/v1/bookings/{id}/location
GET /api/v1/bookings/{id}/location
```

But new writes are stored in the generic `job_location_updates` table through the related booking job.

Frontend/mobile should gradually move to:

```http
POST /api/v1/jobs/{job_id}/location
GET /api/v1/jobs/{job_id}/location
```

## Updated `POST /hustles`

The create hustle endpoint now accepts destination coordinates:

```http
POST /api/v1/hustles
Authorization: Bearer CLIENT_OR_COMPANY_TOKEN
Content-Type: application/json
```

Body example:

```json
{
  "category_id": 1,
  "title": "Weekend Apartment Cleanup",
  "description": "Need a cleaner for a weekend apartment cleanup.",
  "city_id": 1,
  "location_text": "Yaba, Lagos",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "duration_minutes": 180,
  "preferred_date": "2026-05-10",
  "preferred_start_time": "09:00",
  "preferred_end_time": "12:00",
  "timezone_name": "Africa/Lagos",
  "payment_model": "full_amount",
  "budget_amount": 18000,
  "currency_code": "NGN",
  "status": "open"
}
```

When an application is accepted, those coordinates are copied into the created `jobs` row as:

```text
jobs.destination_latitude
jobs.destination_longitude
```

## Recommended mobile flow for hustle tracking

```text
Create hustle with destination latitude/longitude
→ artisan applies
→ poster accepts application
→ backend returns job_id
→ poster pays through POST /jobs/{job_id}/payment/initialize
→ backend verifies payment
→ job status becomes in_progress
→ artisan app starts sending POST /jobs/{job_id}/location with device permission
→ client/company app polls GET /jobs/{job_id}/location or uses it with your map screen
```

## Recommended mobile flow for booking tracking

```text
Create booking with latitude/longitude
→ artisan accepts
→ client pays through POST /jobs/{job_id}/payment/initialize
→ backend verifies payment
→ job status becomes in_progress
→ artisan app sends POST /jobs/{job_id}/location
→ client app reads GET /jobs/{job_id}/location
```

## Important frontend instruction

Use this shared pattern everywhere once you have `job_id`:

```http
POST /jobs/{job_id}/location
GET /jobs/{job_id}/location
```

Do not create fake bookings for hustle/application tracking.
