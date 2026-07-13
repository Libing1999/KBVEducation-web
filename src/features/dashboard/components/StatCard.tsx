import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'primary' | 'accent' | 'neutral';

const toneClasses: Record<Tone, string> = {
  primary: 'bg-primary-50 text-primary',
  accent: 'bg-accent-50 text-accent-500',
  neutral: 'bg-slate-100 text-slate-600',
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: Tone;
}

export function StatCard({ label, value, icon: Icon, tone = 'primary' }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-card border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover">
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', toneClasses[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
