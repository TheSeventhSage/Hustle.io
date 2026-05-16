# Optimization Refactor Phases

Date: 2026-05-14

Goal:
- Optimize the codebase without changing product design or core user flow
- Improve performance, scalability, and DRY structure in controlled batches

## Strategy

The refactor should be implemented in batches, not all priorities at once.

Reason:
- lower regression risk
- easier verification after each batch
- clearer rollback boundaries
- safer behavior preservation in a codebase with limited automated tests

## Phase 1: Foundation

Objective:
- Standardize the lowest-level API and query primitives without changing the UI

Scope:
- introduce shared HTTP helpers
- introduce shared response normalization helpers
- standardize marketplace query keys
- migrate a safe first slice of services and queries to the new foundation

Expected user-facing impact:
- none

Phase 1 implementation target:
- shared API URL/query builder
- shared JSON fetch helper
- shared endpoint normalizer for linked endpoints
- shared payload unwrappers for `data`, `item`, `items`, `docs`, `profile`, `service`
- standardized query keys for marketplace categories and public services
- migrate:
  - `src/shared/api/publicProfile.service.js`
  - `src/features/hustles/hustles.service.js` public/foundation methods
  - `src/features/hustles/pages/FeedPage.jsx` marketplace queries
  - `src/pages/public/home/api/services.hooks.js`

Success criteria:
- no visible UI regression
- build passes
- existing marketplace/profile flows still work
- future service migrations have a reusable base

## Phase 2: Shared Utilities and Query Consistency

Objective:
- reduce duplicated formatting and normalization logic

Scope:
- shared money/date/date-time/status formatters
- shared list/item/profile/service normalizers
- standardize `select` usage in React Query hooks
- remove more raw query keys and replace with `queryKeys`

Expected impact:
- no UI redesign
- cleaner hook outputs
- less repeated parsing inside components

## Phase 3: Payment Flow Consolidation

Objective:
- remove duplicated payment initialization, redirect, popup, verification, and cleanup logic

Scope:
- shared payment orchestration helper or hook
- unified local storage wrapper usage for pending payment sessions
- migrate:
  - hustle payment
  - booking payment
  - city access payment
  - applicant acceptance payment path

Expected impact:
- no workflow redesign
- more consistent behavior and error handling

Phase 3 implementation update:
- added shared payment orchestration in `src/shared/utils/paymentFlow.js`
- added centralized pending payment session storage in `src/services/storage.js`
- standardized:
  - payment initialization response handling
  - Paystack popup flow
  - hosted redirect fallback with callback URL
  - payment callback verification
  - pending payment session persistence and cleanup
  - payment reference query param cleanup
- migrated active flows:
  - `src/features/hustles/pages/MyHustlesPage.jsx`
  - `src/features/hustles/components/hustle-detail-panel/ApplicantDetailView.jsx`
  - `src/features/booking/components/ClientBookingDetailModal.jsx`
  - `src/features/booking/components/BookingDetailPanel.jsx`
  - `src/features/settings/components/settings/SubscriptionSettings.jsx`
- removed obsolete standalone Paystack helper:
  - `src/shared/utils/paystack.js`

## Phase 4: Component Decomposition

Objective:
- split oversized page and panel files into maintainable units

Primary targets:
- `src/features/settings/components/settings/BusinessDetails.jsx`
- `src/features/hustles/components/HustlerProfilePanel.jsx`
- `src/features/hustler/pages/HustlerMyHustlesPage.jsx`
- `src/pages/public/SearchPage.jsx`
- `src/shared/components/SearchResultsPage.jsx`
- `src/features/hustler/components/HustleDetailPanel.jsx`

Scope:
- move data fetching into dedicated hooks
- move normalization into view-model helpers
- move large sections into presentational subcomponents

Expected impact:
- same UI and behavior
- easier performance tuning and safer future work

## Phase 5: Bundle and Asset Optimization

Objective:
- reduce runtime cost and improve load performance

Scope:
- lazy-load more public routes
- add chunking strategy in Vite
- audit heavy panels for chunk isolation
- clean up font strategy and remove dead font assets
- remove stale duplicate files such as `src/pages/public/New folder/SearchPage.jsx`

Expected impact:
- lower initial load cost
- smaller main bundle

## Phase 6: Safety Net

Objective:
- add targeted regression protection for the shared logic introduced earlier

Scope:
- tests for:
  - response normalization
  - formatters
  - payment orchestration
  - status mapping
  - profile fallback behavior

Expected impact:
- safer future optimization work

## Recommended Execution Order

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5
6. Phase 6

## Current Status

Completed:
- Phase 1: Foundation
- Phase 2: Shared Utilities and Query Consistency
- Phase 3: Payment Flow Consolidation

Current focus:
- Phase 4: Component Decomposition

## Completion Log

Phase 1 completed changes:
- introduced shared API response unwrappers
- introduced shared normalization helpers for linked endpoints and collections
- standardized base marketplace query keys
- migrated first API/query slice to the shared foundation

Phase 2 completed changes:
- consolidated repeated formatting and normalization logic into shared helpers
- replaced repeated inline query parsing with shared `select`/unwrap patterns
- reduced raw query key duplication

Phase 3 completed changes:
- consolidated payment init, popup, hosted redirect fallback, verification, and callback cleanup
- moved shared payment flow into `src/shared/utils/paymentFlow.js`
- centralized pending payment session storage in `src/services/storage.js`
- migrated hustle, booking, city-access, and applicant acceptance payment flows to the shared path
- removed the obsolete standalone Paystack utility file
