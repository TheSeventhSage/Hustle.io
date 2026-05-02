import { Button } from '../../../../shared/components/Button.jsx'
import useUIStore from '../../../../shared/store/ui.store.js'

const PLANS = [
  {
    id: 'native',
    title: 'Native hustler',
    accent: 'light',
    items: ['Ad reach is for hustlers within 25 miles radius', '5 hustle posting'],
    cta: 'Current Plan',
    current: true,
  },
  {
    id: 'continental',
    title: 'Continental Hustler',
    accent: 'dark',
    items: ['Ad reach is for hustlers within 1000 miles radius', 'Unlimited'],
    cta: 'Subscribe for GHS 2.99',
    current: false,
  },
  {
    id: 'international',
    title: 'International Hustler',
    accent: 'light',
    items: ['Access to hustlers across multiple countries.', 'Unlimited'],
    cta: 'Subscribe for GHS 7.99',
    current: false,
  },
]

function PlanCard({ plan }) {
  const isDark = plan.accent === 'dark'
  const { toastInfo } = useUIStore()

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto 24px',
        borderRadius: '24px',
        border: isDark ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
        background: isDark ? 'var(--color-primary)' : 'var(--color-surface)',
        padding: '28px 34px 30px',
      }}
    >
      <h4 style={{ fontSize: '22px', fontWeight: 700, color: isDark ? 'var(--color-white)' : 'var(--color-text-1)', textAlign: 'center', marginBottom: '28px', fontFamily: 'var(--ff-body)' }}>
        {plan.title}
      </h4>

      <div style={{ display: 'grid', gap: '18px', maxWidth: '260px', margin: '0 auto 26px' }}>
        {plan.items.map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: isDark ? 'var(--color-secondary)' : 'var(--color-primary)', marginTop: '7px', flexShrink: 0 }} />
            <span style={{ fontSize: '16px', color: isDark ? 'var(--color-white)' : 'var(--color-text-2)', lineHeight: 1.45, fontFamily: 'var(--ff-body)' }}>{item}</span>
          </div>
        ))}
      </div>

      {plan.current ? (
        <Button
          variant="pill"
          disabled
          className="mx-auto min-w-[282px] !cursor-default !bg-[var(--color-mist)] !text-[var(--color-text-1)]"
        >
          {plan.cta}
        </Button>
      ) : (
        <Button
          variant={isDark ? 'outline' : 'solid'}
          className={`mx-auto w-fit min-w-[282px] ${isDark ? '!bg-[var(--color-surface)] !text-[var(--color-primary)] !border-[var(--color-surface)] hover:!bg-[var(--color-mist)]' : '!bg-transparent !text-[var(--color-primary)] !border-[var(--color-primary)] hover:!bg-[var(--color-mist)]'}`}
          onClick={() => toastInfo('Subscription checkout is not connected yet.')}
        >
          {plan.cta}
        </Button>
      )}
    </div>
  )
}

export function SubscriptionSettings() {
  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-1)', marginBottom: '12px', fontFamily: 'var(--ff-body)' }}>
        Subscription
      </h3>
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '40px' }}>
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  )
}
