import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModernCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Dark navy/gold card matching the KpiTile visual language — the Modern UI's Card equivalent. */
export function ModernCard({ title, subtitle, action, children, className, bodyClassName }: ModernCardProps) {
  return (
    <div className={cn('rounded-2xl border border-[rgba(238,242,249,.12)] bg-white/[.03]', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(238,242,249,.1)] px-6 py-4">
          <div>
            {title && <h3 className="font-garamond text-base font-medium text-[#F6F9FE]">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-[rgba(238,242,249,.55)]">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn('p-6', bodyClassName)}>{children}</div>
    </div>
  );
}
