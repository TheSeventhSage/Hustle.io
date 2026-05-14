# Codebase Optimization Audit

Date: 2026-05-14

Scope:
- Entire frontend repository under `src/`
- Focus areas: performance, scalability, and DRY code quality

## Executive Summary

The codebase is functional, but it is carrying four structural problems that will slow delivery and increase regression risk as features grow:

1. The data layer is fragmented.
   - The app mixes `apiClient`, raw `fetch`, hand-built headers, hand-built `URLSearchParams`, and multiple response-unwrapping styles.
   - This increases duplicated code, inconsistent auth/error handling, and weak query cancellation behavior.

2. Core product flows are duplicated.
   - Payment initialization/verification, public-profile fetching, search/discovery rendering, and formatting helpers are implemented multiple times.
   - This is already causing behavioral drift across pages.

3. Several components are too large to scale safely.
   - A number of pages/panels are in the 600 to 900 line range and mix data fetching, normalization, orchestration, and rendering in one file.
   - This raises render complexity and makes optimization work harder than it needs to be.

4. The bundle is heavier than it should be.
   - Current production build still emits an oversized main chunk warning.
   - Large font assets, route loading strategy, and repeated logic are contributing to runtime and maintenance cost.

## Evidence Snapshot

- Current build warning: main bundle still exceeds Vite's chunk warning threshold and produced an `index` chunk around `822 kB` before gzip.
- No test files were found under `src/` using `*.test.*` or `*.spec.*`.
- Oversized source files currently include:
  - `901` lines: `src/features/settings/components/settings/BusinessDetails.jsx`
  - `785` lines: `src/features/hustles/components/HustlerProfilePanel.jsx`
  - `771` lines: `src/features/hustler/pages/HustlerMyHustlesPage.jsx`
  - `697` lines: `src/pages/public/SearchPage.jsx`
  - `685` lines: `src/shared/components/SearchResultsPage.jsx`
  - `587` lines: `src/features/hustler/components/HustleDetailPanel.jsx`
- Large asset footprint includes multiple `.OTF` files under `src/assets/fonts/`, while `src/styles/fonts.css` currently references `/public/fonts` and has the `@font-face` blocks disabled.

## Priority 0: Highest-Value Optimization Tracks

### 1. Unify the HTTP and response-normalization layer

Problem:
- API access is implemented in several incompatible ways.
- Some services use `apiClient`, some use raw `fetch`, some manually inject tokens, and some manually parse nested `data.data.items`.

Impact:
- Inconsistent auth and error behavior
- Repeated request logic
- Harder caching and cancellation
- More brittle response handling

Evidence:
- [`src/services/api.client.js`](./src/services/api.client.js)
- [`src/features/hustles/hustles.service.js`](./src/features/hustles/hustles.service.js)
- [`src/features/auth/auth.service.js`](./src/features/auth/auth.service.js)
- [`src/shared/api/settings.service.js`](./src/shared/api/settings.service.js)
- [`src/features/wallet/wallet.service.js`](./src/features/wallet/wallet.service.js)
- [`src/features/city-access/cityAccess.service.js`](./src/features/city-access/cityAccess.service.js)
- [`src/shared/api/publicProfile.service.js`](./src/shared/api/publicProfile.service.js)
- [`src/features/messages/messages.service.js`](./src/features/messages/messages.service.js)

What should change:
- Standardize all services on one transport abstraction.
- Add one shared response-unwrapper layer for:
  - `item`
  - `items`
  - `docs`
  - nested `data`
- Move query-string creation into shared helpers.
- Support abort signals for `useQuery`-driven requests.
- Stop manually injecting auth headers in feature services when `apiClient` already owns that concern.

Optimization value:
- High performance value
- High scalability value
- Very high DRY value

### 2. Replace duplicated payment workflows with one shared payment state machine

Problem:
- Payment initialization, popup handling, redirect fallback, localStorage persistence, callback verification, stale-session expiry, and cleanup are duplicated across several flows.

Impact:
- High regression risk
- Small fixes must be repeated in multiple places
- Inconsistent failure handling and messaging

Evidence:
- [`src/features/hustles/pages/MyHustlesPage.jsx`](./src/features/hustles/pages/MyHustlesPage.jsx)
- [`src/features/booking/components/ClientBookingDetailModal.jsx`](./src/features/booking/components/ClientBookingDetailModal.jsx)
- [`src/features/settings/components/settings/SubscriptionSettings.jsx`](./src/features/settings/components/settings/SubscriptionSettings.jsx)
- [`src/features/hustles/components/hustle-detail-panel/ApplicantDetailView.jsx`](./src/features/hustles/components/hustle-detail-panel/ApplicantDetailView.jsx)

What should change:
- Create a shared payment orchestration module or hook:
  - `initialize`
  - `resume popup`
  - `redirect fallback`
  - `persist pending session`
  - `verify callback`
  - `cleanup`
- Parameterize the flow by:
  - storage key
  - success redirect/route state
  - verification mutation
  - entity metadata

Optimization value:
- Medium performance value
- Very high scalability value
- Very high DRY value

### 3. Break up oversized “god components”

Problem:
- Several components mix data fetching, transformation, business rules, modal orchestration, and rendering in one file.

Impact:
- Slower future changes
- Harder memoization and profiling
- Increased render complexity
- Higher bug probability during feature work

Largest hotspots:
- [`src/features/settings/components/settings/BusinessDetails.jsx`](./src/features/settings/components/settings/BusinessDetails.jsx)
- [`src/features/hustles/components/HustlerProfilePanel.jsx`](./src/features/hustles/components/HustlerProfilePanel.jsx)
- [`src/features/hustler/pages/HustlerMyHustlesPage.jsx`](./src/features/hustler/pages/HustlerMyHustlesPage.jsx)
- [`src/pages/public/SearchPage.jsx`](./src/pages/public/SearchPage.jsx)
- [`src/shared/components/SearchResultsPage.jsx`](./src/shared/components/SearchResultsPage.jsx)
- [`src/features/hustler/components/HustleDetailPanel.jsx`](./src/features/hustler/components/HustleDetailPanel.jsx)
- [`src/features/hustles/components/JobDetailPanel.jsx`](./src/features/hustles/components/JobDetailPanel.jsx)

What should change:
- Split each large file into:
  - data hook
  - normalization helpers
  - presentational subcomponents
  - action handlers
- Keep page files focused on orchestration only.
- Move panel-specific sections into isolated child components.

Optimization value:
- Medium performance value
- Very high scalability value
- High DRY value

### 4. Eliminate duplicate public-profile and service-drawer logic

Problem:
- The same kinds of profile/service logic are implemented multiple times with local helper copies such as `normalizeList`, `firstDefined`, certification formatting, and service rendering.

Impact:
- Divergent behavior between profile surfaces
- Repeated query logic
- Repeated formatting work

Evidence:
- [`src/features/hustles/components/HustlerProfilePanel.jsx`](./src/features/hustles/components/HustlerProfilePanel.jsx)
- [`src/features/hustles/components/hustle-detail-panel/PublicProfileDrawer.jsx`](./src/features/hustles/components/hustle-detail-panel/PublicProfileDrawer.jsx)
- [`src/features/hustles/components/JobDetailPanel.jsx`](./src/features/hustles/components/JobDetailPanel.jsx)

What should change:
- Extract a shared `profile-view-model` layer for:
  - profile normalization
  - certifications normalization
  - services normalization
  - display-name and fallback resolution
- Reuse one shared set of card components where the UI intent matches.

Optimization value:
- Low to medium performance value
- High scalability value
- Very high DRY value

## Priority 1: Strong Next-Wave Optimizations

### 5. Consolidate search and discovery implementations

Problem:
- Search/discovery behavior exists in multiple parallel implementations.
- There is also an obvious duplicate page copy inside a stray folder.

Evidence:
- [`src/pages/public/SearchPage.jsx`](./src/pages/public/SearchPage.jsx)
- [`src/shared/components/SearchResultsPage.jsx`](./src/shared/components/SearchResultsPage.jsx)
- [`src/pages/public/New folder/SearchPage.jsx`](./src/pages/public/New%20folder/SearchPage.jsx)
- [`src/features/hustles/pages/FeedPage.jsx`](./src/features/hustles/pages/FeedPage.jsx)
- [`src/pages/public/home/api/services.hooks.js`](./src/pages/public/home/api/services.hooks.js)
- [`src/pages/public/home/api/services.service.js`](./src/pages/public/home/api/services.service.js)

Problems inside this area:
- Duplicate normalization logic
- Duplicate query keys
- Duplicate page composition
- Client-side list slicing instead of server-driven result shaping
- Orphaned duplicate source under `New folder`

What should change:
- Merge to one shared discovery/search data model.
- Remove or archive `src/pages/public/New folder/SearchPage.jsx`.
- Standardize query keys through `src/services/query-keys.js`.
- Reuse shared service-fetch hooks instead of re-implementing `fetch` inside pages.

Optimization value:
- Medium performance value
- High scalability value
- High DRY value

### 6. Stop overfetching and filtering large lists on the client

Problem:
- Some views fetch broad collections and then filter or slice client-side.

Evidence:
- [`src/features/hustles/pages/FeedPage.jsx`](./src/features/hustles/pages/FeedPage.jsx)
  - fetches `/services` and slices `mainServices` and `nearbyServices` client-side
- [`src/features/hustles/components/HustlerProfilePanel.jsx`](./src/features/hustles/components/HustlerProfilePanel.jsx)
  - fetches public services list and filters by hustler id client-side
- [`src/pages/public/SearchPage.jsx`](./src/pages/public/SearchPage.jsx)
  - builds large detail views from generic search payloads

Impact:
- More network work than needed
- More client-side parsing and render cost
- Worse scalability when result sets grow

What should change:
- Push filtering and pagination to the server wherever supported.
- Always pass `page`, `per_page`, and specific filters for list endpoints.
- Add endpoint-specific list hooks for “other services by artisan”, “featured services”, and “nearby services”.

Optimization value:
- High performance value
- High scalability value
- Medium DRY value

### 7. Introduce a shared formatting and normalization utility layer

Problem:
- Formatting helpers are copied across the codebase.

Evidence:
- Amount/date helpers are duplicated in:
  - [`src/shared/hustles/JobCard.jsx`](./src/shared/hustles/JobCard.jsx)
  - [`src/features/hustler/pages/HustlerMyHustlesPage.jsx`](./src/features/hustler/pages/HustlerMyHustlesPage.jsx)
  - [`src/features/hustler/components/HustlerHustleDetailPanel.jsx`](./src/features/hustler/components/HustlerHustleDetailPanel.jsx)
  - [`src/features/hustler/components/HustleDetailPanel.jsx`](./src/features/hustler/components/HustleDetailPanel.jsx)
  - [`src/features/booking/components/ClientBookingDetailModal.jsx`](./src/features/booking/components/ClientBookingDetailModal.jsx)
  - [`src/features/booking/components/ClientBookingCard.jsx`](./src/features/booking/components/ClientBookingCard.jsx)
  - [`src/features/booking/components/BookingDetailModal.jsx`](./src/features/booking/components/BookingDetailModal.jsx)
  - [`src/features/hustles/components/JobDetailPanel.jsx`](./src/features/hustles/components/JobDetailPanel.jsx)
  - [`src/features/hustles/components/HustlerProfilePanel.jsx`](./src/features/hustles/components/HustlerProfilePanel.jsx)
  - [`src/features/hustles/components/hustle-detail-panel/PublicProfileDrawer.jsx`](./src/features/hustles/components/hustle-detail-panel/PublicProfileDrawer.jsx)

What should change:
- Create shared utilities for:
  - currency formatting
  - date formatting
  - date-time formatting
  - status label formatting
  - collection normalization
  - entity fallback resolution

Optimization value:
- Low performance value
- Medium scalability value
- Very high DRY value

### 8. Stop bypassing the storage abstraction

Problem:
- The repo already has `src/services/storage.js`, but many flows read or write `localStorage` directly.

Evidence:
- [`src/features/hustles/pages/MyHustlesPage.jsx`](./src/features/hustles/pages/MyHustlesPage.jsx)
- [`src/features/settings/components/settings/SubscriptionSettings.jsx`](./src/features/settings/components/settings/SubscriptionSettings.jsx)
- [`src/features/booking/components/ClientBookingDetailModal.jsx`](./src/features/booking/components/ClientBookingDetailModal.jsx)
- [`src/features/hustles/components/hustle-detail-panel/ApplicantDetailView.jsx`](./src/features/hustles/components/hustle-detail-panel/ApplicantDetailView.jsx)
- [`src/features/hustles/components/CreateHustleForm.jsx`](./src/features/hustles/components/CreateHustleForm.jsx)
- [`src/features/auth/auth.service.js`](./src/features/auth/auth.service.js)

Impact:
- Inconsistent keys and cleanup behavior
- Harder migration to secure storage later
- More brittle persistence logic

What should change:
- Extend `storage.js` to support:
  - pending payment payloads
  - drafts
  - transient callback state
- Replace scattered direct calls with explicit helper methods.

Optimization value:
- Low performance value
- High scalability value
- High DRY value

### 9. Replace hard page reloads and direct `window.location.href` usage with controlled navigation abstractions

Problem:
- Several flows force full page reloads or imperative URL replacement.

Evidence:
- [`src/services/api.client.js`](./src/services/api.client.js)
- [`src/features/settings/components/settings/SubscriptionSettings.jsx`](./src/features/settings/components/settings/SubscriptionSettings.jsx)
- [`src/features/booking/components/ClientBookingDetailModal.jsx`](./src/features/booking/components/ClientBookingDetailModal.jsx)
- [`src/features/hustles/pages/MyHustlesPage.jsx`](./src/features/hustles/pages/MyHustlesPage.jsx)
- [`src/features/hustles/components/hustle-detail-panel/ApplicantDetailView.jsx`](./src/features/hustles/components/hustle-detail-panel/ApplicantDetailView.jsx)

Impact:
- Lost in-memory UI state
- Harder SPA performance tuning
- Harder testability

What should change:
- Wrap navigation and redirect logic in shared helpers.
- Keep the 401 path inside app state where possible instead of hard reloading from the HTTP client.

Optimization value:
- Medium performance value
- Medium scalability value
- Medium DRY value

## Priority 2: Bundle and Runtime Optimization

### 10. Reduce bundle weight and split better

Problem:
- The build still produces an oversized root chunk.

Evidence:
- [`vite.config.js`](./vite.config.js)
- [`src/app/router.jsx`](./src/app/router.jsx)
- Build output warning from the latest production build

Observations:
- Public routes like `About`, `Contact`, `Terms`, `Privacy`, `Services`, and `ServiceDetailsPage` are eagerly imported.
- Large feature panels and public search UIs are still contributing significant code to the app.
- `framer-motion` is imported in some heavy panels and may be pulling more runtime than necessary.

What should change:
- Lazy-load all non-home marketing pages.
- Add `manualChunks` for:
  - profile/detail panels
  - booking/payment flows
  - public search/discovery
  - vendor libraries
- Audit icon imports if whole icon bundles are creeping into shared chunks.

Optimization value:
- High performance value
- Medium scalability value
- Low DRY value

### 11. Clean up font delivery

Problem:
- The repo contains many `.OTF` font files under `src/assets/fonts/`, but `src/styles/fonts.css` currently references `/public/fonts/` and has the relevant `@font-face` blocks commented out.

Evidence:
- [`src/assets/fonts/`](./src/assets/fonts)
- [`src/styles/fonts.css`](./src/styles/fonts.css)

Impact:
- Repository bloat
- Potential confusion about actual runtime font source
- Missed opportunity to ship smaller `woff2` assets

What should change:
- Decide one font strategy:
  - system stack only
  - or real webfonts under `/public/fonts`
- If shipping fonts, convert to `woff2`, subset weights, and remove dead copies from `src/assets/fonts`.

Optimization value:
- Medium performance value
- Low scalability value
- Medium DRY value

### 12. Use React Query more consistently and more efficiently

Problem:
- Query keys, query shaping, and query ownership are inconsistent.
- Some components run raw `fetch` directly inside `useQuery` instead of reusing a service.

Evidence:
- [`src/features/hustles/pages/FeedPage.jsx`](./src/features/hustles/pages/FeedPage.jsx)
- [`src/features/hustler/pages/HustlerHomePage.jsx`](./src/features/hustler/pages/HustlerHomePage.jsx)
- [`src/features/hustles/components/HustlerProfilePanel.jsx`](./src/features/hustles/components/HustlerProfilePanel.jsx)
- [`src/pages/public/home/api/services.hooks.js`](./src/pages/public/home/api/services.hooks.js)
- [`src/services/query-keys.js`](./src/services/query-keys.js)

Specific issues:
- Raw query keys appear beside central query keys.
- Response normalization is often done after the query instead of inside `select`.
- Some query functions manually `fetch` instead of using a shared service.

What should change:
- Standardize every query on:
  - `queryKeys`
  - service method
  - `select` for normalization
  - shared stale-time policy per resource type

Optimization value:
- Medium performance value
- High scalability value
- Medium DRY value

## Lower-Priority but Important Cleanup

### 13. Remove stale or confusing source artifacts

Evidence:
- [`src/pages/public/New folder/SearchPage.jsx`](./src/pages/public/New%20folder/SearchPage.jsx)

Why it matters:
- It creates ambiguity during maintenance.
- It increases review noise.
- It encourages accidental divergence.

### 14. Replace remote avatar URL generation with a local fallback component

Evidence:
- [`src/app/AppShell.jsx`](./src/app/AppShell.jsx)
- [`src/features/hustles/components/HustlerProfilePanel.jsx`](./src/features/hustles/components/HustlerProfilePanel.jsx)
- [`src/features/hustles/components/hustle-detail-panel/PublicProfileDrawer.jsx`](./src/features/hustles/components/hustle-detail-panel/PublicProfileDrawer.jsx)
- [`src/features/hustler/pages/HustlerMyHustlesPage.jsx`](./src/features/hustler/pages/HustlerMyHustlesPage.jsx)

Why it matters:
- Avoids unnecessary external image requests
- Improves deterministic rendering
- Reduces third-party dependency for simple initials avatars

### 15. Add test coverage for optimization-sensitive flows

Current state:
- No test files detected under `src/`

What to cover first:
- shared formatters and normalizers
- payment orchestration
- query data selection
- profile/service rendering fallbacks
- job/hustle status mapping

Why it matters:
- Optimization work without regression coverage is risky
- Shared abstractions only help if they can be locked down safely

## Recommended Rollout Order

### Phase 1: Foundation

1. Unify HTTP client usage.
2. Create shared response-normalization helpers.
3. Move all query keys to `queryKeys`.
4. Add test coverage for those shared primitives.

### Phase 2: DRY Critical Flows

1. Extract shared payment orchestration.
2. Extract shared profile/service normalization.
3. Extract shared formatting utilities.
4. Replace direct storage access with storage helpers.

### Phase 3: Component and Page Decomposition

1. Refactor:
   - `BusinessDetails.jsx`
   - `HustlerProfilePanel.jsx`
   - `HustlerMyHustlesPage.jsx`
   - `SearchPage.jsx`
   - `SearchResultsPage.jsx`
2. Split orchestration from rendering.
3. Introduce view-model hooks per major page/panel.

### Phase 4: Bundle and Asset Work

1. Lazy-load more routes.
2. Add manual chunking.
3. Remove stale font assets and ship `woff2` only if needed.
4. Remove stale duplicate files.

## Suggested Deliverables for the Optimization Pass

1. `src/shared/lib/http/` or equivalent shared data layer helpers
2. `src/shared/lib/format/` for money/date/status helpers
3. `src/shared/lib/normalize/` for payload unwrapping
4. `src/shared/payments/` for payment workflow orchestration
5. `src/shared/profile/` for public-profile shaping
6. Route and chunking updates in [`vite.config.js`](./vite.config.js) and [`src/app/router.jsx`](./src/app/router.jsx)

## Final Assessment

If only one optimization pass is funded, the highest return comes from:

1. Shared HTTP/query normalization
2. Shared payment flow extraction
3. Splitting oversized components
4. Consolidating search/profile duplication

That combination will improve performance and also stop the codebase from becoming more expensive to change with every new feature.
