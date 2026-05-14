# HustleApp Hotfix: City Access Payment, Profile Media, Certification Types

## Fixes included

### 1. City-access payment duplicate reference
Endpoint affected:

```http
POST /api/v1/my/city-access/{id}/payment/initialize
```

Before this fix, if an artisan started Paystack checkout and did not complete it, clicking payment again could reuse the same Paystack reference and trigger:

```text
Duplicate Transaction Reference
```

New behavior:

- If a pending checkout already has an authorization URL, the backend returns the existing checkout link.
- If the old record has a reference but no stored checkout URL, the backend generates a fresh reference before contacting Paystack.
- If Paystack still returns duplicate reference, the backend retries once with a fresh reference.
- `force_new: true` can be sent only when the frontend intentionally wants to abandon the old pending checkout.

Normal frontend request:

```http
POST /api/v1/my/city-access/6/payment/initialize
Authorization: Bearer ARTISAN_TOKEN
```

Optional forced refresh:

```json
{
  "force_new": true
}
```

Do not use `force_new` by default.

### 2. PATCH /profile image update crash
Endpoint affected:

```http
PATCH /api/v1/profile
```

The mobile app was correctly uploading an image and sending `profile_image_asset_id`, but `ProfileController` was missing the ownership validation method.

Fixed methods added:

```php
ownedProfileImageAssetId()
ownedPortfolioImageAssetId()
```

Expected profile update body:

```json
{
  "first_name": "Ama",
  "last_name": "Mensah",
  "profile_image_asset_id": 45
}
```

The asset must belong to the logged-in account and must be an image/media asset.

### 3. Certification type lookup endpoint
Mobile can now fetch certification types with these public aliases:

```http
GET /api/v1/certification-types
GET /api/v1/certificate-types
GET /api/v1/certificate_type_id
GET /api/v1/cirtificate_type_id
```

Recommended endpoint:

```http
GET /api/v1/certification-types
```

Optional filters:

```http
GET /api/v1/certification-types?q=electrical
GET /api/v1/certification-types?category_id=1
```

Response:

```json
{
  "success": true,
  "message": "Certification types loaded.",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Electrical Certification",
        "description": "...",
        "is_active": 1,
        "created_at": "2026-05-10 10:00:00"
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

## Files to upload

```text
src/Bootstrap/Application.php
src/Controllers/CityAccessController.php
src/Controllers/DiscoveryController.php
src/Controllers/ProfileController.php
```

## SQL

Run this safe migration:

```text
database/migrations/2026_05_10_city_access_payment_profile_certtype_hotfix.sql
```

It only adds helpful indexes if missing. It does not delete data.
