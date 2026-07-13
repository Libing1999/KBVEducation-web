import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800',
      'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30',
      'disabled:cursor-not-allowed disabled:bg-secondary',
      'aria-[invalid=true]:border-red-500',
      className,
    )}
    {...props}
  />
));

Select.displayName = 'Select';
