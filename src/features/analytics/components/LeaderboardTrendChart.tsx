import type { ReactNode } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/Spinner';
import type { StudentTrend } from '@/features/analytics/types/analytics.types';
import { formatDate } from '@/lib/format';

interface Props {
  students: StudentTrend[] | undefined;
  isLoading?: boolean;
}

// Fixed-order categorical palette, identity (which student), never cycled or re-sorted by rank.
// Validated: node scripts/validate_palette.js "#3F6FA8,#C4972A,#0D9488,#DC2626,#7C3AED,#16A34A" --mode light
// (all 6 slots pass; the gold slot's sub-3:1 contrast WARN is covered by the legend + tooltip below.)
const SERIES_COLORS = ['#3F6FA8', '#C4972A', '#0D9488', '#DC2626', '#7C3AED', '#16A34A'];

/** Per-student composite-score history for the current top performers - a proxy for rank-over-time, since leaderboard_snapshot is a disposable cache with no history of its own (see Step 5). */
export function LeaderboardTrendChart({ students, isLoading }: Props) {
  const merged = mergeByDate(students ?? []);

  return (
    <Card>
      <CardHeader title="Leaderboard Trend" subtitle="Composite score over time — top performers" />
      <CardBody>
        {isLoading ? (
          <LoadingState label="Loading…" />
        ) : !students || students.length === 0 || merged.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">Not enough score history yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={merged} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d: string) => formatDate(d)}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip labelFormatter={(d: ReactNode) => formatDate(d == null ? null : String(d))} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
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
      </CardBody>
    </Card>
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
