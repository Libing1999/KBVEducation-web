import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

interface Props {
  distribution: Record<string, number>;
}

// Ordinal ramp (best tier = darkest -> worst = lightest), one hue, monotone lightness.
// Validated: node scripts/validate_palette.js "#081322,#122845,#1B3A6B,#6E97C7" --mode light --ordinal
const TIER_RAMP = ['#081322', '#122845', '#1B3A6B', '#6E97C7'];

/** Tiers are ordinal (rank order carries meaning), so this is a one-hue ramp, not categorical colors. */
export function TierDistributionChart({ distribution }: Props) {
  const data = Object.entries(distribution).map(([tier, count]) => ({ tier, count }));

  return (
    <Card>
      <CardHeader title="Tier Distribution" subtitle="Students per graduation tier" />
      <CardBody>
        <ResponsiveContainer width="100%" height={Math.max(180, data.length * 48)}>
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 32, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="0" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="tier" tick={{ fontSize: 12, fill: '#1e293b' }} axisLine={false} tickLine={false} width={90} />
            <Tooltip formatter={(v: unknown) => [`${Number(v)} student${Number(v) === 1 ? '' : 's'}`, 'Count']} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {data.map((_, i) => (
                <Cell key={data[i].tier} fill={TIER_RAMP[i % TIER_RAMP.length]} />
              ))}
              <LabelList dataKey="count" position="right" style={{ fill: '#1e293b', fontSize: 12, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
