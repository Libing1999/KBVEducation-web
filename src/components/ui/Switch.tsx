import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/** Accessible boolean toggle: a visually-hidden checkbox styled via peer-* variants, so it registers with react-hook-form exactly like a native checkbox. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ className, ...props }, ref) => (
  <label className={cn('relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center', className)}>
    <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
    <span
      className={cn(
        'absolute inset-0 rounded-full bg-slate-300 transition-colors',
        'peer-checked:bg-accent',
        'peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 peer-focus-visible:ring-offset-2',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
      )}
    />
    <span className="relative ml-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
  </label>
));

Switch.displayName = 'Switch';
