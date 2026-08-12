import type { ReactNode } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ModernCard } from '@/components/modern/ModernCard';
import { LoadingState } from '@/components/modern/ui/Spinner';
import type { TrendPoint } from '@/features/analytics/types/analytics.types';
import { formatDate } from '@/lib/format';

interface Props {
  title: string;
  subtitle?: string;
  data: TrendPoint[] | undefined;
  isLoading?: boolean;
  color: string;
  valueSuffix?: string;
}

/** Modern port of TrendChart — same shared single-series pattern, dark chrome. */
export function ModernTrendChart({ title, subtitle, data, isLoading, color, valueSuffix = '%' }: Props) {
  return (
    <ModernCard title={title} subtitle={subtitle}>
      {isLoading ? (
        <LoadingState label="Loading…" />
      ) : !data || data.length === 0 ? (
        <p className="py-12 text-center text-sm text-[rgba(238,242,249,.55)]">No data in this period yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(238,242,249,.08)" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => formatDate(d)}
              tick={{ fontSize: 12, fill: 'rgba(238,242,249,.5)' }}
              axisLine={{ stroke: 'rgba(238,242,249,.15)' }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis tick={{ fontSize: 12, fill: 'rgba(238,242,249,.5)' }} axisLine={false} tickLine={false} width={36} />
            <Tooltip
              labelFormatter={(d: ReactNode) => formatDate(d == null ? null : String(d))}
              formatter={(v: unknown) => [`${Number(v)}${valueSuffix}`, title]}
              contentStyle={{ background: '#0C1526', border: '1px solid rgba(238,242,249,.15)', borderRadius: 8 }}
              labelStyle={{ color: '#EEF2F9' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={color}
              fillOpacity={0.15}
              dot={{ r: 4, fill: color, stroke: '#0C1526', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ModernCard>
  );
}
