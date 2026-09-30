import { BadgeCheck, Banknote, Briefcase, CircleX, Send, WalletCards } from 'lucide-react'
import { formatCount, formatSummaryAmount } from '../financialReport.utils.js'

// UI → API mapping from the handoff §13. Values are displayed as returned.
const CARDS = [
  { key: 'total_hustles', label: 'Total Hustles', Icon: Briefcase, type: 'count' },
  { key: 'amount_earned', label: 'Amount Earned', Icon: Banknote, type: 'money' },
  { key: 'amount_withdrawn', label: 'Amount Withdrawn', Icon: WalletCards, type: 'money' },
  { key: 'hustles_applied', label: 'Hustles Applied', Icon: Send, type: 'count' },
  { key: 'hustles_rejected', label: 'Hustles Rejected', Icon: CircleX, type: 'count' },
  { key: 'hustles_accepted', label: 'Hustles Accepted', Icon: BadgeCheck, type: 'count' },
]

function SummaryCard({ card, value, isLoading }) {
  return (
    <div className="min-w-0 rounded-[10px] border border-border bg-surface py-3 pl-3 pr-2.5">
      <div className="flex items-start justify-between gap-1">
        <span className="truncate text-[12.5px] leading-6 text-text-3">{card.label}</span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mist text-text-3">
          <card.Icon size={12} />
        </span>
      </div>
      {isLoading
        ? <div className="mt-1 h-4 w-20 animate-pulse rounded bg-mist" />
        : <p className="truncate text-[13px] font-semibold text-text-2">{value}</p>}
    </div>
  )
}

// 3 columns once the content column is ≥ 28rem (@container on the parent),
// 2 on phones.
export function SummaryCards({ summary, currency, isLoading }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 @md:grid-cols-3">
      {CARDS.map((card) => (
        <SummaryCard
          key={card.key}
          card={card}
          isLoading={isLoading}
          value={card.type === 'money'
            ? formatSummaryAmount(summary?.[card.key] ?? 0, currency)
            : formatCount(summary?.[card.key] ?? 0)}
        />
      ))}
    </div>
  )
}
