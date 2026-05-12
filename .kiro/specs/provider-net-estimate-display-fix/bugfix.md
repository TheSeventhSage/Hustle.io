# Bugfix Requirements Document

## Introduction

This document addresses two related display bugs in the hustler job interface:

1. **Job cards missing amount display**: The `JobMeta` component in `HustlerMyHustlesPage` does not display the `provider_net_estimate` amount, even though the `deriveCardData` function correctly extracts this value from the API response.

2. **Job details panel showing empty data**: The `JobDetailPanel` component displays empty/null values for job fields (Job ID, Title, Status) even though the API returns complete data with the correct structure `{ data: { success: true, data: { item: {...} } } }`.

These bugs prevent hustlers from seeing critical job information: how much they will earn (provider_net_estimate) and the full details of their jobs.

## Bug Analysis

### Current Behavior (Defect)

**Issue 1: Missing Amount Display in Job Cards**

1.1 WHEN a hustler views job cards in the pending, in_progress, or completed tabs THEN the system displays Location, Duration, Timezone, and Payment Status but does NOT display the provider_net_estimate amount

1.2 WHEN the `deriveCardData` function processes a job item THEN the system correctly extracts `provider_net_estimate` into the `amount` field but the `JobMeta` component does not render this value

**Issue 2: Empty Data in Job Details Panel**

1.3 WHEN a hustler clicks "View more details" on a job card THEN the system opens the `JobDetailPanel` but displays "Debug Info: Job ID: null, Title: null, Status: null" even when the API returns valid data

1.4 WHEN the API returns job data with structure `{ data: { success: true, data: { item: {...} } } }` THEN the system attempts to extract using `jobData?.data?.data?.item` but the extracted values are null or undefined

### Expected Behavior (Correct)

**Issue 1: Amount Display in Job Cards**

2.1 WHEN a hustler views job cards in the pending, in_progress, or completed tabs THEN the system SHALL display the provider_net_estimate amount prominently alongside Location, Duration, Timezone, and Payment Status

2.2 WHEN the `JobMeta` component receives job data with a non-null `amount` field THEN the system SHALL render the amount in the format "NGN X,XXX" (or appropriate currency code) with proper formatting

2.3 WHEN the `JobMeta` component receives job data with a null or undefined `amount` field THEN the system SHALL display "—" as a placeholder

**Issue 2: Complete Data in Job Details Panel**

2.4 WHEN a hustler clicks "View more details" on a job card THEN the system SHALL open the `JobDetailPanel` and display all job information including Job ID, Title, Status, Location, Duration, Amount, and other fields

2.5 WHEN the API returns job data with structure `{ data: { success: true, data: { item: {...} } } }` THEN the system SHALL correctly extract the job object and populate all fields in the panel

2.6 WHEN the job data extraction fails or returns null THEN the system SHALL display an error message "Failed to load job details" with a retry button

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a hustler views saved hustles or applications (non-job items) THEN the system SHALL CONTINUE TO display the amount using the existing logic (budget_amount or offered_amount)

3.2 WHEN the `HustlerHustleDetailPanel` component displays job details THEN the system SHALL CONTINUE TO show the provider_net_estimate correctly as it currently does

3.3 WHEN job cards display status badges, payment warnings, and other metadata THEN the system SHALL CONTINUE TO render these elements correctly

3.4 WHEN the `deriveCardData` function processes items THEN the system SHALL CONTINUE TO extract all fields (title, description, location, duration, timezone, paymentStatus, status) correctly

3.5 WHEN the job details panel displays participant information, completion details, and booking references THEN the system SHALL CONTINUE TO render these sections correctly

3.6 WHEN a user completes a job or submits a review from the job details panel THEN the system SHALL CONTINUE TO function correctly
