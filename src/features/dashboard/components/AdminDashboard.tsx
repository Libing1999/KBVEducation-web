import {
  Users,
  UserRound,
  Layers,
  CheckCircle2,
  PauseCircle,
  LogIn,
  Award,
  FileDown,
  ShieldCheck,
  HardDrive,
  DatabaseBackup,
} from 'lucide-react';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { AdminStatsCards } from '@/features/dashboard/components/AdminStatsCards';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAdminDashboard } from '@/features/dashboard/hooks/useDashboard';
import { useAdminCertificates } from '@/features/certificates/hooks/useCertificates';
import { useExportHistory } from '@/features/export/hooks/useExport';
import { useAuditTrailTodayCount } from '@/features/auditTrail/hooks/useAuditTrail';
import { useBackups } from '@/features/backup/hooks/useBackups';
import { formatDate, formatFileSize, initials, roleLabel } from '@/lib/format';
import type { CohortStatus } from '@/features/cohorts/types/cohort.types';

const statusTone: Record<CohortStatus, 'success' | 'info' | 'neutral' | 'warning'> = {
  ACTIVE: 'success',
  UPCOMING: 'info',
  COMPLETED: 'neutral',
  ARCHIVED: 'warning',
};

export function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useAdminDashboard();
  const { data: certificates } = useAdminCertificates();
  const { data: exportHistory } = useExportHistory();
  const todaysExports = exportHistory?.filter(
    (h) => new Date(h.createdAt).toDateString() === new Date().toDateString(),
  ).length ?? 0;
  const { data: auditEventsToday } = useAuditTrailTodayCount();
  const { data: backups } = useBackups();
  const storageUsageBytes = backups
    ?.filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.fileSizeBytes ?? 0), 0) ?? 0;
  const recentBackupsCount = backups?.length ?? 0;

  if (isLoading) return <LoadingState label="Loading dashboard…" />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of platform activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Students" value={data.totalStudents} icon={Users} tone="primary" />
        <StatCard label="Total Parents" value={data.totalParents} icon={UserRound} tone="primary" />
        <StatCard label="Total Cohorts" value={data.totalCohorts} icon={Layers} tone="neutral" />
        <StatCard label="Active Cohorts" value={data.activeCohorts} icon={CheckCircle2} tone="accent" />
        <StatCard label="Inactive Cohorts" value={data.inactiveCohorts} icon={PauseCircle} tone="neutral" />
        <StatCard label="Today's Logins" value={data.todaysLogins} icon={LogIn} tone="accent" />
        <StatCard label="Total Certificates" value={certificates?.length ?? 0} icon={Award} tone="accent" />
        <StatCard label="Today's Exports" value={todaysExports} icon={FileDown} tone="neutral" />
        <StatCard label="Audit Events Today" value={auditEventsToday ?? 0} icon={ShieldCheck} tone="neutral" />
        <StatCard label="Storage Usage" value={formatFileSize(storageUsageBytes)} icon={HardDrive} tone="neutral" />
        <StatCard label="Recent Backups" value={recentBackupsCount} icon={DatabaseBackup} tone="primary" />
      </div>

      <AdminStatsCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent Users" subtitle="Newest accounts" />
          <CardBody className="p-0">
            {data.recentUsers.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No users yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.recentUsers.map((u) => (
                  <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary">
                      {initials(u.firstName, u.lastName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="truncate text-xs text-slate-500">{u.email}</p>
                    </div>
                    <Badge tone={u.status === 'ACTIVE' ? 'success' : 'neutral'}>
                      {roleLabel(u.role)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent Cohorts" subtitle="Latest intakes" />
          <CardBody className="p-0">
            {data.recentCohorts.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No cohorts yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.recentCohorts.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{c.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {formatDate(c.startDate)} – {formatDate(c.endDate)} · {c.studentCount}
                        {c.maxStudents > 0 ? `/${c.maxStudents}` : ''} students
                      </p>
                    </div>
                    <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
