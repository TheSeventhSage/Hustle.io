# HustleApp API Patch: Primary Services / Artisan Services

## Purpose

`GET /api/v1/services` returns one row per service. If one artisan has many services, the artisan appears multiple times. This is still correct for a detailed service search, but it is not good for the client home/provider list.

This patch adds a grouped provider-facing endpoint that returns one row per artisan, plus a detail endpoint to fetch all services for one artisan.

## Files changed

```text
src/Bootstrap/Application.php
src/Controllers/DiscoveryController.php
database/migrations/2026_05_10_primary_services_artisan_services_safe.sql
```

## SQL

Run:

```text
database/migrations/2026_05_10_primary_services_artisan_services_safe.sql
```

The migration is update-only and only adds helpful indexes if they are missing.

## New endpoint 1: Primary services/providers

```http
GET /api/v1/services/primary
```

Aliases:

```http
GET /api/v1/primary-services
GET /api/v1/providers
```

### Use case

Use this on the client home screen, map screen, and provider discovery list when you want each artisan to appear once.

### Query params

```text
q
category_id
city_id
country_id
skill_id
available_weekday
available_time
min_rating
page
per_page
```

### Example

```http
GET /api/v1/services/primary?country_id=1&city_id=3&page=1&per_page=20
```

### Response shape

```json
{
  "success": true,
  "message": "Primary provider services loaded.",
  "data": {
    "items": [
      {
        "artisan_account_id": 15,
        "artisan_name": "Ama Mensah",
        "artisan_first_name": "Ama",
        "artisan_last_name": "Mensah",
        "artisan_bio": "Professional home cleaner",
        "artisan_role": "artisan",
        "services_count": 4,
        "category_names": "Cleaning, Plumbing",
        "city_names": "Accra",
        "country_names": "Ghana",
        "average_rating": 4.8,
        "review_count": 12,
        "primary_service_id": 33,
        "primary_service": {
          "id": 33,
          "category_id": 2,
          "category_name": "Cleaning",
          "title": "Deep Cleaning",
          "short_description": "House and office cleaning",
          "pricing_display_type": "starting_from",
          "rate_min_amount": "200.00",
          "rate_max_amount": null,
          "currency_code": "GHS",
          "image_url": "https://hustleapp.stii.click/api/v1/media/99/file",
          "latitude": 5.6037168,
          "longitude": -0.1869644,
          "location_text": "East Legon, Accra",
          "has_coordinates": true,
          "details_endpoint": "/services/33"
        },
        "services_endpoint": "/artisans/15/services"
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

## New endpoint 2: All services by artisan

```http
GET /api/v1/artisans/{id}/services
```

Alias:

```http
GET /api/v1/providers/{id}/services
```

### Use case

Use this when a client taps one artisan/provider card and wants to see all services offered by that artisan.

### Query params

```text
q
category_id
city_id
country_id
skill_id
page
per_page
```

### Example

```http
GET /api/v1/artisans/15/services?page=1&per_page=20
```

### Response shape

```json
{
  "success": true,
  "message": "Artisan services loaded.",
  "data": {
    "artisan": {
      "artisan_account_id": 15,
      "account_type": "artisan",
      "artisan_name": "Ama Mensah",
      "first_name": "Ama",
      "last_name": "Mensah",
      "bio": "Professional home cleaner",
      "average_rating": 4.8,
      "review_count": 12,
      "services_count": 4
    },
    "items": [
      {
        "id": 33,
        "artisan_account_id": 15,
        "category_id": 2,
        "title": "Deep Cleaning",
        "short_description": "House and office cleaning",
        "pricing_display_type": "starting_from",
        "rate_min_amount": "200.00",
        "currency_code": "GHS",
        "image_url": "https://hustleapp.stii.click/api/v1/media/99/file",
        "latitude": 5.6037168,
        "longitude": -0.1869644,
        "has_coordinates": true
      }
    ]
  }
}
```

## Existing endpoint remains unchanged

```http
GET /api/v1/services
```

This still returns one row per service. It should be used for detailed service search.

## Frontend/mobile recommendation

Use:

```text
Home provider list/map: GET /services/primary
Provider detail screen: GET /artisans/{artisan_id}/services
Search by exact service: GET /services
```

## Notes

- The primary endpoint chooses one display service per artisan, preferring a service that has coordinates when possible.
- It does not remove any existing services.
- It prevents repeated artisan names in provider-card views.
- It still supports country, city, category, skill, availability, rating, search, and pagination filters.
