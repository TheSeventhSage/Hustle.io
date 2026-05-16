import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AppShell from './AppShell.jsx'
import AuthLayout from '../shared/layouts/AuthLayout.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import ErrorBoundaryPage from '../shared/components/ErrorBoundaryPage.jsx'

// ── Auth pages (small, eager loaded) ─────────────────────
import SignInPage from '../features/auth/pages/SignInPage.jsx'
import SignUpPage from '../features/auth/pages/SignUpPage.jsx'
import ForgotPassword from '../features/auth/pages/ForgotPasswordPage.jsx'
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage.jsx'

// ── Public pages (eager loaded) ──────────────────────────
import HomePage from '../pages/public/home/HomePage.jsx'
import AboutPage from '../pages/public/AboutPage.jsx'
// import Home from '../pages/public/home/HustleLanding.jsx'
import ContactPage from '../pages/public/ContactPage.jsx'
import ServicesPage from '../pages/public/ServicesPage.jsx'
import ServiceDetailsPage from '../pages/public/ServiceDetailsPage.jsx'
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage.jsx'
import TermsPage from '../pages/public/TermsPage.jsx'
import CancellationPolicyPage from '../pages/public/CancellationPolicyPage.jsx'
import RefundPolicyPage from '../pages/public/RefundPolicyPage.jsx'

// ── App pages (lazy loaded per route) ────────────────────
const FeedPage = lazy(() => import('../features/hustles/pages/FeedPage.jsx'))
const SearchPage = lazy(() => import('../pages/public/SearchPage.jsx'))
const HustleDetailPage = lazy(() => import('../features/hustles/pages/HustleDetailPage.jsx'))
const CreateHustleWizard = lazy(() => import('../features/hustles/pages/CreateHustlePage.jsx'))
const EditHustlePage = lazy(() => import('../features/hustles/pages/EditHustlePage.jsx'))
const MyHustlesPage = lazy(() => import('../features/hustles/pages/MyHustlesPage.jsx'))
const HustlerHomePage = lazy(() => import('../features/hustler/pages/HustlerHomePage.jsx'))
const OfferReviewPage = lazy(() => import('../features/booking/pages/OfferReviewPage.jsx'))
const WalletPage = lazy(() => import('../features/wallet/pages/WalletPage.jsx'))
const MessagesPage = lazy(() => import('../features/messages/pages/MessagesPage.jsx'))
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage.jsx'))

const BookingsPage = lazy(() => import('../features/booking/pages/BookingPage.jsx'))
const HustlerMyHustlesPage = lazy(() => import('../features/hustler/pages/HustlerMyHustlesPage.jsx'))

export const router = createBrowserRouter([
  // ── Public pages (no auth required) ─────────────────
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorBoundaryPage />,
  },

  {
    path: '/home',
    element: <HomePage />,
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/services',
    element: <ServicesPage />,
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/search',
    element: <SearchPage />,
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/services/:id',
    element: <ServiceDetailsPage />,
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/privacy-policy',
    element: <PrivacyPolicyPage />,
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/cancellation-policy',
    element: <CancellationPolicyPage />,
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/refund-policy',
    element: <RefundPolicyPage />,
    errorElement: <ErrorBoundaryPage />,
  },

  // ── Auth routes (no shell) ──────────────────────────
  {
    element: <AuthLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      { path: '/sign-in', element: <SignInPage /> },
      { path: '/sign-up', element: <SignUpPage /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
    ],
  },

  // ── Protected app routes (inside shell) ─────────────
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundaryPage />,
    children: [
      {
        path: '/feed', element: (
          <ProtectedRoute allowedRoles={['company', 'client']}>
            <FeedPage />
          </ProtectedRoute>
        )
      },

      // Artisan home — hustler feed with apply flow
      {
        path: '/hustler',
        element: (
          <ProtectedRoute allowedRoles={['artisan']}>
            <HustlerHomePage />
          </ProtectedRoute>
        ),
      },
      { path: '/hustles/:id', element: <HustleDetailPage /> },

      // company/client only — artisans cannot post hustles
      {
        path: '/hustles/create',
        element: (
          <ProtectedRoute allowedRoles={['company', 'client']}>
            <CreateHustleWizard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/hustles/:id/edit',
        element: (
          <ProtectedRoute allowedRoles={['company', 'client']}>
            <EditHustlePage />
          </ProtectedRoute>
        ),
      },

      {
        path: '/my-hustles',
        element: (
          <ProtectedRoute allowedRoles={['company', 'client']}>
            <MyHustlesPage />
          </ProtectedRoute>
        ),
      },

      // artisan only — My Hustles page for artisans
      {
        path: '/bookings',
        element: (
          <ProtectedRoute allowedRoles={['artisan']}>
            <HustlerMyHustlesPage />
          </ProtectedRoute>
        ),
      },

      { path: '/offers/:offerId', element: <OfferReviewPage /> },
      { path: '/wallet', element: <WalletPage /> },
      { path: '/messages', element: <MessagesPage /> },
      { path: '/messages/:id', element: <MessagesPage /> },
      { path: '/settings', element: <SettingsPage /> },

    ],
  },
])
