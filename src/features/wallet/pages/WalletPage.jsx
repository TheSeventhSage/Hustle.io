import { useEffect, useRef, useState } from 'react'
import { Info, ArrowUpFromLine, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { formatMoney, maskAccountNumber } from '../walletData'
import { storage } from '../../../services/storage.js'
import {
  useWallet,
  useRequestWithdrawal,
  useBankAccounts,
  useVerifyWithdrawalOtp,
  useAddBankAccount,
} from '../wallet.hooks.js'

import { WithdrawalModal } from '../components/modals/WithdrawalModal'
import { WithdrawalResultModal } from '../components/modals/WithdrawalResultModal'
import { VerifyWithdrawalOtpModal } from '../components/modals/VerifyWithdrawalOtpModal'
import { AddBankAccountModal } from '../components/modals/AddBankAccountModal'
import { BankAccountsModal } from '../components/modals/BankAccountsModal'
import { TransactionDetailPanel } from '../components/wallet/TransactionDetailPanel'
import { TransactionReceiptPanel } from '../components/wallet/TransactionReceiptPanel'
import { MoreDropdown } from '../components/wallet/MoreDropdown'
import {
  WorkInProgressTab,
  WorkInReviewTab,
  TransactionHistoryTab,
} from '../components/wallet/WalletTabs'

function BalanceCard({ label, amount, currencyCode, iconColor, className }) {
  // Map the iconColor to Tailwind classes for dark mode compatibility
  const colorMap = {
    '#22c55e': {
      bg: 'bg-green-50  dark:bg-green-950/30',
      border: 'border-green-100 dark:border-green-900/40',
      icon: 'border-green-500 dark:border-green-400',
      iconFg: 'text-green-500 dark:text-green-400',
    },
    '#3b82f6': {
      bg: 'bg-blue-50   dark:bg-blue-950/30',
      border: 'border-blue-100  dark:border-blue-900/40',
      icon: 'border-blue-500  dark:border-blue-400',
      iconFg: 'text-blue-500  dark:text-blue-400',
    },
    '#a855f7': {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      border: 'border-purple-100 dark:border-purple-900/40',
      icon: 'border-purple-500 dark:border-purple-400',
      iconFg: 'text-purple-500 dark:text-purple-400',
    },
  }
  const c = colorMap[iconColor] ?? colorMap['#22c55e']

  return (
    <div className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${c.bg} ${c.border} ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center bg-white dark:bg-surface ${c.icon}`}>
          <Info size={13} className={c.iconFg} />
        </div>
        <span className="text-[13px] font-medium text-text-3 dark:text-text-3">
          {label}
        </span>
      </div>
      <p className="text-[22px] font-extrabold text-text-1 dark:text-text-1 leading-tight">
        {formatMoney(amount, currencyCode)}
      </p>
    </div>
  )
}

const TABS = [
  { key: 'progress', label: 'In-progress balance' },
  { key: 'review', label: 'In-review balance' },
  { key: 'history', label: 'Transaction' },
]

export default function WalletPage() {
  const [withdrawalFlow, setWithdrawalFlow] = useState(null)
  const [withdrawalId, setWithdrawalId] = useState(null)
  const [withdrawalOtpHint, setWithdrawalOtpHint] = useState('')
  const [withdrawalResultStatus, setWithdrawalResultStatus] = useState(null)
  // Stable idempotency key for one withdrawal action, reused across retries.
  const withdrawalKeyRef = useRef(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('progress')
  const [selectedTx, setSelectedTx] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [selectedBankAccountId, setSelectedBankAccountId] = useState(null)
  const [addBankModalOpen, setAddBankModalOpen] = useState(false)
  const [bankAccountsModalOpen, setBankAccountsModalOpen] = useState(false)

  const { data: wallet, isLoading: walletLoading } = useWallet()
  const { data: bankAccounts = [] } = useBankAccounts()
  const { mutate: requestWithdrawal, isPending: requestingWithdrawal } = useRequestWithdrawal()
  const { mutate: verifyWithdrawalOtp, isPending: verifyingOtp } = useVerifyWithdrawalOtp()
  const { mutate: addBankAccount, isPending: addingBankAccount } = useAddBankAccount()

  // The backend wallet currency can be wrong; use the signed-in user's country
  // currency from the stored hustle_user object as the source of truth.
  const currencyCode = storage.getUser()?.country?.currency_code ?? wallet?.currency_code ?? 'NGN'
  const availableBalance = wallet?.available_balance ?? 0
  const pendingBalance = wallet?.pending_balance ?? 0
  const totalEarned = wallet?.total_earned ?? 0
  // Prefer a payout-ready default; only such accounts can be selected for withdrawal.
  const payoutReadyAccounts = bankAccounts.filter(a => (a.payout_ready ?? true) && (a.is_active ?? 1))
  const defaultBankAccount = payoutReadyAccounts.find(a => a.is_default)
    ?? payoutReadyAccounts[0]
    ?? bankAccounts.find(a => a.is_default)
    ?? bankAccounts[0]
    ?? null

  useEffect(() => {
    if (!selectedBankAccountId && defaultBankAccount?.id) {
      setSelectedBankAccountId(defaultBankAccount.id)
    }
  }, [defaultBankAccount, selectedBankAccountId])

  const selectedBankAccount = bankAccounts.find(account => account.id === selectedBankAccountId)
    ?? defaultBankAccount
    ?? null

  const handleViewTxDetails = (tx) => {
    setSelectedTx(tx)
    setDetailOpen(true)
  }

  const handleDownloadReceipt = () => {
    setDetailOpen(false)
    setReceiptOpen(true)
  }

  const handleWithdraw = (amount) => {
    if (!selectedBankAccount) return

    // Generate the key once per action; reused if the request is retried.
    if (!withdrawalKeyRef.current) {
      withdrawalKeyRef.current = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `wd-${Date.now()}-${Math.random().toString(36).slice(2)}`
    }

    requestWithdrawal(
      { payout_bank_account_id: selectedBankAccount.id, amount, idempotencyKey: withdrawalKeyRef.current },
      {
        onSuccess(res) {
          const payload = res?.data?.data ?? res?.data ?? res
          setWithdrawalId(payload?.withdrawal_id ?? null)
          setWithdrawalOtpHint(payload?.otp_code ? String(payload.otp_code) : '')
          setWithdrawalFlow('otp')
        },
        onError() {
          setWithdrawalFlow('failed')
        },
      }
    )
  }

  const handleVerifyOtp = (otp_code) => {
    if (!withdrawalId) return

    verifyWithdrawalOtp(
      { withdrawalId, otp_code },
      {
        onSuccess(res) {
          const payload = res?.data?.data ?? res?.data ?? res
          // After OTP the status is approved/queued — never "paid". Keep the
          // API status so the result modal shows accurate, non-success copy.
          setWithdrawalResultStatus(payload?.status ?? 'approved')
          setWithdrawalFlow('success')
          setWithdrawalOtpHint('')
          withdrawalKeyRef.current = null
        },
        onError() {
          setWithdrawalFlow('otp')
        },
      }
    )
  }

  const handleAddBankAccount = (payload) => {
    addBankAccount(payload, {
      onSuccess(res) {
        const account = res?.data?.data?.item ?? res?.data?.item ?? res?.data?.data ?? res?.data ?? null
        if (account?.id) setSelectedBankAccountId(account.id)
        setAddBankModalOpen(false)
        setBankAccountsModalOpen(true)
      },
    })
  }

  const closeWithdrawalFlow = () => {
    setWithdrawalFlow(null)
    setWithdrawalId(null)
    setWithdrawalOtpHint('')
    setWithdrawalResultStatus(null)
    withdrawalKeyRef.current = null
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto h-full flex flex-col">
      <div className="flex gap-4 pb-6 flex-row items-center justify-between">
        <h1 className="text-xl font-bold text-text-1">
          My wallet
        </h1>
        <div className="flex items-center gap-2 sm:w-auto sm:min-w-[160px] sm:justify-end">
          <button
            onClick={() => setWithdrawalFlow('form')}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-border bg-mist px-4 py-2.5 text-[13px] font-bold text-text-1 sm:flex-none sm:px-[18px]"
          >
            <ArrowUpFromLine size={16} />
            Withdraw
          </button>

          <div className="relative shrink-0">
            <button
              onClick={() => setMoreOpen(o => !o)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-mist text-text-3"
            >
              <MoreVertical size={16} />
            </button>
            <MoreDropdown

              isOpen={moreOpen}
              onClose={() => setMoreOpen(false)}
              onViewBankAccounts={() => setBankAccountsModalOpen(true)}
              onAddBankAccount={() => setAddBankModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-border bg-surface p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="mb-6 grid  gap-4 grid-cols-2 xl:grid-cols-3">
          {walletLoading ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[90px] rounded-2xl bg-mist animate-pulse" />
              ))}
            </>
          ) : (
            <>
              <BalanceCard
                label={'Wallet Balance'}
                amount={availableBalance}
                currencyCode={currencyCode}
                iconColor="#22c55e"
              />
              <BalanceCard
                label="Pending payment"
                amount={pendingBalance}
                currencyCode={currencyCode}
                iconColor="#3b82f6"
              />
              <BalanceCard
                className="col-span-2"
                label="Total earnings"
                amount={totalEarned}
                currencyCode={currencyCode}
                iconColor="#a855f7"
              />
            </>
          )}
        </div>

        {selectedBankAccount && (
          <div className="mb-5 rounded-2xl border border-border bg-mist px-4 py-3.5">
            <div className="mb-1 text-[12px] text-text-4">
              Selected payout account
            </div>
            <div className="break-words text-[14px] font-bold text-text-1">
              {selectedBankAccount.bank_name} - {maskAccountNumber(selectedBankAccount)}
            </div>
            <div className="mt-0.5 break-words text-[13px] text-text-3">
              {selectedBankAccount.resolved_account_name ?? selectedBankAccount.beneficiary_name ?? ''}
            </div>
          </div>
        )}

        <div className="mb-1 flex gap-0 overflow-x-auto border-b-[1.5px] border-border [scrollbar-width:none]">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative mr-6 shrink-0 whitespace-nowrap border-none bg-transparent py-2 text-[13.5px] ${isActive ? 'font-bold text-text-1' : 'font-medium text-text-4'} sm:mr-8`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="wallet-tab-underline"
                    style={{
                      position: 'absolute', bottom: '-1.5px', left: 0, right: 0,
                      height: '2.5px', background: 'var(--color-accent-gold)',
                      borderRadius: '2px',
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'progress' && <WorkInProgressTab currencyCode={currencyCode} />}
            {activeTab === 'review' && <WorkInReviewTab currencyCode={currencyCode} />}
            {activeTab === 'history' && <TransactionHistoryTab onViewDetails={handleViewTxDetails} currencyCode={currencyCode} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <WithdrawalModal
        isOpen={withdrawalFlow === 'form'}
        onCancel={closeWithdrawalFlow}
        onWithdraw={handleWithdraw}
        maxAmount={availableBalance}
        currencyCode={currencyCode}
        bankAccount={selectedBankAccount}
        isPending={requestingWithdrawal}
      />

      <VerifyWithdrawalOtpModal
        isOpen={withdrawalFlow === 'otp'}
        onCancel={closeWithdrawalFlow}
        onSubmit={handleVerifyOtp}
        isPending={verifyingOtp}
        otpHint={withdrawalOtpHint}
      />

      <AddBankAccountModal
        isOpen={addBankModalOpen}
        onCancel={() => setAddBankModalOpen(false)}
        onSubmit={handleAddBankAccount}
        isPending={addingBankAccount}
      />

      <BankAccountsModal
        isOpen={bankAccountsModalOpen}
        onClose={() => setBankAccountsModalOpen(false)}
        bankAccounts={bankAccounts}
        selectedBankAccountId={selectedBankAccountId}
        onSelectBankAccount={setSelectedBankAccountId}
        onAddBankAccount={() => {
          setBankAccountsModalOpen(false)
          setAddBankModalOpen(true)
        }}
      />

      <WithdrawalResultModal
        isOpen={['success', 'failed', 'pending'].includes(withdrawalFlow)}
        status={withdrawalFlow}
        withdrawalStatus={withdrawalResultStatus}
        onClose={closeWithdrawalFlow}
      />

      <TransactionDetailPanel
        isOpen={detailOpen}
        transaction={selectedTx}
        bankAccount={selectedBankAccount}
        currencyCode={currencyCode}
        onClose={() => setDetailOpen(false)}
        onDownloadReceipt={handleDownloadReceipt}
        onShareReceipt={() => setDetailOpen(false)}
      />

      <TransactionReceiptPanel
        isOpen={receiptOpen}
        transaction={selectedTx}
        bankAccount={selectedBankAccount}
        currencyCode={currencyCode}
        onClose={() => setReceiptOpen(false)}
      />
    </div>
  )
}
