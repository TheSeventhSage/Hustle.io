import { motion, AnimatePresence } from 'framer-motion'
import { maskAccountNumber } from '../../walletData'

export function BankAccountsModal({
  isOpen,
  onClose,
  bankAccounts = [],
  selectedBankAccountId = null,
  onSelectBankAccount,
  onAddBankAccount,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="bank-list-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/35 z-[66]"
          />
          <motion.div
            key="bank-list-modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-[67] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-surface rounded-[20px] p-8 w-full max-w-[560px] max-h-[80vh] overflow-y-auto shadow-2xl border border-border pointer-events-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] font-bold text-text-1">
                  Bank accounts
                </h2>
                <button
                  onClick={onAddBankAccount}
                  className="h-[38px] rounded-full border-none bg-primary hover:bg-primary-sat text-white px-4 text-[13px] font-bold cursor-pointer transition-colors"
                >
                  Add account
                </button>
              </div>

              {bankAccounts.length === 0 ? (
                <div className="border border-dashed border-border rounded-2xl p-7 text-center text-text-3 mb-4">
                  No bank accounts added yet.
                </div>
              ) : (
                <div className="grid gap-3 mb-5">
                  {bankAccounts.map(account => {
                    const isSelected = selectedBankAccountId === account.id
                    return (
                      <button
                        key={account.id}
                        onClick={() => onSelectBankAccount(account.id)}
                        className={`w-full text-left rounded-2xl p-4 cursor-pointer transition-all ${isSelected
                          ? 'bg-green-50 dark:bg-mist border-[1.5px] border-primary'
                          : 'bg-white dark:bg-surface border-[1.5px] border-border hover:border-primary/40'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                          <div>
                            <div className="text-[15px] font-bold text-text-1">
                              {account.bank_name}
                            </div>
                            <div className="text-[13px] text-text-3">
                              {account.country_name || 'Country not set'}
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            {account.is_default && (
                              <span className="inline-flex items-center h-[26px] px-2.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[12px] font-bold">
                                Default
                              </span>
                            )}
                            {isSelected && (
                              <span className="inline-flex items-center h-[26px] px-2.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[12px] font-bold">
                                Selected
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <Meta label="Account number" value={maskAccountNumber(account) || '—'} />
                          <Meta label="Beneficiary" value={account.beneficiary_name || account.resolved_account_name || '—'} />
                          <Meta label="Country" value={account.country_name || '—'} />
                          <Meta label="Bank Code" value={account.bank_code || '—'} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full h-12 rounded-full border-[1.5px] border-border bg-white dark:bg-surface text-text-2 text-[14px] font-semibold cursor-pointer hover:bg-mist dark:hover:bg-white/5 transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <div className="text-[12px] text-text-4 mb-1">{label}</div>
      <div className="text-[14px] text-text-1 font-semibold">{value}</div>
    </div>
  )
}
