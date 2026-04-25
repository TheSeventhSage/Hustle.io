import { useRouteError, Link } from 'react-router-dom'

export default function ErrorBoundaryPage() {
  const error = useRouteError()

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--color-bg)]">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚠</div>
        <h1 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--color-text-1)' }}>
          Something went wrong
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-3)' }}>
          {error?.message ?? 'An unexpected error occurred.'}
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-primary-sat)' }}
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
