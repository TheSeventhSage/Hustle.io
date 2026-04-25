# Bugfix Requirements Document

## Introduction

This document addresses three critical issues on the My Hustles page that affect user interaction and visual consistency:

1. The "View more details" button on hustle cards is non-functional - clicking it should display the hustle detail panel but currently does nothing
2. Hustle cards use hardcoded font sizes instead of design tokens, causing inconsistency with the design system
3. Buttons across the application do not use the gold color as the primary color in dark mode, breaking the intended dark mode visual hierarchy

These issues impact user experience by preventing access to hustle details, creating visual inconsistency, and failing to meet dark mode design specifications.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user clicks the "View more details" button on a hustle card THEN the system does nothing and the hustle detail panel does not open

1.2 WHEN hustle cards are rendered THEN the system displays text using hardcoded pixel values (e.g., `text-[12px]`, `text-[14px]`) instead of design token CSS variables

1.3 WHEN the application is in dark mode THEN the system displays buttons with inconsistent colors instead of using gold (`#FACC15`) as the primary button color

### Expected Behavior (Correct)

2.1 WHEN a user clicks the "View more details" button on a hustle card THEN the system SHALL open the hustle detail panel displaying the full hustle information

2.2 WHEN hustle cards are rendered THEN the system SHALL display text using design token CSS variables (e.g., `var(--text-sm)`, `var(--text-md)`) for consistent typography

2.3 WHEN the application is in dark mode THEN the system SHALL display all primary buttons with gold color (`#FACC15` / `var(--color-secondary)`) as the background

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user interacts with other buttons and UI elements on the My Hustles page THEN the system SHALL CONTINUE TO respond to those interactions correctly

3.2 WHEN hustle cards are rendered in light mode THEN the system SHALL CONTINUE TO display the correct colors and styling as currently implemented

3.3 WHEN the hustle detail panel is opened THEN the system SHALL CONTINUE TO display all panel content, tabs, and applicant information correctly

3.4 WHEN a user creates a new hustle using the "Create a hustle" button THEN the system SHALL CONTINUE TO open the create hustle panel and process form submissions correctly

3.5 WHEN hustle cards display metadata (experience level, duration, amount, applicant count) THEN the system SHALL CONTINUE TO format and display this information correctly
