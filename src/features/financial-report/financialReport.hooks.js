import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { financialReportService } from './financialReport.service.js'
import { printFinancialReport } from './financialReport.pdf.js'
import { downloadBlob, toPeriodQuery } from './financialReport.utils.js'
import useUIStore from '../../shared/store/ui.store.js'

const PAGE_SIZE = 10

// Every key embeds the same period so a date change refetches all three
// sources together (handoff §14).
export const FINANCIAL_REPORT_KEYS = {
  all: () => ['financial-report'],
  summary: (period) => ['financial-report', 'summary', toPeriodQuery(period)],
  transactions: (period) => ['financial-report', 'transactions', toPeriodQuery(period)],
  hustles: (period) => ['financial-report', 'hustles', toPeriodQuery(period)],
}

function getNextPageParam(lastPage) {
  return lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined
}

function flattenPages(data) {
  const pages = data?.pages ?? []
  return {
    items: pages.flatMap((page) => page.items),
    total: pages[0]?.meta.total ?? 0,
  }
}

export function useFinancialReport(period) {
  return useQuery({
    queryKey: FINANCIAL_REPORT_KEYS.summary(period),
    queryFn: () => financialReportService.getReport(period),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  })
}

export function useFinancialTransactions(period, options = {}) {
  return useInfiniteQuery({
    queryKey: FINANCIAL_REPORT_KEYS.transactions(period),
    queryFn: ({ pageParam }) => financialReportService.getTransactions(period, { page: pageParam, perPage: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam,
    select: flattenPages,
    staleTime: 60 * 1000,
    ...options,
  })
}

export function useFinancialHustles(period, options = {}) {
  return useInfiniteQuery({
    queryKey: FINANCIAL_REPORT_KEYS.hustles(period),
    queryFn: ({ pageParam }) => financialReportService.getHustles(period, { page: pageParam, perPage: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam,
    select: flattenPages,
    staleTime: 60 * 1000,
    ...options,
  })
}

export function usePrintFinancialReport() {
  const { toastError } = useUIStore()

  return useMutation({
    mutationFn: printFinancialReport,
    onError(err) {
      toastError(err?.message ?? 'Failed to prepare the PDF report.')
    },
  })
}

export function useExportFinancialReport() {
  const { toastSuccess, toastError } = useUIStore()

  return useMutation({
    mutationFn: ({ period, format = 'csv' }) => financialReportService.exportReport(period, format),
    onSuccess({ blob, filename }) {
      downloadBlob(blob, filename)
      toastSuccess('Financial report downloaded.')
    },
    onError(err) {
      toastError(err?.message ?? 'Failed to download financial report.')
    },
  })
}
