import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ModernWelcomePage } from '@/pages/modern/ModernWelcomePage';
import { ModernAppShell } from '@/layouts/modern/ModernAppShell';
import { useSelectedUI } from '@/theme/uiSelector';
import { peekWelcomePending, clearWelcomePending } from '@/theme/modernWelcomeFlag';
import { useAuthStore } from '@/features/auth/store/authStore';
import { paths } from '@/routes/paths';

/** Routes shared across all roles (not under /admin) that only count as admin-area for a SUPER_ADMIN. */
const SHARED_ADMIN_ROUTES: string[] = [paths.profile, paths.notifications];

/**
 * Every SUPER_ADMIN-only route, used to decide whether to render the Modern
 * admin shell. Shared routes like /profile and /notifications are only
 * treated as admin-area when the current user IS an admin — Student/Parent
 * keep the Default shell there even in modern mode.
 */
function isAdminAreaPath(pathname: string, isAdmin: boolean): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname === paths.search ||
    (isAdmin && SHARED_ADMIN_ROUTES.includes(pathname))
  );
}

/**
 * Root element for the authenticated route tree (replaces a bare
 * <DashboardLayout/>). If the Modern UI just completed a login, shows the
 * Welcome screen first. Otherwise: admin-area routes get the persistent
 * Modern shell (sidebar/topbar) when selected-ui=modern; every other route
 * (dashboard is handled separately by DashboardRoute; everything else not
 * yet modernized) keeps the exact Default DashboardLayout. No route/URL
 * change — this only swaps which component tree mounts under ProtectedRoute.
 */
export function AuthenticatedShell() {
  const ui = useSelectedUI();
  const location = useLocation();
  const role = useAuthStore((s) => s.user?.role);
  const [showWelcome, setShowWelcome] = useState(() => ui === 'modern' && peekWelcomePending());

  if (showWelcome) {
    return (
      <ModernWelcomePage
        onContinue={() => {
          clearWelcomePending();
          setShowWelcome(false);
        }}
      />
    );
  }

  if (ui === 'modern' && isAdminAreaPath(location.pathname, role === 'SUPER_ADMIN')) {
    return <ModernAppShell />;
  }

  return <DashboardLayout />;
}
