# Frontend Understanding: City Access, Country Scope, and Hustle Flow Update

Date: 2026-05-09

## What Changed In Today's Backend Docs

The May 9 update changes city access from a mostly profile/discovery detail into an authorization rule for hustlers. A hustler/artisan can no longer apply to every visible hustle just because they are authenticated and KYC-approved. They must also have active city access for the hustle's city.

The backend now enforces this rule on:

- `POST /hustles/{id}/applications`
- `GET /services` visibility by city/country
- `POST /hustles` country/city validation

The frontend should treat city access as part of the hustler's working scope. It is not just a subscription upsell. It decides which hustles the hustler can act on.

## New Backend Concepts To Integrate

### Countries

New endpoint:

```http
GET /api/v1/countries?q=nigeria&page=1&per_page=50
```

Current code does not use this endpoint. Signup still calls `/meta/countries.php`, and some UI derives countries from cities. The new flow should use `/countries` as the canonical country list.

### City Access

New endpoints:

```http
GET /api/v1/my/city-access
POST /api/v1/my/city-access
PATCH /api/v1/my/city-access/{id}
POST /api/v1/my/city-access/{id}/deactivate
POST /api/v1/my/city-access/{id}/payment/initialize
POST /api/v1/city-access/payments/{reference}/verify
```

Expected behavior:

- The first/default city may be activated without payment.
- Extra cities may require payment.
- If payment is required, the backend returns `payment_required = true` and a payment initialize endpoint.
- A city only counts for applying/search eligibility when it is active and subscription status is active.

### Admin City Access Pricing

Admin controls pricing:

```http
GET /api/v1/admin/city-access/pricing
POST /api/v1/admin/city-access/pricing
PATCH /api/v1/admin/city-access/pricing/{id}
```

This repo currently has no admin frontend area, so this remains out of scope for the immediate hustler-facing work unless an admin module is added.

### Hustle Country And City Scope

`POST /hustles` can now include:

```json
{
  "country_id": 1,
  "city_id": 2
}
```

Backend validates:

- city exists and is active
- city belongs to the submitted country
- poster cannot create a hustle outside their registered country

Current `CreateHustleForm` sends `city_id`, but not `country_id`.

### Hustle Application Rule

When an artisan applies:

```http
POST /api/v1/hustles/{id}/applications
```

Backend checks:

```text
artisan_city_access.city_id = hustle_posts.city_id
is_active = 1
subscription_status = active
ends_at is null or still in future
```

If not active, the API returns a message that the user needs city access before applying.

The frontend should not rely only on the backend rejection. It should show eligibility before the user clicks apply.

## Current Codebase Flow That Changes

### Current Hustler Application Flow

Current location:

- `src/features/hustler/components/HustleDetailPanel.jsx`
- `src/features/hustler/components/ProposalPanel.jsx`
- `src/features/hustles/hustles.service.js`
- `src/features/hustles/hustles.hooks.js`

Current behavior:

1. Hustler opens a hustle detail panel.
2. Frontend fetches `GET /hustles/{id}`.
3. Frontend fetches KYC status from `GET /kyc/status`.
4. Apply buttons are enabled if KYC is approved.
5. Application is submitted to `POST /hustles/{id}/applications`.

Required change:

KYC approval is no longer enough. The frontend should also fetch `GET /my/city-access` for artisans and compare the hustle `city_id` against active city access rows. Apply CTAs should be disabled or replaced with a subscribe CTA when the hustle city is not covered.

### Current Hustle Creation Flow

Current location:

- `src/features/hustles/components/CreateHustleForm.jsx`
- `src/features/hustles/hustles.service.js`

Current behavior:

1. Company/client selects category and city.
2. Form sends `city_id`, location text, budget, schedule, and other fields.
3. It does not send `country_id`.

Required change:

The create form should include country awareness. The safest frontend flow is:

1. Load countries from `GET /countries`.
2. Resolve the poster's registered country from `GET /profile` or `GET /auth/me` if available.
3. Default the country selector to the poster's registered country.
4. Load cities using `GET /cities?country_id={country_id}`.
5. Send both `country_id` and `city_id` in `POST /hustles`.

### Current Booking Flow

Current location:

- `src/features/hustles/components/BookHustlerPanel.jsx`
- `src/features/booking/booking.service.js`
- `src/features/booking/components/BookingDetailPanel.jsx`

Current behavior:

1. Client selects a provider service.
2. Booking panel uses the service city or a selected city.
3. Booking is submitted to `POST /bookings`.
4. Payment is initialized later through booking/job payment endpoints.

Required change:

The backend now says `GET /services` only lists providers with active city access. So the booking flow should mostly trust that a visible service is bookable in its returned city. The frontend should still pass `city_id`, but should avoid letting the client override to a city the provider is not active in unless the service response includes that city as active access.

If the service details include city access metadata later, the booking UI should use that as the allowed city list. Until then, default to the service city and keep the selector conservative.

## Intended Hustler-To-Client Flow After Update

### Hustle Posting Flow

1. Client/company opens create hustle.
2. Frontend loads countries and cities.
3. Client/company chooses country and city, or uses registered country by default.
4. Frontend posts the hustle with `country_id`, `city_id`, schedule, budget, and description.
5. Backend returns poster name and city/country names.
6. Hustle appears in `GET /hustles` filtered by country/city where applicable.

### Hustler Discovery And Application Flow

1. Hustler signs in.
2. Frontend loads:
   - `GET /kyc/status`
   - `GET /my/city-access`
   - `GET /hustles`
3. Hustle cards/details show city and country.
4. For each hustle:
   - If hustle city is in active city access, show normal apply/proposal CTA.
   - If not active, show a blocked state: "Subscribe to this city to apply."
5. If the hustler chooses to subscribe:
   - Navigate to Settings > My subscription / City access.
   - Preselect the hustle city if possible.
6. Hustler creates city access with `POST /my/city-access`.
7. If payment is required:
   - Call `POST /my/city-access/{id}/payment/initialize`.
   - Open Paystack with returned `authorization_url`.
   - Verify with `POST /city-access/payments/{reference}/verify`.
8. Refresh `GET /my/city-access`.
9. Hustler returns to the hustle and applies.
10. Client/company reviews the application and accepts/rejects.
11. Accepted application creates a job.
12. Poster pays through job payment if required.
13. Job starts, completes, and wallet release happens through the existing job flow.

### Booking Flow

1. Client opens service discovery.
2. `GET /services` only returns providers active in the requested country/city.
3. Client opens provider/service profile.
4. Booking panel uses service `city_id` and location details.
5. Client submits `POST /bookings`.
6. Artisan confirms or rejects.
7. Client pays through booking/job payment.
8. Job progresses through the existing booking/job detail UI.

## UI Updates Needed

### Hustle Detail UI

Add city-access awareness to:

- `src/features/hustler/components/HustleDetailPanel.jsx`
- `src/features/hustler/components/ProposalPanel.jsx`

UI behavior:

- Show active city eligibility near the location block.
- Disable "Submit a proposal" and "Apply without submitting a proposal" if city access is missing.
- Replace or supplement disabled buttons with "Subscribe to city".
- Preserve KYC gating. Final eligibility is KYC approved plus active city access.

### Hustle Cards And Feed

Add lightweight city eligibility indicators:

- "Available in your city access"
- "City subscription required"

This is most useful in hustler-facing hustle feeds, not client service feeds.

### Settings Subscription Section

Current `SubscriptionSettings.jsx` is static and only shows hardcoded plan cards. It should become the city access management area for artisans.

Add:

- active/default city list from `GET /my/city-access`
- city subscription status badge: active, pending, expired, cancelled
- add city control using `GET /countries` and `GET /cities?country_id=...`
- payment required state
- Paystack redirect/inline handling
- verify payment action
- deactivate city action

Keep the existing high-level subscription plan cards only if they still map to product decisions. The new backend contract is specifically city access, so the important UI should be city access first.

## Integration Boundary In This Repo

Use existing patterns:

- service functions in `src/features/.../*.service.js` or `src/shared/api/*.service.js`
- React Query hooks beside services
- `apiClient` for authenticated JSON calls
- direct `fetch` only where FormData or special handling is required
- `useUIStore` for toasts
- `storage.getToken()` only when using direct fetch

Suggested new files:

```text
src/features/city-access/cityAccess.service.js
src/features/city-access/cityAccess.hooks.js
src/features/city-access/cityAccess.utils.js
src/features/settings/components/settings/CityAccessSettings.jsx
```

Alternative smaller integration:

```text
src/shared/api/cityAccess.service.js
src/shared/api/cityAccess.hooks.js
```

Given this feature is cross-cutting but mostly artisan settings and hustle apply gating, `src/features/city-access` is cleaner.

