import { Link } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Pie, PieChart } from 'recharts';
import {
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
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ModernCard } from '@/components/modern/ModernCard';
import { useAdminCertificates } from '@/features/certificates/hooks/useCertificates';
import { useExportHistory } from '@/features/export/hooks/useExport';
import { useAuditTrailTodayCount } from '@/features/auditTrail/hooks/useAuditTrail';
import { useBackups } from '@/features/backup/hooks/useBackups';
import { useAdminStatistics } from '@/features/progress/hooks/useAdminStats';
import { formatDate, formatFileSize, initials, roleLabel } from '@/lib/format';
import { paths } from '@/routes/paths';
import type { ActivityDay, CohortStatusBreakdown, TopStudent } from '@/features/dashboard/types/dashboard.types';
import type { UserResponse } from '@/features/users/types/user.types';
import type { CohortResponse, CohortStatus } from '@/features/cohorts/types/cohort.types';

const statusColor: Record<CohortStatus, string> = {
  ACTIVE: '#8fd6ae',
  UPCOMING: '#8fc7e8',
  COMPLETED: '#a9b1bf',
  ARCHIVED: '#DBB652',
};

const SERIES = [
  { key: 'reflections', label: 'Reflections', color: '#5f9de0' },
  { key: 'practiceLogs', label: 'Practice Logs', color: '#4fbf7a' },
  { key: 'homeworkSubmissions', label: 'Post-Lesson Homework Submissions', color: '#e87ba4' },
  { key: 'quizAttempts', label: 'Post-Lesson Quiz Attempts', color: '#eda100' },
] as const;

/** Modern-themed port of ActivityOverviewChart — same trend data, dark axis/grid chrome. */
export function ModernActivityChart({ data }: { data: ActivityDay[] }) {
  return (
    <ModernCard title="Activity Overview" subtitle="Daily submissions across the platform">
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-[rgba(238,242,249,.55)]">No activity in this period yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(238,242,249,.08)" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => formatDate(d)}
              tick={{ fontSize: 12, fill: 'rgba(238,242,249,.5)' }}
              axisLine={{ stroke: 'rgba(238,242,249,.15)' }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: 'rgba(238,242,249,.5)' }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              labelFormatter={(d: unknown) => formatDate(d == null ? null : String(d))}
              contentStyle={{ background: '#0C1526', border: '1px solid rgba(238,242,249,.15)', borderRadius: 8 }}
              labelStyle={{ color: '#EEF2F9' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(238,242,249,.6)' }} iconType="line" />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </ModernCard>
  );
}

const SLICES = [
  { key: 'active', label: 'Active', color: '#4fbf7a' },
  { key: 'inactive', label: 'Inactive', color: '#8A93A3' },
  { key: 'upcoming', label: 'Upcoming', color: '#5f9de0' },
] as const;

/** Modern-themed port of CohortStatusChart — same breakdown data, dark chrome. */
export function ModernCohortChart({ breakdown }: { breakdown: CohortStatusBreakdown }) {
  const total = breakdown.active + breakdown.inactive + breakdown.upcoming;
  const data = SLICES.map((s) => ({ ...s, value: breakdown[s.key] }));
  const nonZeroData = data.filter((d) => d.value > 0);

  return (
    <ModernCard title="Cohort Status">
      {total === 0 ? (
        <p className="py-12 text-center text-sm text-[rgba(238,242,249,.55)]">No cohorts yet.</p>
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={nonZeroData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={nonZeroData.length > 1 ? 2 : 0}
                  strokeWidth={0}
                >
                  {nonZeroData.map((d) => (
                    <Cell key={d.key} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown, name: unknown): [string, string] => [
                    `${Number(value)} cohort${Number(value) === 1 ? '' : 's'}`,
                    String(name),
                  ]}
                  contentStyle={{ background: '#0C1526', border: '1px solid rgba(238,242,249,.15)', borderRadius: 8 }}
                  labelStyle={{ color: '#EEF2F9' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-garamond text-2xl font-semibold text-[#F6F9FE]">{total}</p>
              <p className="text-xs text-[rgba(238,242,249,.55)]">Total</p>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5">
            {data.map((d) => (
              <li key={d.key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[rgba(238,242,249,.6)]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} aria-hidden />
                  {d.label}
                </span>
                <span className="font-medium text-[#EEF2F9]">
                  {d.value} ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </ModernCard>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <li className="flex items-center gap-3 px-6 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[.06] text-[rgba(238,242,249,.6)]">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm text-[rgba(238,242,249,.6)]">{label}</span>
      <span className="text-sm font-semibold text-[#EEF2F9]">{value}</span>
    </li>
  );
}

/** Modern-themed port of AdminDashboard's System Summary card — same hooks/data. */
export function ModernSystemSummary({
  lockedAccounts,
  systemHealthy,
}: {
  lockedAccounts: number;
  systemHealthy: boolean;
}) {
  const { data: certificates } = useAdminCertificates();
  const { data: exportHistory } = useExportHistory();
  const todaysExports =
    exportHistory?.filter((h) => new Date(h.createdAt).toDateString() === new Date().toDateString()).length ?? 0;
  const { data: auditEventsToday } = useAuditTrailTodayCount();
  const { data: backups } = useBackups();
  const storageUsageBytes =
    backups?.filter((b) => b.status === 'COMPLETED').reduce((sum, b) => sum + (b.fileSizeBytes ?? 0), 0) ?? 0;

  return (
    <ModernCard title="System Summary" bodyClassName="p-0">
      <ul className="divide-y divide-[rgba(238,242,249,.08)]">
        <SummaryRow icon={Award} label="Total Certificates" value={certificates?.length ?? 0} />
        <SummaryRow icon={FileDown} label="Today's Exports" value={todaysExports} />
        <SummaryRow icon={ShieldCheck} label="Audit Events Today" value={auditEventsToday ?? 0} />
        <SummaryRow icon={HardDrive} label="Storage Usage" value={formatFileSize(storageUsageBytes)} />
        <SummaryRow icon={DatabaseBackup} label="Recent Backups" value={backups?.length ?? 0} />
        <SummaryRow icon={Lock} label="Failed Login Attempts" value={lockedAccounts} />
        <SummaryRow icon={HeartPulse} label="System Health" value={systemHealthy ? 'Healthy' : 'Low Disk Space'} />
      </ul>
    </ModernCard>
  );
}

/** Modern-themed port of AdminDashboard's Daily Activity tiles — same useAdminStatistics data. */
export function ModernDailyActivity() {
  const { data } = useAdminStatistics();
  const tiles = [
    { icon: PenLine, label: "Today's Reflections", value: data?.todayReflections ?? 0 },
    { icon: BookOpenCheck, label: "Today's Practice", value: data?.todayPractice ?? 0 },
    { icon: Clock3, label: 'Pending Reviews', value: data?.pendingReviews ?? 0 },
    { icon: Users, label: 'Active Students', value: data?.activeStudents ?? 0 },
  ];
  return (
    <ModernCard title="Daily Activity" bodyClassName="grid grid-cols-2 gap-4">
      {tiles.map((t) => (
        <div key={t.label} className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[.06] text-[#DBB652]">
            <t.icon className="h-6 w-6" />
          </div>
          <p className="font-garamond text-xl font-semibold text-[#F6F9FE]">{t.value}</p>
          <p className="text-xs text-[rgba(238,242,249,.55)]">{t.label}</p>
        </div>
      ))}
    </ModernCard>
  );
}

/** Modern-themed port of the Top Performing Students table — same trends.topStudents data. */
export function ModernTopStudents({ students }: { students: TopStudent[] }) {
  return (
    <ModernCard
      title="Top Performing Students"
      bodyClassName="p-0"
      action={
        <Link to={paths.admin.leaderboard} className="text-sm font-medium text-[#DBB652] hover:underline">
          View Leaderboard
        </Link>
      }
    >
      {students.length === 0 ? (
        <p className="p-6 text-sm text-[rgba(238,242,249,.55)]">No scored students yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(238,242,249,.08)] text-left text-xs uppercase tracking-wide text-[rgba(238,242,249,.45)]">
              <th className="px-6 py-2 font-medium">#</th>
              <th className="px-2 py-2 font-medium">Student</th>
              <th className="px-6 py-2 text-right font-medium">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(238,242,249,.08)]">
            {students.map((s, i) => (
              <tr key={`${s.studentName}-${i}`}>
                <td className="px-6 py-2.5 text-[rgba(238,242,249,.5)]">{i + 1}</td>
                <td className="px-2 py-2.5">
                  <p className="truncate font-medium text-[#EEF2F9]">{s.studentName}</p>
                  {s.cohortName && <p className="truncate text-xs text-[rgba(238,242,249,.45)]">{s.cohortName}</p>}
                </td>
                <td className="px-6 py-2.5 text-right font-semibold text-[#EEF2F9]">{s.compositeScore.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ModernCard>
  );
}

/** Modern-themed port of Recent Users — same data.recentUsers. */
export function ModernRecentUsers({ users }: { users: UserResponse[] }) {
  return (
    <ModernCard title="Recent Users" subtitle="Newest accounts" bodyClassName="p-0">
      {users.length === 0 ? (
        <p className="p-6 text-sm text-[rgba(238,242,249,.55)]">No users yet.</p>
      ) : (
        <ul className="divide-y divide-[rgba(238,242,249,.08)]">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 px-6 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[.06] text-xs font-semibold text-[#DBB652]">
                {initials(u.firstName, u.lastName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#EEF2F9]">
                  {u.firstName} {u.lastName}
                </p>
                <p className="truncate text-xs text-[rgba(238,242,249,.5)]">{u.email}</p>
              </div>
              <span
                className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: u.status === 'ACTIVE' ? 'rgba(143,214,174,.15)' : 'rgba(238,242,249,.1)',
                  color: u.status === 'ACTIVE' ? '#8fd6ae' : 'rgba(238,242,249,.6)',
                }}
              >
                {roleLabel(u.role)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </ModernCard>
  );
}

/** Modern-themed port of Recent Cohorts — same data.recentCohorts. */
export function ModernRecentCohorts({ cohorts }: { cohorts: CohortResponse[] }) {
  return (
    <ModernCard title="Recent Cohorts" subtitle="Latest intakes" bodyClassName="p-0">
      {cohorts.length === 0 ? (
        <p className="p-6 text-sm text-[rgba(238,242,249,.55)]">No cohorts yet.</p>
      ) : (
        <ul className="divide-y divide-[rgba(238,242,249,.08)]">
          {cohorts.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-6 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#EEF2F9]">{c.name}</p>
                <p className="truncate text-xs text-[rgba(238,242,249,.5)]">
                  {formatDate(c.startDate)} – {formatDate(c.endDate)} · {c.studentCount}
                  {c.maxStudents > 0 ? `/${c.maxStudents}` : ''} students
                </p>
              </div>
              <span
                className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ color: statusColor[c.status], backgroundColor: 'rgba(238,242,249,.08)' }}
              >
                {c.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </ModernCard>
  );
}
