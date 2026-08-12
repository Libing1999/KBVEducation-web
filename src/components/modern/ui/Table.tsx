import type { ReactNode } from 'react';
import { Spinner } from '@/components/modern/ui/Spinner';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  rowClassName?: (row: T) => string | undefined;
}

const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' } as const;

/** Modern UI's DataTable — same prop contract as the Default UI's, dark palette. */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading,
  emptyMessage = 'No records found.',
  rowClassName,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[rgba(238,242,249,.1)] bg-white/[.02]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]',
                  alignClass[col.align ?? 'left'],
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(238,242,249,.08)]">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-12">
                <div className="flex justify-center">
                  <Spinner className="h-6 w-6" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-sm text-[rgba(238,242,249,.5)]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className={cn('hover:bg-white/[.03]', rowClassName?.(row))}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn('px-4 py-3 text-[rgba(238,242,249,.8)]', alignClass[col.align ?? 'left'], col.className)}
                  >
                    {col.render ? col.render(row) : (row as Record<string, ReactNode>)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
