# Implementation Plan: hustle-management-ui

## Overview

This implementation plan breaks down the hustle management UI feature into discrete, sequential tasks. The feature includes three main components: My Hustles Page (tabbed dashboard), Create Hustle Form (modal with rich text and file uploads), and Hustle Detail Panel (side panel with job details and applicants). The implementation follows the existing React 19 + React Router v7 patterns, using Zustand for UI state, Tanstack Query for server state, and Framer Motion for animations.

## Tasks

- [ ] 1. Create shared UI components
  - [ ] 1.1 Create SkillChip component
    - Implement pill-shaped chip with label and optional remove button
    - Support default and outlined variants
    - _Requirements: 5.3, 5.4, 10.4_
  
  - [ ] 1.2 Create StatusBadge component
    - Implement color-coded status badges for hustle states
    - Map status values to colors (created=yellow, in-progress=blue, pending-approval=orange, completed=green, reviews=purple)
    - _Requirements: 1.1_
  
  - [ ] 1.3 Create EmptyState component
    - Implement centered layout with illustration, title, description, and optional action button
    - _Requirements: 1.5_

- [ ] 2. Implement My Hustles Page structure
  - [ ] 2.1 Create MyHustlesPage component with tab navigation
    - Implement status tabs (Created, In-progress, Pending approval, Completed, Reviews)
    - Connect to Zustand store for activeTab state
    - Display hustle counts in tab labels using useMyHustles hook
    - _Requirements: 1.1, 1.2, 14.1, 14.3_
  
  - [ ] 2.2 Implement tab filtering logic
    - Connect tab selection to Zustand store setActiveTab action
    - Trigger useMyHustles query refetch on tab change
    - _Requirements: 1.3, 14.2_
  
  - [ ] 2.3 Create responsive grid layout for hustle cards
    - Implement 3-column grid (desktop), 2-column (tablet), 1-column (mobile)
    - _Requirements: 1.4, 12.1, 12.2, 12.3_
  
  - [ ] 2.4 Add "Create a hustle" button in page header
    - Position button in top right corner
    - Connect to modal open action
    - _Requirements: 1.6, 3.1_
  
  - [ ] 2.5 Implement loading and error states
    - Display skeleton grid while fetching hustles
    - Display error message with retry button on fetch failure
    - _Requirements: 13.1, 13.2_

- [ ] 3. Create HustleCard component
  - [ ] 3.1 Implement HustleCard layout and content
    - Display image with fallback gradient
    - Display title (truncated to 2 lines), description preview (truncated to 3 lines)
    - Display metadata badges (experience level, duration, amount)
    - Display applicant count and posted time
    - Add "View more details" button
    - _Requirements: 2.1, 2.2_
  
  - [ ] 3.2 Connect HustleCard to detail panel navigation
    - Implement onViewDetails handler to set selectedHustleId in Zustand store
    - Open HustleDetailPanel when button clicked
    - _Requirements: 2.4, 10.1_

- [ ] 4. Implement Create Hustle Form modal
  - [ ] 4.1 Create CreateHustleModal container component
    - Implement modal with Framer Motion slide-in animation from right
    - Add backdrop click to close with unsaved changes warning
    - Add escape key handler to close
    - Implement focus trap for accessibility
    - Add scroll lock on body when open
    - _Requirements: 3.1, 3.2, 18.1, 18.2_
  
  - [ ] 4.2 Set up React Hook Form with Zod validation schema
    - Define createHustleSchema with all field validations (title 5-100 chars, budget positive, description 20+ chars, skills 1-5, date/time range validation)
    - Initialize useForm hook with schema resolver
    - _Requirements: 8.1, 8.2, 8.5, 8.6, 4.3, 4.4_
  
  - [ ] 4.3 Create BasicInfoSection with title and category inputs
    - Implement title Input field with character count
    - Implement category dropdown/select fetching from API
    - Display validation errors inline
    - _Requirements: 3.3, 16.1, 16.2, 16.3, 16.4_
  
  - [ ] 4.4 Create DateTimeSection with date and time pickers
    - Implement date range picker (start date, end date)
    - Implement time range picker (start time, end time)
    - Add validation for end date >= start date and end time > start time when dates equal
    - _Requirements: 3.3, 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 4.5 Create LocationBudgetSection with location, budget, and duration inputs
    - Implement location Input field
    - Implement budget Input field with GHS currency prefix and numeric validation
    - Implement duration Input field
    - _Requirements: 3.3, 3.4, 8.2_
  
  - [ ] 4.6 Create ExperienceLevelSection with radio button group
    - Implement radio buttons for Beginner, Intermediate, Expert
    - _Requirements: 3.3, 3.5_
  
  - [ ] 4.7 Create SkillsSection with skill input and chip management
    - Implement skill input field with add functionality
    - Display added skills as SkillChip components with remove buttons
    - Enforce maximum 5 skills limit
    - Disable input when 5 skills added
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 4.8 Integrate RichTextEditor for description field
    - Install and configure TipTap or Lexical rich text editor
    - Implement toolbar with bold, italic, underline, alignment, lists, links, clear formatting
    - Connect to React Hook Form
    - Output HTML string
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 8.6_
  
  - [ ] 4.9 Create FileUploadComponent with drag-and-drop
    - Implement drag-and-drop zone with visual feedback
    - Add click-to-browse file picker
    - Validate file types (SVG, PNG, JPG, GIF)
    - Validate file size (max 5MB per file)
    - Display preview thumbnails with remove buttons
    - Support multiple file uploads
    - Display recommended size (800x400 pixels)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [ ] 4.10 Implement form submission logic
    - Transform form data to FormData with multipart files
    - Call useCreateHustle mutation hook
    - Display loading spinner on submit button during submission
    - Close modal on success
    - Display API error messages on failure
    - _Requirements: 9.1, 9.2, 9.5, 9.6, 13.3, 13.4_
  
  - [ ] 4.11 Implement submit button state management
    - Disable submit button when validation errors exist or required fields empty
    - Enable submit button when form is valid
    - _Requirements: 8.3, 8.4_
  
  - [ ] 4.12 Add form actions (Clear draft, Submit buttons)
    - Implement "Clear draft" button to manually discard saved data
    - Implement "Create hustle" submit button
    - _Requirements: 3.6, 15.5_

- [ ] 5. Implement draft persistence with local storage
  - [ ] 5.1 Create auto-save functionality for form drafts
    - Implement debounced auto-save (every 2 seconds) to localStorage
    - Store form data under 'hustle-draft' key with timestamp
    - _Requirements: 15.1_
  
  - [ ] 5.2 Implement draft restoration on form reopen
    - Load draft data from localStorage when CreateHustleModal opens
    - Restore all field values to React Hook Form
    - _Requirements: 15.2, 15.3_
  
  - [ ] 5.3 Clear draft on successful submission
    - Remove draft data from localStorage after successful hustle creation
    - _Requirements: 15.4_

- [ ] 6. Create Hustle Detail Panel
  - [ ] 6.1 Create HustleDetailPanel container component
    - Implement side panel with Framer Motion slide-in animation from right
    - Add close button in header
    - Fetch hustle details using useHustle hook with selectedHustleId
    - Display loading skeleton while fetching
    - Display error state with retry button on fetch failure
    - _Requirements: 10.1, 10.9, 18.3, 18.4_
  
  - [ ] 6.2 Implement tabbed interface (Job Description, Applicants)
    - Create tab navigation for Job Description and Applicants tabs
    - _Requirements: 10.2_
  
  - [ ] 6.3 Create Job Description tab content
    - Display hustle metadata (title, location, experience level, duration, amount, date range, time range)
    - Render description HTML content preserving rich text formatting
    - Display skills as SkillChip components
    - _Requirements: 10.3, 10.4, 10.5, 6.4_
  
  - [ ] 6.4 Create DocumentList component
    - Display attached documents with file icon, name, and size
    - Add download links for each document
    - _Requirements: 10.5_
  
  - [ ] 6.5 Create MediaGallery component
    - Display images and videos in grid layout with consistent aspect ratios
    - Add play button overlay on video thumbnails
    - Implement video playback on play button click
    - _Requirements: 10.6, 10.7, 20.1, 20.2, 20.3, 20.4_
  
  - [ ] 6.6 Create Applicants tab content
    - Display applicant count in tab label
    - Render list of applicants (ApplicantCard components)
    - Display empty state when no applicants exist
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [ ] 6.7 Implement share functionality
    - Add share button in panel header
    - Copy hustle detail page link to clipboard on click
    - Display confirmation toast message
    - _Requirements: 10.8, 19.1, 19.2, 19.3, 19.4_

- [ ] 7. Update Zustand store for UI state management
  - [ ] 7.1 Add createModalOpen state and actions
    - Add createModalOpen boolean to store
    - Add openCreateModal and closeCreateModal actions
    - _Requirements: 3.1_
  
  - [ ] 7.2 Add detailPanelOpen state and actions
    - Add detailPanelOpen boolean to store
    - Add openDetailPanel and closeDetailPanel actions
    - _Requirements: 10.1_
  
  - [ ] 7.3 Add formDraft state for draft persistence
    - Add formDraft object to store
    - Add saveDraft and clearDraft actions
    - _Requirements: 15.1, 15.4_

- [ ] 8. Implement success notification
  - [ ] 8.1 Display success toast on hustle creation
    - Use existing useUIStore toastSuccess to display "Hustle created successfully" message
    - Auto-dismiss after 5 seconds
    - _Requirements: 9.3, 17.1, 17.2, 17.3, 17.4_

- [ ] 9. Update query invalidation and refetching
  - [ ] 9.1 Ensure new hustle appears in Created tab after creation
    - Verify useCreateHustle mutation invalidates hustles.mine queries
    - Verify My Hustles Page refetches and displays new hustle
    - _Requirements: 9.4_

- [ ] 10. Implement responsive design adjustments
  - [ ] 10.1 Add mobile-specific styles for CreateHustleModal
    - Make modal full-screen width on mobile devices
    - _Requirements: 12.4_
  
  - [ ] 10.2 Add mobile-specific styles for HustleDetailPanel
    - Make panel full-screen width on mobile devices
    - _Requirements: 12.5_

- [ ] 11. Add accessibility features
  - [ ] 11.1 Add ARIA labels and roles to all interactive elements
    - Add aria-label to buttons, inputs, and interactive components
    - Add role attributes where appropriate
    - _Requirements: Accessibility compliance_
  
  - [ ] 11.2 Implement keyboard navigation
    - Ensure Tab key navigates through all interactive elements
    - Ensure Enter key activates buttons and submits forms
    - Ensure Escape key closes modals and panels
    - _Requirements: Accessibility compliance_
  
  - [ ] 11.3 Implement focus management
    - Trap focus within modals when open
    - Return focus to trigger element when modal closes
    - _Requirements: Accessibility compliance_

- [ ] 12. Final integration and testing checkpoint
  - Ensure all components render correctly
  - Verify tab filtering works across all status tabs
  - Test form validation for all fields
  - Test draft persistence (save, restore, clear)
  - Test file upload (add, remove, validation)
  - Test rich text editor formatting preservation
  - Test detail panel display with all data types
  - Test responsive layouts on mobile, tablet, desktop
  - Ensure all tests pass, ask the user if questions arise.
