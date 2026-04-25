# Hustle App — Folder Structure

## Current Structure (Existing Files)

|
```
hustle-app/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
├── .env.local
├── .gitignore
│
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── fonts/
│       ├── SF-Pro-Display-Bold.OTF
│       ├── SF-Pro-Display-Light.OTF
│       ├── SF-Pro-Display-Regular.OTF
│       └── SF-Pro-Display-Semibold.OTF
│
└── src/
    ├── main.jsx                          # App entry point
    │
    ├── app/
    │   ├── App.jsx                       # Root component, query client, providers
    │   ├── AppShell.jsx                  # Sidebar + topnav layout shell
    │   └── router.jsx                    # React Router v7 route definitions
    │
    ├── assets/
    │   └── images/
    │       ├── hero.png
    │       ├── logo.png
    │       ├── logo-text.png
    │       ├── pana.png
    │       ├── signin.png
    │       ├── signup.png
    │       ├── Union.png
    │       └── workers.png
    │
    ├── styles/
    │   ├── base.css                      # Global resets and base styles
    │   ├── fonts.css                     # @font-face declarations
    │   ├── tailwind.css                  # Tailwind directives
    │   └── tokens.css                    # Design tokens (colors, spacing, radii)
    │
    ├── services/                         # App-wide API and storage utilities
    │   ├── api.client.js                 # Axios/fetch wrapper with interceptors
    │   ├── query-keys.js                 # Tanstack Query key factory
    │   └── storage.js                    # localStorage / token helpers
    │
    ├── shared/                           # Reusable UI across all features
    │   ├── components/
    │   │   ├── Button.jsx
    │   │   ├── DatePicker.jsx
    │   │   ├── Dropdown.jsx
    │   │   ├── EmptyState.jsx
    │   │   ├── ErrorBoundaryPage.jsx
    │   │   ├── FileUploadComponent.jsx
    │   │   ├── GlassCard.jsx
    │   │   ├── HustleLogo.jsx
    │   │   ├── Image.jsx
    │   │   ├── Input.jsx
    │   │   ├── PageSkeleton.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── RadioGroup.jsx
    │   │   ├── RichTextEditor.jsx
    │   │   ├── SkillChip.jsx
    │   │   ├── StatusBadge.jsx
    │   │   ├── TimePicker.jsx
    │   │   └── ToastContainer.jsx
    │   ├── hooks/                        # (empty — add useDebounce, useMediaQuery etc.)
    │   ├── layouts/
    │   │   └── AuthLayout.jsx
    │   ├── store/
    │   │   └── ui.store.js               # Global UI state (toasts, modals)
    │   └── utils/
    │       └── cn.js                     # Tailwind class merge utility
    │
    └── features/                         # One folder per product domain
        │
        ├── auth/                         # 3.1 Onboarding, Registration, Authentication
        │   ├── components/
        │   │   ├── AuthLayout.jsx
        │   │   └── SharedAuthUI.jsx
        │   ├── pages/
        │   │   ├── SignInPage.jsx
        │   │   ├── SignUpPage.jsx
        │   │   ├── ForgotPasswordPage.jsx
        │   │   └── VerifyEmailPage.jsx
        │   ├── auth.hooks.js
        │   ├── auth.schemas.js
        │   ├── auth.service.js
        │   └── auth.store.js
        │
        ├── hustles/                      # 3.3 Discovery, 3.6 Hustle Details & Offers
        │   ├── components/
        │   │   ├── BookHustlePanel.jsx   # Book a hustle (from detail panel)
        │   │   ├── BookHustlerPanel.jsx  # Book a hustler (from profile panel)
        │   │   ├── CreateHustleForm.jsx
        │   │   ├── CreateHustleModal.jsx
        │   │   ├── FilterSidebar.jsx
        │   │   ├── HustleCard.jsx
        │   │   ├── HustleDetailPanel.jsx
        │   │   ├── HustlerCard.jsx
        │   │   ├── HustlerProfilePanel.jsx
        │   │   ├── MoreActionsDropdown.jsx
        │   │   ├── SectionHeader.jsx
        │   │   ├── ServiceCard.jsx
        │   │   ├── ShareDropdown.jsx
        │   │   ├── TopHustlerCard.jsx
        │   │   └── VerifiedBadge.jsx
        │   ├── machines/
        │   │   ├── hustle.machine.js
        │   │   └── offer.machine.js
        │   ├── pages/
        │   │   ├── FeedPage.jsx
        │   │   ├── MyHustlesPage.jsx
        │   │   ├── HustleDetailPage.jsx
        │   │   ├── CreateHustlePage.jsx
        │   │   ├── EditHustlePage.jsx
        │   │   └── SearchResultsPage.jsx
        │   ├── hustles.hooks.js
        │   ├── hustles.service.js
        │   └── hustles.store.js
        │
        ├── booking/                      # 3.5 Booking, Scheduling, Availability
        │   ├── components/               # (empty — add BookingCard, CalendarView etc.)
        │   ├── pages/
        │   │   ├── BookingPage.jsx
        │   │   └── OfferReviewPage.jsx
        │   ├── booking.machine.js
        │   └── booking.service.js
        │
        ├── messages/                     # 3.7 Messaging & Push Notifications
        │   ├── components/               # (empty — add ConversationItem, ChatBubble etc.)
        │   ├── pages/
        │   │   └── MessagesPage.jsx
        │   ├── messages.service.js
        │   └── socket.client.js
        │
        ├── wallet/                       # 3.8 Wallet, Payments, Withdrawals
        │   ├── components/               # (empty — add BalanceCard, TransactionRow etc.)
        │   ├── pages/
        │   │   └── WalletPage.jsx
        │   ├── wallet.hooks.js
        │   ├── wallet.machine.js
        │   ├── wallet.service.js
        │   └── wallet.store.js
        │
        └── settings/                     # 3.10 Profile Management & Settings
            ├── components/               # (empty — add SettingsSection, ThemeToggle etc.)
            ├── pages/
            │   └── SettingsPage.jsx
            └── settings.service.js
```

---

## Planned Structure (Features to Add)

Based on the product document, these feature folders need to be created:

```
src/features/
    │
    ├── kyc/                              # 3.2 Identity Verification & KYC
    │   ├── components/
    │   │   ├── DocumentUpload.jsx        # Government ID / driver's license upload
    │   │   ├── SelfieCapture.jsx         # Selfie verification step
    │   │   ├── KycStatusBanner.jsx       # Pending / approved / rejected state
    │   │   └── PersonalInfoForm.jsx      # Name, DOB, gender, ID number
    │   ├── pages/
    │   │   ├── KycIntroPage.jsx
    │   │   ├── KycDocumentPage.jsx
    │   │   └── KycStatusPage.jsx
    │   ├── kyc.service.js
    │   └── kyc.store.js
    │
    ├── profile/                          # 3.10 Portfolio & Profile Management
    │   ├── components/
    │   │   ├── PortfolioItem.jsx         # Service name, description, image
    │   │   ├── PortfolioGrid.jsx
    │   │   ├── BusinessDetailsForm.jsx
    │   │   └── SubscriptionStatus.jsx
    │   ├── pages/
    │   │   ├── ProfilePage.jsx
    │   │   ├── EditProfilePage.jsx
    │   │   └── PortfolioPage.jsx
    │   ├── profile.service.js
    │   └── profile.store.js
    │
    ├── reviews/                          # 3.9 Reviews & Social Proof
    │   ├── components/
    │   │   ├── ReviewCard.jsx            # Reviewer name, age, rating, feedback
    │   │   ├── StarRating.jsx
    │   │   └── WriteReviewModal.jsx
    │   ├── pages/
    │   │   └── ReviewsPage.jsx
    │   └── reviews.service.js
    │
    ├── companies/                        # 3.9 Company Profiles
    │   ├── components/
    │   │   ├── CompanyProfileHeader.jsx  # Name, location, date registered, socials
    │   │   ├── FollowButton.jsx
    │   │   └── CompanyReviewList.jsx
    │   ├── pages/
    │   │   └── CompanyProfilePage.jsx
    │   └── companies.service.js
    │
    ├── notifications/                    # 3.7 Push Notifications & Engagement
    │   ├── components/
    │   │   ├── NotificationItem.jsx
    │   │   └── NotificationList.jsx
    │   ├── pages/
    │   │   └── NotificationsPage.jsx
    │   └── notifications.service.js
    │
    └── admin/                            # Section 4 — Admin Dashboard
        ├── components/
        │   ├── KycReviewCard.jsx         # Review uploaded IDs and selfies
        │   ├── UserManagementTable.jsx
        │   ├── ListingModerationRow.jsx
        │   └── WalletOversightPanel.jsx
        ├── pages/
        │   ├── AdminDashboardPage.jsx
        │   ├── AdminKycPage.jsx
        │   ├── AdminUsersPage.jsx
        │   ├── AdminListingsPage.jsx
        │   ├── AdminBookingsPage.jsx
        │   └── AdminWalletPage.jsx
        └── admin.service.js
```

---

## Phase Mapping

| Phase | Focus | Feature Folders |
|-------|-------|-----------------|
| 1 — Core Launch | Trust, conversion, operations | `auth`, `hustles`, `booking`, `messages`, `wallet`, `kyc` |
| 2 — Operational Scale | Calendar, reviews, portfolio, dark mode | `profile`, `reviews`, `companies`, `notifications` |
| 3 — Monetization & Expansion | Multi-city, insurance, analytics, admin | `admin` + extensions to `wallet`, `settings` |
