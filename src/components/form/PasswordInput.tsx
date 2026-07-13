import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/** Password field with a show/hide toggle. Forwards ref for React Hook Form. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(
            'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-800',
            'placeholder:text-slate-400',
            'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30',
            'disabled:cursor-not-allowed disabled:bg-secondary',
            'aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
