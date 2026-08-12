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

/** Modern UI's Button — same prop contract as the Default UI's Button, dark/gold palette. */
const variantClasses: Record<Variant, string> = {
  primary: 'bg-gradient-to-b from-[#DBB652] to-[#B0821C] text-[#231803] hover:opacity-95',
  secondary: 'border border-[rgba(238,242,249,.2)] bg-white/[.04] text-[#EEF2F9] hover:bg-white/[.08]',
  accent: 'bg-gradient-to-b from-[#DBB652] to-[#B0821C] text-[#231803] hover:opacity-95',
  outline: 'border border-[rgba(238,242,249,.2)] text-[#EEF2F9] hover:bg-white/[.06]',
  ghost: 'text-[rgba(238,242,249,.7)] hover:bg-white/[.06] hover:text-[#EEF2F9]',
  danger: 'bg-[#8B2E2E] text-white hover:bg-[#a33636]',
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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1428] focus-visible:ring-[#DBB652]',
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

Button.displayName = 'ModernButton';
