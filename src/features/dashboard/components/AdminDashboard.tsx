import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserRound,
  Layers,
  CheckCircle2,
  LogIn,
  Award,
  FileDown,
  ShieldCheck,
  HardDrive,
  DatabaseBackup,
  Lock,
  HeartPulse,
  PenLine,
  BookOpenCheck,
  Clock3,
  CalendarRange,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAdminDashboard, useAdminDashboardTrends } from '@/features/dashboard/hooks/useDashboard';
import { useAdminCertificates } from '@/features/certificates/hooks/useCertificates';
import { useExportHistory } from '@/features/export/hooks/useExport';
import { useAuditTrailTodayCount } from '@/features/auditTrail/hooks/useAuditTrail';
import { useBackups } from '@/features/backup/hooks/useBackups';
import { useAdminStatistics } from '@/features/progress/hooks/useAdminStats';
import { KpiCard } from '@/features/dashboard/components/KpiCard';
import { ActivityOverviewChart } from '@/features/dashboard/components/ActivityOverviewChart';
import { CohortStatusChart } from '@/features/dashboard/components/CohortStatusChart';
import { formatDate, formatFileSize, initials, roleLabel } from '@/lib/format';
import { paths } from '@/routes/paths';
import { cn } from '@/lib/utils';
import type { ActivityDay } from '@/features/dashboard/types/dashboard.types';
import type { CohortStatus } from '@/features/cohorts/types/cohort.types';

const statusTone: Record<CohortStatus, 'success' | 'info' | 'neutral' | 'warning'> = {
  ACTIVE: 'success',
  UPCOMING: 'info',
  COMPLETED: 'neutral',
  ARCHIVED: 'warning',
};

const RANGE_OPTIONS = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

/** Real day-over-day change, derived from the same activityTrend series the chart uses — not fabricated. */
function dailyChangePct(trend: ActivityDay[] | undefined, key: 'reflections' | 'practiceLogs'): number | null {
  if (!trend || trend.length < 2) return null;
  const today = trend[trend.length - 1][key];
  const yesterday = trend[trend.length - 2][key];
  if (yesterday === 0) return today === 0 ? 0 : null;
  return ((today - yesterday) / yesterday) * 100;
}

export function AdminDashboard() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError, refetch } = useAdminDashboard();
  const { data: trends } = useAdminDashboardTrends(days);
  const { data: certificates } = useAdminCertificates();
  const { data: exportHistory } = useExportHistory();
  const todaysExports = exportHistory?.filter(
    (h) => new Date(h.createdAt).toDateString() === new Date().toDateString(),
  ).length ?? 0;
  const { data: auditEventsToday } = useAuditTrailTodayCount();
  const { data: backups } = useBackups();
  const { data: dailyStats } = useAdminStatistics();
  const storageUsageBytes = backups
    ?.filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.fileSizeBytes ?? 0), 0) ?? 0;
  const recentBackupsCount = backups?.length ?? 0;

  if (isLoading) return <LoadingState label="Loading dashboard…" />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const rangeLabel = `vs last ${days} days`;
  const reflectionsChangePct = dailyChangePct(trends?.activityTrend, 'reflections');
  const practiceChangePct = dailyChangePct(trends?.activityTrend, 'practiceLogs');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of platform activity and performance.</p>
        </div>
        <label className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 shrink-0 text-slate-400" />
          <Select
            className="w-auto"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            aria-label="Date range"
          >
            {RANGE_OPTIONS.map((o) => (
              <option key={o.days} value={o.days}>
                {o.label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Total Students"
          value={data.totalStudents}
          icon={Users}
          tone="primary"
          changePct={trends?.studentsChangePct}
          changeLabel={rangeLabel}
          sparkline={trends?.studentsGrowth}
          sparklineColor="#2a78d6"
        />
        <KpiCard
          label="Total Parents"
          value={data.totalParents}
          icon={UserRound}
          tone="primary"
          changePct={trends?.parentsChangePct}
          changeLabel={rangeLabel}
          sparkline={trends?.parentsGrowth}
          sparklineColor="#008300"
        />
        <KpiCard
          label="Total Cohorts"
          value={data.totalCohorts}
          icon={Layers}
          tone="neutral"
          changePct={trends?.cohortsChangePct}
          changeLabel={rangeLabel}
          sparkline={trends?.cohortsGrowth}
          sparklineColor="#4a3aa7"
        />
        <KpiCard
          label="Active Cohorts"
          value={data.activeCohorts}
          icon={CheckCircle2}
          tone="accent"
          changePct={trends?.activeCohortsChangePct}
          changeLabel={rangeLabel}
          sparkline={trends?.activeCohortsGrowth}
          sparklineColor="#C4972A"
        />
        <KpiCard
          label="Today's Logins"
          value={data.todaysLogins}
          icon={LogIn}
          tone="accent"
          changePct={trends?.loginsChangePct}
          changeLabel="vs yesterday"
          sparkline={trends?.loginsPerDay}
          sparklineColor="#1baf7a"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityOverviewChart data={trends?.activityTrend ?? []} />
        </div>

        <Card>
          <CardHeader title="System Summary" />
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              <SummaryRow icon={Award} label="Total Certificates" value={certificates?.length ?? 0} />
              <SummaryRow icon={FileDown} label="Today's Exports" value={todaysExports} />
              <SummaryRow icon={ShieldCheck} label="Audit Events Today" value={auditEventsToday ?? 0} />
              <SummaryRow icon={HardDrive} label="Storage Usage" value={formatFileSize(storageUsageBytes)} />
              <SummaryRow icon={DatabaseBackup} label="Recent Backups" value={recentBackupsCount} />
              <SummaryRow icon={Lock} label="Failed Login Attempts" value={data.lockedAccounts} />
              <SummaryRow
                icon={HeartPulse}
                label="System Health"
                value={data.systemHealthy ? 'Healthy' : 'Low Disk Space'}
                valueClassName={data.systemHealthy ? 'text-green-600' : 'text-accent-500'}
              />
            </ul>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Daily Activity" />
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <DailyActivityTile
                icon={PenLine}
                label="Today's Reflections"
                value={dailyStats?.todayReflections ?? 0}
                changePct={reflectionsChangePct}
                tone="primary"
              />
              <DailyActivityTile
                icon={BookOpenCheck}
                label="Today's Practice"
                value={dailyStats?.todayPractice ?? 0}
                changePct={practiceChangePct}
                tone="primary"
              />
              <DailyActivityTile
                icon={Clock3}
                label="Pending Reviews"
                value={dailyStats?.pendingReviews ?? 0}
                changePct={null}
                tone="accent"
              />
              <DailyActivityTile
                icon={Users}
                label="Active Students"
                value={dailyStats?.activeStudents ?? 0}
                changePct={null}
                tone="neutral"
              />
            </div>
          </CardBody>
        </Card>

        <CohortStatusChart breakdown={trends?.cohortStatus ?? { active: 0, inactive: 0, upcoming: 0 }} />

        <Card>
          <CardHeader
            title="Top Performing Students"
            action={
              <Link to={paths.admin.leaderboard} className="text-sm font-medium text-primary hover:text-primary-600">
                View Leaderboard
              </Link>
            }
          />
          <CardBody className="p-0">
            {!trends?.topStudents || trends.topStudents.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No scored students yet.</p>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-2 font-medium">#</th>
                      <th className="px-2 py-2 font-medium">Student</th>
                      <th className="px-5 py-2 text-right font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trends.topStudents.map((s, i) => (
                      <tr key={`${s.studentName}-${i}`}>
                        <td className="px-5 py-2.5 text-slate-500">{i + 1}</td>
                        <td className="px-2 py-2.5">
                          <p className="truncate font-medium text-slate-800">{s.studentName}</p>
                          {s.cohortName && <p className="truncate text-xs text-slate-400">{s.cohortName}</p>}
                        </td>
                        <td className="px-5 py-2.5 text-right font-semibold text-slate-800">
                          {s.compositeScore.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-slate-100 p-3 text-center">
                  <Link
                    to={paths.admin.leaderboard}
                    className="text-sm font-medium text-primary hover:text-primary-600"
                  >
                    View Full Leaderboard →
                  </Link>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

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

function SummaryRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  valueClassName?: string;
}) {
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm text-slate-600">{label}</span>
      <span className={cn('text-sm font-semibold text-slate-800', valueClassName)}>{value}</span>
    </li>
  );
}

function DailyActivityTile({
  icon: Icon,
  label,
  value,
  changePct,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  changePct: number | null;
  tone: 'primary' | 'accent' | 'neutral';
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: 'bg-primary-50 text-primary',
    accent: 'bg-accent-50 text-accent-500',
    neutral: 'bg-slate-100 text-slate-600',
  };
  const hasChange = changePct !== null;
  const isFlat = hasChange && Math.round(changePct) === 0;
  const isPositive = hasChange && changePct > 0;

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className={cn('flex h-14 w-14 items-center justify-center rounded-full', toneClasses[tone])}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-xl font-semibold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
      {hasChange && (
        <p
          className={cn(
            'text-xs font-medium',
            isFlat ? 'text-slate-400' : isPositive ? 'text-green-600' : 'text-red-600',
          )}
        >
          {isFlat ? '—' : `${isPositive ? '↑' : '↓'} ${Math.abs(Math.round(changePct))}%`}
        </p>
      )}
    </div>
  );
}
