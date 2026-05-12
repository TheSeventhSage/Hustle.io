# HustleApp API Patch: My Hustles / Client-Created Hustle List

Date: 2026-05-09

## Purpose

The public endpoint `GET /api/v1/hustles` lists open hustle posts for discovery. It is not enough for a client/company dashboard because creators also need to see their own open, closed, awaiting-payment, and cancelled hustle posts.

This patch adds a private endpoint for the logged-in creator to list hustle posts they created and use the existing cancel endpoint.

## New Endpoint

```http
GET /api/v1/my/hustles
Authorization: Bearer CLIENT_OR_COMPANY_TOKEN
```

Allowed roles:

```text
client
company
```

## Query Parameters

| Parameter | Required | Description |
|---|---:|---|
| `page` | No | Page number. Default `1`. |
| `per_page` | No | Page size. Default from backend pagination helper. Max from backend pagination helper. |
| `status` | No | `open`, `closed`, `cancelled`, or `all`. If omitted, returns all creator hustles. |
| `job_status` | No | Filter by latest related job status: `awaiting_payment`, `paid`, `in_progress`, `completed`, etc. |
| `category_id` | No | Filter by category. |
| `city_id` | No | Filter by city. |
| `country_id` | No | Filter by country through the selected city. |
| `preferred_date` | No | Exact preferred date in `YYYY-MM-DD`. |
| `date_from` | No | Start date in `YYYY-MM-DD`. |
| `date_to` | No | End date in `YYYY-MM-DD`. |
| `q` | No | Search title, description, location, category, city, or country. |

## Example Requests

```http
GET /api/v1/my/hustles?page=1&per_page=20
Authorization: Bearer CLIENT_OR_COMPANY_TOKEN
```

```http
GET /api/v1/my/hustles?status=open
Authorization: Bearer CLIENT_OR_COMPANY_TOKEN
```

```http
GET /api/v1/my/hustles?job_status=awaiting_payment
Authorization: Bearer CLIENT_OR_COMPANY_TOKEN
```

```http
GET /api/v1/my/hustles?q=cleaning&city_id=1
Authorization: Bearer CLIENT_OR_COMPANY_TOKEN
```

## Example Response

```json
{
  "success": true,
  "message": "My hustle posts loaded.",
  "data": {
    "items": [
      {
        "id": 15,
        "posted_by_account_id": 7,
        "posted_by_name": "Kwame Mensah",
        "poster_account_type": "client",
        "title": "Apartment Cleaning",
        "description": "Need apartment cleaning this weekend.",
        "category_id": 1,
        "category_name": "Cleaning",
        "city_id": 2,
        "city_name": "Accra",
        "country_id": 1,
        "country_name": "Ghana",
        "preferred_date": "2026-05-15",
        "preferred_start_time": "09:00:00",
        "preferred_end_time": "12:00:00",
        "timezone_name": "Africa/Accra",
        "status": "open",
        "applications_count": 3,
        "active_applications_count": 2,
        "accepted_applications_count": 0,
        "latest_job_id": null,
        "latest_job_status": null,
        "latest_total_amount_due": null,
        "latest_currency_code": null,
        "can_cancel": true,
        "cancel_endpoint": "/hustles/15/cancel",
        "applications_endpoint": "/hustles/15/applications",
        "payment_initialize_endpoint": null
      }
    ]
  },
  "meta": {
    "total": 1,
    "page": 1,
    "per_page": 20,
    "total_pages": 1,
    "has_next_page": false,
    "has_previous_page": false
  }
}
```

## Cancel Flow

Frontend/mobile should call `GET /my/hustles` to load the creator's own hustle posts.

If `can_cancel` is `true`, show the cancel button.

Then call:

```http
POST /api/v1/hustles/{id}/cancel
Authorization: Bearer CLIENT_OR_COMPANY_TOKEN
Content-Type: application/json
```

```json
{
  "reason": "I no longer need this request."
}
```

The backend will reject cancellation if the hustle already has a paid/active/completed/disputed job.

## Files Changed

```text
src/Bootstrap/Application.php
src/Controllers/HustleController.php
```

## Database Changes

None.
