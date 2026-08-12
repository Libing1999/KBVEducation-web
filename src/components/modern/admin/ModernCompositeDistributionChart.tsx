import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ModernCard } from '@/components/modern/ModernCard';

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

/** Modern port of CompositeDistributionChart — same buckets, dark chrome. */
export function ModernCompositeDistributionChart({ scores }: Props) {
  const data = BUCKETS.map((b) => ({
    label: b.label,
    count: scores.filter((s) => s >= b.min && (b.max === 100 ? s <= 100 : s < b.max)).length,
  }));

  return (
    <ModernCard title="Composite Score Distribution" subtitle="Number of students per score band">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(238,242,249,.08)" strokeDasharray="0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'rgba(238,242,249,.5)' }} axisLine={{ stroke: 'rgba(238,242,249,.15)' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'rgba(238,242,249,.5)' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            formatter={(v: unknown) => [`${Number(v)} student${Number(v) === 1 ? '' : 's'}`, 'Count']}
            contentStyle={{ background: '#0C1526', border: '1px solid rgba(238,242,249,.15)', borderRadius: 8 }}
            labelStyle={{ color: '#EEF2F9' }}
          />
          <Bar dataKey="count" fill="#DBB652" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </ModernCard>
  );
}
