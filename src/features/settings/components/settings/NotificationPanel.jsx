/**
 * NotificationPanel
 * Settings-specific wrapper for NotificationPanel
 * @deprecated Use NotificationPanel from src/shared/components/NotificationPanel.jsx for new code
 * 
 * isOpen: boolean
 * onClose: () => void
 */
import { NotificationPanel as SharedNotificationPanel } from '../../../../shared/components/NotificationPanel.jsx'
import { NOTIFICATIONS } from '../../settingsData'

export function NotificationPanel({ isOpen, onClose }) {
  return <SharedNotificationPanel isOpen={isOpen} onClose={onClose} notifications={NOTIFICATIONS} />
}
