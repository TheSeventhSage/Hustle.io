# HustleDetailPanel Component Structure

This directory contains the modular components for the HustleDetailPanel feature.

## File Structure

```
detail-panel/
├── index.js                      # Centralized exports
├── hustleDetailPanel.utils.js   # Utilities, helpers, and mock data
├── ApplicantTile.jsx            # Applicant card component
├── ImageGallery.jsx             # Image/video gallery component
├── RejectModal.jsx              # Rejection reason modal
├── ResultModal.jsx              # Success/result modal
├── DebitConfirmModal.jsx        # Payment confirmation modal
├── PaymentScreen.jsx            # PIN entry payment screen
├── ApplicantDetailView.jsx      # Applicant detail view with payment flow
├── JobDescriptionTab.jsx        # Job description tab content
└── ApplicantsTab.jsx            # Applicants list tab content
```

## Component Hierarchy

```
HustleDetailPanel (main)
├── ApplicantDetailView
│   ├── PaymentScreen
│   ├── DebitConfirmModal
│   ├── RejectModal
│   └── ResultModal
├── JobDescriptionTab
│   └── ImageGallery
└── ApplicantsTab
    └── ApplicantTile
```

## Usage

### Import the main component:
```jsx
import { HustleDetailPanel } from './components/HustleDetailPanel.jsx'
```

### Import individual components (if needed):
```jsx
import { 
  ApplicantTile, 
  ImageGallery, 
  formatGHS 
} from './components/detail-panel/index.js'
```

## Component Responsibilities

### HustleDetailPanel.jsx (Main)
- Manages panel visibility and animations
- Handles tab switching (Job Description / Applicants)
- Manages applicant selection state
- Handles keyboard shortcuts (Escape key)
- Controls scroll locking

### ApplicantDetailView.jsx
- Displays applicant profile details
- Manages payment flow state machine
- Coordinates modals (debit confirm, reject, result)
- Handles navigation between payment screens

### JobDescriptionTab.jsx
- Displays hustle description and details
- Shows location, experience level, duration, amount
- Renders skills and attachments
- Integrates image gallery

### ApplicantsTab.jsx
- Lists all applicants in a grid
- Handles empty state
- Delegates to ApplicantTile for rendering

### PaymentScreen.jsx
- PIN entry interface (4 digits)
- Input validation and error handling
- Loading state during payment processing
- Auto-focus management between inputs

### Modals
- **DebitConfirmModal**: Confirms wallet debit before payment
- **RejectModal**: Collects rejection reasons and custom feedback
- **ResultModal**: Shows success/rejection confirmation

### Utilities (hustleDetailPanel.utils.js)
- `formatGHS()`: Currency formatting helper
- `MOCK_HUSTLE`: Sample hustle data
- `MOCK_APPLICANTS`: Sample applicant data
- `REJECT_REASONS`: Predefined rejection options

## State Management

### Local State (HustleDetailPanel)
- `activeTab`: Current tab ('job' | 'applicants')
- `selectedApplicant`: Currently selected applicant object

### Local State (ApplicantDetailView)
- `flow`: Payment flow state ('idle' | 'debit_confirm' | 'payment' | 'payment_success' | 'reject_modal' | 'rejected')

### Local State (PaymentScreen)
- `pin`: Array of 4 digits
- `error`: PIN validation error state
- `loading`: Payment processing state

## Props Interface

### HustleDetailPanel
```typescript
{
  isOpen: boolean
  onClose: () => void
  hustleId: string
  hustle?: HustleObject
  applicants?: ApplicantObject[]
}
```

### ApplicantDetailView
```typescript
{
  applicant: ApplicantObject
  onBack: () => void
  onClose: () => void
}
```

### JobDescriptionTab
```typescript
{
  hustle: HustleObject
}
```

### ApplicantsTab
```typescript
{
  applicants: ApplicantObject[]
  onSelectApplicant: (applicant: ApplicantObject) => void
}
```

## Design Patterns

1. **Component Composition**: Each component has a single responsibility
2. **State Lifting**: State is managed at the appropriate level
3. **Prop Drilling Prevention**: Only necessary props are passed down
4. **Separation of Concerns**: UI, logic, and data are separated
5. **Reusability**: Components can be used independently if needed

## Styling

All components use Tailwind CSS with custom design tokens:
- Colors: `text-text-1`, `text-text-2`, `text-text-3`, `text-text-4`
- Backgrounds: `bg-surface`, `bg-bg`, `bg-mist`
- Borders: `border-border`
- Primary: `bg-primary`, `text-primary`

## Animation

Uses Framer Motion for:
- Panel slide-in/out animations
- Tab switching transitions
- Modal fade-in/out
- Tab indicator animation (layoutId)

## Accessibility

- Proper ARIA labels on buttons
- Keyboard navigation support (Escape key)
- Focus management in payment screen
- Semantic HTML structure
