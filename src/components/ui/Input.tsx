import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800',
      'placeholder:text-slate-400',
      'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30',
      'disabled:cursor-not-allowed disabled:bg-secondary',
      'aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/20',
      className,
    )}
    {...props}
  />
));

Input.displayName = 'Input';
