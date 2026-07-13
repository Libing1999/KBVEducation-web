import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-600 focus-visible:ring-primary',
  secondary: 'border border-primary bg-white text-primary hover:bg-primary-50 focus-visible:ring-primary',
  accent: 'bg-accent text-white hover:bg-accent-500 focus-visible:ring-accent',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-primary',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-primary',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, fullWidth, children, disabled, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
