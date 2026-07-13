import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn('rounded-card border border-slate-200 bg-white shadow-card', className)}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-slate-100 p-5', className)}>
      <div>
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: DivProps) {
  return <div className={cn('p-5', className)} {...props} />;
}
