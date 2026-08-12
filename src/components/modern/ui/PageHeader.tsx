import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

/** Modern UI's PageHeader — same prop contract as the Default UI's, dark/Garamond palette. */
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-garamond text-xl font-medium text-[#F6F9FE]">{title}</h1>
        {subtitle && <p className="text-sm text-[rgba(238,242,249,.55)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
