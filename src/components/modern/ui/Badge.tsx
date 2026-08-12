import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

/** Modern UI's Badge — same prop contract as the Default UI's Badge, dark palette. */
const toneClasses: Record<Tone, string> = {
  neutral: 'bg-white/[.08] text-[rgba(238,242,249,.7)]',
  success: 'bg-[#8fd6ae]/15 text-[#8fd6ae]',
  warning: 'bg-[#DBB652]/15 text-[#DBB652]',
  danger: 'bg-[#e08a8a]/15 text-[#e08a8a]',
  info: 'bg-[#8fc7e8]/15 text-[#8fc7e8]',
  accent: 'bg-[#B0821C]/20 text-[#DBB652]',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
