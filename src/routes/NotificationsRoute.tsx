import NotificationsPage from '@/features/notifications/pages/NotificationsPage';
import ModernNotificationsPage from '@/pages/modern/admin/ModernNotificationsPage';
import { useSelectedUI } from '@/theme/uiSelector';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * /notifications is shared across all roles (Student/Parent/Admin), but only
 * the admin area has a Modern shell so far — so this only swaps to the
 * Modern page for SUPER_ADMIN, matching ProfileRoute's pattern. Student/
 * Parent keep the Default page even when selected-ui=modern.
 */
export function NotificationsRoute() {
  const ui = useSelectedUI();
  const role = useAuthStore((s) => s.user?.role);
  return ui === 'modern' && role === 'SUPER_ADMIN' ? <ModernNotificationsPage /> : <NotificationsPage />;
}
