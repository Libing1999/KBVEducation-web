import { useAuthStore } from '@/features/auth/store/authStore';
import { AdminDashboard } from '@/features/dashboard/components/AdminDashboard';
import { ScoreDashboard } from '@/features/dashboard/components/ScoreDashboard';

/**
 * Role-aware dashboard entry point:
 * - SUPER_ADMIN → aggregated admin dashboard
 * - STUDENT     → own score dashboard
 * - PARENT      → linked student's score dashboard (same content)
 */
export default function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role);

  if (role === 'SUPER_ADMIN') {
    return <AdminDashboard />;
  }
  return <ScoreDashboard isParentView={role === 'PARENT'} />;
}
