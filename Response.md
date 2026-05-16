# Response

Date: 2026-05-14

## What I changed

I removed the temporary shared transport helper approach and collapsed the migrated Phase 1 paths back onto `apiClient` directly.

### Transport cleanup

- Removed:
  - `src/shared/lib/api/http.js`

- Rewired these files to use `apiClient` directly:
  - `src/features/hustles/hustles.service.js`
  - `src/shared/api/publicProfile.service.js`

### What I kept

- I kept the shared response-shaping utilities in:
  - `src/shared/lib/api/response.js`

That file still has value because it removes repeated payload parsing without becoming a second transport system.

## Why this is the cleaner direction

This keeps the architecture simpler:

- `apiClient` is the only request transport
- service files define endpoints and request options
- shared response helpers only shape returned payloads

That is a better separation than:

- `apiClient`
- plus `fetchJson`
- plus feature-level raw `fetch`

The mixed state would have recreated the same fragmentation we are trying to remove.

## Current Phase 1 state

Phase 1 now uses:

- direct `apiClient` transport
- shared query keys where migrated
- shared response unwrapping helpers

That means the foundation is still in place, but with less abstraction overhead than before.

## Validation target

The expectation after this cleanup is:

- no UI redesign
- no feature-flow change
- simpler internal transport structure

## Next recommended move

The next clean batch would be:

1. continue replacing raw `fetch` service implementations with direct `apiClient`
2. keep only shared response normalization helpers
3. avoid introducing new transport wrappers unless a real capability gap appears

## Phase 1 hotfix

The created-hustle detail panel was still reading the old response shape after the transport cleanup.

### Root cause

- `hustlesService.getById()` now returns the `apiClient` response shape
- `HustleDetailPanel.jsx` was still resolving:
  - `hustleData?.data?.item`
  - `hustleData?.data?.skills`
- for the current API payload, that caused the panel to map the wrong object and fall back to `-` for most fields

### Fix applied

- updated `src/features/hustles/components/HustleDetailPanel.jsx`
- the panel now uses `unwrapData(...)`
- it resolves:
  - `payload.item`
  - `payload.skills`

That keeps the panel aligned with the shared Phase 1 response utilities.

## Phase 1 major features affected

These are the main areas to test after the transport and response-shape cleanup:

1. Client feed marketplace listing
   - `src/features/hustles/pages/FeedPage.jsx`
   - categories
   - service cards
   - filters
   - public services loading

2. Public home marketplace hooks
   - `src/pages/public/home/api/services.hooks.js`
   - public service list queries
   - public service detail queries

3. Created hustle detail panel
   - `src/features/hustles/components/HustleDetailPanel.jsx`
   - title
   - description
   - location
   - date/time
   - budget
   - applicants tab still opening correctly

4. Shared hustle service transport
   - `src/features/hustles/hustles.service.js`
   - categories
   - cities
   - insurance rates
   - hustle detail
   - my hustles
   - applied hustles
   - reviews

5. Public profile linked data
   - `src/shared/api/publicProfile.service.js`
   - public profile
   - certifications linked endpoint
   - services linked endpoint

## Phase 1 affected items to look through

Use this as the review list for this finished phase:

- client feed page
- public service list loading
- public service detail loading
- created hustle detail drawer
- applicant drawer opening from hustle details
- public profile drawer from applicant flow
- certifications rendering in profile drawer
- services rendering in profile drawer
- my hustles page loading
- applied hustles tab loading
- insurance rate retrieval where used

## Public profile drawer service-source update

The `View full profile` flow from the application panel now uses the public services list endpoint as its service source.

### What changed

- updated `src/features/hustles/components/hustle-detail-panel/PublicProfileDrawer.jsx`
- the `Services` tab now calls:
  - `publicProfileService.listServices({ artisan_account_id: accountId })`
- the returned list is filtered again in the UI by hustler account id to protect against broad endpoint responses
- the previous mixed approach of:
  - linked services endpoint
  - single service detail endpoint
  was removed from this drawer flow

### Affected items to test

- client hustle detail panel
- applicant detail view
- `View full profile` button
- public profile drawer opening
- services tab count
- services tab content for the correct hustler only
- certifications tab still loading
- profile tab still loading

## Phase 1 confirmation

Phase 1 is now a successful completed optimization batch.

### Why it is complete

- transport is standardized on `apiClient` for the migrated slice
- shared response unwrapping is in place
- the created-hustle detail regression introduced during the transport cleanup was fixed
- the public profile drawer service-source update was completed on top of the same foundation
- production build passes after the fixes

### Phase 1 completed test surface

- client feed marketplace loading
- public service list/detail loading
- created hustle detail drawer
- hustle applications loading in detail panel
- public profile drawer from applicant flow
- certifications rendering
- services rendering filtered to the correct hustler

## Phase 2 implementation

Phase 2 was implemented as a DRY and query-consistency batch without redesigning the UI.

### Shared utilities added

- `src/shared/lib/format.js`
  - currency code display formatting
  - currency display formatting
  - service rate formatting
  - shared date formatting
  - shared date-time formatting
  - shared duration formatting
  - shared relative-time formatting
  - shared status label formatting
  - shared experience-level formatting

- `src/shared/lib/normalize.js`
  - shared collection normalization
  - shared fallback-value resolution
  - linked-endpoint resolution
  - service ownership filtering by account id
  - profile display-name fallback
  - profile location fallback

### Query consistency changes

- updated `src/features/hustles/hustles.hooks.js`
  - `useHustle` now normalizes through shared response unwrapping
  - `useMyHustles` now normalizes through shared response unwrapping
  - `useMyApplications` now normalizes through shared response unwrapping
  - `useHustleReviews` now normalizes through shared response unwrapping

- updated `src/services/query-keys.js`
  - added `queryKeys.hustles.detailApplications(id)`
  - added `queryKeys.profiles.reviews(id)`

- updated `src/features/hustles/hustles.service.js`
  - added `getApplicationsByHustle(id)` so the detail panel no longer has to fetch applications manually

- updated `src/features/hustles/components/HustleDetailPanel.jsx`
  - applications query now uses:
    - shared service method
    - centralized query key
    - shared item-list unwrapping

- updated `src/features/hustles/components/HustlerProfilePanel.jsx`
  - reviews now use `hustlesService.getPublicReviews(...)` instead of local raw `fetch`
  - review query uses centralized query key
  - certifications query uses `select`
  - public services query now requests `artisan_account_id`
  - public services query uses `select` to filter to the correct hustler
  - duplicated local helper logic now routes through the shared format/normalize utilities where patched

- updated `src/features/hustles/components/hustle-detail-panel/PublicProfileDrawer.jsx`
  - certifications query uses `select`
  - public services query uses `select`
  - shared formatting and normalization utilities are now used instead of local copies for the patched paths

- updated `src/features/hustles/components/JobDetailPanel.jsx`
  - job detail query now uses `select` with shared item unwrapping
  - participant display now uses shared profile fallback helpers
  - payment/date/duration display now uses shared format helpers

### Validation

- `npm.cmd run build` passed on 2026-05-14

## Phase 2 affected items to test

1. Created hustle detail panel
   - job description data
   - applicants list still loading
   - applicant acceptance invalidation still refreshing applications

2. Hustler profile panel from client feed
   - certifications section
   - other services section
   - reviews section
   - review timestamps
   - service rate formatting

3. Public profile drawer from application flow
   - services tab count
   - hustler-only services filtering
   - certification status/date display
   - profile tab still rendering correctly

4. Job detail panel
   - job title/details
   - participant names and locations
   - payment breakdown formatting
   - duration formatting
   - completion timestamps

5. Hook-driven hustle pages
   - my hustles data loading
   - applied hustles data loading
   - single hustle detail loading
   - hustle reviews loading
