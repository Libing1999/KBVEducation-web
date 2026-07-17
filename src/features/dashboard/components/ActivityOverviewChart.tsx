import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import type { ActivityDay } from '@/features/dashboard/types/dashboard.types';
import { formatDate } from '@/lib/format';

interface Props {
  data: ActivityDay[];
}

// Validated: node scripts/validate_palette.js "#2a78d6,#008300,#e87ba4,#eda100" --mode light --surface "#ffffff"
// First 4 slots of the reference categorical order (the documented all-pairs-CVD-safe subset).
// Magenta/yellow sit below 3:1 contrast on white (the palette's documented "relief rule"), so
// identity here never relies on color alone — the legend + hover tooltip both carry the label.
const SERIES = [
  { key: 'reflections', label: 'Reflections', color: '#2a78d6' },
  { key: 'practiceLogs', label: 'Practice Logs', color: '#008300' },
  { key: 'homeworkSubmissions', label: 'Homework Submissions', color: '#e87ba4' },
  { key: 'quizAttempts', label: 'Quiz Attempts', color: '#eda100' },
] as const;

export function ActivityOverviewChart({ data }: Props) {
  return (
    <Card>
      <CardHeader title="Activity Overview" subtitle="Daily submissions across the platform" />
      <CardBody>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">No activity in this period yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d: string) => formatDate(d)}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip labelFormatter={(d: unknown) => formatDate(d == null ? null : String(d))} />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="line" />
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
      </CardBody>
    </Card>
  );
}
