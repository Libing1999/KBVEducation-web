import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/Spinner';
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
}

const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' } as const;

/** Lightweight, typed data table with loading and empty states. */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-secondary">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500',
                  alignClass[col.align ?? 'left'],
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
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
              <td colSpan={columns.length} className="py-12 text-center text-sm text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-secondary/60">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn('px-4 py-3 text-slate-700', alignClass[col.align ?? 'left'], col.className)}
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
