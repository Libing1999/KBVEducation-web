import ProfilePage from '@/features/profile/pages/ProfilePage';
import ModernProfilePage from '@/pages/modern/admin/ModernProfilePage';
import { useSelectedUI } from '@/theme/uiSelector';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * /profile is shared across all roles (Student/Parent/Admin), but only the
 * admin area has a Modern shell so far — so this only swaps to the Modern
 * page for SUPER_ADMIN. Student/Parent keep the Default page even when
 * selected-ui=modern, since they'd otherwise render dark Modern content
 * inside the still-Default (light) DashboardLayout shell.
 */
export function ProfileRoute() {
  const ui = useSelectedUI();
  const role = useAuthStore((s) => s.user?.role);
  return ui === 'modern' && role === 'SUPER_ADMIN' ? <ModernProfilePage /> : <ProfilePage />;
}
