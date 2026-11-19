import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ModernWelcomePage } from '@/pages/modern/ModernWelcomePage';
import { ModernAppShell } from '@/layouts/modern/ModernAppShell';
import { useSelectedUI } from '@/theme/uiSelector';
import { peekWelcomePending, clearWelcomePending } from '@/theme/modernWelcomeFlag';
import { useAuthStore } from '@/features/auth/store/authStore';
import { paths } from '@/routes/paths';
import type { Role } from '@/features/auth/types/auth.types';

/** Shared across every role — only content/API calls differ, not the shell. */
const SHARED_MODERN_PATHS: string[] = [paths.profile, paths.notifications];

/** STUDENT + PARENT: learning + read-only activity views. */
const STUDENT_PARENT_PATHS: string[] = [paths.myLessons, paths.activity, paths.calendar, paths.certificates];
const STUDENT_PARENT_DYNAMIC_PREFIXES: string[] = ['/lessons/'];

/** STUDENT-only: quiz taking + logging reflections/practice. Note: paths.leaderboard and
 * paths.log are deliberately NOT here — those two (plus paths.dashboard) escape this shell
 * entirely for STUDENT+modern via their own portal-based routes (DashboardRoute/
 * LeaderboardRoute/LogRoute) into the shared 3-tab ModernStudentShell, replacing the
 * hamburger-drawer nav this shell renders for every other Modern route. */
const STUDENT_ONLY_PATHS: string[] = [paths.reflections, paths.practice];
const STUDENT_ONLY_DYNAMIC_PREFIXES: string[] = ['/quizzes/', '/practice/'];

/**
 * True if `pathname` should render inside the Modern shell for `role`.
 * Mirrors each route's actual RoleGuard restriction in router.tsx, so a role
 * never gets the Modern shell for a route it can't access anyway.
 */
function isModernShellPath(pathname: string, role: Role | undefined): boolean {
  if (pathname.startsWith('/admin') || pathname === paths.search) return true;
  if (SHARED_MODERN_PATHS.includes(pathname)) return true;

  if (role === 'STUDENT' || role === 'PARENT') {
    if (STUDENT_PARENT_PATHS.includes(pathname)) return true;
    if (STUDENT_PARENT_DYNAMIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  }
  if (role === 'STUDENT') {
    if (STUDENT_ONLY_PATHS.includes(pathname)) return true;
    if (STUDENT_ONLY_DYNAMIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  }
  return false;
}

/**
 * Root element for the authenticated route tree (replaces a bare
 * <DashboardLayout/>). If the Modern UI just completed a login, shows the
 * Welcome screen first. Otherwise: routes matched by isModernShellPath get
 * the persistent Modern shell (hamburger-drawer sidebar/topbar, full-width
 * content — same ModernAppShell used for admin) when selected-ui=modern;
 * every other route (dashboard is handled separately by DashboardRoute, via
 * its own portal escape hatch; everything else not yet modernized) keeps the
 * exact Default DashboardLayout. No route/URL change — this only swaps which
 * component tree mounts under ProtectedRoute.
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

  if (ui === 'modern' && isModernShellPath(location.pathname, role)) {
    return <ModernAppShell />;
  }

  return <DashboardLayout />;
}
