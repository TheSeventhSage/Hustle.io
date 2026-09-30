import { Briefcase, WalletMinimal } from 'lucide-react'
import {
  formatReportAmount,
  formatReportDateTime,
  getStatusTone,
  isCredit,
} from '../financialReport.utils.js'

const TONE_CLASSES = {
  success: 'bg-success-soft text-[var(--color-info)]',
  pending: 'bg-warning-soft text-[var(--color-secondary-400)]',
  failed: 'bg-error-soft text-error',
}

function StatusBadge({ status }) {
  const { tone, label } = getStatusTone(status)
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] ${TONE_CLASSES[tone]}`}>
      {label}
    </span>
  )
}

/**
 * ActivityRow
 * One list row from the design: icon · title/date · amount/meta.
 */
function ActivityRow({ icon, title, subtitle, amount, meta }) {
  return (
    <li className="flex items-center gap-2 border-b border-border py-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist text-[var(--color-primary-btn)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] text-text-2">{title}</p>
        <p className="mt-0.5 truncate text-[12px] text-text-3">{subtitle}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-[13.5px] text-text-2">{amount}</span>
        {meta}
      </div>
    </li>
  )
}

function ListState({ isLoading, isError, error, emptyLabel }) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 py-3">
        {[1, 2, 3].map((key) => <div key={key} className="h-[60px] animate-pulse rounded-xl bg-mist" />)}
      </div>
    )
  }
  if (isError) return <p className="py-10 text-center text-[13px] text-error">{error?.message || 'Could not load this list.'}</p>
  return <p className="py-10 text-center text-[13px] text-text-3">{emptyLabel}</p>
}

function LoadMore({ query }) {
  if (!query.hasNextPage) return null
  return (
    <div className="flex justify-center pt-5">
      <button
        type="button"
        onClick={() => query.fetchNextPage()}
        disabled={query.isFetchingNextPage}
        className="h-[34px] rounded-full border border-border px-4 text-[13px] text-text-2 transition-colors hover:bg-mist disabled:opacity-60"
      >
        {query.isFetchingNextPage ? 'Loading...' : 'Load more'}
      </button>
    </div>
  )
}

function ActivityList({ query, emptyLabel, renderRow }) {
  const items = query.data?.items ?? []
  if (query.isLoading || query.isError || !items.length) {
    return <ListState isLoading={query.isLoading} isError={query.isError} error={query.error} emptyLabel={emptyLabel} />
  }
  return (
    <>
      <ul>{items.map(renderRow)}</ul>
      <LoadMore query={query} />
    </>
  )
}

export function TransactionList({ query, fallbackCurrency }) {
  return (
    <ActivityList
      query={query}
      emptyLabel="No transactions in this period"
      renderRow={(tx) => {
        // Direction decides money in/out — never the sign or title (handoff §7).
        const credit = isCredit(tx)
        const amount = formatReportAmount(tx.amount, tx.currency_code ?? fallbackCurrency)
        return (
          <ActivityRow
            key={tx.transaction_key ?? `${tx.transaction_type}:${tx.source_id}`}
            icon={<WalletMinimal size={20} />}
            title={credit ? `Money received for ${tx.title || 'a hustle'}` : 'Withdrawal to bank'}
            subtitle={formatReportDateTime(tx.transaction_at)}
            amount={credit ? amount : `-${amount}`}
            meta={<StatusBadge status={tx.status} />}
          />
        )
      }}
    />
  )
}

export function HustleList({ query, fallbackCurrency }) {
  return (
    <ActivityList
      query={query}
      emptyLabel="No completed hustles in this period"
      renderRow={(hustle) => {
        const currency = hustle.currency_code ?? fallbackCurrency
        return (
          <ActivityRow
            key={hustle.id}
            icon={<Briefcase size={20} />}
            title={hustle.title || `Job #${hustle.id}`}
            subtitle={`${formatReportDateTime(hustle.completed_at)} · ${hustle.source_type === 'booking' ? 'Booking' : 'Hustle'}`}
            amount={formatReportAmount(hustle.provider_earning, currency)}
            meta={<span className="text-[11px] text-text-3">Sale {formatReportAmount(hustle.gross_sale, currency)}</span>}
          />
        )
      }}
    />
  )
}
