# HustleApp API Patch Documentation — Search + Pagination

Date: 2026-05-08

This patch adds a general marketplace search endpoint and standard pagination to the main list endpoints used by web and mobile.

## 1. Global pagination standard

Most list endpoints now accept:

| Query param | Type | Default | Max | Meaning |
|---|---:|---:|---:|---|
| `page` | integer | `1` | — | 1-based page number |
| `per_page` | integer | `20` | `100` | Items per page |
| `q` | string | none | 120 chars | Search keyword where supported |

Example:

```http
GET /api/v1/services?q=cleaning&page=1&per_page=20
```

Paginated responses include this `meta` shape:

```json
{
  "count": 45,
  "total": 45,
  "page": 1,
  "per_page": 20,
  "total_pages": 3,
  "has_next_page": true,
  "has_previous_page": false
}
```

Frontend/mobile should stop assuming `meta.count` means only the current page count. Use `meta.total`, `meta.page`, `meta.per_page`, and `meta.has_next_page` for infinite scroll and pagination controls.

## 2. New global search endpoint

### `GET /search`

Auth: public

Searches marketplace records.

Query params:

| Param | Required | Values | Notes |
|---|---|---|---|
| `q` | yes | string | Search text |
| `type` | no | `all`, `services`, `hustles`, `companies`, `categories`, `cities` | Default `all` |
| `page` | no | integer | Used when `type` is not `all` |
| `per_page` | no | integer | Used when `type` is not `all` |
| `limit` | no | integer | Used only when `type=all`; default `5`, max `20` per section |

#### Search all sections

```http
GET /api/v1/search?q=cleaning&type=all&limit=5
```

Success:

```json
{
  "success": true,
  "message": "Search results loaded.",
  "data": {
    "query": "cleaning",
    "type": "all",
    "results": {
      "services": [],
      "hustles": [],
      "companies": [],
      "categories": [],
      "cities": []
    }
  },
  "meta": {
    "query": "cleaning",
    "type": "all",
    "limit": 5
  }
}
```

#### Search one section with pagination

```http
GET /api/v1/search?q=cleaning&type=services&page=1&per_page=20
```

Success:

```json
{
  "success": true,
  "message": "Search results loaded.",
  "data": {
    "query": "cleaning",
    "type": "services",
    "items": []
  },
  "meta": {
    "count": 0,
    "total": 0,
    "page": 1,
    "per_page": 20,
    "total_pages": 0,
    "has_next_page": false,
    "has_previous_page": false
  }
}
```

## 3. Updated public/discovery endpoints

### `GET /categories`

New query params:

```http
GET /api/v1/categories?q=clean&page=1&per_page=50
```

Searches `name` and `slug`.

### `GET /cities`

Existing:

```http
GET /api/v1/cities?country_id=1
```

New:

```http
GET /api/v1/cities?q=lagos&page=1&per_page=50
```

Searches city name, state name, and country name.

### `GET /services`

Existing filters still work:

```http
GET /api/v1/services?category_id=1&city_id=1
```

New filters:

```http
GET /api/v1/services?q=cleaning&page=1&per_page=20
GET /api/v1/services?artisan_account_id=2&page=1&per_page=20
```

Searches service title, description, experience level, category, artisan name, and city.

### `GET /companies`

New filters:

```http
GET /api/v1/companies?q=tech&page=1&per_page=20
GET /api/v1/companies?city_id=1&page=1&per_page=20
```

Searches company name, overview, location text, and city.

### `GET /hustles`

Existing filters still work:

```http
GET /api/v1/hustles?category_id=1&city_id=1&preferred_date=2026-05-10
GET /api/v1/hustles?date_from=2026-05-10&date_to=2026-05-15
```

New/standard filters:

```http
GET /api/v1/hustles?q=cleaning&page=1&per_page=20
GET /api/v1/hustles?status=open&page=1&per_page=20
GET /api/v1/hustles?posted_by_account_id=3&page=1&per_page=20
```

Allowed `status`: `open`, `closed`, `cancelled`.

### `GET /reviews`

Existing filters still work:

```http
GET /api/v1/reviews?target_type=artisan&review_subject_account_id=2
```

New:

```http
GET /api/v1/reviews?q=great&page=1&per_page=20
```

## 4. Updated authenticated list endpoints

All endpoints below require `Authorization: Bearer {{token}}`.

### `GET /jobs`

New filters:

```http
GET /api/v1/jobs?page=1&per_page=20
GET /api/v1/jobs?status=awaiting_payment&page=1&per_page=20
GET /api/v1/jobs?source=hustle&page=1&per_page=20
GET /api/v1/jobs?source=booking&page=1&per_page=20
GET /api/v1/jobs?payment_status=approved&page=1&per_page=20
GET /api/v1/jobs?q=cleaning&page=1&per_page=20
```

Allowed `source`: `booking`, `hustle`.

Allowed job statuses:

```text
pending, accepted, rejected, awaiting_payment, paid, in_progress, completed, disputed, cancelled
```

Allowed payment statuses:

```text
pending, initialized, approved, failed, declined, abandoned
```

### `GET /bookings`

New filters:

```http
GET /api/v1/bookings?page=1&per_page=20
GET /api/v1/bookings?status=pending&page=1&per_page=20
GET /api/v1/bookings?booking_mode=scheduled&page=1&per_page=20
GET /api/v1/bookings?date_from=2026-05-01&date_to=2026-05-31&page=1&per_page=20
GET /api/v1/bookings?q=yaba&page=1&per_page=20
```

### `GET /my/services`

New filters:

```http
GET /api/v1/my/services?page=1&per_page=20
GET /api/v1/my/services?q=cleaning&page=1&per_page=20
GET /api/v1/my/services?category_id=1&page=1&per_page=20
GET /api/v1/my/services?is_active=1&page=1&per_page=20
```

### `GET /hustles/{id}/applications`

New filters:

```http
GET /api/v1/hustles/5/applications?page=1&per_page=20
GET /api/v1/hustles/5/applications?status=under_review&page=1&per_page=20
GET /api/v1/hustles/5/applications?q=tunde&page=1&per_page=20
```

Allowed statuses:

```text
under_review, shortlisted, accepted, rejected
```

### `GET /conversations`

New filters:

```http
GET /api/v1/conversations?page=1&per_page=20
GET /api/v1/conversations?conversation_type=direct&page=1&per_page=20
GET /api/v1/conversations?q=hello&page=1&per_page=20
```

### `GET /conversations/{id}`

Messages are now paginated:

```http
GET /api/v1/conversations/10?page=1&per_page=50
```

Default `per_page` for messages is `50`, max `100`.

### `GET /notifications`

New filters:

```http
GET /api/v1/notifications?page=1&per_page=20
GET /api/v1/notifications?read=0&page=1&per_page=20
GET /api/v1/notifications?read=1&page=1&per_page=20
GET /api/v1/notifications?type=payment_verified&page=1&per_page=20
GET /api/v1/notifications?q=payment&page=1&per_page=20
```

### `GET /wallet/entries`

New filters:

```http
GET /api/v1/wallet/entries?page=1&per_page=20
GET /api/v1/wallet/entries?entry_type=credit&page=1&per_page=20
GET /api/v1/wallet/entries?status=available&page=1&per_page=20
GET /api/v1/wallet/entries?q=job&page=1&per_page=20
```

### `GET /wallet/bank-accounts`

New filters:

```http
GET /api/v1/wallet/bank-accounts?q=gtbank&page=1&per_page=20
```

### `GET /availability/rules`

New filters:

```http
GET /api/v1/availability/rules?page=1&per_page=50
GET /api/v1/availability/rules?provider_service_id=1&page=1&per_page=50
GET /api/v1/availability/rules?weekday_number=1&page=1&per_page=50
```

### `GET /availability/exceptions`

New filters:

```http
GET /api/v1/availability/exceptions?page=1&per_page=20
GET /api/v1/availability/exceptions?provider_service_id=1&page=1&per_page=20
GET /api/v1/availability/exceptions?status=unavailable&page=1&per_page=20
```

### `GET /kyc/certifications`

New filters:

```http
GET /api/v1/kyc/certifications?page=1&per_page=20
GET /api/v1/kyc/certifications?status=pending_review&page=1&per_page=20
GET /api/v1/kyc/certifications?q=license&page=1&per_page=20
```

### `GET /portfolio`

New filters:

```http
GET /api/v1/portfolio?page=1&per_page=20
GET /api/v1/portfolio?q=cleaning&page=1&per_page=20
```

## 5. Frontend/mobile implementation notes

### Infinite scroll

Use this pattern:

1. Load `page=1&per_page=20`.
2. Append `data.items` to the local list.
3. If `meta.has_next_page` is true, load `page + 1`.
4. Stop when `meta.has_next_page` is false.

### Search box debounce

Use a debounce of about 300–500ms before calling endpoints with `q`.

### Empty search

For `/search`, do not call the endpoint until the user has typed a non-empty `q`.

For normal list endpoints, `q` is optional. If `q` is empty, simply call the endpoint without `q`.

### Backward compatibility

Older calls without `page`, `per_page`, or `q` still work. They now return the first page instead of every record.

## 6. Files changed in backend patch

```text
src/Bootstrap/Application.php
src/Controllers/AdminController.php
src/Controllers/AvailabilityController.php
src/Controllers/BaseController.php
src/Controllers/BookingController.php
src/Controllers/ConversationController.php
src/Controllers/DiscoveryController.php
src/Controllers/HustleController.php
src/Controllers/JobController.php
src/Controllers/KycController.php
src/Controllers/NotificationController.php
src/Controllers/ProfileController.php
src/Controllers/ReviewController.php
src/Controllers/SearchController.php
src/Controllers/ServiceController.php
src/Controllers/WalletController.php
database/migrations/2026_05_08_search_pagination_indexes_optional.sql
```
