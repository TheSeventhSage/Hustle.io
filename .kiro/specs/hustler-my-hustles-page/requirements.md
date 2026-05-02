# Requirements Document

## Introduction

The "My Hustles" page is a dedicated dashboard for hustlers (artisans/service providers) in the Hustle.io app. It gives authenticated artisan users a single place to track every hustle they have interacted with — applied to, currently working on, pending client approval, completed, or saved — and to read all reviews they have received. The page lives at the `/bookings` route (the artisan equivalent of the company `/my-hustles` route) and is accessible only to users with the `artisan` role.

The page replaces the current placeholder `BookingPage` for artisans and introduces a richer, tab-driven list view backed by the existing `GET /hustles/applications` API, a right-side detail panel that reuses and extends the existing `HustleDetailPanel` component, and a "My Booking" shortcut button in the page header.

---

## Glossary

- **Hustler**: An authenticated user with the `artisan` role who applies to and completes hustle jobs.
- **Hustle**: A job posting created by a company or client user.
- **Application**: A hustler's submission to a hustle, created via `POST /hustles/{id}/applications`. Contains `offered_amount`, `pricing_model`, `currency_code`, `expected_completion_at`, and `timeline_notes`.
- **My_Hustles_Page**: The page rendered at `/bookings` for artisan users, showing all hustles the Hustler has interacted with.
- **Tab**: One of the six filter categories displayed as a horizontal tab bar on the My_Hustles_Page.
- **Hustle_Card**: A card component displaying a summary of a single hustle, reusing the existing `HustleCard` component.
- **Detail_Panel**: A right-side slide-in panel showing full hustle details and the Hustler's submission, reusing and extending the existing `HustleDetailPanel` component in `src/features/hustler/components/`.
- **Submission_Tab**: The "Your submission" tab inside the Detail_Panel, showing the Hustler's proposal data.
- **Job_Description_Tab**: The "Job description" tab inside the Detail_Panel, showing the full hustle posting details.
- **Status_Badge**: A coloured pill label inside the Detail_Panel header indicating the current application status (e.g. "Applied", "In-progress", "Completed").
- **Saved_Hustle**: A hustle the Hustler has bookmarked via `POST /hustles/{id}/save` without necessarily applying.
- **Review**: A rating and comment submitted by a client for a completed hustle, retrieved via `GET /hustles/{id}/reviews`.
- **My_Booking_Button**: A button in the page header that navigates the Hustler to their active or most recent booking detail.
- **Applications_API**: `GET /hustles/applications` — returns the authenticated artisan's applications, optionally filtered by `status` and `page`.
- **Empty_State**: A visual placeholder shown when a tab has no items to display.

---

## Requirements

### Requirement 1: My Hustles Page Layout and Navigation

**User Story:** As a Hustler, I want a dedicated "My Hustles" page accessible from the sidebar, so that I can see all hustles I have interacted with in one place.

#### Acceptance Criteria

1. THE My_Hustles_Page SHALL render at the `/bookings` route and be accessible only to authenticated users with the `artisan` role.
2. THE My_Hustles_Page SHALL display a page title of "My Hustles" in the page header area.
3. THE My_Hustles_Page SHALL display a "My booking" button in the top-right of the page header.
4. WHEN the Hustler clicks the "My booking" button, THE My_Hustles_Page SHALL navigate to or open the detail view of the Hustler's most recently active application.
5. THE My_Hustles_Page SHALL display a horizontal tab bar containing exactly six tabs in this order: "Applied", "In-progress", "Pending approval", "Completed", "Saved hustles", "All reviews".
6. WHEN the My_Hustles_Page first loads, THE My_Hustles_Page SHALL set the "Applied" tab as the active tab.
7. WHEN the Hustler selects a tab, THE My_Hustles_Page SHALL update the displayed hustle list to show only items matching that tab's filter without a full page reload.
8. THE My_Hustles_Page SHALL be accessible only to users with the `artisan` role; WHEN a non-artisan user navigates to `/bookings`, THE My_Hustles_Page SHALL redirect the user to the `/feed` route.

---

### Requirement 2: Hustle Card Grid

**User Story:** As a Hustler, I want to see my hustles displayed as cards in a responsive grid, so that I can quickly scan and identify the hustles I care about.

#### Acceptance Criteria

1. THE My_Hustles_Page SHALL display hustle items in a responsive grid of 1 column on mobile, 2 columns on tablet, and 3 columns on desktop.
2. EACH Hustle_Card SHALL display: a cover image (or placeholder), share and bookmark icon buttons overlaid on the image, the hustle title, a relative timestamp (e.g. "Posted 5 minutes ago"), a truncated description, and three metadata fields — Experience level, Hustle duration, and Amount.
3. EACH Hustle_Card SHALL display a "View more details" call-to-action button.
4. WHEN the Hustler clicks the "View more details" button on a Hustle_Card, THE My_Hustles_Page SHALL open the Detail_Panel for that hustle.
5. WHEN the Hustler clicks the share icon on a Hustle_Card, THE My_Hustles_Page SHALL copy the hustle's shareable URL to the clipboard.
6. WHEN the Hustler clicks the bookmark icon on a Hustle_Card, THE My_Hustles_Page SHALL toggle the saved state of that hustle by calling the save/unsave API and update the bookmark icon to reflect the new state.
7. IF the Applications_API returns an error, THEN THE My_Hustles_Page SHALL display an error message and a retry action without crashing the page.

---

### Requirement 3: Tab Filtering — Applied

**User Story:** As a Hustler, I want to see all hustles I have applied to under the "Applied" tab, so that I can track my pending applications.

#### Acceptance Criteria

1. WHEN the "Applied" tab is active, THE My_Hustles_Page SHALL fetch and display all applications with a status of `applied` from the Applications_API.
2. WHILE the Applications_API request is in flight, THE My_Hustles_Page SHALL display skeleton loading placeholders in place of Hustle_Cards.
3. IF the "Applied" tab returns zero results, THEN THE My_Hustles_Page SHALL display an Empty_State with a briefcase illustration and the message "No applied hustles" and a description "All hustles you have applied to will appear here".

---

### Requirement 4: Tab Filtering — In-progress

**User Story:** As a Hustler, I want to see all hustles I am currently working on under the "In-progress" tab, so that I can manage my active work.

#### Acceptance Criteria

1. WHEN the "In-progress" tab is active, THE My_Hustles_Page SHALL fetch and display all applications with a status of `in_progress` from the Applications_API.
2. IF the "In-progress" tab returns zero results, THEN THE My_Hustles_Page SHALL display an Empty_State with the message "No in-progress hustles" and a description "Hustles you are currently working on will appear here".

---

### Requirement 5: Tab Filtering — Pending Approval

**User Story:** As a Hustler, I want to see all hustles awaiting client approval under the "Pending approval" tab, so that I know which jobs are under review.

#### Acceptance Criteria

1. WHEN the "Pending approval" tab is active, THE My_Hustles_Page SHALL fetch and display all applications with a status of `pending_approval` from the Applications_API.
2. IF the "Pending approval" tab returns zero results, THEN THE My_Hustles_Page SHALL display an Empty_State with the message "No hustles pending approval" and a description "Hustles awaiting client approval will appear here".

---

### Requirement 6: Tab Filtering — Completed

**User Story:** As a Hustler, I want to see all hustles I have completed under the "Completed" tab, so that I can review my work history.

#### Acceptance Criteria

1. WHEN the "Completed" tab is active, THE My_Hustles_Page SHALL fetch and display all applications with a status of `completed` from the Applications_API.
2. IF the "Completed" tab returns zero results, THEN THE My_Hustles_Page SHALL display an Empty_State with the message "No completed hustles" and a description "Hustles you have completed will appear here".

---

### Requirement 7: Tab Filtering — Saved Hustles

**User Story:** As a Hustler, I want to see all hustles I have bookmarked under the "Saved hustles" tab, so that I can revisit interesting opportunities.

#### Acceptance Criteria

1. WHEN the "Saved hustles" tab is active, THE My_Hustles_Page SHALL fetch and display all hustles the Hustler has saved.
2. EACH Hustle_Card in the "Saved hustles" tab SHALL display the bookmark icon in a filled/active state.
3. WHEN the Hustler clicks the bookmark icon on a saved Hustle_Card, THE My_Hustles_Page SHALL remove that hustle from the saved list and update the display without a full page reload.
4. IF the "Saved hustles" tab returns zero results, THEN THE My_Hustles_Page SHALL display an Empty_State with the message "No saved hustles" and a description "Hustles you have bookmarked will appear here".

---

### Requirement 8: Tab Filtering — All Reviews

**User Story:** As a Hustler, I want to see all reviews I have received under the "All reviews" tab, so that I can monitor my reputation.

#### Acceptance Criteria

1. WHEN the "All reviews" tab is active, THE My_Hustles_Page SHALL fetch and display all reviews the Hustler has received across completed hustles.
2. EACH review item SHALL display: the client's name and avatar, the star rating (numeric and visual), the review comment text, and the hustle title the review relates to.
3. IF the "All reviews" tab returns zero results, THEN THE My_Hustles_Page SHALL display an Empty_State with the message "No reviews yet" and a description "Reviews from clients will appear here after you complete hustles".

---

### Requirement 9: Hustle Detail Panel — Structure

**User Story:** As a Hustler, I want a detail panel to slide in from the right when I click a hustle card, so that I can view full details without leaving the page.

#### Acceptance Criteria

1. WHEN the Hustler clicks "View more details" on a Hustle_Card, THE Detail_Panel SHALL animate in from the right side of the screen over the list.
2. THE Detail_Panel SHALL display a header containing: the label "Hustle details", a bookmark icon button, a share icon button, and a close (X) icon button.
3. THE Detail_Panel SHALL display a Status_Badge below the header showing the current application status (e.g. "Applied", "In-progress", "Completed", "Pending approval") as a coloured pill.
4. THE Detail_Panel SHALL display the full hustle title below the Status_Badge.
5. THE Detail_Panel SHALL display two tabs: "Job description" and "Your submission".
6. WHEN the Detail_Panel opens, THE Detail_Panel SHALL default to the "Job description" tab as the active tab.
7. WHEN the Hustler clicks the close button or presses the Escape key, THE Detail_Panel SHALL animate out and the list SHALL remain in its current state.
8. WHEN the Hustler clicks the backdrop behind the Detail_Panel, THE Detail_Panel SHALL close.
9. WHILE the Detail_Panel is open, THE My_Hustles_Page SHALL prevent the background page from scrolling.

---

### Requirement 10: Hustle Detail Panel — Job Description Tab

**User Story:** As a Hustler, I want to read the full job description inside the detail panel, so that I can review what was required for the hustle.

#### Acceptance Criteria

1. WHEN the "Job description" tab is active in the Detail_Panel, THE Detail_Panel SHALL display the full description text of the hustle.
2. THE Detail_Panel SHALL display the hustle location as a teal/green styled link (e.g. "Accra, Dansoman").
3. THE Detail_Panel SHALL display a metadata row containing: Experience level, Hustle Duration, Amount, Preferred time, and Preferred date.
4. WHERE the hustle has associated skills, THE Detail_Panel SHALL display a "Skills & expertise" section with each skill rendered as a tag chip.
5. THE Detail_Panel SHALL display an "About the client" section containing: the client's avatar, the client's name, the client's star rating with review count, the client's location, and a "Reviews: N" link.
6. IF the hustle detail data is loading, THEN THE Detail_Panel SHALL display a loading spinner in the content area.
7. IF the hustle detail API call fails, THEN THE Detail_Panel SHALL display an error message with a retry button.

---

### Requirement 11: Hustle Detail Panel — Your Submission Tab (With Data)

**User Story:** As a Hustler, I want to see my submitted proposal details inside the detail panel, so that I can review what I offered for the hustle.

#### Acceptance Criteria

1. WHEN the "Your submission" tab is active and the Hustler has a submitted proposal, THE Detail_Panel SHALL display: Total Cost (formatted as "GHS {amount}/{pricing_model}"), Duration for Completion, Preferred date range, and Preferred time range.
2. THE Detail_Panel SHALL format the Total Cost as "GHS {amount}/per service" when the pricing model is `full_amount`, and "GHS {amount}/per hour" when the pricing model is `per_hour`.
3. THE Detail_Panel SHALL format the Preferred date as a human-readable range (e.g. "April 16 2025 - April 24 2025").
4. THE Detail_Panel SHALL format the Preferred time as a human-readable range (e.g. "03:30pm - 04:00pm").

---

### Requirement 12: Hustle Detail Panel — Your Submission Tab (Pending Review State)

**User Story:** As a Hustler, I want to see a clear message when my submission is being reviewed, so that I know the current state of my application.

#### Acceptance Criteria

1. WHEN the "Your submission" tab is active and the application status is `applied` with no further client action, THE Detail_Panel SHALL display an empty state with a briefcase icon and the message "Your submission is being reviewed".
2. THE Detail_Panel SHALL NOT display submission data fields when the pending review empty state is shown.

---

### Requirement 13: Detail Panel — Bookmark and Share Actions

**User Story:** As a Hustler, I want to bookmark and share hustles directly from the detail panel, so that I can save interesting jobs and share them with others.

#### Acceptance Criteria

1. WHEN the Hustler clicks the bookmark icon in the Detail_Panel header, THE Detail_Panel SHALL toggle the saved state of the hustle by calling the save/unsave API and update the bookmark icon to reflect the new state.
2. WHEN the Hustler clicks the share icon in the Detail_Panel header, THE Detail_Panel SHALL copy the hustle's shareable URL to the clipboard and display a brief confirmation message.
3. IF the save API call fails, THEN THE Detail_Panel SHALL display an error toast and revert the bookmark icon to its previous state.

---

### Requirement 14: Data Loading and Error Handling

**User Story:** As a Hustler, I want the page to handle loading and error states gracefully, so that I always understand what is happening.

#### Acceptance Criteria

1. WHILE any tab's data is loading, THE My_Hustles_Page SHALL display skeleton card placeholders matching the grid layout.
2. IF the Applications_API returns a network error or a non-2xx HTTP status, THEN THE My_Hustles_Page SHALL display an inline error banner with a "Try again" button that re-triggers the API call.
3. THE My_Hustles_Page SHALL cache fetched application data for 60 seconds before considering it stale, consistent with the existing `useMyApplications` hook configuration.
4. WHEN the Hustler switches between tabs, THE My_Hustles_Page SHALL display previously cached data immediately while re-fetching in the background if the cache is stale.

---

### Requirement 15: Accessibility

**User Story:** As a Hustler using assistive technology, I want the My Hustles page to be navigable by keyboard and screen reader, so that I can use the page without a mouse.

#### Acceptance Criteria

1. THE My_Hustles_Page SHALL assign `role="tablist"` to the tab bar container and `role="tab"` to each tab button, with `aria-selected="true"` on the active tab.
2. THE My_Hustles_Page SHALL associate each tab panel with its tab button using `aria-controls` and `id` attributes.
3. THE Detail_Panel SHALL trap keyboard focus within the panel while it is open and restore focus to the triggering Hustle_Card when the panel closes.
4. THE Detail_Panel SHALL include an `aria-label` of "Hustle details" on the panel container.
5. EACH Hustle_Card's "View more details" button SHALL include an `aria-label` that includes the hustle title (e.g. "View more details for Plumber needed for a bathroom fix").
