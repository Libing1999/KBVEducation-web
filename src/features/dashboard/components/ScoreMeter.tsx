import { cn } from '@/lib/utils';
import { formatPercent } from '@/lib/format';

interface ScoreMeterProps {
  label: string;
  value: number;
  tone?: 'primary' | 'accent';
}

/** Horizontal progress meter for a 0–100 score. */
export function ScoreMeter({ label, value, tone = 'primary' }: ScoreMeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{formatPercent(clamped)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full', tone === 'accent' ? 'bg-accent' : 'bg-primary')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
