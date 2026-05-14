# HustleApp Hotfix: Country and Certification Type Lookup Routes

## Issue
Mobile called:

```http
GET /api/v1/country?page=1&per_page=100
GET /api/v1/certification-types?page=1&per_page=100
```

and received:

```json
{
  "success": false,
  "message": "Route not found",
  "data": []
}
```

## Cause
The API already had the country/certification lookup controller methods, but the public route aliases needed by mobile were missing from `src/Bootstrap/Application.php` on the deployed version.

## Files to upload

```text
src/Bootstrap/Application.php
src/Controllers/DiscoveryController.php
```

## SQL
No SQL migration is required.

## Public endpoints now available

### Countries

Recommended plural endpoint:

```http
GET /api/v1/countries?page=1&per_page=100
```

Mobile-compatible singular alias:

```http
GET /api/v1/country?page=1&per_page=100
```

Search:

```http
GET /api/v1/country?q=ghana&page=1&per_page=100
```

### Certification types

Recommended endpoint:

```http
GET /api/v1/certification-types?page=1&per_page=100
```

Aliases also supported:

```http
GET /api/v1/certificate-types?page=1&per_page=100
GET /api/v1/certificate_type_id?page=1&per_page=100
GET /api/v1/cirtificate_type_id?page=1&per_page=100
```

Filter by category:

```http
GET /api/v1/certification-types?category_id=1&page=1&per_page=100
```

Search:

```http
GET /api/v1/certification-types?q=electrical&page=1&per_page=100
```

## Expected response envelope

```json
{
  "success": true,
  "message": "Countries loaded.",
  "data": {
    "items": []
  },
  "meta": {
    "total": 0,
    "page": 1,
    "per_page": 100,
    "total_pages": 0,
    "has_next_page": false,
    "has_previous_page": false
  }
}
```

## Test checklist

```http
GET /api/v1/country?page=1&per_page=100
GET /api/v1/countries?page=1&per_page=100
GET /api/v1/certification-types?page=1&per_page=100
GET /api/v1/certificate-types?page=1&per_page=100
GET /api/v1/cirtificate_type_id?page=1&per_page=100
```
