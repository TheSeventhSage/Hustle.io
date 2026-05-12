# API Catalog

Base path: `/api/v1`

## Public
- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`
- `GET /categories`
- `GET /cities`
- `GET /services`
- `GET /services/{id}`
- `GET /companies`
- `GET /companies/{id}`
- `GET /legal/{pageType}`
- `GET /hustles`
- `GET /hustles/{id}`
- `GET /reviews`

## Authenticated shared
- `GET /auth/me`
- `GET /profile`
- `PUT /profile`
- `GET /settings`
- `PUT /settings`
- `GET /conversations`
- `GET /conversations/{id}`
- `POST /conversations/{id}/messages`
- `GET /notifications`
- `POST /notifications/{id}/read`
- `POST /reviews`

## Client
- `GET /bookings`
- `POST /bookings`
- `GET /bookings/{id}`
- `POST /companies/{companyId}/follow`

## Artisan
- `GET /kyc/status`
- `POST /kyc/submissions`
- `GET /kyc/certifications`
- `POST /kyc/certifications`
- `GET /my/services`
- `POST /my/services`
- `PUT /my/services/{id}`
- `GET /availability/rules`
- `POST /availability/rules`
- `GET /availability/exceptions`
- `POST /availability/exceptions`
- `GET /wallet`
- `GET /wallet/entries`
- `GET /wallet/bank-accounts`
- `POST /wallet/bank-accounts`
- `POST /wallet/withdrawals`
- `POST /wallet/withdrawals/{id}/verify-otp`
- `GET /portfolio`
- `POST /portfolio`

## Company
- `POST /hustles`
- `GET /hustles/{id}/applications`
- `POST /hustles/{id}/applications/{applicationId}/decision`

## Shared work module
- `GET /jobs`
- `GET /jobs/{id}`
- `POST /jobs/{id}/complete`

## Admin
- `GET /admin/dashboard`
- `GET /admin/accounts`
- `POST /admin/kyc/{id}/review`
- `GET /admin/payouts`
- `POST /admin/payouts/{id}/process`
- `GET /admin/bookings`
- `GET /admin/disputes`
