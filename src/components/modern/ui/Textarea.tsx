import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Modern UI's Textarea — same prop contract as the Default UI's, dark palette. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-lg border border-[rgba(238,242,249,.15)] bg-[#0A1424] px-3 py-2 text-sm text-[#EEF2F9]',
      'placeholder:text-[rgba(238,242,249,.35)]',
      'focus:border-[#B0821C] focus:outline-none focus:ring-2 focus:ring-[#B0821C]/30',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/20',
      className,
    )}
    {...props}
  />
));

Textarea.displayName = 'ModernTextarea';
