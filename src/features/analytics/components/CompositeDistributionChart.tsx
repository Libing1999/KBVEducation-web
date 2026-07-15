import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

interface Props {
  scores: number[];
}

const BUCKETS = [
  { label: '0–20', min: 0, max: 20 },
  { label: '20–40', min: 20, max: 40 },
  { label: '40–60', min: 40, max: 60 },
  { label: '60–80', min: 60, max: 80 },
  { label: '80–100', min: 80, max: 100 },
];

/** Histogram of composite scores across a cohort. Sequential job, one hue - bar height already carries magnitude. */
export function CompositeDistributionChart({ scores }: Props) {
  const data = BUCKETS.map((b) => ({
    label: b.label,
    count: scores.filter((s) => s >= b.min && (b.max === 100 ? s <= 100 : s < b.max)).length,
  }));

  return (
    <Card>
      <CardHeader title="Composite Score Distribution" subtitle="Number of students per score band" />
      <CardBody>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip formatter={(v: unknown) => [`${Number(v)} student${Number(v) === 1 ? '' : 's'}`, 'Count']} />
            <Bar dataKey="count" fill="#3F6FA8" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
