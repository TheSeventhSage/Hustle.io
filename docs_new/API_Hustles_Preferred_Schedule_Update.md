Test these flows and watch for these failure points:

1. Hustler My Hustles page

- Confirm the new Applied hustles tab appears.
- Confirm it loads items from GET /apply.
- Confirm empty state shows when there are no applications.
- Confirm search/filter behavior still works on the existing tabs.
- Watch for bad date parsing if the API returns sent_at, applied_at, or expected_completion_at as "YYYY-MM-DD HH:mm:ss".

2. Applied hustle cards

- Confirm each card shows the correct title, amount, status, and applied time.
- Confirm the status label is Applied, Accepted, Rejected, Withdrawn, or Completed.
- Confirm opening a card shows the existing hustle detail panel without errors.
- Watch for missing job_details fields in the /apply response causing blank cards or wrong values.

3. Messages page

- Confirm conversation cards show the new participant name and avatar from participant.
- Confirm legacy fallback still works when participant is absent.
- Confirm message timestamps still show correctly as today, yesterday, or the actual date.
- Watch for any runtime errors from conversation objects that still only use old fields like other_participant_name.

4. Creator hustle detail panel

- Confirm the View hustler profile action opens a new drawer.
- Confirm the drawer loads profile data from GET /profile/{id}.
- Confirm the drawer can be closed with the close button, backdrop click, and Escape key.
