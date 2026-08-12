import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ModernCard } from '@/components/modern/ModernCard';

interface Props {
  distribution: Record<string, number>;
}

// Ordinal ramp matching the Modern gold register (best tier = brightest gold -> worst = dim).
const TIER_RAMP = ['#F4D888', '#DBB652', '#B0821C', '#6b5210'];

/** Modern port of TierDistributionChart — same ordinal data, dark chrome. */
export function ModernTierDistributionChart({ distribution }: Props) {
  const data = Object.entries(distribution).map(([tier, count]) => ({ tier, count }));

  return (
    <ModernCard title="Tier Distribution" subtitle="Students per graduation tier">
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 48)}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 32, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="rgba(238,242,249,.08)" strokeDasharray="0" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: 'rgba(238,242,249,.5)' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="tier" tick={{ fontSize: 12, fill: '#EEF2F9' }} axisLine={false} tickLine={false} width={90} />
          <Tooltip
            formatter={(v: unknown) => [`${Number(v)} student${Number(v) === 1 ? '' : 's'}`, 'Count']}
            contentStyle={{ background: '#0C1526', border: '1px solid rgba(238,242,249,.15)', borderRadius: 8 }}
            labelStyle={{ color: '#EEF2F9' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {data.map((_, i) => (
              <Cell key={data[i].tier} fill={TIER_RAMP[i % TIER_RAMP.length]} />
            ))}
            <LabelList dataKey="count" position="right" style={{ fill: '#EEF2F9', fontSize: 12, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ModernCard>
  );
}
