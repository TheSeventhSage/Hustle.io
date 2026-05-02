# HustleApp API Documentation

Generated from the uploaded app ZIP and SQL dump. The SQL table structure was **not changed**.

## 1. App Overview

- Runtime: custom PHP 8.1+ API, front controller `index.php`, no external framework.
- Default API base path: `/api/v1`; live base URL: `https://hustleapp.stii.click/api/v1`. Admin API base path: `https://hustleapp.stii.click/api/v1/admin`.
- Database: MySQL/MariaDB using PDO.
- Auth: JWT bearer token issued by `POST /auth/login`; default token lifetime in `config/app.php` is `604800` seconds (7 days) unless `.env` overrides `TOKEN_TTL_SECONDS`.
- Request body: JSON only for `POST`, `PUT`, and `PATCH`. Send `Content-Type: application/json`.

Response format:

```json
{
  "success": true,
  "message": "Human readable message.",
  "data": {},
  "meta": {}
}
```

Errors use the same envelope with `success: false`. Common status codes: `200`, `201`, `202`, `400`, `401`, `403`, `404`, `409`, `415`, `422`, `429`, `500`.

## 2. Authentication and Postman Setup

### Required headers

| Case | Header |
|---|---|
| All JSON writes | `Content-Type: application/json` |
| Authenticated routes | `Authorization: Bearer {{token}}` |
| Safe retries for selected POST routes | `X-Idempotency-Key: {{$guid}}` |
| Optional tracing | `X-Request-Id: any-client-generated-id` |

### Demo accounts from the seed/readme

All four seeded demo accounts use password `Password123!`:

| Role | Email |
|---|---|
| Client | `client@example.com` |
| Artisan | `artisan@example.com` |
| Company | `company@example.com` |
| Admin | `admin@example.com` |

### Postman login flow

1. Import `HustleApp_Postman_Collection_Full.json` from this answer.
2. Set collection variable `baseUrl` to `https://hustleapp.stii.click/api/v1`. Do not set `baseUrl` to `/api/v1/admin` because the admin requests already append `/admin/...`.
3. Run one of the login requests. The included tests save `clientToken`, `artisanToken`, `companyToken`, or `adminToken`; the latest login also saves `token`.
4. Send role-specific protected requests. A client token cannot call artisan/company/admin-only endpoints, and vice versa.
5. For idempotent routes, keep `X-Idempotency-Key` unique per real attempt. Reusing the same key for the same route and account replays the saved response.

### Auth requirements by route family

| Family | Roles |
|---|---|
| Public auth/discovery | no token |
| Shared profile/chat/notifications/reviews | `client`, `artisan`, `company` |
| Bookings | create = `client`; confirm = `artisan`; list/show/cancel = `client` or `artisan` |
| KYC, services, availability, wallet, portfolio | `artisan` |
| Hustle create | `company` |
| Hustle applications list/decision | `company` owner or `admin` |
| Jobs | `client`, `artisan`, `company` participant |
| Admin | `admin` |

## 3. Endpoint Reference

### Public / Auth

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `GET` | `/health` | No / Public | Health check; confirms API and DB connectivity. | None | 200 API is healthy. |
| `POST` | `/auth/register` | No / Public | Create a client, artisan, or company account. | email*, password* (min 8), account_type* client\|artisan\|company, country_id*, timezone_name, first_name, last_name, phone_number, company_name, overview | 201 account + verification token in non-production |
| `POST` | `/auth/login` | No / Public | Login and receive JWT bearer access token. | email*, password* | 200 access_token, token_type, expires_in, account |
| `POST` | `/auth/resend-verification` | No / Public | Regenerate email verification token for unverified account. | email* | 202 verification token in non-production |
| `GET|POST` | `/auth/verify-email` | No / Public | Verify email using email and token. | email*, token* in query string or JSON body | 200 verified account |

### Public / Discovery

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `GET` | `/categories` | No / Public | List active service categories. | None | 200 items |
| `GET` | `/cities` | No / Public | List active cities. | country_id optional | 200 items |
| `GET` | `/services` | No / Public | List active artisan provider services. | category_id optional, city_id optional, q optional | 200 items |
| `GET` | `/services/{id}` | No / Public | Get one provider service, skills, and latest reviews. | id path | 200 item, skills, reviews |
| `GET` | `/companies` | No / Public | List companies and review stats. | None | 200 items |
| `GET` | `/companies/{id}` | No / Public | Get company profile, social links, reviews, followers count. | id path = company account id | 200 item, social_links, reviews |
| `GET` | `/legal/{pageType}` | No / Public | Get active legal page. | pageType path such as terms, privacy | 200 item |
| `GET` | `/hustles` | No / Public | List open hustle posts. | category_id optional, city_id optional, q optional | 200 items |
| `GET` | `/hustles/{id}` | No / Public | Get one hustle post and skills. | id path | 200 item, skills |
| `GET` | `/reviews` | No / Public | List visible reviews. | target_type optional artisan\|company, review_subject_account_id optional | 200 items |

### Authenticated / Shared

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `GET` | `/auth/me` | Bearer / client, artisan, company | Current authenticated account snapshot. | None | 200 account |
| `GET` | `/profile` | Bearer / client, artisan, company | Get current profile; company gets company profile, others get user profile. | None | 200 profile |
| `PUT|PATCH` | `/profile` | Bearer / client, artisan, company | Update current profile. | For client/artisan: first_name, middle_name, last_name, date_of_birth, gender, phone_number, bio, default_city_id, profile_image_url. For company: company_name, overview, registration_date, city_id, location_text, profile_image_url. | 200 profile |
| `GET` | `/settings` | Bearer / client, artisan, company | Get account appearance/timezone settings. | None | 200 settings |
| `PUT|PATCH` | `/settings` | Bearer / client, artisan, company | Update account appearance/timezone settings. | appearance_mode system\|light\|dark, timezone_name | 200 settings |
| `GET` | `/conversations` | Bearer / client, artisan, company | List conversations for current account. | None | 200 items |
| `POST` | `/conversations/initiate` | Bearer / client, artisan, company | Create or return an existing conversation between the current account and another participant. Use this before sending the first message when no conversation exists yet. Idempotency supported with `X-Idempotency-Key`. | participant_account_id*, conversation_type default direct, booking_id optional, hustle_post_id optional, job_id optional | 200 existing conversation or 201 new conversation |
| `GET` | `/conversations/{id}` | Bearer / client, artisan, company | Get conversation and messages; marks as read. | id path | 200 conversation, messages |
| `POST` | `/conversations/{id}/messages` | Bearer / client, artisan, company | Send a chat message in a conversation. Idempotency supported with `X-Idempotency-Key`. | id path; message_body* | 201 message |
| `GET` | `/notifications` | Bearer / client, artisan, company | List current account notifications. | None | 200 items |
| `POST` | `/notifications/{id}/read` | Bearer / client, artisan, company | Mark notification as read. | id path | 200 notification_id |
| `POST` | `/reviews` | Bearer / client, artisan, company | Create a review for an artisan or company. | target_type* artisan\|company, review_subject_account_id*, job_id, rating* 1-5, feedback_text | 201 item |

### Client / Bookings

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `GET` | `/bookings` | Bearer / client or artisan | List bookings for current client/artisan. | None | 200 items |
| `POST` | `/bookings` | Bearer / client | Create a booking and related pending job, payment, conversation, notifications. Idempotency supported with `X-Idempotency-Key`. | provider_service_id*, booking_mode come_now\|scheduled, scheduled_start_at required for scheduled, expected_duration_minutes default 60, timezone_name, city_id, service_location_text, latitude, longitude, special_instructions, insurance_rate_pct | 201 booking_id, job_id, conversation_id |
| `GET` | `/bookings/{id}` | Bearer / client or artisan | Get one booking if current user is the client or artisan. | id path | 200 item |
| `POST` | `/bookings/{id}/confirm` | Bearer / artisan | Artisan confirms booking; job moves to in_progress. | id path | 200 booking_id |
| `POST` | `/bookings/{id}/cancel` | Bearer / client or artisan | Cancel booking and related job. | id path; reason | 200 booking_id |

### Client / Company Follow

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `POST` | `/companies/{companyId}/follow` | Bearer / client | Follow a company. | companyId path | 200 company_account_id |

### Artisan / KYC

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `GET` | `/kyc/status` | Bearer / artisan | Get latest KYC submission. | None | 200 submission |
| `POST` | `/kyc/submissions` | Bearer / artisan | Submit KYC identity details and optional document/selfie URLs. Idempotency supported with `X-Idempotency-Key`. | document_type*, id_number*, first_name*, middle_name, last_name*, date_of_birth*, gender, document_url, selfie_url | 201 submission |
| `GET` | `/kyc/certifications` | Bearer / artisan | List provider certifications. | None | 200 items |
| `POST` | `/kyc/certifications` | Bearer / artisan | Submit provider certification for admin review. | certification_type_id*, certification_number, file_url, issued_at, expires_at | 201 item |

### Artisan / Services

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `GET` | `/my/services` | Bearer / artisan | List current artisan's provider services. | None | 200 items |
| `POST` | `/my/services` | Bearer / artisan | Create an artisan service listing. | title*, category_id*, short_description, experience_level, pricing_model_default per_service\|full_amount\|per_hour, default_rate_amount, currency_code, image_url | 201 item |
| `PUT|PATCH` | `/my/services/{id}` | Bearer / artisan | Update one owned provider service. | id path; category_id, title, short_description, experience_level, pricing_model_default, default_rate_amount, currency_code, is_active | 200 item |

### Artisan / Availability

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `GET` | `/availability/rules` | Bearer / artisan | List weekly availability rules. | None | 200 items |
| `POST` | `/availability/rules` | Bearer / artisan | Create or update weekly availability rule. If body.id is present, updates existing rule. | id optional, weekday_number* 0-6, start_time*, end_time*, timezone_name, status available\|unavailable | 200 item |
| `GET` | `/availability/exceptions` | Bearer / artisan | List date/time availability exceptions. | None | 200 items |
| `POST` | `/availability/exceptions` | Bearer / artisan | Create date/time availability exception. | starts_at*, ends_at*, timezone_name, status unavailable\|available, note | 201 item |

### Artisan / Portfolio

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `GET` | `/portfolio` | Bearer / artisan | List portfolio items. | None | 200 items |
| `POST` | `/portfolio` | Bearer / artisan | Create portfolio item. | service_name*, brief_description, image_url | 201 item |

### Company / Hustles

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `POST` | `/hustles` | Bearer / company | Create hustle post. | category_id*, title*, description, city_id, location_text, duration_minutes, required_experience_level, payment_model per_service\|full_amount\|per_hour, budget_amount, currency_code, status | 201 item |

### Artisan / Hustles

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `POST` | `/hustles/{id}/applications` | Bearer / artisan | Apply to open hustle post. Idempotency supported with `X-Idempotency-Key`. | id path; pricing_model, offered_amount*, currency_code, expected_completion_at, timeline_notes | 201 item |

### Company/Admin / Hustles

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `GET` | `/hustles/{id}/applications` | Bearer / company or admin | List applications for a hustle post. Company must own the post; admin can view any. | id path | 200 items |
| `POST` | `/hustles/{id}/applications/{applicationId}/decision` | Bearer / company or admin | Shortlist, accept, or reject a hustle application. Accepting creates a job and closes the post. | id path, applicationId path; decision shortlisted\|accepted\|rejected | 200 application_id, decision, job_id |

### Jobs

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `GET` | `/jobs` | Bearer / client, artisan, company | List jobs for current account based on role. | None | 200 items |
| `GET` | `/jobs/{id}` | Bearer / client, artisan, company | Get job details if current user participates. | id path | 200 item |
| `POST` | `/jobs/{id}/complete` | Bearer / client, artisan, company | Mark job completed and credit artisan wallet with provider net estimate. | id path | 200 job_id, wallet_credit |

### Artisan / Wallet

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `GET` | `/wallet` | Bearer / artisan | Get current artisan wallet; creates empty wallet if missing. | None | 200 wallet |
| `GET` | `/wallet/entries` | Bearer / artisan | List wallet ledger entries. | None | 200 items |
| `GET` | `/wallet/bank-accounts` | Bearer / artisan | List payout bank accounts. | None | 200 items |
| `POST` | `/wallet/bank-accounts` | Bearer / artisan | Create payout bank account. | bank_name*, account_number*, beneficiary_name*, branch_name, country_id, swift_code, is_default | 201 item |
| `POST` | `/wallet/withdrawals` | Bearer / artisan | Request withdrawal and create email OTP. Non-production returns otp_code. Idempotency supported with `X-Idempotency-Key`. | payout_bank_account_id*, amount* | 201 withdrawal_id, otp_code in non-production |
| `POST` | `/wallet/withdrawals/{id}/verify-otp` | Bearer / artisan | Verify withdrawal OTP and approve withdrawal; wallet balance is reduced. | id path; otp_code* | 200 withdrawal_id, status |

### Admin

| Method | Path | Auth/Roles | Purpose | Request input | Success |
|---|---|---|---|---|---|
| `GET` | `/admin/dashboard` | Bearer / admin | Admin dashboard metrics. | None | 200 metrics |
| `GET` | `/admin/accounts` | Bearer / admin | List accounts. | account_type optional, status optional | 200 items |
| `POST` | `/admin/kyc/{id}/review` | Bearer / admin | Approve or reject KYC submission. | id path; status approved\|rejected, review_notes | 200 kyc_submission_id, status |
| `GET` | `/admin/payouts` | Bearer / admin | List withdrawal requests with bank/wallet info. | None | 200 items |
| `POST` | `/admin/payouts/{id}/process` | Bearer / admin | Process withdrawal payout status. | id path; action approved\|declined\|failed\|paid, transfer_reference, failure_reason | 200 withdrawal_id, status |
| `GET` | `/admin/bookings` | Bearer / admin | List all bookings. | None | 200 items |
| `GET` | `/admin/disputes` | Bearer / admin | List disputes. | None | 200 items |

## 4. Request Body Examples

### `POST /auth/register`

```json
{
  "email": "newclient{{$timestamp}}@example.com",
  "password": "Password123!",
  "account_type": "client",
  "country_id": 1,
  "timezone_name": "Africa/Lagos",
  "first_name": "New",
  "last_name": "Client",
  "phone_number": "+2348000000000"
}
```

### `POST /auth/login`

```json
{
  "email": "client@example.com",
  "password": "Password123!"
}
```

### `POST /auth/resend-verification`

```json
{
  "email": "newclient@example.com"
}
```

### `POST /auth/verify-email`

```json
{
  "email": "newclient@example.com",
  "token": "paste-token-from-email-or-non-production-response"
}
```

### `PUT /profile`

```json
{
  "first_name": "Ada",
  "last_name": "Okafor",
  "phone_number": "+2348000000000",
  "bio": "Reliable customer",
  "default_city_id": 1,
  "profile_image_url": "https://example.com/profile.jpg"
}
```

### `PUT /settings`

```json
{
  "appearance_mode": "system",
  "timezone_name": "Africa/Lagos"
}
```

### `POST /conversations/{id}/messages`

```json
{
  "message_body": "Hello, I have a question about the job."
}
```

### `POST /conversations/initiate`

```json
{
  "participant_account_id": 2,
  "conversation_type": "direct",
  "booking_id": null,
  "hustle_post_id": null,
  "job_id": null
}

### `POST /reviews`

```json
{
  "target_type": "artisan",
  "review_subject_account_id": 2,
  "job_id": 1,
  "rating": 5,
  "feedback_text": "Great work."
}
```

### `POST /bookings`

```json
{
  "provider_service_id": 1,
  "booking_mode": "scheduled",
  "scheduled_start_at": "2026-05-01 10:00:00",
  "expected_duration_minutes": 120,
  "timezone_name": "Africa/Lagos",
  "city_id": 1,
  "service_location_text": "Yaba, Lagos",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "special_instructions": "Call on arrival",
  "insurance_rate_pct": 5
}
```

### `POST /bookings/{id}/cancel`

```json
{
  "reason": "Schedule changed"
}
```

### `POST /kyc/submissions`

```json
{
  "document_type": "national_id",
  "id_number": "NIN123456789",
  "first_name": "Tunde",
  "last_name": "Artisan",
  "date_of_birth": "1995-01-15",
  "gender": "male",
  "document_url": "https://example.com/id-card.jpg",
  "selfie_url": "https://example.com/selfie.jpg"
}
```

### `POST /kyc/certifications`

```json
{
  "certification_type_id": 1,
  "certification_number": "CERT-001",
  "file_url": "https://example.com/certificate.pdf",
  "issued_at": "2025-01-01",
  "expires_at": "2027-01-01"
}
```

### `POST /my/services`

```json
{
  "category_id": 1,
  "title": "Home Deep Cleaning",
  "short_description": "Full apartment cleaning with supplies included.",
  "experience_level": "senior",
  "pricing_model_default": "per_service",
  "default_rate_amount": 15000,
  "currency_code": "NGN",
  "image_url": "https://example.com/service.jpg"
}
```

### `PUT /my/services/{id}`

```json
{
  "title": "Home Deep Cleaning Plus",
  "category_id": 1,
  "short_description": "Updated description",
  "experience_level": "senior",
  "pricing_model_default": "per_service",
  "default_rate_amount": 18000,
  "currency_code": "NGN",
  "is_active": 1
}
```

### `POST /availability/rules`

```json
{
  "weekday_number": 1,
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "timezone_name": "Africa/Lagos",
  "status": "available"
}
```

### `POST /availability/exceptions`

```json
{
  "starts_at": "2026-05-02 09:00:00",
  "ends_at": "2026-05-02 17:00:00",
  "timezone_name": "Africa/Lagos",
  "status": "unavailable",
  "note": "Personal appointment"
}
```

### `POST /portfolio`

```json
{
  "service_name": "Apartment Cleaning",
  "brief_description": "Before/after cleaning project.",
  "image_url": "https://example.com/portfolio.jpg"
}
```

### `POST /hustles`

```json
{
  "category_id": 1,
  "title": "Weekend Apartment Cleanup",
  "description": "Need a trusted cleaner for a weekend apartment cleanup.",
  "city_id": 1,
  "location_text": "Yaba, Lagos",
  "duration_minutes": 180,
  "required_experience_level": "mid",
  "payment_model": "full_amount",
  "budget_amount": 18000,
  "currency_code": "NGN",
  "status": "open"
}
```

### `POST /hustles/{id}/applications`

```json
{
  "pricing_model": "full_amount",
  "offered_amount": 17500,
  "currency_code": "NGN",
  "expected_completion_at": "2026-05-05 17:00:00",
  "timeline_notes": "Can complete same day."
}
```

### `POST /hustles/{id}/applications/{applicationId}/decision`

```json
{
  "decision": "accepted"
}
```

### `POST /wallet/bank-accounts`

```json
{
  "bank_name": "GTBank",
  "account_number": "0123456789",
  "beneficiary_name": "Tunde Artisan",
  "branch_name": "Yaba",
  "country_id": 1,
  "swift_code": "GTBINGLA",
  "is_default": true
}
```

### `POST /wallet/withdrawals`

```json
{
  "payout_bank_account_id": 1,
  "amount": 5000
}
```

### `POST /wallet/withdrawals/{id}/verify-otp`

```json
{
  "otp_code": "123456"
}
```

### `POST /admin/kyc/{id}/review`

```json
{
  "status": "approved",
  "review_notes": "Documents are valid."
}
```

### `POST /admin/payouts/{id}/process`

```json
{
  "action": "paid",
  "transfer_reference": "BANK-TX-001",
  "failure_reason": null
}
```

## 5. Recommended Postman Test Flows

### Public smoke test

1. `GET /health`
2. `GET /categories`
3. `GET /cities?country_id=1`
4. `GET /services?category_id=1&city_id=1`

### Direct conversation flow

1. Login as `client@example.com`, `artisan@example.com`, or `company@example.com`.
2. Call `POST /conversations/initiate` with `participant_account_id` and an idempotency key.
3. Save the returned `conversation.id`.
4. Call `POST /conversations/{id}/messages` using the saved conversation id.
5. Call `GET /conversations/{id}` to confirm the message appears and the conver

### Client booking flow

1. Login as `client@example.com` and use `clientToken`.
2. `GET /services` to choose `provider_service_id`.
3. `POST /bookings` with an idempotency key. Save `booking_id`, `job_id`, `conversation_id`.
4. `GET /bookings/{id}`.
5. Use artisan login/token and call `POST /bookings/{id}/confirm`.
6. Use any job participant token and call `POST /jobs/{id}/complete`.

### Artisan provider flow

1. Login as `artisan@example.com`.
2. `POST /kyc/submissions` and `GET /kyc/status`.
3. `POST /my/services`, `GET /my/services`.
4. Add `POST /availability/rules` and `POST /availability/exceptions`.
5. `POST /hustles/{id}/applications` to apply to company work.
6. After completed jobs, test `GET /wallet`, `POST /wallet/withdrawals`, then OTP verification.

### Company hustle flow

1. Login as `company@example.com`.
2. `POST /hustles`.
3. Login as artisan and apply with `POST /hustles/{id}/applications`.
4. Login as company and call `GET /hustles/{id}/applications`.
5. Call `POST /hustles/{id}/applications/{applicationId}/decision` with `accepted` to create a job.

### Admin review flow

1. Login as `admin@example.com`.
2. `GET /admin/dashboard`.
3. `GET /admin/accounts?account_type=artisan&status=active`.
4. `POST /admin/kyc/{id}/review`.
5. `GET /admin/payouts`; then `POST /admin/payouts/{id}/process`.

## 6. SQL Table Reference

The app currently expects these tables and relationships. Do not rename/remove columns without updating controllers.

| Table | Purpose | Main columns |
|---|---|---|
| `account_settings` | Per-account UI mode and timezone. | account_id, appearance_mode, timezone_name, created_at, updated_at |
| `accounts` | Core login identity, role, status, verification/profile completion timestamps. | id, account_type, email, password_hash, registration_country_id, email_verified_at, profile_completed_at, status, ... |
| `artisan_availability_exceptions` | One-off artisan availability overrides. | id, artisan_account_id, starts_at, ends_at, timezone_name, status, note, created_at |
| `artisan_availability_rules` | Weekly artisan availability schedule. | id, artisan_account_id, weekday_number, start_time, end_time, timezone_name, status, created_at |
| `artisan_city_access` | Cities where an artisan can receive bookings. | id, artisan_account_id, city_id, membership_plan_id, is_default_city, is_active, starts_at, ends_at, ... |
| `bookings` | Client-to-artisan booking requests and schedule/status. | id, client_account_id, artisan_account_id, provider_service_id, booking_mode, requested_at, scheduled_start_at, expected_duration_minutes, ... |
| `categories` | Top-level service categories. | id, parent_category_id, name, slug, is_active, display_order, created_at |
| `category_certification_requirements` | Certification requirements per category. | id, category_id, certification_type_id, is_required, created_at |
| `certification_types` | Certification type lookup. | id, name, description, is_active, created_at |
| `cities` | City lookup by country. | id, country_id, name, state_name, is_active, created_at |
| `company_profiles` | Company profile details. | account_id, company_name, overview, registration_date, city_id, location_text, profile_image_asset_id, created_at, ... |
| `conversation_participants` | Accounts in each conversation. | conversation_id, account_id, last_read_at, created_at |
| `conversations` | Conversation containers created directly or from bookings/hustles/jobs. | id, conversation_type, booking_id, hustle_post_id, job_id, created_at |
| `countries` | Country lookup. | id, name, iso2_code, iso3_code, created_at |
| `disputes` | Disputes attached to jobs. | id, job_id, opened_by_account_id, description, status, opened_at, resolved_at, resolved_by_admin_id, ... |
| `email_otps` | OTP records used for withdrawal confirmation. | id, account_id, purpose, code_hash, expires_at, verified_at, created_at |
| `email_verification_tokens` | Email verification tokens for accounts. | id, account_id, token_hash, expires_at, consumed_at, created_at |
| `follows` | Client follows of company accounts. | follower_account_id, company_account_id, created_at |
| `hustle_applications` | Artisan applications to company hustle posts. | id, hustle_post_id, artisan_account_id, pricing_model, offered_amount, currency_code, platform_service_fee_amount, provider_net_estimate, ... |
| `hustle_post_skills` | Skill tags required on hustle posts. | hustle_post_id, skill_id |
| `hustle_posts` | Company-created job/hustle postings. | id, posted_by_account_id, category_id, title, description, city_id, location_text, duration_minutes, ... |
| `job_financials` | Pricing, fees, provider net estimate, total due per job. | job_id, pricing_model, base_amount, currency_code, platform_service_fee_amount, provider_net_estimate, insurance_amount, total_amount_due, ... |
| `job_insurance` | Optional insurance quotation data per job. | id, job_id, provider_type, insurance_rate_pct, premium_amount, external_policy_reference, status, created_at, ... |
| `jobs` | Work execution records created from bookings or accepted hustle applications. | id, booking_id, hustle_post_id, accepted_application_id, client_account_id, artisan_account_id, company_account_id, category_id, ... |
| `kyc_submission_files` | Files attached to KYC submissions. | id, kyc_submission_id, file_role, media_asset_id, created_at |
| `kyc_submissions` | Artisan identity KYC records and review status. | id, account_id, document_type, id_number, first_name, middle_name, last_name, date_of_birth, ... |
| `legal_pages` | Terms/privacy/etc legal content. | id, page_type, title, body_content, version_number, is_active, published_at, created_at |
| `listing_actions` | Audit/action records for listings. | id, account_id, target_type, target_id, action_type, created_at |
| `media_assets` | Stored file/URL metadata. | id, owner_account_id, asset_type, file_name, storage_url, mime_type, uploaded_at |
| `membership_plans` | Artisan membership plan lookup. | id, name, description, fee_amount, currency_code, rules_text, is_active, created_at |
| `messages` | Chat messages inside conversations. | id, conversation_id, sender_account_id, message_body, sent_at |
| `moderation_actions` | Admin moderation actions. | id, admin_account_id, target_type, target_id, action, reason, created_at |
| `notifications` | Per-account notifications. | id, account_id, notification_type, title, body, payload_json, delivered_at, read_at, ... |
| `payments` | Payment records against jobs. | id, job_id, payer_account_id, payment_gateway_reference, amount, currency_code, status, paid_at, ... |
| `payout_bank_accounts` | Artisan bank account payout details. | id, artisan_account_id, bank_name, account_number, beneficiary_name, branch_name, country_id, swift_code, ... |
| `portfolio_items` | Artisan portfolio examples. | id, artisan_account_id, service_name, brief_description, image_asset_id, created_at, updated_at |
| `provider_certifications` | Artisan certification submissions/reviews. | id, artisan_account_id, certification_type_id, certification_number, media_asset_id, status, issued_at, expires_at, ... |
| `provider_service_skills` | Skill tags attached to provider services. | provider_service_id, skill_id |
| `provider_services` | Artisan service listings visible in discovery. | id, artisan_account_id, category_id, title, short_description, experience_level, pricing_model_default, default_rate_amount, ... |
| `reviews` | Visible reviews for artisans or companies. | id, reviewer_account_id, target_type, review_subject_account_id, job_id, rating, feedback_text, is_visible, ... |
| `skills` | Skill lookup. | id, name, is_active, created_at |
| `social_links` | Company social links. | id, company_account_id, platform_name, profile_url, created_at |
| `user_profiles` | Client/artisan personal profile data. | account_id, first_name, middle_name, last_name, date_of_birth, gender, phone_number, bio, ... |
| `wallet_entries` | Wallet ledger entries. | id, wallet_id, job_id, entry_type, amount, status, description, created_at |
| `wallets` | Artisan wallet balances. | id, artisan_account_id, currency_code, available_balance, pending_balance, total_earned, updated_at, created_at |
| `withdrawal_requests` | Artisan payout requests and admin processing state. | id, wallet_id, payout_bank_account_id, email_otp_id, amount, currency_code, status, transfer_reference, ... |

### Key database relationships used by the API

- `accounts.account_type` drives route access: `client`, `artisan`, `company`, `admin`.
- `provider_services.artisan_account_id` links artisan listings to the owning artisan.
- `bookings` create related `jobs`, `job_financials`, `payments`, and `conversations`.
- `hustle_posts` are owned by company accounts; accepted `hustle_applications` create `jobs`.
- `wallets` and `wallet_entries` are artisan-only financial ledgers; `withdrawal_requests` use OTP before approval.
- `notifications` are created by booking, messaging, KYC, hustle, job, and wallet workflows.

## 7. Developer Notes / Current Behavior

- There is no multipart upload endpoint. File/image inputs are URL strings; controllers create `media_assets` records from those URLs.
- Some controllers rely on database constraints more than request validation. In Postman, send all fields marked with `*` to avoid SQL errors.
- `POST /auth/register` only allows `client`, `artisan`, and `company`; admin users must be seeded/managed separately.
- Auth middleware allows accounts with status `active` or `pending_verification`; suspended/disabled accounts are rejected.
- `X-Idempotency-Key` is supported only on selected POST routes registered with the idempotency middleware.
- Rate limits are file-based per IP per minute: public/auth/private buckets from `config/security.php`.
- Use `POST /conversations/initiate` before `POST /conversations/{id}/messages` when the frontend does not already have a `conversation_id`. The initiate route creates the `conversations` row and the required `conversation_participants` rows.
