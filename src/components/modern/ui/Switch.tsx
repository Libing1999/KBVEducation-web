import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/** Modern UI's Switch — same prop contract as the Default UI's, dark/gold palette. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ className, ...props }, ref) => (
  <label className={cn('relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center', className)}>
    <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
    <span
      className={cn(
        'absolute inset-0 rounded-full bg-white/[.12] transition-colors',
        'peer-checked:bg-[#B0821C]',
        'peer-focus-visible:ring-2 peer-focus-visible:ring-[#B0821C]/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#0C1526]',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
      )}
    />
    <span className="relative ml-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
  </label>
));

Switch.displayName = 'ModernSwitch';
