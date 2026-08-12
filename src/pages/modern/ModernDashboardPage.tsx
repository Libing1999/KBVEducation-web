import { createPortal } from 'react-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ModernStandingDashboard } from '@/pages/modern/ModernStandingDashboard';
import { ModernAdminDashboard } from '@/pages/modern/ModernAdminDashboard';

/**
 * Role-aware entry point for the Modern Dashboard, mirroring Default's
 * DashboardPage split. Portaled to document.body: this route still mounts
 * inside AuthenticatedShell's <DashboardLayout/> (sidebar/topbar unchanged
 * for every other route), but the Modern Dashboard is full-bleed by design,
 * so it escapes that chrome via a fixed, viewport-covering portal instead of
 * rendering squeezed inside DashboardLayout's <main> padding.
 */
export function ModernDashboardPage() {
  const role = useAuthStore((s) => s.user?.role);
  return createPortal(
    <div className="fixed inset-0 z-40 overflow-y-auto" data-testid="modern-dashboard-scroll">
      {role === 'SUPER_ADMIN' ? <ModernAdminDashboard /> : <ModernStandingDashboard />}
    </div>,
    document.body,
  );
}

export default ModernDashboardPage;
