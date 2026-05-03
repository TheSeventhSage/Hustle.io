import { useEffect, useState } from 'react'
import { Info, ArrowUpFromLine, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { formatMoney } from '../walletData'
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

function BalanceCard({ label, amount, currencyCode, iconColor, bgColor }) {
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
    <div className={`flex-1 min-w-[140px] rounded-2xl p-5 border ${c.bg} ${c.border}`}>
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

export default function WalletPage({ isProvider = false, hasPinAlready = false }) {
  const [withdrawalFlow, setWithdrawalFlow] = useState(null)
  const [withdrawalId, setWithdrawalId] = useState(null)
  const [withdrawalOtpHint, setWithdrawalOtpHint] = useState('')
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

  const currencyCode = wallet?.currency_code ?? 'NGN'
  const availableBalance = wallet?.available_balance ?? 0
  const pendingBalance = wallet?.pending_balance ?? 0
  const totalEarned = wallet?.total_earned ?? 0
  const defaultBankAccount = bankAccounts.find(a => a.is_default) ?? bankAccounts[0] ?? null

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

    requestWithdrawal(
      { payout_bank_account_id: selectedBankAccount.id, amount },
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
        onSuccess() {
          setWithdrawalFlow('success')
          setWithdrawalOtpHint('')
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
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto h-full flex flex-col">
      <div className="pb-[24px] flex items-center justify-between">
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-1)' }}>
          My wallet
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px' }}>
          <button
            onClick={() => setWithdrawalFlow('form')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--color-mist)', border: '1.5px solid var(--color-border)',
              borderRadius: '14px', padding: '10px 18px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700, color: 'var(--color-text-1)',
            }}
          >
            <ArrowUpFromLine size={16} />
            Withdraw
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMoreOpen(o => !o)}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--color-mist)', border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--color-text-3)',
              }}
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

      <div style={{
        background: 'var(--color-surface)', borderRadius: '20px',
        border: '1px solid var(--color-border)',
        padding: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'stretch', gap: '16px',
          marginBottom: '24px', position: 'relative',
          flexWrap: 'wrap',
        }}>
          {walletLoading ? (
            <div style={{ flex: 1, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ flex: '1 1 140px', height: '90px', borderRadius: '16px', background: 'var(--color-mist)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : (
            <>
              <BalanceCard
                label={isProvider ? 'Wallet Balance' : 'Available for withdraw'}
                amount={availableBalance}
                currencyCode={currencyCode}
                iconColor="#22c55e"
                bgColor="color-mix(in srgb, var(--color-success-soft) 78%, var(--color-surface) 22%)"
              />
              <BalanceCard
                label="Pending payment"
                amount={pendingBalance}
                currencyCode={currencyCode}
                iconColor="#3b82f6"
                bgColor="color-mix(in srgb, #dbeafe 68%, var(--color-surface) 32%)"
              />
              <BalanceCard
                label="Total earning this year"
                amount={totalEarned}
                currencyCode={currencyCode}
                iconColor="#a855f7"
                bgColor="color-mix(in srgb, #f3e8ff 68%, var(--color-surface) 32%)"
              />
            </>
          )}
        </div>

        {selectedBankAccount && (
          <div style={{
            marginBottom: '20px',
            background: 'var(--color-mist)', border: '1px solid var(--color-border)',
            borderRadius: '16px', padding: '14px 16px',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-4)', marginBottom: '4px', fontFamily: 'var(--ff-body)' }}>
              Selected payout account
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-1)', fontFamily: 'var(--ff-body)' }}>
              {selectedBankAccount.bank_name} - {selectedBankAccount.account_number}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-3)', marginTop: '2px', fontFamily: 'var(--ff-body)' }}>
              {selectedBankAccount.beneficiary_name}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex', borderBottom: '1.5px solid var(--color-border)',
          marginBottom: '4px', gap: '0',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 0', marginRight: '32px',
                  fontSize: '13.5px', fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-text-1)' : 'var(--color-text-4)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  position: 'relative', fontFamily: 'var(--ff-body)',
                  flexShrink: 0, whiteSpace: 'nowrap',
                }}
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
