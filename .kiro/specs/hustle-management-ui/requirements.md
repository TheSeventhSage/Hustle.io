# Requirements Document

## Introduction

This document specifies the requirements for the Hustle Management UI feature, which enables users to view, create, and manage their hustles (job postings) through a comprehensive web interface. The feature includes a tabbed dashboard for viewing hustles by status, a multi-step form for creating new hustles with rich media support, and a detailed view panel for reviewing hustle information.

## Glossary

- **Hustle**: A job posting created by a user seeking services from other users
- **Hustle_Creator**: The user who creates and owns a hustle
- **Applicant**: A user who applies to work on a hustle
- **My_Hustles_Page**: The dashboard page displaying all hustles created by the current user
- **Create_Hustle_Form**: The form interface for creating a new hustle
- **Hustle_Card**: A visual card component displaying summary information about a hustle
- **Hustle_Detail_Panel**: A side panel displaying complete information about a specific hustle
- **Status_Tab**: A navigation tab representing a specific hustle lifecycle state
- **Experience_Level**: The required skill proficiency (Beginner, Intermediate, Expert)
- **Rich_Text_Editor**: A text input component with formatting capabilities
- **File_Upload_Component**: An interface for uploading images and documents
- **Skill_Chip**: A visual tag representing a required skill
- **Date_Range**: A start date and end date pair
- **Time_Range**: A start time and end time pair
- **Success_Notification**: A banner message confirming successful hustle creation
- **Empty_State**: A placeholder view shown when no hustles exist in a tab

## Requirements

### Requirement 1: Display My Hustles Dashboard

**User Story:** As a Hustle_Creator, I want to view all my hustles organized by status, so that I can track and manage them effectively.

#### Acceptance Criteria

1. THE My_Hustles_Page SHALL display Status_Tabs for Created, In-progress, Pending approval, Completed, and Reviews states
2. FOR EACH Status_Tab, THE My_Hustles_Page SHALL display the count of hustles in that state
3. WHEN a Status_Tab is selected, THE My_Hustles_Page SHALL display only hustles matching that status
4. THE My_Hustles_Page SHALL display hustles in a grid layout with three columns
5. WHEN no hustles exist for the selected status, THE My_Hustles_Page SHALL display an Empty_State with an illustration and create button
6. THE My_Hustles_Page SHALL display a "Create a hustle" button in the top right corner

### Requirement 2: Render Hustle Cards

**User Story:** As a Hustle_Creator, I want to see summary information for each hustle, so that I can quickly identify and access specific hustles.

#### Acceptance Criteria

1. FOR EACH hustle in the current tab, THE My_Hustles_Page SHALL display a Hustle_Card
2. THE Hustle_Card SHALL display the hustle title, applicant count, posted time, image, description preview, Experience_Level, duration, and amount
3. THE Hustle_Card SHALL display a "View more details" button
4. WHEN the "View more details" button is clicked, THE My_Hustles_Page SHALL open the Hustle_Detail_Panel for that hustle

### Requirement 3: Create Hustle Form Interface

**User Story:** As a Hustle_Creator, I want to fill out a comprehensive form to create a hustle, so that I can provide all necessary job details.

#### Acceptance Criteria

1. WHEN the "Create a hustle" button is clicked, THE My_Hustles_Page SHALL display the Create_Hustle_Form as a modal or slide-in panel
2. THE Create_Hustle_Form SHALL display a close button that dismisses the form
3. THE Create_Hustle_Form SHALL display input fields for job title, category, Date_Range, Time_Range, service duration, location, budget, Experience_Level, skills, and description
4. THE Create_Hustle_Form SHALL display the budget input with a GHS currency prefix
5. THE Create_Hustle_Form SHALL display Experience_Level as radio button options for Beginner, Intermediate, and Expert
6. THE Create_Hustle_Form SHALL display a "Create hustle" submit button at the bottom

### Requirement 4: Date and Time Selection

**User Story:** As a Hustle_Creator, I want to specify when I need the work done, so that applicants know my availability requirements.

#### Acceptance Criteria

1. THE Create_Hustle_Form SHALL provide date picker inputs for preferred start date and end date
2. THE Create_Hustle_Form SHALL provide time picker inputs for preferred start time and end time
3. WHEN a start date is selected, THE Create_Hustle_Form SHALL validate that the end date is not before the start date
4. WHEN a start time is selected, THE Create_Hustle_Form SHALL validate that the end time is after the start time when dates are equal

### Requirement 5: Skills Input Management

**User Story:** As a Hustle_Creator, I want to add multiple required skills, so that I can specify the expertise needed for the job.

#### Acceptance Criteria

1. THE Create_Hustle_Form SHALL allow the Hustle_Creator to add skills as Skill_Chips
2. THE Create_Hustle_Form SHALL limit skill input to a maximum of 5 skills
3. WHEN a skill is added, THE Create_Hustle_Form SHALL display it as a Skill_Chip with a remove button
4. WHEN the remove button on a Skill_Chip is clicked, THE Create_Hustle_Form SHALL remove that skill from the list
5. WHEN 5 skills have been added, THE Create_Hustle_Form SHALL disable the skill input field

### Requirement 6: Rich Text Description Editor

**User Story:** As a Hustle_Creator, I want to format my job description with rich text, so that I can present information clearly and professionally.

#### Acceptance Criteria

1. THE Create_Hustle_Form SHALL provide a Rich_Text_Editor for the description field
2. THE Rich_Text_Editor SHALL provide formatting toolbar buttons for bold, italic, underline, text alignment, bulleted lists, numbered lists, and hyperlinks
3. WHEN a formatting button is clicked, THE Rich_Text_Editor SHALL apply that formatting to the selected text
4. THE Rich_Text_Editor SHALL preserve formatting when the description is saved and displayed

### Requirement 7: File Upload Functionality

**User Story:** As a Hustle_Creator, I want to upload images and documents, so that I can provide visual context and additional information about the job.

#### Acceptance Criteria

1. THE Create_Hustle_Form SHALL provide a File_Upload_Component with drag-and-drop and click-to-browse capabilities
2. THE File_Upload_Component SHALL accept SVG, PNG, JPG, and GIF image formats
3. THE File_Upload_Component SHALL display a maximum recommended size of 800x400 pixels
4. WHEN files are uploaded, THE Create_Hustle_Form SHALL display preview thumbnails with remove buttons
5. WHEN a remove button on a file preview is clicked, THE Create_Hustle_Form SHALL remove that file from the upload list
6. THE File_Upload_Component SHALL support multiple file uploads

### Requirement 8: Form Validation

**User Story:** As a Hustle_Creator, I want the form to validate my inputs, so that I can correct errors before submission.

#### Acceptance Criteria

1. WHEN a required field is empty, THE Create_Hustle_Form SHALL display a validation error message for that field
2. WHEN the budget field contains non-numeric characters, THE Create_Hustle_Form SHALL display a validation error
3. WHEN the form has validation errors, THE Create_Hustle_Form SHALL disable the submit button
4. WHEN all required fields are valid, THE Create_Hustle_Form SHALL enable the submit button
5. THE Create_Hustle_Form SHALL validate that the job title is between 5 and 100 characters
6. THE Create_Hustle_Form SHALL validate that the description is at least 20 characters

### Requirement 9: Create Hustle Submission

**User Story:** As a Hustle_Creator, I want to submit my completed form, so that my hustle is created and visible to potential applicants.

#### Acceptance Criteria

1. WHEN the submit button is clicked with valid form data, THE Create_Hustle_Form SHALL send the hustle data to the backend API
2. WHEN the API returns success, THE Create_Hustle_Form SHALL close the form modal
3. WHEN the API returns success, THE My_Hustles_Page SHALL display a Success_Notification banner
4. WHEN the API returns success, THE My_Hustles_Page SHALL add the new hustle to the Created tab
5. WHEN the API returns an error, THE Create_Hustle_Form SHALL display an error message and remain open
6. WHILE the submission is in progress, THE Create_Hustle_Form SHALL display a loading state on the submit button

### Requirement 10: Hustle Detail Panel Display

**User Story:** As a Hustle_Creator, I want to view complete details of a hustle, so that I can review all information and applicants.

#### Acceptance Criteria

1. WHEN a hustle is selected, THE Hustle_Detail_Panel SHALL display as a side panel or modal
2. THE Hustle_Detail_Panel SHALL display tabs for "Job description" and "Applicants"
3. THE Hustle_Detail_Panel SHALL display the hustle title, description, location, Experience_Level, duration, amount, Date_Range, and Time_Range
4. THE Hustle_Detail_Panel SHALL display required skills as Skill_Chips
5. WHEN documents are attached, THE Hustle_Detail_Panel SHALL display them with file icon, name, and size
6. WHEN images or videos are attached, THE Hustle_Detail_Panel SHALL display them in a media gallery grid
7. FOR EACH video in the media gallery, THE Hustle_Detail_Panel SHALL display a play button overlay
8. THE Hustle_Detail_Panel SHALL display a share button
9. THE Hustle_Detail_Panel SHALL display a close button that dismisses the panel

### Requirement 11: Applicants Tab Display

**User Story:** As a Hustle_Creator, I want to view applicants for my hustle, so that I can review and select candidates.

#### Acceptance Criteria

1. WHEN the "Applicants" tab is selected, THE Hustle_Detail_Panel SHALL display the list of applicants
2. THE Hustle_Detail_Panel SHALL display the applicant count in the tab label
3. WHEN no applicants exist, THE Hustle_Detail_Panel SHALL display an empty state message

### Requirement 12: Responsive Layout

**User Story:** As a Hustle_Creator, I want the interface to work on mobile devices, so that I can manage hustles from any device.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768 pixels, THE My_Hustles_Page SHALL display hustles in a single column grid
2. WHEN the viewport width is between 768 and 1024 pixels, THE My_Hustles_Page SHALL display hustles in a two column grid
3. WHEN the viewport width is greater than 1024 pixels, THE My_Hustles_Page SHALL display hustles in a three column grid
4. WHEN displayed on mobile, THE Create_Hustle_Form SHALL occupy the full screen width
5. WHEN displayed on mobile, THE Hustle_Detail_Panel SHALL occupy the full screen width

### Requirement 13: Loading and Error States

**User Story:** As a Hustle_Creator, I want to see loading indicators and error messages, so that I understand the system status.

#### Acceptance Criteria

1. WHILE hustles are being fetched, THE My_Hustles_Page SHALL display a loading skeleton
2. WHEN fetching hustles fails, THE My_Hustles_Page SHALL display an error message with a retry button
3. WHILE the Create_Hustle_Form is submitting, THE submit button SHALL display a loading spinner
4. WHEN form submission fails, THE Create_Hustle_Form SHALL display the error message returned by the API

### Requirement 14: Tab State Persistence

**User Story:** As a Hustle_Creator, I want my selected tab to persist when I navigate away and return, so that I can continue where I left off.

#### Acceptance Criteria

1. WHEN a Status_Tab is selected, THE My_Hustles_Page SHALL store the selected tab in application state
2. WHEN the Hustle_Creator navigates away from My_Hustles_Page and returns, THE My_Hustles_Page SHALL display the previously selected Status_Tab
3. WHEN the Hustle_Creator first visits My_Hustles_Page, THE My_Hustles_Page SHALL default to the Created tab

### Requirement 15: Form Data Persistence

**User Story:** As a Hustle_Creator, I want my form data to be preserved if I accidentally close the form, so that I don't lose my work.

#### Acceptance Criteria

1. WHILE the Hustle_Creator is filling out the Create_Hustle_Form, THE form SHALL store draft data in local storage
2. WHEN the Create_Hustle_Form is closed without submitting, THE form SHALL retain the draft data
3. WHEN the Create_Hustle_Form is reopened, THE form SHALL restore the draft data
4. WHEN the form is successfully submitted, THE form SHALL clear the draft data from local storage
5. THE form SHALL provide a "Clear draft" option to manually discard saved data

### Requirement 16: Category Selection

**User Story:** As a Hustle_Creator, I want to select a category for my hustle, so that it can be properly classified and discovered.

#### Acceptance Criteria

1. THE Create_Hustle_Form SHALL provide a dropdown or select input for category selection
2. THE Create_Hustle_Form SHALL display available categories retrieved from the backend API
3. WHEN no category is selected, THE Create_Hustle_Form SHALL display a validation error on submit
4. THE Create_Hustle_Form SHALL include the selected category in the submission payload

### Requirement 17: Success Notification Display

**User Story:** As a Hustle_Creator, I want to see a confirmation message after creating a hustle, so that I know the operation succeeded.

#### Acceptance Criteria

1. WHEN a hustle is successfully created, THE My_Hustles_Page SHALL display a Success_Notification banner
2. THE Success_Notification SHALL display the message "Hustle created successfully"
3. THE Success_Notification SHALL automatically dismiss after 5 seconds
4. THE Success_Notification SHALL provide a close button for manual dismissal

### Requirement 18: Modal and Panel Animations

**User Story:** As a Hustle_Creator, I want smooth transitions when opening and closing panels, so that the interface feels polished and responsive.

#### Acceptance Criteria

1. WHEN the Create_Hustle_Form is opened, THE form SHALL animate into view with a slide-in transition
2. WHEN the Create_Hustle_Form is closed, THE form SHALL animate out of view with a slide-out transition
3. WHEN the Hustle_Detail_Panel is opened, THE panel SHALL animate into view with a slide-in transition
4. WHEN the Hustle_Detail_Panel is closed, THE panel SHALL animate out of view with a slide-out transition
5. THE animations SHALL complete within 300 milliseconds

### Requirement 19: Share Hustle Functionality

**User Story:** As a Hustle_Creator, I want to share my hustle, so that I can promote it through external channels.

#### Acceptance Criteria

1. THE Hustle_Detail_Panel SHALL display a share button
2. WHEN the share button is clicked, THE Hustle_Detail_Panel SHALL display sharing options
3. THE sharing options SHALL include a copyable link to the hustle detail page
4. WHEN the link is copied, THE Hustle_Detail_Panel SHALL display a confirmation message

### Requirement 20: Media Gallery Display

**User Story:** As a Hustle_Creator, I want to view uploaded media in an organized gallery, so that I can review visual content associated with the hustle.

#### Acceptance Criteria

1. WHEN images are attached to a hustle, THE Hustle_Detail_Panel SHALL display them in a grid layout
2. WHEN videos are attached to a hustle, THE Hustle_Detail_Panel SHALL display them with a play button overlay
3. WHEN a video play button is clicked, THE Hustle_Detail_Panel SHALL play the video
4. THE media gallery SHALL display images and videos with consistent aspect ratios
