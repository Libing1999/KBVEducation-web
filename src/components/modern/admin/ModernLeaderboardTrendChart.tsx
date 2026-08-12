import type { ReactNode } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ModernCard } from '@/components/modern/ModernCard';
import { LoadingState } from '@/components/modern/ui/Spinner';
import type { StudentTrend } from '@/features/analytics/types/analytics.types';
import { formatDate } from '@/lib/format';

interface Props {
  students: StudentTrend[] | undefined;
  isLoading?: boolean;
}

const SERIES_COLORS = ['#DBB652', '#8fc7e8', '#8fd6ae', '#e08a8a', '#c9a6f0', '#f0b46b'];

/** Modern port of LeaderboardTrendChart — same per-student trend data, dark chrome. */
export function ModernLeaderboardTrendChart({ students, isLoading }: Props) {
  const merged = mergeByDate(students ?? []);

  return (
    <ModernCard title="Leaderboard Trend" subtitle="Composite score over time — top performers">
      {isLoading ? (
        <LoadingState label="Loading…" />
      ) : !students || students.length === 0 || merged.length === 0 ? (
        <p className="py-12 text-center text-sm text-[rgba(238,242,249,.55)]">Not enough score history yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={merged} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(238,242,249,.08)" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => formatDate(d)}
              tick={{ fontSize: 12, fill: 'rgba(238,242,249,.5)' }}
              axisLine={{ stroke: 'rgba(238,242,249,.15)' }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis tick={{ fontSize: 12, fill: 'rgba(238,242,249,.5)' }} axisLine={false} tickLine={false} width={32} />
            <Tooltip
              labelFormatter={(d: ReactNode) => formatDate(d == null ? null : String(d))}
              contentStyle={{ background: '#0C1526', border: '1px solid rgba(238,242,249,.15)', borderRadius: 8 }}
              labelStyle={{ color: '#EEF2F9' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(238,242,249,.6)' }} />
            {students.map((s, i) => (
              <Line
                key={s.studentId}
                type="monotone"
                dataKey={s.studentId}
                name={s.studentName}
                stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </ModernCard>
  );
}

function mergeByDate(students: StudentTrend[]): Record<string, string | number>[] {
  const byDate = new Map<string, Record<string, string | number>>();
  for (const student of students) {
    for (const point of student.points) {
      const row = byDate.get(point.date) ?? { date: point.date };
      row[student.studentId] = point.value;
      byDate.set(point.date, row);
    }
  }
  return Array.from(byDate.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));
}
