import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Sparkline } from '@/features/dashboard/components/Sparkline';
import type { DailyValue } from '@/features/dashboard/types/dashboard.types';
import { cn } from '@/lib/utils';

type Tone = 'primary' | 'accent' | 'neutral';

const toneClasses: Record<Tone, string> = {
  primary: 'bg-primary-50 text-primary',
  accent: 'bg-accent-50 text-accent-500',
  neutral: 'bg-slate-100 text-slate-600',
};

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: Tone;
  /** null/undefined = no comparable baseline (e.g. growth from zero) — shown as a flat dash, not a fabricated number. */
  changePct?: number | null;
  changeLabel: string;
  sparkline?: DailyValue[];
  sparklineColor: string;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = 'primary',
  changePct,
  changeLabel,
  sparkline,
  sparklineColor,
}: Props) {
  const hasChange = changePct !== null && changePct !== undefined;
  const isFlat = hasChange && Math.round(changePct) === 0;
  const isPositive = hasChange && changePct > 0;

  return (
    <div className="flex flex-col gap-3 rounded-card border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="truncate text-sm text-slate-500">{label}</p>
      </div>

      <p className="text-2xl font-semibold text-slate-800">{value}</p>

      <p
        className={cn(
          'flex items-center gap-1 text-xs font-medium',
          !hasChange && 'text-slate-400',
          hasChange && isFlat && 'text-slate-400',
          hasChange && !isFlat && isPositive && 'text-green-600',
          hasChange && !isFlat && !isPositive && 'text-red-600',
        )}
      >
        {hasChange && !isFlat && (isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />)}
        {hasChange ? (isFlat ? '—' : `${isPositive ? '+' : ''}${Math.round(changePct)}%`) : '—'}
        <span className="font-normal text-slate-400">{changeLabel}</span>
      </p>

      {sparkline && <Sparkline data={sparkline} color={sparklineColor} />}
    </div>
  );
}
