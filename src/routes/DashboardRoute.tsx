import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import { ModernDashboardPage } from '@/pages/modern/ModernDashboardPage';
import { useSelectedUI } from '@/theme/uiSelector';

/**
 * Resolves /dashboard to the Default or Modern UI. Full-bleed like LoginRoute
 * (the Modern Dashboard is self-contained — no sidebar/topbar shell — so it
 * escapes the parent AuthenticatedShell's <DashboardLayout/> chrome for this
 * one route). Every other authenticated route is untouched and keeps using
 * Default UI's DashboardLayout regardless of selected-ui, until modernized.
 */
export function DashboardRoute() {
  const ui = useSelectedUI();
  return ui === 'modern' ? <ModernDashboardPage /> : <DashboardPage />;
}
