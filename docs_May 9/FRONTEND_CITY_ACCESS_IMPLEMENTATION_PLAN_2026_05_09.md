# Frontend Implementation Plan: Hustler City Access Subscriptions

Date: 2026-05-09

## Goal

Integrate the May 9 city access update into the current frontend so that hustlers can only apply to hustles in cities they have active access to, and can subscribe to additional cities from settings.

This plan focuses on the existing React/Vite codebase and the current hustles, bookings, settings, wallet, and payment patterns.

## Current Codebase Starting Point

Relevant existing files:

```text
src/features/hustler/components/HustleDetailPanel.jsx
src/features/hustler/components/ProposalPanel.jsx
src/features/hustles/hustles.service.js
src/features/hustles/hustles.hooks.js
src/features/hustles/components/CreateHustleForm.jsx
src/features/hustles/components/BookHustlerPanel.jsx
src/features/settings/pages/SettingsPage.jsx
src/features/settings/components/settings/SubscriptionSettings.jsx
src/shared/hustles/jobs.service.js
src/shared/hustles/jobs.hooks.js
src/shared/utils/paystack.js
src/services/api.client.js
src/services/query-keys.js
```

Current application gating is mostly:

```text
KYC approved -> allow apply
```

New gating should become:

```text
KYC approved + active city access for hustle.city_id -> allow apply
```

## Phase 1: Add API Services And Query Keys

### Add country API

Add a canonical country service method. Best location:

```text
src/shared/api/location.service.js
```

or extend:

```text
src/shared/api/settings.service.js
```

Required methods:

```js
getCountries(params);
getCities(params);
```

Endpoints:

```http
GET /countries?q=&page=&per_page=
GET /cities?country_id=&q=&page=&per_page=
```

Replace or gradually migrate:

- `authService.getCountries()` away from `/meta/countries.php`
- wallet country derivation from `/cities`
- create hustle city loading to country-scoped city loading

### Add city access feature service

Create:

```text
src/features/city-access/cityAccess.service.js
src/features/city-access/cityAccess.hooks.js
src/features/city-access/cityAccess.utils.js
```

Service methods:

```js
listCityAccess(params);
createCityAccess(payload);
updateCityAccess(id, payload);
deactivateCityAccess(id);
initializeCityAccessPayment(id);
verifyCityAccessPayment(reference);
```

Endpoints:

```http
GET /my/city-access
POST /my/city-access
PATCH /my/city-access/{id}
POST /my/city-access/{id}/deactivate
POST /my/city-access/{id}/payment/initialize
POST /city-access/payments/{reference}/verify
```

Hooks:

```js
useCityAccess(params);
useCreateCityAccess();
useUpdateCityAccess();
useDeactivateCityAccess();
useInitializeCityAccessPayment();
useVerifyCityAccessPayment();
```

Utilities:

```js
getActiveCityAccessRows(rows);
hasActiveCityAccess(rows, cityId);
getCityAccessForCity(rows, cityId);
normalizeCityAccessStatus(row);
```

Add query keys:

```js
cityAccess: {
  all: () => ['city-access'],
  list: (params) => ['city-access', 'list', params],
}
countries: {
  list: (params) => ['countries', 'list', params],
}
cities: {
  list: (params) => ['cities', 'list', params],
}
```

## Phase 2: Update Hustle Apply Flow

### Update `HustleDetailPanel.jsx`

Current flow checks KYC through `settingsService.getKycStatus`.

Add:

```js
const { data: cityAccessRows, isLoading: cityAccessLoading } = useCityAccess();
const hasCityAccess = hasActiveCityAccess(cityAccessRows, hustle?.city_id);
const canApplyToHustle = isKycVerified(kycStatus) && hasCityAccess;
```

UI states:

- KYC loading: existing "Checking KYC" behavior.
- KYC rejected/missing: existing KYC error.
- City access loading: "Checking city access."
- City access missing: show city subscription CTA.
- City access active: show normal apply CTAs.

Add a visible block near location:

```text
City access
Active for Lagos
```

or:

```text
City subscription required
Subscribe to Lagos to apply to this hustle.
```

Clicking subscribe should navigate to:

```text
/settings?section=my-subscription&city_id={hustle.city_id}
```

The current settings page does not read this query param yet, so that is part of Phase 3.

### Update `ProposalPanel.jsx`

The parent already passes `canApply` and `isCheckingKyc`. Rename or extend props to make the rule clear:

```js
canApply;
isCheckingEligibility;
eligibilityReason;
onSubscribeCity;
```

The proposal submit button should be disabled when city access is missing. The panel should not let a user fill a full proposal only to fail at submit when we already know they need a city subscription.

### Keep backend as final authority

Even with UI gating, keep current error handling from `POST /hustles/{id}/applications`. If the backend rejects for city access, show the backend message and a "Subscribe to city" action.

## Phase 3: Replace Static Subscription Settings With City Access Management

### Update Settings Routing State

Current settings tabs are local state in:

```text
src/features/settings/pages/SettingsPage.jsx
```

Add query param support:

```text
/settings?section=my-subscription
/settings?section=my-subscription&city_id=2
```

On mount:

- if `section=my-subscription`, set `activeKey = 'my-subscription'`
- if `city_id` is present, pass it to `SubscriptionSettings`

### Rewrite `SubscriptionSettings.jsx`

Current component is static plan cards. Replace or extend it with a city access manager.

Required UI:

1. Current city access list
   - city name
   - country name
   - default city marker
   - active/inactive state
   - subscription status
   - start/end date
   - deactivate action

2. Add city form
   - country select from `GET /countries`
   - city select from `GET /cities?country_id=...`
   - default city checkbox when appropriate
   - submit button

3. Payment required state
   - after `POST /my/city-access`, if response has `payment_required`
   - show amount, currency, duration
   - call `POST /my/city-access/{id}/payment/initialize`
   - open Paystack using returned `authorization_url`
   - verify with `POST /city-access/payments/{reference}/verify`
   - refresh city access list

4. Empty state
   - "No city access yet"
   - "Add your first operating city"

Use existing style from Settings page: restrained panels, not marketing cards. The current static "Native/Continental/International" cards should be moved below the active city access management or removed if they no longer map to backend behavior.

### Payment Handling

Follow the existing booking/job payment pattern instead of inventing a separate payment flow.

Current repo pattern:

- initialize payment from backend
- read `access_code`, `reference`, and optionally `authorization_url`
- store pending payment context in `localStorage`
- prefer Paystack Inline `new window.PaystackPop().resumeTransaction(accessCode, ...)`
- verify from the frontend success callback
- fall back to Paystack redirect when Inline is unavailable
- on redirect return, read `payment_ref`, `reference`, or `trxref` from the URL
- compare returned reference against the stored pending payment
- reject stale payment sessions older than one hour
- verify with the backend
- clean URL params and remove pending localStorage record

The city access payment should copy that shape.

Recommended localStorage key:

```js
localStorage.setItem(
  "pending_city_access_payment",
  JSON.stringify({
    reference,
    cityAccessId,
    cityId,
    timestamp: Date.now(),
  }),
);
```

City access initialize flow:

```js
const paymentData = response?.data?.data || response?.data;
const accessCode = paymentData?.access_code;
const reference = paymentData?.reference;

if (!accessCode || !reference) {
  toastError("Payment initialization failed. Missing payment details.");
  return;
}

localStorage.setItem(
  "pending_city_access_payment",
  JSON.stringify({
    reference,
    cityAccessId,
    cityId,
    timestamp: Date.now(),
  }),
);

try {
  if (typeof window.PaystackPop === "undefined") {
    const authUrl = paymentData?.authorization_url;
    if (authUrl) {
      const returnUrl = `${window.location.origin}/settings?section=my-subscription&payment_ref=${reference}`;
      window.location.href = `${authUrl}&callback_url=${encodeURIComponent(returnUrl)}`;
    } else {
      toastError("Payment initialization failed. Missing payment URL.");
    }
    return;
  }

  const popup = new window.PaystackPop();
  popup.resumeTransaction(accessCode, {
    onSuccess: () => {
      verifyCityAccessPayment(reference);
    },
    onCancel: () => {
      localStorage.removeItem("pending_city_access_payment");
      toastError("Payment cancelled.");
    },
    onError: (error) => {
      localStorage.removeItem("pending_city_access_payment");
      toastError(error?.message ?? "Payment failed.");
    },
  });
} catch (error) {
  const authUrl = paymentData?.authorization_url;
  if (authUrl) {
    const returnUrl = `${window.location.origin}/settings?section=my-subscription&payment_ref=${reference}`;
    window.location.href = `${authUrl}&callback_url=${encodeURIComponent(returnUrl)}`;
  } else {
    localStorage.removeItem("pending_city_access_payment");
    toastError("Payment initialization failed.");
  }
}
```

City access callback handling should live in `SettingsPage.jsx` or inside the new `CityAccessSettings.jsx` component if that component owns the `useSearchParams()` logic.

Callback logic:

```js
const paymentRef =
  searchParams.get("payment_ref") ||
  searchParams.get("reference") ||
  searchParams.get("trxref");
const section = searchParams.get("section");

if (section !== "my-subscription" || !paymentRef) return;

const pendingPaymentStr = localStorage.getItem("pending_city_access_payment");
if (!pendingPaymentStr) {
  cleanupPaymentParams();
  return;
}

const pendingPayment = JSON.parse(pendingPaymentStr);

if (pendingPayment.reference !== paymentRef) {
  toastError("Payment reference mismatch.");
  localStorage.removeItem("pending_city_access_payment");
  cleanupPaymentParams();
  return;
}

const ONE_HOUR = 60 * 60 * 1000;
if (Date.now() - pendingPayment.timestamp > ONE_HOUR) {
  toastError("Payment session expired. Please try again.");
  localStorage.removeItem("pending_city_access_payment");
  cleanupPaymentParams();
  return;
}

verifyCityAccessPayment(paymentRef, {
  onSuccess: () => {
    toastSuccess("City access payment verified.");
    localStorage.removeItem("pending_city_access_payment");
    cleanupPaymentParams();
    queryClient.invalidateQueries({ queryKey: cityAccessKeys.all() });
  },
  onError: (err) => {
    toastError(
      err?.message ?? "Payment verification failed. Please contact support.",
    );
    localStorage.removeItem("pending_city_access_payment");
    cleanupPaymentParams();
  },
});
```

Verification endpoint:

```http
POST /api/v1/city-access/payments/{reference}/verify
```

The callback URL should keep the user in the settings subscription screen:

```text
/settings?section=my-subscription&payment_ref={reference}
```

This mirrors the existing `/my-hustles?tab=pending&payment_ref={reference}` pattern used by job payments, but routes the result back to city access management.

## Phase 4: Update Hustle Creation Country/City Scope

### Update `CreateHustleForm.jsx`

Add `country_id` to schema and default values.

Load:

```http
GET /countries
GET /cities?country_id={selectedCountryId}
```

Payload should include:

```js
country_id: Number(data.country_id),
city_id: Number(data.city_id),
```

When the user changes country, reset city.

If the poster's registered country is available from `GET /profile` or stored auth data, default country to that value and optionally lock it if backend rules say posters cannot create outside their registered country.

### Update Hustle List Filters

Add support in `hustlesService.list(params)` for:

```js
country_id;
date_from;
date_to;
preferred_date;
per_page;
```

Current code uses `limit`; docs use `per_page`. Prefer `per_page`, but keep `limit` only if old backend still accepts it.

## Phase 5: Booking Flow Adjustments

### Keep service visibility backend-driven

The backend says `GET /services` only lists providers with active city access. So current discovery can stay mostly as-is, but service queries should pass selected `country_id` and `city_id` once the UI has filters.

### Tighten `BookHustlerPanel.jsx`

Current booking form allows city selection from all cities.

Safer behavior:

- default to the provider service city
- if service response has allowed cities/access rows later, only show those cities
- if not, show the service city as read-only or strongly preferred

Keep sending:

```js
city_id;
service_location_text;
scheduled_start_at;
timezone_name;
```

Remove hardcoded insurance behavior later once `GET /insurance/rates` is integrated. It is separate from city access.

## Phase 6: Tests And Verification

Add focused tests for pure utilities first:

```text
tests/unit/cityAccess.utils.test.js
```

Cases:

- active city access with no `ends_at`
- active city access with future `ends_at`
- expired access
- inactive row
- pending subscription
- numeric/string city IDs

Manual verification:

1. Artisan with active city A opens hustle in city A: apply button enabled.
2. Artisan with active city A opens hustle in city B: subscribe CTA shown, apply disabled.
3. Subscribe to city B from settings.
4. Payment required path initializes Paystack and verifies.
5. After refresh, city B appears active.
6. Artisan returns to hustle in city B and can apply.
7. Client/company creates hustle with country and city.
8. Client books a provider service and city stays consistent with service city.

## Implementation Order I Would Use

1. Add `cityAccess.service.js`, `cityAccess.hooks.js`, and `cityAccess.utils.js`.
2. Add country/city service helpers and query keys.
3. Update `SubscriptionSettings.jsx` into city access management UI.
4. Add settings query-param handling for deep linking from a blocked hustle.
5. Update `HustleDetailPanel.jsx` eligibility gating.
6. Update `ProposalPanel.jsx` to respect full eligibility, not just KYC.
7. Update `CreateHustleForm.jsx` to send `country_id` and country-scoped city selection.
8. Update `hustlesService.list()` query params for country/city/date pagination.
9. Tighten `BookHustlerPanel.jsx` city selection behavior.
10. Add utility tests and run the existing unit test suite.

## What Remains To Be Implemented After This Plan

These are documented May 9 or nearby backend features that remain outside the immediate city-access implementation:

- Admin city access pricing UI.
- Admin insurance rates UI.
- Admin insurance wallet and transaction UI.
- `GET /insurance/rates` in booking/hustle payment UI.
- Share API integration: `POST /share`, `GET /share/{code}`.
- Hustle cancellation endpoint: `POST /hustles/{id}/cancel`.
- Admin trash UI and restore/purge flow.
- Public company list/detail UI.
- Company follow action.
- Global search endpoint: `GET /search`.
- Job-level location endpoints: `POST /jobs/{id}/location`, `GET /jobs/{id}/location`.
- Full web KYC submission and certification flows.
- Replacing static legal pages with `GET /legal/{pageType}` where desired.
- Admin dashboard/accounts/KYC/payouts/bookings/disputes module.

## Key Product Decision Needed

The backend supports paid extra city access, but the frontend still needs a product rule for the first/default city:

- Should the first active city be created automatically from the user's registered/default city?
- Should artisans choose their first city during signup/profile completion?
- Should settings allow changing default city after jobs exist? ->

Until that is decided, the frontend should show the current backend state from `GET /my/city-access` and allow adding cities through the documented API.
