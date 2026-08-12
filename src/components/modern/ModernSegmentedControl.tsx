import { cn } from '@/lib/utils';

interface ModernSegmentedControlProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Purely presentational pill toggle (e.g. the Student/Parent tabs on the
 * Modern login screen). It never influences the login payload — role is
 * still resolved server-side from credentials, exactly as in the Default UI.
 */
export function ModernSegmentedControl({
  options,
  value,
  onChange,
  className,
}: ModernSegmentedControlProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'grid grid-cols-2 gap-1 rounded-xl border border-[rgba(255,255,255,.13)] bg-white/5 p-1',
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={value === option}
          onClick={() => onChange(option)}
          className={cn(
            'min-h-11 rounded-[9px] px-[11px] py-[11px] text-[13px] transition-colors',
            value === option
              ? 'bg-white/10 text-[#EEF2F9] shadow-[0_1px_3px_rgba(0,0,0,.3)]'
              : 'text-[rgba(238,242,249,.72)] hover:text-[#EEF2F9]',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
