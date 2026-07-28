# HustleApp Sign in with Apple
## API Integration and Team Handoff Documentation

**Prepared:** 25 July 2026  
**API base URL:** `https://api-v2.hustleapp.info/api/v1`  
**Audience:** Mobile App Team, Web Frontend Team, QA Team  
**Scope:** Sign in with Apple only. Existing Google SSO and password authentication remain unchanged.

---

## 1. Current implementation status

| Component | Status | Team action |
|---|---|---|
| Native iOS API: `POST /auth/apple` | Active and reachable | Mobile team should integrate and test with a fresh Apple credential on a real iPhone. |
| Apple routes and controller | Installed | No client action required. |
| Database alignment | Complete | No new migration is required; Apple identities use the existing OAuth identity table. |
| Web endpoint: `GET /auth/apple/url` | Route exists but web login is not enabled | Web team must keep the Apple button hidden or disabled until Services ID and browser callback/session handoff are enabled. |
| Google SSO | Unchanged | Do not modify the Google flow. |

Live checks already confirmed:

- `POST /auth/apple` returns `422 APPLE_AUTHORIZATION_CODE_REQUIRED` for an empty request. This confirms the native route is active.
- `GET /auth/apple/url` currently returns `503 APPLE_WEB_SIGNIN_NOT_CONFIGURED`. This confirms the web route exists but browser login is not yet enabled.

> **Important:** “Backend code installed” and “web Apple login enabled” are different states. Native iOS integration can proceed. Browser/frontend Apple login must remain behind a feature flag until the backend team confirms it is enabled.

---

## 2. Shared API conventions

### Base URL

```text
https://api-v2.hustleapp.info/api/v1
```

### Headers

```http
Accept: application/json
Content-Type: application/json
```

After authentication, send the HustleApp token—not the Apple token:

```http
Authorization: Bearer HUSTLEAPP_ACCESS_TOKEN
```

### Standard success envelope

```json
{
  "success": true,
  "message": "Apple sign-in successful.",
  "data": {},
  "meta": {}
}
```

### Standard error envelope

```json
{
  "success": false,
  "message": "Apple authorization_code is required.",
  "data": {
    "errors": {
      "code": "APPLE_AUTHORIZATION_CODE_REQUIRED"
    }
  },
  "meta": []
}
```

Client applications must branch primarily on `data.errors.code`, not only the human-readable `message`.

---

# Part A — Mobile App Team

## 3. Supported platform

The current native implementation is for **iOS/iPadOS**. The Apple button should be rendered only when Apple authentication is available. Do not show the native Expo Apple button on Android or web.

### Expo packages

```bash
npx expo install expo-apple-authentication expo-crypto expo-secure-store
```

### Expo app configuration

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "YOUR.EXACT.IOS.BUNDLE.ID",
      "usesAppleSignIn": true
    },
    "plugins": [
      "expo-apple-authentication"
    ]
  }
}
```

The Bundle ID in the mobile project must exactly match the App ID configured in Apple Developer and the backend `APPLE_BUNDLE_ID`. A new signed iOS build is required after adding the native capability.

## 4. Required user flow

The recommended sequence is:

1. User chooses **Login** or **Sign up**.
2. User chooses the HustleApp role before Apple authorization: `client`, `artisan`, or `company`.
3. For signup, collect or resolve the user’s country before Apple authorization.
4. Generate a fresh nonce.
5. Start native Apple authorization and request `FULL_NAME` and `EMAIL`.
6. Immediately send Apple’s fresh `authorizationCode`, `identityToken`, the same nonce, intent, role, and first-time profile data to HustleApp.
7. Store only the returned HustleApp `access_token` in secure storage.
8. Use that token for normal authenticated API calls.

Apple authorization codes are single-use. When the backend asks the user to choose a role or restart signup, begin a completely new Apple authorization attempt and obtain a new code.

## 5. Native endpoint

### `POST /auth/apple`

**Full URL**

```text
https://api-v2.hustleapp.info/api/v1/auth/apple
```

### Request body

```json
{
  "authorization_code": "APPLE_SINGLE_USE_CODE",
  "identity_token": "APPLE_IDENTITY_JWT",
  "nonce": "THE_NONCE_SENT_TO_APPLE",
  "platform": "ios",
  "intent": "login",
  "account_type": "client",
  "country_id": 1,
  "country_iso2": "GH",
  "timezone_name": "Africa/Accra",
  "first_name": "Ama",
  "last_name": "Mensah",
  "company_name": null
}
```

### Request fields

| Field | Type | Required | Rules |
|---|---|---:|---|
| `authorization_code` | string | Yes | Apple’s fresh `authorizationCode`. Never reuse it. Alias `code` is accepted, but use the documented name. |
| `identity_token` | string/null | Recommended | Apple’s `identityToken`. The backend cross-checks it against the token obtained during server-side code exchange. Alias `id_token` is accepted. |
| `nonce` | string | Recommended | Send the same raw nonce supplied to Apple. The backend accepts the matching nonce claim or its SHA-256 form. Generate a new value for every attempt. |
| `platform` | string | Yes | Send `ios`. Do not send `web` from the native app. |
| `intent` | string | Yes | `login`, `signup`, or `auto`. The UI should send explicit `login` or `signup`. |
| `account_type` | string | Contextual | `client`, `artisan`, or `company`. Required for signup and strongly recommended for every request. |
| `country_id` | integer | First signup | Preferred when the app already has the numeric country ID. |
| `country_iso2` | string | First signup | Alternative country resolver such as `GH`. The backend uses the same country registration logic as Google SSO. |
| `timezone_name` | string | Recommended | IANA timezone, for example `Africa/Accra`. |
| `first_name` | string/null | First authorization | Send immediately when Apple provides `fullName.givenName`. Apple may return it only on the first authorization. |
| `last_name` | string/null | First authorization | Send immediately when Apple provides `fullName.familyName`. |
| `company_name` | string/null | Company signup | Recommended for a `company` account. If omitted, the backend falls back to the supplied name or `New Company`. |
| `client_id` | string | No | Do not send unless the backend team explicitly instructs you to select another configured Apple client. |

Do not send the Apple Team ID, Key ID, `.p8` key, or client secret from the mobile app.

## 6. Success response

### Existing account login

```json
{
  "success": true,
  "message": "Apple sign-in successful.",
  "data": {
    "access_token": "HUSTLEAPP_JWT",
    "token_type": "Bearer",
    "expires_in": 604800,
    "account": {
      "id": 101,
      "account_type": "client",
      "admin_role": null,
      "is_primary_admin": 0,
      "email": "user@example.com",
      "status": "active",
      "email_verified_at": "2026-07-25 10:00:00",
      "first_name": "Ama",
      "last_name": "Mensah",
      "phone_number": null,
      "default_city_id": null,
      "default_city_name": null,
      "company_name": null
    },
    "is_new_account": false,
    "intent": "login",
    "apple_private_email": false
  },
  "meta": {}
}
```

### New account signup

The same structure is returned with:

```json
{
  "message": "Apple signup successful.",
  "data": {
    "is_new_account": true,
    "intent": "signup"
  }
}
```

`expires_in` is supplied by the server. Do not hard-code a fixed token lifetime.

`apple_private_email: true` means the user selected Apple’s Hide My Email option. Treat the relay address as the user’s valid account email.

## 7. Session handling

Store only:

```text
data.access_token
```

Recommended Expo storage:

```ts
await SecureStore.setItemAsync('hustle_access_token', payload.data.access_token);
```

Use it on subsequent API calls:

```ts
headers: {
  Accept: 'application/json',
  Authorization: `Bearer ${accessToken}`,
}
```

Do not use or persist the Apple `authorization_code` as a session. Do not use the Apple `identity_token` as the HustleApp bearer token.

## 8. Expo/React Native implementation

A complete implementation file is included separately as `AppleSignInButton.tsx`. The core call is:

```ts
const nonce = Crypto.randomUUID();

const credential = await AppleAuthentication.signInAsync({
  requestedScopes: [
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
  ],
  nonce,
});

const response = await fetch(
  'https://api-v2.hustleapp.info/api/v1/auth/apple',
  {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      authorization_code: credential.authorizationCode,
      identity_token: credential.identityToken,
      nonce,
      platform: 'ios',
      intent,
      account_type: accountType,
      country_id: countryId,
      country_iso2: countryIso2,
      timezone_name: timezoneName,
      first_name: credential.fullName?.givenName ?? undefined,
      last_name: credential.fullName?.familyName ?? undefined,
      company_name: companyName ?? undefined,
    }),
  }
);
```

Before calling the API, verify that `credential.authorizationCode` is not null.

For the official button:

- Use `AppleAuthentication.AppleAuthenticationButton`.
- Give the button an explicit width and height.
- Use an Apple-provided button style and type.
- Render it only when `AppleAuthentication.isAvailableAsync()` returns `true`.
- Treat `ERR_REQUEST_CANCELED` as user cancellation, not as a backend failure.

## 9. Client decision and error handling

| HTTP | Error code | Meaning | Required client action |
|---:|---|---|---|
| 422 | `APPLE_AUTHORIZATION_CODE_REQUIRED` | No Apple code was sent. | Stop and obtain a fresh Apple credential. |
| 503 | `APPLE_SIGNIN_NOT_CONFIGURED` | Native Apple credentials or Bundle ID are unavailable/mismatched on the backend. | Show temporary-unavailable message and report to backend team. |
| 401 | `APPLE_CODE_VALIDATION_FAILED` | Apple rejected the code, or the code was expired/reused. | Start a fresh Apple authorization. Never retry the same code. |
| 401 | `APPLE_IDENTITY_TOKEN_INVALID` | Apple JWT signature/claims/nonce could not be verified. | Start a fresh authorization and report repeated failures. |
| 401 | `APPLE_IDENTITY_MISMATCH` | The client identity token does not match the server-exchanged code. | Reject the attempt and start again. |
| 401 | `APPLE_VERIFIED_EMAIL_REQUIRED` | A first-time link did not provide a verified Apple email. | Restart Apple authorization and request email scope. |
| 422 | `INVALID_APPLE_AUTH_INTENT` | `intent` was invalid. | Send `login`, `signup`, or `auto`. |
| 422 | `INVALID_ACCOUNT_TYPE` | Unsupported HustleApp role. | Send `client`, `artisan`, or `company`. |
| 409 | `APPLE_ACCOUNT_TYPE_REQUIRED` | The Apple identity/email maps to multiple HustleApp roles. | Show role selection, then restart Apple authorization with a fresh code. |
| 422 | `ACCOUNT_TYPE_REQUIRED` | Signup started without selecting a role. | Select role, then restart Apple authorization. |
| 404 | `APPLE_ACCOUNT_NOT_REGISTERED` | Login was requested but no account exists for that email/role. | Offer signup; begin a fresh Apple authorization with `intent: signup`. |
| 409 | `APPLE_ACCOUNT_ALREADY_EXISTS` | Signup was requested for an existing email/role. | Offer login; begin a fresh Apple authorization with `intent: login`. |
| 422 | `COUNTRY_REQUIRED` | First-time signup did not include a valid country. | Collect country and restart Apple signup with a fresh code. |
| 403 | `ACCOUNT_SIGNIN_BLOCKED` | Account is suspended or disabled. | Do not authenticate; show support/contact guidance. |
| 500 | `APPLE_AUTH_COMPLETION_FAILED` | Unexpected account completion failure. | Show a generic error and report the request ID to backend support. |

### Recommended error dispatcher

```ts
const errorCode =
  payload?.data?.errors?.code ?? payload?.errors?.code ?? null;

switch (errorCode) {
  case 'APPLE_ACCOUNT_NOT_REGISTERED':
    // Route to signup choice. Start Apple again; do not reuse the code.
    break;
  case 'APPLE_ACCOUNT_ALREADY_EXISTS':
    // Route to login choice. Start Apple again.
    break;
  case 'APPLE_ACCOUNT_TYPE_REQUIRED':
  case 'ACCOUNT_TYPE_REQUIRED':
    // Ask for role and restart Apple authorization.
    break;
  case 'COUNTRY_REQUIRED':
    // Ask for country and restart signup.
    break;
  case 'ACCOUNT_SIGNIN_BLOCKED':
    // Show blocked-account guidance.
    break;
  default:
    // Show payload.message or a safe generic message.
}
```

## 10. Mobile UI requirements

Place the Apple button anywhere Google SSO is shown on iOS login/signup screens.

Recommended behavior:

- Login screen: choose role first, then send `intent: login`.
- Signup screen: choose role and country first, then send `intent: signup`.
- Hide the Apple button on unsupported platforms.
- Disable the button while an Apple request is in progress.
- Never silently change a login request into signup or vice versa.
- Preserve Apple private relay email exactly as returned.

---

# Part B — Web Frontend Team

## 11. Current web status

The web route exists, but the latest live response is:

```http
HTTP/1.1 503 Service Unavailable
```

```json
{
  "success": false,
  "message": "Sign in with Apple for web is not configured.",
  "data": {
    "errors": {
      "code": "APPLE_WEB_SIGNIN_NOT_CONFIGURED"
    }
  }
}
```

Therefore:

- Do not display an active “Sign in with Apple” button on the production web frontend yet.
- Keep the feature behind a disabled feature flag.
- Do not call the native `POST /auth/apple` endpoint directly from browser JavaScript as a replacement for the Apple web flow.
- The backend team must first configure a Services ID, registered web domain, return URL, and a safe browser session/token handoff.

## 12. Web authorization URL endpoint

### `GET /auth/apple/url`

Planned request:

```text
GET /auth/apple/url?intent=login&account_type=client&return_to=https%3A%2F%2Fv2.hustleapp.info%2Fauth%2Fcallback
```

Supported query parameters:

| Parameter | Required | Rules |
|---|---:|---|
| `intent` | Recommended | `login`, `signup`, or `auto`. |
| `account_type` | Contextual | `client`, `artisan`, or `company`. |
| `country_id` | Signup | Numeric HustleApp country ID. |
| `country_iso2` | Signup | ISO-2 country such as `GH`. |
| `timezone_name` | Recommended | IANA timezone. |
| `return_to` | Recommended | Must be an approved HustleApp frontend URL. Invalid values return 422. |

When web Apple login is enabled, success will return:

```json
{
  "success": true,
  "message": "Apple authorization URL generated.",
  "data": {
    "auth_url": "https://appleid.apple.com/auth/authorize?...",
    "state": "SIGNED_STATE",
    "redirect_uri": "https://api-v2.hustleapp.info/api/v1/auth/apple/callback",
    "platform": "web",
    "return_to": "https://v2.hustleapp.info/auth/callback",
    "intent": "login"
  },
  "meta": {}
}
```

The frontend would navigate to `data.auth_url` only after the backend team confirms the web flow is production-ready.

## 13. Web callback

### `GET|POST /auth/apple/callback`

Apple normally posts:

- `code`
- `id_token`
- `state`
- `user` on the first authorization only
- `error` when authorization fails

Current backend callback processing validates the signed state, exchanges the code, verifies the Apple token, and runs the same HustleApp account logic.

**Production limitation:** the current browser flow has not yet been enabled or accepted for final frontend token delivery. The web team must not design around tokens in query parameters or local storage until the backend team publishes the final callback/session contract.

## 14. Web-specific errors

| HTTP | Error code | Meaning |
|---:|---|---|
| 503 | `APPLE_WEB_SIGNIN_NOT_CONFIGURED` | Services ID/web configuration is not active. |
| 422 | `INVALID_APPLE_AUTH_INTENT` | Invalid intent query. |
| 422 | `INVALID_ACCOUNT_TYPE` | Invalid role query. |
| 422 | — | Invalid `return_to` URL. |
| 401 | `APPLE_AUTHORIZATION_ERROR` | Apple returned an authorization error. |
| 422 | `INVALID_APPLE_CALLBACK_STATE` | State was missing, modified, expired, or not an Apple state. |
| 401 | `APPLE_CODE_VALIDATION_FAILED` | Apple rejected the callback code. |
| 401 | `APPLE_IDENTITY_TOKEN_INVALID` | Callback identity token failed verification. |
| 401 | `APPLE_IDENTITY_MISMATCH` | Callback token and exchanged code represent different identities. |

---

# Part C — QA and Release

## 15. Required test matrix

### Mobile functional tests

1. Existing Apple-linked client logs in.
2. Existing Apple-linked artisan logs in.
3. Existing Apple-linked company logs in.
4. Existing password/Google account with the same verified email is linked to Apple for the selected role.
5. New client signs up with country and first-time name.
6. New artisan signs up with country.
7. New company signs up with `company_name`.
8. User selects Hide My Email and receives a valid `apple_private_email: true` response.
9. User cancels the Apple sheet; no API request is sent and no error alert is shown as a failure.
10. Reusing the same authorization code fails and the app starts a fresh Apple flow.
11. Login for an unregistered account returns `APPLE_ACCOUNT_NOT_REGISTERED` and routes to signup.
12. Signup for an existing account returns `APPLE_ACCOUNT_ALREADY_EXISTS` and routes to login.
13. Missing role is handled before authorization or through the documented restart flow.
14. Missing country during first signup returns `COUNTRY_REQUIRED`.
15. Suspended/disabled account returns `ACCOUNT_SIGNIN_BLOCKED`.
16. Returned HustleApp JWT successfully authorizes a normal protected endpoint.
17. Google SSO still works after the iOS build update.

### Device/build tests

- Test on a physical iPhone.
- Test first authorization using an Apple ID that has never authorized the app.
- Test repeat authorization where Apple returns null name/email fields.
- Test an App Store/TestFlight-signed build whose Bundle ID matches the backend.
- Confirm the Sign in with Apple entitlement is present in the signed build.

### Web test status

Web QA is deferred until the backend team confirms `GET /auth/apple/url` no longer returns `APPLE_WEB_SIGNIN_NOT_CONFIGURED` and publishes the final frontend session handoff.

## 16. Logging and security rules

Never log or expose:

- Apple `.p8` private key
- Apple client secret
- Apple authorization code
- Apple identity token
- HustleApp access token
- Full callback query/body in production logs

Safe items to log:

- HTTP status
- Backend error code
- Request ID
- Platform
- Intent
- Account type
- Whether the account is new

Never place Apple server credentials in Expo config, React environment variables shipped to browsers, Git, or frontend source code.

## 17. Definition of done

### Mobile team

The mobile integration is complete when:

- A new signed iOS build includes the Apple entitlement.
- The Apple button appears only on supported iOS devices.
- Existing login, new signup, multiple roles, country requirement, private email, cancellation, and blocked-account flows pass.
- Only the HustleApp JWT is stored and used for API access.
- Google SSO remains unaffected.

### Web frontend team

The web task is complete for the current phase when:

- Apple web UI remains feature-flagged off.
- No native Apple endpoint is misused from the browser.
- The team is ready to integrate `GET /auth/apple/url` after Services ID and final callback/session delivery are confirmed.

---

## 18. Files included in this handoff

- `HustleApp_Apple_SignIn_API_Handoff.docx` — formatted team document.
- `HUSTLEAPP_APPLE_SIGNIN_API_HANDOFF.md` — plain-text/Markdown version.
- `HustleApp_Apple_SignIn.openapi.yaml` — OpenAPI definition.
- `HustleApp_Apple_SignIn.postman_collection.json` — Postman requests.
- `AppleSignInButton.tsx` — Expo/iOS implementation example.

## 19. Final implementation note

The mobile team may proceed with native iOS integration. The web frontend team should not activate Apple login until the backend team completes and confirms the Services ID and secure browser callback/session handoff.
