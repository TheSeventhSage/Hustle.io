import { MenuDropdown } from '../../../../shared/components/MenuDropdown.jsx'

/**
 * MoreDropdown
 * Wallet-specific dropdown adapter for MenuDropdown
 * @deprecated Use MenuDropdown from src/shared/components/MenuDropdown.jsx for new code
 * 
 * isOpen: boolean
 * onClose: () => void
 * onChangePin?: () => void
 * onForgotPin?: () => void
 * onViewBankAccounts?: () => void
 * onAddBankAccount?: () => void
 */
export function MoreDropdown({
  isOpen,
  onClose,
  onChangePin,
  onForgotPin,
  onViewBankAccounts,
  onAddBankAccount,
}) {
  const items = [
    ...(onViewBankAccounts ? [{ label: 'View Bank Accounts', onClick: onViewBankAccounts }] : []),
    ...(onAddBankAccount ? [{ label: 'Add Bank Account', onClick: onAddBankAccount }] : []),
    ...(onChangePin ? [{ label: 'Change PIN', onClick: onChangePin }] : []),
    ...(onForgotPin ? [{ label: 'Forgot PIN', onClick: onForgotPin }] : []),
  ]

  return <MenuDropdown isOpen={isOpen} onClose={onClose} items={items} title="More" />
}
