import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import type { CohortStatusBreakdown } from '@/features/dashboard/types/dashboard.types';

interface Props {
  breakdown: CohortStatusBreakdown;
}

// Matches this app's existing cohort-status badge convention (success/neutral/info)
// rather than the categorical series order — these are lifecycle states, not
// freely-chosen series identity, so staying consistent with Badge/statusTone
// elsewhere in the app matters more than a fresh categorical assignment.
const SLICES = [
  { key: 'active', label: 'Active', color: '#16a34a' },
  { key: 'inactive', label: 'Inactive', color: '#94a3b8' },
  { key: 'upcoming', label: 'Upcoming', color: '#3F6FA8' },
] as const;

export function CohortStatusChart({ breakdown }: Props) {
  const total = breakdown.active + breakdown.inactive + breakdown.upcoming;
  const data = SLICES.map((s) => ({ ...s, value: breakdown[s.key] }));
  // Recharts still reserves angular space (via paddingAngle) for zero-value
  // slices, which draws a visibly broken ring when only one category has
  // data (the common case for a fresh cohort list) — drop them from the Pie
  // itself; the legend list below still shows every category at 0.
  const nonZeroData = data.filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader title="Cohort Status" />
      <CardBody>
        {total === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">No cohorts yet.</p>
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
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-semibold text-slate-800">{total}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {data.map((d) => (
                <li key={d.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} aria-hidden />
                    {d.label}
                  </span>
                  <span className="font-medium text-slate-800">
                    {d.value} ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardBody>
    </Card>
  );
}
