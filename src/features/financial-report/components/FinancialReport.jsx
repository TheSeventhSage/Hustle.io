import { useMemo, useState } from 'react'
import { Download, RotateCw } from 'lucide-react'
import useAuthStore from '../../auth/auth.store.js'
import {
  useExportFinancialReport,
  useFinancialHustles,
  useFinancialReport,
  useFinancialTransactions,
  usePrintFinancialReport,
} from '../financialReport.hooks.js'
import {
  ALL_TIME_PERIOD,
  formatCount,
  formatReportAmount,
  toChartSeries,
} from '../financialReport.utils.js'
import { DateRangeFilter } from './DateRangeFilter.jsx'
import { DownloadReportModal } from './DownloadReportModal.jsx'
import { SummaryCards } from './SummaryCards.jsx'
import { TrendChart } from './TrendChart.jsx'
import { HustleList, TransactionList } from './ActivityLists.jsx'

const TABS = [
  { key: 'transactions', label: 'Transactions' },
  { key: 'hustles', label: 'Hustles' },
]

function ChartCard({ title, headline, period, onPeriodChange, series, formatValue, axisPrefix, isLoading }) {
  return (
    <div className="rounded-md bg-surface p-3.5 shadow-[0_10px_32px_rgba(15,23,42,0.08)] ring-1 ring-[var(--color-border-subtle)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[11.5px] font-semibold text-text-1">{title}</h3>
          {isLoading
            ? <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-mist" />
            : <p className="mt-1 truncate text-[11px] text-text-2">{headline}</p>}
        </div>
        <DateRangeFilter variant="chip" period={period} onChange={onPeriodChange} />
      </div>
      <div className="mt-3">
        {isLoading
          ? <div className="h-[170px] animate-pulse rounded-md bg-mist" />
          : <TrendChart series={series} formatValue={formatValue} axisPrefix={axisPrefix} />}
      </div>
    </div>
  )
}

function ReportTabs({ activeTab, onChange }) {
  return (
    <div role="tablist" className="flex h-[43px] gap-8 rounded-[10px] border border-border px-4">
      {TABS.map((tab) => {
        const active = tab.key === activeTab
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`-mb-px border-b-2 text-[13.5px] transition-colors ${active ? 'border-[var(--color-accent-gold)] font-medium text-text-1' : 'border-transparent text-text-3 hover:text-text-1'}`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * FinancialReport
 * Hustler financial report (Settings → My Financial Report).
 * The selected period is shared by the summary, both lists and the download.
 */
export function FinancialReport() {
  const [period, setPeriod] = useState(ALL_TIME_PERIOD)
  const [activeTab, setActiveTab] = useState('transactions')
  const [downloadOpen, setDownloadOpen] = useState(false)
  const user = useAuthStore((state) => state.user)

  const reportQuery = useFinancialReport(period)
  const transactionsQuery = useFinancialTransactions(period)
  const hustlesQuery = useFinancialHustles(period)
  const exportMutation = useExportFinancialReport()
  const printMutation = usePrintFinancialReport()

  const report = reportQuery.data
  const currency = report?.currency ?? 'GHS'

  const revenueSeries = useMemo(() => toChartSeries(report?.charts?.revenue, 'amount'), [report])
  const hustleSeries = useMemo(() => toChartSeries(report?.charts?.hustles, 'total'), [report])

  const handleDownload = ({ period: downloadPeriod, format, include }) => {
    const onSuccess = () => setDownloadOpen(false)
    if (format === 'pdf') {
      printMutation.mutate({ period: downloadPeriod, include, user }, { onSuccess })
    } else {
      exportMutation.mutate({ period: downloadPeriod, format }, { onSuccess })
    }
  }

  return (
    <div className="-mx-4 -my-5 sm:-mx-8 sm:-my-[30px]">
      <header className="flex flex-col items-start gap-3 border-b border-border px-5 py-5 sm:h-[78px] sm:flex-row sm:items-center sm:justify-between sm:px-[30px] sm:py-0">
        <h2 className="text-[14px] font-medium text-text-1">Financial Report</h2>
        <div className="flex items-center gap-3">
          <DateRangeFilter period={period} onChange={setPeriod} />
          <button
            type="button"
            onClick={() => setDownloadOpen(true)}
            className="inline-flex h-[34px] items-center gap-2 rounded-full bg-[var(--color-primary-btn)] px-3.5 text-[13px] text-white transition-colors hover:bg-[var(--color-primary-sat)]"
          >
            Download Report
            <Download size={16} />
          </button>
        </div>
      </header>

      <div className="@container mx-auto w-full max-w-[524px] px-5 pb-10 pt-8 sm:px-0 sm:pt-[34px]">
        {reportQuery.isError ? (
          <div className="flex flex-col items-center gap-3 rounded-[10px] border border-border px-4 py-8 text-center">
            <p className="text-[13px] text-error">{reportQuery.error?.message || 'Could not load your financial report.'}</p>
            <button
              type="button"
              onClick={() => reportQuery.refetch()}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-full border border-border px-4 text-[13px] text-text-2 hover:bg-mist"
            >
              <RotateCw size={14} /> Try again
            </button>
          </div>
        ) : (
          <SummaryCards summary={report?.summary} currency={currency} isLoading={reportQuery.isLoading} />
        )}

        <div className="mt-11">
          <ReportTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div role="tabpanel" className="mt-6">
          {activeTab === 'transactions' ? (
            <>
              <ChartCard
                title="Revenue Generated"
                headline={formatReportAmount(report?.summary?.amount_earned ?? 0, currency)}
                period={period}
                onPeriodChange={setPeriod}
                series={revenueSeries}
                formatValue={(value) => formatReportAmount(value, currency)}
                axisPrefix={currency}
                isLoading={reportQuery.isLoading}
              />
              <div className="mt-5">
                <TransactionList query={transactionsQuery} fallbackCurrency={currency} />
              </div>
            </>
          ) : (
            <>
              <ChartCard
                title="Completed Hustles"
                headline={`${formatCount(report?.summary?.total_hustles ?? 0)} completed`}
                period={period}
                onPeriodChange={setPeriod}
                series={hustleSeries}
                formatValue={(value) => `${formatCount(value)} hustle${value === 1 ? '' : 's'}`}
                isLoading={reportQuery.isLoading}
              />
              <div className="mt-5">
                <HustleList query={hustlesQuery} fallbackCurrency={currency} />
              </div>
            </>
          )}
        </div>
      </div>

      <DownloadReportModal
        isOpen={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        initialPeriod={period}
        onDownload={handleDownload}
        isPending={exportMutation.isPending || printMutation.isPending}
      />
    </div>
  )
}
