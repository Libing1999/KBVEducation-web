import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/** Modern UI's Select — same prop contract as the Default UI's Select, dark palette. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'h-10 w-full rounded-lg border border-[rgba(238,242,249,.15)] bg-[#0A1424] px-3 text-sm text-[#EEF2F9]',
      'focus:border-[#B0821C] focus:outline-none focus:ring-2 focus:ring-[#B0821C]/30',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-[invalid=true]:border-red-500',
      className,
    )}
    {...props}
  />
));

Select.displayName = 'ModernSelect';
