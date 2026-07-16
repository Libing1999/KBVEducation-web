import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800',
      'placeholder:text-slate-400',
      'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30',
      'disabled:cursor-not-allowed disabled:bg-secondary',
      'aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/20',
      className,
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';
