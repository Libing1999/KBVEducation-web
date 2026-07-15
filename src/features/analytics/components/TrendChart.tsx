import type { ReactNode } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/Spinner';
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

/**
 * Shared single-series trend line (Practice/Reflection/Quiz Performance are structurally
 * identical - a title, a color, and a percentage-over-time series - so one parameterized
 * component instead of three near-duplicate files).
 */
export function TrendChart({ title, subtitle, data, isLoading, color, valueSuffix = '%' }: Props) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <CardBody>
        {isLoading ? (
          <LoadingState label="Loading…" />
        ) : !data || data.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">No data in this period yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d: string) => formatDate(d)}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                labelFormatter={(d: ReactNode) => formatDate(d == null ? null : String(d))}
                formatter={(v: unknown) => [`${Number(v)}${valueSuffix}`, title]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={color}
                fillOpacity={0.1}
                dot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}
