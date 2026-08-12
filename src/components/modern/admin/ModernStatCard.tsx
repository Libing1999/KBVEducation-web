import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'primary' | 'accent' | 'neutral';

const toneClasses: Record<Tone, string> = {
  primary: 'bg-white/[.06] text-[#8fc7e8]',
  accent: 'bg-white/[.06] text-[#DBB652]',
  neutral: 'bg-white/[.06] text-[rgba(238,242,249,.6)]',
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: Tone;
}

/** Modern port of StatCard — same prop contract, dark styling. */
export function ModernStatCard({ label, value, icon: Icon, tone = 'primary' }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[rgba(238,242,249,.12)] bg-white/[.03] p-4">
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', toneClasses[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-[rgba(238,242,249,.55)]">{label}</p>
        <p className="font-garamond text-2xl font-semibold text-[#F6F9FE]">{value}</p>
      </div>
    </div>
  );
}
