import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AppShell from './AppShell.jsx'
import AuthLayout from '../shared/layouts/AuthLayout.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import ErrorBoundaryPage from '../shared/components/ErrorBoundaryPage.jsx'

const withSuspense = (element) => <Suspense fallback={null}>{element}</Suspense>

const SignInPage = lazy(() => import('../features/auth/pages/SignInPage.jsx'))
const SignUpPage = lazy(() => import('../features/auth/pages/SignUpPage.jsx'))
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage.jsx'))
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPasswordPage.jsx'))
const VerifyEmailPage = lazy(() => import('../features/auth/pages/VerifyEmailPage.jsx'))
const GoogleAuthCallbackPage = lazy(() => import('../features/auth/pages/GoogleAuthCallbackPage.jsx'))

const HomePage = lazy(() => import('../pages/public/Home.jsx'))
const AboutPage = lazy(() => import('../pages/public/AboutUsPage.jsx'))
const ServicesPage = lazy(() => import('../pages/public/ServicesJobListPage.jsx'))
const ServiceDetailsPage = lazy(() => import('../pages/public/JobDetailsPage.jsx'))
const ContactPage = lazy(() => import('../pages/public/ContactPage.jsx'))
const SearchResultsPage = lazy(() => import('../shared/components/SearchResultsPage.jsx'))
const LegalPage = lazy(() => import('../pages/public/LegalPage.jsx'))

const FeedPage = lazy(() => import('../features/hustles/pages/FeedPage.jsx'))
const HustleDetailPage = lazy(() => import('../features/hustles/pages/HustleDetailPage.jsx'))
const CreateHustlePage = lazy(() => import('../features/hustles/pages/CreateHustlePage.jsx'))
const EditHustlePage = lazy(() => import('../features/hustles/pages/EditHustlePage.jsx'))
const MyHustlesPage = lazy(() => import('../features/hustles/pages/MyHustlesPage.jsx'))
const HustlerHomePage = lazy(() => import('../features/hustler/pages/HustlerHomePage.jsx'))
const OfferReviewPage = lazy(() => import('../features/booking/pages/OfferReviewPage.jsx'))
const WalletPage = lazy(() => import('../features/wallet/pages/WalletPage.jsx'))
const MessagesPage = lazy(() => import('../features/messages/pages/MessagesPage.jsx'))
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage.jsx'))
const HustlerMyHustlesPage = lazy(() => import('../features/hustler/pages/HustlerMyHustlesPage.jsx'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(<HomePage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/home',
    element: withSuspense(<HomePage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/about',
    element: withSuspense(<AboutPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/contact',
    element: withSuspense(<ContactPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/services',
    element: withSuspense(<ServicesPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/search',
    element: withSuspense(<SearchResultsPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/reset-password',
    element: withSuspense(<ResetPasswordPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/auth/callback',
    element: withSuspense(<GoogleAuthCallbackPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/services/:id',
    element: withSuspense(<ServiceDetailsPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/s-details',
    element: withSuspense(<ServiceDetailsPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/s-details/:id',
    element: withSuspense(<ServiceDetailsPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/terms',
    element: withSuspense(<LegalPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/privacy-policy',
    element: withSuspense(<LegalPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/refund-policy',
    element: withSuspense(<LegalPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/faq',
    element: withSuspense(<LegalPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: '/legal/:pageType',
    element: withSuspense(<LegalPage />),
    errorElement: <ErrorBoundaryPage />,
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      { path: '/sign-in', element: withSuspense(<SignInPage />) },
      { path: '/sign-up', element: withSuspense(<SignUpPage />) },
      { path: '/forgot-password', element: withSuspense(<ForgotPasswordPage />) },
      { path: '/verify-email', element: withSuspense(<VerifyEmailPage />) },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundaryPage />,
    children: [
      {
        path: '/feed',
        element: (
          <ProtectedRoute allowedRoles={['company', 'client']}>
            {withSuspense(<FeedPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/hustler',
        element: (
          <ProtectedRoute allowedRoles={['artisan']}>
            {withSuspense(<HustlerHomePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/hustles/:id',
        element: withSuspense(<HustleDetailPage />),
      },
      {
        path: '/hustles/create',
        element: (
          <ProtectedRoute allowedRoles={['company', 'client']}>
            {withSuspense(<CreateHustlePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/hustles/:id/edit',
        element: (
          <ProtectedRoute allowedRoles={['company', 'client']}>
            {withSuspense(<EditHustlePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/my-hustles',
        element: (
          <ProtectedRoute allowedRoles={['company', 'client']}>
            {withSuspense(<MyHustlesPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/bookings',
        element: (
          <ProtectedRoute allowedRoles={['artisan']}>
            {withSuspense(<HustlerMyHustlesPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/offers/:offerId',
        element: withSuspense(<OfferReviewPage />),
      },
      {
        path: '/wallet',
        element: (
          <ProtectedRoute allowedRoles={['artisan']}>
            {withSuspense(<WalletPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/messages',
        element: (
          <ProtectedRoute allowedRoles={['artisan', 'client']}>
            {withSuspense(<MessagesPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/messages/:id',
        element: (
          <ProtectedRoute allowedRoles={['artisan', 'client']}>
            {withSuspense(<MessagesPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute allowedRoles={['artisan', 'client']}>
            {withSuspense(<SettingsPage />)}
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    errorElement: <ErrorBoundaryPage />,
  },
])
