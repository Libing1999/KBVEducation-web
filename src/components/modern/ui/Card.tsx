import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DivProps = HTMLAttributes<HTMLDivElement>;

/** Modern UI's Card/CardHeader/CardBody — same prop contract as the Default UI's, dark/gold palette. */
export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn('rounded-2xl border border-[rgba(238,242,249,.12)] bg-white/[.03]', className)}
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
    <div className={cn('flex items-start justify-between gap-4 border-b border-[rgba(238,242,249,.1)] p-5', className)}>
      <div>
        <h3 className="font-garamond text-base font-medium text-[#F6F9FE]">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-[rgba(238,242,249,.55)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: DivProps) {
  return <div className={cn('p-5', className)} {...props} />;
}
