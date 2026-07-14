import { useAuthStore } from '@/features/auth/store/authStore';
import { AdminDashboard } from '@/features/dashboard/components/AdminDashboard';
import { ScoreDashboard } from '@/features/dashboard/components/ScoreDashboard';
import { ParentDashboard } from '@/features/dashboard/components/ParentDashboard';

/**
 * Role-aware dashboard entry point:
 * - SUPER_ADMIN → aggregated admin dashboard
 * - STUDENT     → composite score, tier, leaderboard position, plus activity/streaks
 * - PARENT      → linked student's progress (read-only)
 */
export default function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role);

  if (role === 'SUPER_ADMIN') {
    return <AdminDashboard />;
  }
  if (role === 'PARENT') {
    return <ParentDashboard />;
  }
  return <ScoreDashboard />;
}
