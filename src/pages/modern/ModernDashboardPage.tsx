import { createPortal } from 'react-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ModernStandingDashboard } from '@/pages/modern/ModernStandingDashboard';
import { ModernAdminDashboard } from '@/pages/modern/ModernAdminDashboard';
import { ModernStudentShell } from '@/layouts/modern/ModernStudentShell';
import { ModernStudentDashboardContent } from '@/pages/modern/student/ModernStudentDashboardContent';
import { ModernParentSummary } from '@/pages/modern/parent/ModernParentSummary';

/**
 * Role-aware entry point for the Modern Dashboard, mirroring Default's
 * DashboardPage split. Portaled to document.body: this route still mounts
 * inside AuthenticatedShell's <DashboardLayout/> (sidebar/topbar unchanged
 * for every other route), but the Modern Dashboard is full-bleed by design,
 * so it escapes that chrome via a fixed, viewport-covering portal instead of
 * rendering squeezed inside DashboardLayout's <main> padding.
 *
 * STUDENT gets the new 3-tab shell (Dashboard/Log/Leaderboard, no side nav) —
 * see ModernStudentShell. PARENT gets its own single-screen weekly summary
 * (ModernParentSummary), replacing the old 6-link side nav entirely — it
 * portals to document.body itself, so it short-circuits before the shared
 * portal wrapper below. SUPER_ADMIN is unaffected.
 */
export function ModernDashboardPage() {
  const role = useAuthStore((s) => s.user?.role);

  if (role === 'PARENT') {
    return <ModernParentSummary />;
  }

  let content: React.ReactNode;
  if (role === 'SUPER_ADMIN') {
    content = <ModernAdminDashboard />;
  } else if (role === 'STUDENT') {
    content = (
      <ModernStudentShell active="dashboard">
        <ModernStudentDashboardContent />
      </ModernStudentShell>
    );
  } else {
    content = <ModernStandingDashboard />;
  }

  return createPortal(
    <div className="fixed inset-0 z-40 overflow-y-auto" data-testid="modern-dashboard-scroll">
      {content}
    </div>,
    document.body,
  );
}

export default ModernDashboardPage;
