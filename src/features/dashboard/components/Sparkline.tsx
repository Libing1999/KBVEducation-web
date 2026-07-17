import { Line, LineChart, ResponsiveContainer } from 'recharts';
import type { DailyValue } from '@/features/dashboard/types/dashboard.types';

interface Props {
  data: DailyValue[];
  color: string;
}

/**
 * Decorative mini trend line inside a KPI tile. The tile's own number and
 * %-change text carry the real, readable data — this is a supplementary
 * visual accent, not an interactive chart, so it intentionally skips
 * axes/grid/tooltip (the "bare stat tile" exception to the hover-layer rule).
 */
export function Sparkline({ data, color }: Props) {
  if (data.length < 2) return null;
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
