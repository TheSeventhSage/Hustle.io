# Hustle.io App Usage

This document describes the current app as built in this codebase. Items that are not fully settled are marked as `In progress` or `Testing`.

## What the app does

Hustle.io is a two-sided marketplace:
- `company` and `client` users create and manage hustle requests
- `artisan` users browse jobs, apply, and track work progress

The app is split into:
- public marketing pages
- authentication pages
- protected marketplace pages for each role

## Auth flow

Use these routes to access the app:
- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/verify-email`

Auth is token-based and protected routes require a valid session.

## Company / client flow

After sign-in, a `company` or `client` user can use:
- `/feed` - marketplace feed
- `/hustles/create` - create a hustle
- `/hustles/:id/edit` - edit a hustle
- `/my-hustles` - manage posted hustles
- `/messages` - conversations
- `/wallet` - wallet and transaction views
- `/settings` - profile and preferences

Typical flow:
1. Browse the feed or search page
2. Open a service or hustle
3. Create or manage a hustle
4. Review applications and booking progress
5. Use messages and wallet for follow-up

## Artisan flow

After sign-in, an `artisan` user can use:
- `/hustler` - artisan home
- `/bookings` - current and past jobs
- `/messages` - conversations
- `/wallet` - earnings and transaction info
- `/settings` - profile and subscription preferences

Typical flow:
1. Open `/hustler`
2. Browse open hustles
3. Apply to a hustle
4. Track accepted work in bookings
5. Review wallet and message updates

## Search usage

The public search page uses the search endpoint and is the main discovery surface.
- Type a query in the search input
- Apply category and city filters
- Switch between `Services` and `Hustles` tabs
- Open the details modal for raw result data
- Booking from a service prompts sign-in or register if needed

## Wallet usage

Wallet is used for payment and transaction views.
- Clients see booking and job-related payment data
- Artisans see in-progress job amounts and transaction-related details

## Messages usage

Messages show direct conversations and re-used chat threads.
- Use the messages list to open a thread
- Names should display from participant data rather than account IDs

## Settings usage

Settings covers account preferences and subscription-related options.
- Profile details
- Theme preference
- City subscription controls for artisans
- Other account preferences

## Current incomplete work

### In progress
- Company results are parsed from search responses but are not yet shown in the tab UI
- Search page pagination is wired but still needs live endpoint verification across edge cases
- Some raw search response fields are still surfaced in the details modal and may be trimmed later
- Footer behavior on public pages is still being refined across layouts

### Testing
- Search response shape handling for nested objects and arrays
- Wallet/job transaction rendering across different job statuses
- Message name display consistency across all thread types
- Subscription-dependent artisan city application flow

## Notes

- The homepage hero search preview is intentionally disconnected from the search page
- The search page uses the app tokens for color and light/dark mode styling
- The public search page does not use the shared public header/footer shell
