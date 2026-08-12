import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/** Modern UI's PasswordInput — same prop contract as the Default UI's, dark palette. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(
            'h-10 w-full rounded-lg border border-[rgba(238,242,249,.15)] bg-[#0A1424] px-3 pr-10 text-sm text-[#EEF2F9]',
            'placeholder:text-[rgba(238,242,249,.35)]',
            'focus:border-[#B0821C] focus:outline-none focus:ring-2 focus:ring-[#B0821C]/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[rgba(238,242,249,.4)] hover:text-[rgba(238,242,249,.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B0821C]/40"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'ModernPasswordInput';
