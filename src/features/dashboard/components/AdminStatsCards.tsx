import { Link } from 'react-router-dom';
import { PenLine, BookOpenCheck, Clock3, CheckCircle2, XCircle, Users, CalendarRange, TrendingUp } from 'lucide-react';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { useAdminStatistics } from '@/features/progress/hooks/useAdminStats';
import { paths } from '@/routes/paths';

/** Phase 3 daily-activity statistics for the admin dashboard. */
export function AdminStatsCards() {
  const { data } = useAdminStatistics();
  if (!data) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Daily Activity</h2>
        <div className="flex gap-3 text-sm">
          <Link to={paths.admin.reflections} className="font-medium text-primary hover:text-primary-600">Reflections</Link>
          <Link to={paths.admin.practice} className="font-medium text-primary hover:text-primary-600">Practice</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Reflections" value={data.todayReflections} icon={PenLine} tone="primary" />
        <StatCard label="Today's Practice" value={data.todayPractice} icon={BookOpenCheck} tone="primary" />
        <StatCard label="Pending Reviews" value={data.pendingReviews} icon={Clock3} tone="accent" />
        <StatCard label="Active Students" value={data.activeStudents} icon={Users} tone="neutral" />
        <StatCard label="Approved Sessions" value={data.approvedSessions} icon={CheckCircle2} tone="primary" />
        <StatCard label="Rejected Sessions" value={data.rejectedSessions} icon={XCircle} tone="neutral" />
        <StatCard label="Weekly Activity" value={data.weeklyActivity} icon={CalendarRange} tone="primary" />
        <StatCard label="Monthly Activity" value={data.monthlyActivity} icon={TrendingUp} tone="accent" />
      </div>
    </div>
  );
}
