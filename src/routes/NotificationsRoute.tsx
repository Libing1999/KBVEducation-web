import NotificationsPage from '@/features/notifications/pages/NotificationsPage';
import ModernNotificationsPage from '@/pages/modern/admin/ModernNotificationsPage';
import { useSelectedUI } from '@/theme/uiSelector';

/**
 * /notifications is shared across all roles (Student/Parent/Admin).
 * ModernNotificationsPage has no admin-specific logic — same
 * hooks/mutations/grouping as Default's NotificationsPage — so every role
 * gets it once selected-ui=modern and lands on a Modern shell route (see
 * isModernShellPath in AuthenticatedShell).
 */
export function NotificationsRoute() {
  const ui = useSelectedUI();
  return ui === 'modern' ? <ModernNotificationsPage /> : <NotificationsPage />;
}
