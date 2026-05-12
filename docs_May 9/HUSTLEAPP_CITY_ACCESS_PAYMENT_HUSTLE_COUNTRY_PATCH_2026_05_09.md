# HustleApp API Patch: Paid City Access, Hustle Poster Names, Country/City Scope

## Summary

This patch completes three items:

1. **Paid artisan city access**: an artisan can add more than one city, but extra city access remains pending until Paystack payment is verified by the backend.
2. **Hustle post responses now include poster names**: `POST /hustles`, `GET /hustles`, and `GET /hustles/{id}` return `posted_by_name`, `poster_first_name`, `poster_last_name`, `company_name`, `poster_account_type`, `country_name`, and `city_name` where available.
3. **Country/city scope rules**: hustle creation validates selected country/city; providers can only apply to hustle posts in cities where they have active city access.

## Database migration

Run this safe migration first:

```text
/database/migrations/2026_05_09_city_access_payment_hustle_country_scope_safe.sql
```

It does not drop data. It adds:

- `city_access_pricing`
- payment metadata columns to `artisan_city_access_subscriptions`
- `city_access_payment_events`
- country/city lookup indexes

## Admin: set extra city access price

### List pricing

```http
GET /api/v1/admin/city-access/pricing
Authorization: Bearer ADMIN_TOKEN
```

Filters:

```http
GET /api/v1/admin/city-access/pricing?country_id=1&is_active=1
GET /api/v1/admin/city-access/pricing?city_id=2
```

### Create pricing

```http
POST /api/v1/admin/city-access/pricing
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

```json
{
  "country_id": 1,
  "city_id": 2,
  "membership_plan_id": null,
  "amount": 5000,
  "currency_code": "NGN",
  "duration_days": 30,
  "is_active": true,
  "notes": "Monthly extra-city access for Lagos"
}
```

If `city_id` is omitted, the price applies to the whole country. A city-specific price overrides country-level price.

### Update pricing

```http
PATCH /api/v1/admin/city-access/pricing/{id}
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

## Artisan: request extra city access

### Create city access request

```http
POST /api/v1/my/city-access
Authorization: Bearer ARTISAN_TOKEN
Content-Type: application/json
```

```json
{
  "city_id": 2,
  "membership_plan_id": null,
  "is_default_city": false
}
```

First active/default city can be activated without payment. Extra city access requires payment if admin has configured a price.

Expected paid response:

```json
{
  "success": true,
  "message": "City access created. Payment is required before activation.",
  "data": {
    "item": {
      "id": 10,
      "city_id": 2,
      "is_active": 0,
      "subscription_status": "pending"
    },
    "payment_required": true,
    "payment_initialize_endpoint": "/my/city-access/10/payment/initialize",
    "amount": 5000,
    "currency_code": "NGN",
    "duration_days": 30
  }
}
```

### Initialize Paystack payment

```http
POST /api/v1/my/city-access/{id}/payment/initialize
Authorization: Bearer ARTISAN_TOKEN
```

Response:

```json
{
  "success": true,
  "message": "City access payment initialized.",
  "data": {
    "gateway": "paystack",
    "reference": "CITYACC-10-ABC123...",
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "...",
    "subscription_id": 4,
    "artisan_city_access_id": 10,
    "amount": 5000,
    "currency_code": "NGN"
  }
}
```

Frontend/mobile should open `authorization_url`.

### Verify city access payment

```http
POST /api/v1/city-access/payments/{reference}/verify
Authorization: Bearer ARTISAN_TOKEN
```

After successful backend verification:

- `artisan_city_access.is_active = 1`
- `artisan_city_access.subscription_status = active`
- `artisan_city_access.subscription_reference = payment reference`
- `artisan_city_access_subscriptions.status = paid`

## Hustle post response update

### Create hustle

```http
POST /api/v1/hustles
Authorization: Bearer CLIENT_OR_COMPANY_TOKEN
```

Request can include `country_id` and `city_id`:

```json
{
  "country_id": 1,
  "city_id": 2,
  "category_id": 1,
  "title": "Office cleaning",
  "description": "Need cleaning service",
  "location_text": "Yaba, Lagos",
  "budget_amount": 15000,
  "currency_code": "NGN"
}
```

The backend checks:

- the city exists and is active
- `city.country_id` matches the submitted `country_id`
- the poster cannot create a hustle outside their registered country

Response now includes the poster identity:

```json
{
  "item": {
    "id": 12,
    "posted_by_account_id": 5,
    "posted_by_name": "ABC Company Ltd",
    "poster_account_type": "company",
    "company_name": "ABC Company Ltd",
    "poster_first_name": null,
    "poster_last_name": null,
    "city_name": "Lagos",
    "country_name": "Nigeria"
  }
}
```

### List hustles with country/city filters

```http
GET /api/v1/hustles?country_id=1
GET /api/v1/hustles?country_id=1&city_id=2
```

### Get hustle details

```http
GET /api/v1/hustles/{id}
```

Also returns `posted_by_name`, `poster_account_type`, `city_name`, and `country_name`.

## Hustle application city rule

When an artisan applies:

```http
POST /api/v1/hustles/{id}/applications
Authorization: Bearer ARTISAN_TOKEN
```

The backend now checks whether the artisan has active access for the hustle city:

```text
artisan_city_access.city_id = hustle_posts.city_id
is_active = 1
subscription_status = active
ends_at is null or still in future
```

If not active, response:

```json
{
  "success": false,
  "message": "You need active city access for this hustle city before you can apply.",
  "data": {
    "errors": {
      "city_id": 2,
      "city_access_endpoint": "/my/city-access"
    }
  }
}
```

## Provider search country/city scope

`GET /services` now only lists providers with active city access.

Supported filters:

```http
GET /api/v1/services?country_id=1
GET /api/v1/services?country_id=1&city_id=2
GET /api/v1/services?category_id=1&city_id=2
```

A provider appears in a city only when they have active city access for that city. Extra cities become visible only after payment verification activates the city access.

## Frontend/mobile checklist

1. Admin sets city access prices first.
2. Artisan adds a city via `POST /my/city-access`.
3. If `payment_required = true`, show payment button.
4. Call `POST /my/city-access/{id}/payment/initialize`.
5. Open Paystack with `authorization_url`.
6. Call `POST /city-access/payments/{reference}/verify` after payment.
7. Refresh `GET /my/city-access`.
8. Only allow artisan to apply to hustles in cities returned as active in city access list.
9. Use `posted_by_name` from hustle responses instead of only showing IDs.
