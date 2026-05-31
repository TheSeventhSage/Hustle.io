import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { formatMoney, formatEntryType } from '../../walletData'
import { useWalletEntries } from '../../wallet.hooks.js'
import { useJobs } from '../../../../shared/hustles/jobs.hooks.js'

function HustleRow({ item, currencyCode = 'NGN' }) {
  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: '14px', padding: '18px 20px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: '16px', marginBottom: '12px',
      }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)', marginBottom: '4px' }}>
            {item.title}
          </span>
          <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-4)', fontFamily: 'var(--ff-body)' }}>
            Expected finish: {item.expected_completion_at ? new Date(item.expected_completion_at).toLocaleString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) : '—'}
          </span>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-4)', fontFamily: 'var(--ff-body)', marginBottom: '4px' }}>
            Amount to receive
          </span>
          <span style={{ display: 'block', fontSize: '15px', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--ff-body)' }}>
            {formatMoney(item.amount, currencyCode)}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-3)', fontFamily: 'var(--ff-body)' }}>
          Job #{item.id}
        </span>
        <a
          href="#"
          onClick={(event) => event.preventDefault()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)',
            textDecoration: 'none',
          }}
        >
          View job <ArrowRight size={14} />
        </a>
      </div>
    </div>
  )
}

function EmptyHustleState({ title = 'No hustle is in progress' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
      <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
        <rect x="20" y="45" width="80" height="40" rx="8" fill="#FDBA40" opacity="0.9" />
        <rect x="20" y="35" width="80" height="20" rx="4" fill="#F5A623" />
        <rect x="10" y="55" width="6" height="28" fill="#E8940F" />
        <rect x="104" y="55" width="6" height="28" fill="#E8940F" />
        <circle cx="32" cy="85" r="10" fill="#3d3d3d" />
        <circle cx="32" cy="85" r="5" fill="#888" />
        <circle cx="88" cy="85" r="10" fill="#3d3d3d" />
        <circle cx="88" cy="85" r="5" fill="#888" />
        <rect x="28" y="36" width="8" height="18" fill="#E8940F" rx="1" />
        <rect x="44" y="36" width="8" height="18" fill="#E8940F" rx="1" />
        <rect x="60" y="36" width="8" height="18" fill="#E8940F" rx="1" />
        <rect x="76" y="36" width="8" height="18" fill="#E8940F" rx="1" />
        <path d="M55 20 Q60 15 65 20" stroke="#888" strokeWidth="1.5" fill="none" />
        <path d="M62 18 Q65 12 70 16" stroke="#888" strokeWidth="1.5" fill="none" />
      </svg>
      <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--ff-body)' }}>
        {title}
      </p>
      <p style={{ fontSize: '13px', color: 'var(--color-text-3)', textAlign: 'center', maxWidth: '280px', lineHeight: 1.6, fontFamily: 'var(--ff-body)' }}>
        In-progress jobs with the payout you will receive are shown here.
      </p>
    </div>
  )
}

const STATUS_CONFIG = {
  Approved: { color: 'var(--color-primary)' },
  Pending: { color: '#f59e0b' },
  Failed: { color: '#ef4444' },
  In_review: { color: '#3b82f6' },
}

const PAGE_SIZE = 8

const pageBtnStyle = {
  width: '32px', height: '32px', borderRadius: '50%',
  border: '1px solid var(--color-border)',
  fontSize: '13px', fontWeight: 500,
  cursor: 'pointer', fontFamily: 'var(--ff-body)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.15s',
  background: 'var(--color-surface)',
}

function PaginationControls({ page, totalPages, onChange, label }) {
  if (totalPages <= 1) return null

  const windowSize = 7
  const start = Math.max(1, Math.min(page - Math.floor(windowSize / 2), totalPages - windowSize + 1))
  const end = Math.min(totalPages, start + windowSize - 1)
  const pageNumbers = Array.from({ length: end - start + 1 }, (_, index) => start + index)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      padding: '20px 0', borderTop: '1px solid var(--color-border)', marginTop: '8px',
    }}>
      <span style={{ fontSize: '13px', color: 'var(--color-text-3)', marginRight: '8px', fontFamily: 'var(--ff-body)' }}>
        {label ?? `Showing page ${page} of ${totalPages} pages`}
      </span>
      <button onClick={() => onChange(Math.max(1, page - 1))} style={{ ...pageBtnStyle, background: 'var(--color-surface)', color: 'var(--color-text-3)' }} disabled={page === 1}>‹</button>
      {pageNumbers.map((n) => (
        <button key={n} onClick={() => onChange(n)} style={{ ...pageBtnStyle, background: page === n ? 'var(--color-accent-gold)' : 'var(--color-surface)', color: page === n ? 'var(--color-primary-500)' : 'var(--color-text-2)', fontWeight: page === n ? 700 : 500 }}>{n}</button>
      ))}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} style={{ ...pageBtnStyle, background: 'var(--color-accent-gold)', color: 'var(--color-primary-500)' }} disabled={page === totalPages}>›</button>
    </div>
  )
}

export function WorkInProgressTab({ currencyCode = 'NGN' }) {
  const [page, setPage] = useState(1)
  const { data: jobs = [], isLoading } = useJobs({ status: 'in_progress', page, per_page: PAGE_SIZE })
  const items = jobs.map((job) => ({
    id: job.id,
    title: job.title || `Job #${job.id}`,
    amount: job.provider_net_estimate ?? job.total_amount_due ?? job.base_amount ?? 0,
    expected_completion_at: job.expected_completion_at || job.scheduled_start_at,
  }))
  const totalPages = Number(jobs.meta?.total_pages ?? 0) || 0
  const currentPage = Number(jobs.meta?.page ?? page) || page

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '24px 0' }}>
        {[1, 2].map((i) => <div key={i} style={{ height: '80px', borderRadius: '14px', background: 'var(--color-mist)', animation: 'pulse 1.5s infinite' }} />)}
      </div>
    )
  }

  if (items.length === 0) return <EmptyHustleState />

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '24px 0' }}>
        {items.map((item) => (
          <HustleRow
            key={item.id}
            item={item}
            currencyCode={currencyCode}
          />
        ))}
      </div>
      <PaginationControls page={currentPage} totalPages={totalPages} onChange={setPage} />
    </>
  )
}

export function WorkInReviewTab({ currencyCode = 'NGN' }) {
  const [page, setPage] = useState(1)
  const { data: entries = [], isLoading } = useWalletEntries({ status: 'in_review', page, per_page: PAGE_SIZE })
  const totalPages = Number(entries.meta?.total_pages ?? 0) || 0
  const currentPage = Number(entries.meta?.page ?? page) || page

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '24px 0' }}>
        {[1, 2].map((i) => <div key={i} style={{ height: '80px', borderRadius: '14px', background: 'var(--color-mist)', animation: 'pulse 1.5s infinite' }} />)}
      </div>
    )
  }

  if (entries.length === 0) return <EmptyHustleState title="No hustle is in review" />

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '24px 0' }}>
        {entries.map((item) => (
          <HustleRow
            key={item.id}
            item={{ id: item.id, title: item.description, amount: item.amount }}
            currencyCode={currencyCode}
          />
        ))}
      </div>
      <PaginationControls page={currentPage} totalPages={totalPages} onChange={setPage} />
    </>
  )
}

export function TransactionHistoryTab({ onViewDetails, currencyCode = 'NGN' }) {
  const [page, setPage] = useState(1)
  const { data: entries = [], isLoading } = useWalletEntries({ page, per_page: PAGE_SIZE })
  const totalPages = Number(entries.meta?.total_pages ?? 0) || 0
  const currentPage = Number(entries.meta?.page ?? page) || page
  const totalEntries = Number(entries.meta?.total ?? 0) || 0

  const thStyle = {
    textAlign: 'left', fontSize: '13px', fontWeight: 600,
    color: 'var(--color-text-3)', padding: '12px 16px',
    borderBottom: '1px solid var(--color-border)',
    fontFamily: 'var(--ff-body)',
  }
  const tdStyle = {
    padding: '16px 16px', fontSize: '14px',
    color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)',
    borderBottom: '1px solid var(--color-mist)',
    verticalAlign: 'middle',
  }

  return (
    <div style={{ paddingTop: '8px' }}>
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-4)', fontFamily: 'var(--ff-body)' }}>
          Loading transactions...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--color-text-4)', padding: '40px' }}>
                    No transactions yet
                  </td>
                </tr>
              ) : entries.map((tx) => {
                const statusKey = tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Pending'
                const sc = STATUS_CONFIG[statusKey] || STATUS_CONFIG.Pending
                const date = tx.created_at
                  ? new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'

                return (
                  <tr
                    key={tx.id}
                    style={{ transition: 'background 0.15s' }}
                    onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--color-mist)' }}
                    onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={tdStyle}>{formatMoney(tx.amount, currencyCode)}</td>
                    <td style={tdStyle}>{date}</td>
                    <td style={tdStyle}>{tx.description || '—'}</td>
                    <td style={tdStyle}>{formatEntryType(tx.entry_type)}</td>
                    <td style={tdStyle}>
                      <span style={{ color: sc.color, fontWeight: 600 }}>{statusKey}</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button
                        onClick={() => onViewDetails(tx)}
                        style={{
                          background: 'var(--color-primary-btn)', color: 'white',
                          border: 'none', borderRadius: '50px',
                          padding: '7px 16px', fontSize: '12px', fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'var(--ff-body)',
                          whiteSpace: 'nowrap', transition: 'background 0.2s',
                        }}
                        onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--color-primary-sat)' }}
                        onMouseLeave={(event) => { event.currentTarget.style.background = 'var(--color-primary-btn)' }}
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <PaginationControls
        page={currentPage}
        totalPages={totalPages}
        onChange={setPage}
        label={totalEntries > 0 ? `Showing page ${currentPage} of ${totalPages} pages` : undefined}
      />
    </div>
  )
}
