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
import ContactPage from '../pages/public/ContactPage.jsx'
import ServicesPage from '../pages/public/ServicesPage.jsx'
import ServiceDetailsPage from '../pages/public/home/components/ServiceDetailsPage.jsx'
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage.jsx'
import TermsPage from '../pages/public/TermsPage.jsx'
import CancellationPolicyPage from '../pages/public/CancellationPolicyPage.jsx'
import RefundPolicyPage from '../pages/public/RefundPolicyPage.jsx'

// ── App pages (lazy loaded per route) ────────────────────
const FeedPage = lazy(() => import('../features/hustles/pages/FeedPage.jsx'))
const SearchResultsPage = lazy(() => import('../features/hustles/pages/SearchResultsPage.jsx'))
const HustleDetailPage = lazy(() => import('../features/hustles/pages/HustleDetailPage.jsx'))
const CreateHustleWizard = lazy(() => import('../features/hustles/pages/CreateHustlePage.jsx'))
const EditHustlePage = lazy(() => import('../features/hustles/pages/EditHustlePage.jsx'))
const MyHustlesPage = lazy(() => import('../features/hustles/pages/MyHustlesPage.jsx'))
const OfferReviewPage = lazy(() => import('../features/booking/pages/OfferReviewPage.jsx'))
const WalletPage = lazy(() => import('../features/wallet/pages/WalletPage.jsx'))
const MessagesPage = lazy(() => import('../features/messages/pages/MessagesPage.jsx'))
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage.jsx'))

export const router = createBrowserRouter([
  // ── Public pages (no auth required) ─────────────────
  {
    path: '/',
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
      { path: '/feed', element: <FeedPage /> },
      { path: '/search', element: <SearchResultsPage /> },
      { path: '/hustles/:id', element: <HustleDetailPage /> },
      { path: '/hustles/create', element: <CreateHustleWizard /> },
      { path: '/hustles/:id/edit', element: <EditHustlePage /> },
      { path: '/my-hustles', element: <MyHustlesPage /> },
      { path: '/offers/:offerId', element: <OfferReviewPage /> },
      { path: '/wallet', element: <WalletPage /> },
      { path: '/messages', element: <MessagesPage /> },
      { path: '/messages/:id', element: <MessagesPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
])
