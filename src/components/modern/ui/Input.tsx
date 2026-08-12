import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

/** Modern UI's Input — same prop contract as the Default UI's Input, dark palette. */
export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-10 w-full rounded-lg border border-[rgba(238,242,249,.15)] bg-[#0A1424] px-3 text-sm text-[#EEF2F9]',
      'placeholder:text-[rgba(238,242,249,.35)]',
      'focus:border-[#B0821C] focus:outline-none focus:ring-2 focus:ring-[#B0821C]/30',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/20',
      className,
    )}
    {...props}
  />
));

Input.displayName = 'ModernInput';
