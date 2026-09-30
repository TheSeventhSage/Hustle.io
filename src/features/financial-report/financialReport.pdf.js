/**
 * financialReport.pdf.js
 * Printable financial report (financial-report.png design), saved as PDF via
 * the browser print dialog. Phase 1 of the API exports CSV only, so this
 * renders backend values as returned — every total comes from `summary`,
 * nothing is recalculated locally.
 */
import { financialReportService } from './financialReport.service.js'
import {
  formatCount,
  formatDateRange,
  formatReportAmount,
  formatReportDate,
  isAllTime,
  isCredit,
} from './financialReport.utils.js'

const PER_PAGE = 100
const MAX_PAGES = 20

async function fetchAll(loader, period) {
  const items = []
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await loader(period, { page, perPage: PER_PAGE })
    items.push(...result.items)
    if (!result.meta.hasNextPage) break
  }
  return items
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function plainAmount(value) {
  return formatReportAmount(value, '')
}

function table(headers, rows, emptyLabel) {
  const head = headers.map(({ label, align }) => `<th class="${align ?? ''}">${escapeHtml(label)}</th>`).join('')
  const body = rows.length
    ? rows.map((cells) => `<tr>${cells.map(({ value, align, strong }) => (
      `<td class="${align ?? ''} ${strong ? 'strong' : ''}">${escapeHtml(value)}</td>`
    )).join('')}</tr>`).join('')
    : `<tr><td class="empty" colspan="${headers.length}">${escapeHtml(emptyLabel)}</td></tr>`
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}

function section(title, totalLabel, totalValue, content) {
  return `
    <section>
      <div class="section-head">
        <h2>${escapeHtml(title)}</h2>
        <span>${escapeHtml(totalLabel)}: <b>${escapeHtml(totalValue)}</b></span>
      </div>
      ${content}
    </section>`
}

function buildHtml({ report, transactions, hustles, include, user, generatedAt }) {
  const currency = report?.currency ?? 'GHS'
  const summary = report?.summary ?? {}
  const period = report?.period ?? {}
  const periodLabel = period.is_all_time || !period.from
    ? 'All time'
    : formatDateRange(period.from, period.to)

  const detailRows = [
    ['Name', user?.name],
    ['Email', user?.email],
    ['Phone', user?.phone],
  ].filter(([, value]) => value)

  const summaryCells = [
    ['Total Hustles', formatCount(summary.total_hustles)],
    ['Amount Earned', formatReportAmount(summary.amount_earned, currency)],
    ['Amount Withdrawn', formatReportAmount(summary.amount_withdrawn, currency)],
    ['Hustle Applied', formatCount(summary.hustles_applied)],
    ['Hustle Rejected', formatCount(summary.hustles_rejected)],
    ['Hustle Accepted', formatCount(summary.hustles_accepted)],
  ]

  const earnings = transactions.filter(isCredit)
  const withdrawals = transactions.filter((tx) => !isCredit(tx))
  const amountHeader = `Amount (${currency})`

  const sections = []

  if (include.transactions) {
    sections.push(section('Revenue', 'Total Revenue', formatReportAmount(summary.amount_earned, currency), table(
      [{ label: '#' }, { label: 'Date' }, { label: 'Hustles' }, { label: 'Description' }, { label: amountHeader, align: 'right' }],
      earnings.map((tx, index) => [
        { value: index + 1 },
        { value: formatReportDate(tx.transaction_at) },
        { value: tx.title || '---' },
        { value: tx.description || '---' },
        { value: plainAmount(tx.amount), align: 'right', strong: true },
      ]),
      'No revenue in this period',
    )))

    sections.push(section('Withdrawals', 'Total Withdrawals', formatReportAmount(summary.amount_withdrawn, currency), table(
      [{ label: '#' }, { label: 'Date' }, { label: 'Description' }, { label: 'Status' }, { label: amountHeader, align: 'right' }],
      withdrawals.map((tx, index) => [
        { value: index + 1 },
        { value: formatReportDate(tx.transaction_at) },
        { value: tx.description || '---' },
        { value: tx.status || '---' },
        { value: `-${plainAmount(tx.amount)}`, align: 'right', strong: true },
      ]),
      'No withdrawals in this period',
    )))
  }

  if (include.hustles) {
    sections.push(section('Hustles', 'Total Hustles', formatCount(summary.total_hustles), table(
      [{ label: '#' }, { label: 'Date' }, { label: 'Hustles' }, { label: 'Source' }, { label: 'Sale', align: 'right' }, { label: amountHeader, align: 'right' }],
      hustles.map((hustle, index) => [
        { value: index + 1 },
        { value: formatReportDate(hustle.completed_at) },
        { value: hustle.title || '---' },
        { value: hustle.source_type === 'booking' ? 'Booking' : 'Hustle' },
        { value: plainAmount(hustle.gross_sale), align: 'right' },
        { value: plainAmount(hustle.provider_earning), align: 'right', strong: true },
      ]),
      'No completed hustles in this period',
    )))
  }

  const logoUrl = `${window.location.origin}/images/logo.png`

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Financial Report - ${escapeHtml(periodLabel)}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, 'Segoe UI', Arial, sans-serif; color: #1E293B; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  header { background: #122A26; padding: 22px 48px; display: flex; align-items: center; gap: 12px; }
  header img { height: 34px; }
  header span { color: #2F8F7A; font-size: 28px; font-weight: 800; letter-spacing: 0.02em; }
  main { padding: 36px 48px 24px; }
  .title { text-align: center; margin-bottom: 32px; }
  .title h1 { font-size: 20px; margin: 0 0 6px; letter-spacing: 0.02em; }
  .title p { margin: 0; color: #64748B; font-size: 13px; }
  .details { display: flex; justify-content: space-between; gap: 32px; margin-bottom: 28px; font-size: 12px; }
  .details dl { display: grid; grid-template-columns: 90px auto; gap: 10px 16px; margin: 0; }
  .details dt { color: #64748B; }
  .details dd { margin: 0; font-weight: 600; }
  section { margin-bottom: 26px; }
  .section-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
  h2 { font-size: 14px; text-transform: uppercase; margin: 0; }
  .section-head span { font-size: 12px; }
  .section-head b { color: #0F9D7A; }
  .summary { display: grid; grid-template-columns: repeat(6, 1fr); border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px; gap: 8px; }
  .summary small { display: block; color: #64748B; font-size: 10.5px; margin-bottom: 8px; }
  .summary strong { font-size: 12px; }
  table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; font-size: 11.5px; }
  thead th { background: #F8FAFC; color: #64748B; font-weight: 600; text-align: left; padding: 10px 12px; }
  tbody td { padding: 10px 12px; border-top: 1px solid #EEF2F6; }
  tbody tr:nth-child(even) td { background: #FAFAFA; }
  tr { page-break-inside: avoid; }
  .right { text-align: right; }
  .strong { font-weight: 700; }
  .empty { text-align: center; color: #94A3B8; padding: 18px; }
  footer { background: #F1F5F9; padding: 18px 48px; font-size: 10.5px; color: #64748B; }
  footer b { color: #1E293B; font-size: 12px; display: block; margin-bottom: 6px; }
  footer p { margin: 3px 0; }
</style>
</head>
<body>
  <header><img src="${logoUrl}" alt="" /><span>HUSTLE</span></header>
  <main>
    <div class="title">
      <h1>FINANCIAL REPORT</h1>
      <p>A summary of your Hustles gotten, revenue and withdrawals for the selected period.</p>
    </div>
    <div class="details">
      <dl>${detailRows.map(([label, value]) => `<dt>${label}</dt><dd>${escapeHtml(value)}</dd>`).join('')}</dl>
      <dl>
        <dt>Report Period</dt><dd>${escapeHtml(periodLabel)}</dd>
        <dt>Generated on</dt><dd>${escapeHtml(generatedAt)}</dd>
      </dl>
    </div>
    <section>
      <div class="section-head"><h2>Summary</h2></div>
      <div class="summary">
        ${summaryCells.map(([label, value]) => `<div><small>${label}</small><strong>${escapeHtml(value)}</strong></div>`).join('')}
      </div>
    </section>
    ${sections.join('')}
  </main>
  <footer>
    <b>Note:</b>
    <p>1. This report shows completed Hustles gotten, revenue and withdrawals within the selected period.</p>
    <p>2. Pending or cancelled transactions are excluded.</p>
    <p>3. For any discrepancies, please contact our support team.</p>
  </footer>
</body>
</html>`
}

function printHtml(html) {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;'

    iframe.onload = () => {
      const frameWindow = iframe.contentWindow
      const cleanup = () => setTimeout(() => iframe.remove(), 500)
      frameWindow.addEventListener('afterprint', cleanup, { once: true })
      // Some browsers never fire afterprint for iframes; don't leak the node.
      setTimeout(cleanup, 60_000)
      frameWindow.focus()
      frameWindow.print()
      resolve()
    }

    iframe.srcdoc = html
    document.body.appendChild(iframe)
  })
}

function getUserDetails(user) {
  const name = user?.name
    || [user?.first_name, user?.last_name].filter(Boolean).join(' ')
    || user?.display_name
  return {
    name,
    email: user?.email,
    phone: user?.phone ?? user?.phone_number,
  }
}

export async function printFinancialReport({ period, include, user }) {
  const [report, transactions, hustles] = await Promise.all([
    financialReportService.getReport(period),
    include.transactions ? fetchAll(financialReportService.getTransactions, period) : [],
    include.hustles ? fetchAll(financialReportService.getHustles, period) : [],
  ])

  const now = new Date()
  const generatedAt = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`

  await printHtml(buildHtml({
    report: report ?? { period: { is_all_time: isAllTime(period) } },
    transactions,
    hustles,
    include,
    user: getUserDetails(user),
    generatedAt,
  }))
}
