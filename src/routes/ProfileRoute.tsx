import ProfilePage from '@/features/profile/pages/ProfilePage';
import ModernProfilePage from '@/pages/modern/admin/ModernProfilePage';
import { useSelectedUI } from '@/theme/uiSelector';

/**
 * /profile is shared across all roles (Student/Parent/Admin). ModernProfilePage
 * has no admin-specific logic — same query/mutation as Default's ProfilePage —
 * so every role gets it once selected-ui=modern and lands on a Modern shell
 * route (see isModernShellPath in AuthenticatedShell).
 */
export function ProfileRoute() {
  const ui = useSelectedUI();
  return ui === 'modern' ? <ModernProfilePage /> : <ProfilePage />;
}
