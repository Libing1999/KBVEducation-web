import { useState } from 'react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card } from '@/components/modern/ui/Card';
import { Select } from '@/components/modern/ui/Select';
import { Badge } from '@/components/modern/ui/Badge';
import { DataTable, type Column } from '@/components/modern/ui/Table';
import { Pagination } from '@/components/modern/ui/Pagination';
import { useApplicationLogs } from '@/features/applicationLogs/hooks/useApplicationLogs';
import type { ApplicationLogEntry, LogSeverity } from '@/features/applicationLogs/types/applicationLog.types';
import { formatDateTime } from '@/lib/format';

const PAGE_SIZE = 20;

/** Modern port of ApplicationLogsPage — same hooks/columns, dark styling. */
export default function ModernApplicationLogsPage() {
  const [page, setPage] = useState(0);
  const [severity, setSeverity] = useState<LogSeverity | ''>('');

  const { data, isLoading } = useApplicationLogs({
    severity: severity || undefined,
    page,
    size: PAGE_SIZE,
  });

  const columns: Column<ApplicationLogEntry>[] = [
    {
      key: 'createdAt',
      header: 'When',
      render: (r) => <span className="text-[rgba(238,242,249,.75)]">{formatDateTime(r.createdAt)}</span>,
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (r) => <Badge tone={r.severity === 'ERROR' ? 'danger' : 'warning'}>{r.severity}</Badge>,
    },
    { key: 'source', header: 'Source', render: (r) => <span className="font-mono text-xs text-[rgba(238,242,249,.8)]">{r.source}</span> },
    {
      key: 'endpoint',
      header: 'Endpoint',
      render: (r) => (
        <span className="text-xs text-[rgba(238,242,249,.5)]">
          {r.httpMethod ?? ''} {r.endpoint ?? '—'}
        </span>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      render: (r) => (
        <div className="max-w-md truncate text-xs text-[rgba(238,242,249,.75)]" title={r.message ?? ''}>
          {r.message ?? '—'}
        </div>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP',
      render: (r) => <span className="font-mono text-xs text-[rgba(238,242,249,.5)]">{r.ipAddress ?? '—'}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Application Logs"
        subtitle="Unhandled errors and authentication/authorization warnings captured by the API."
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-[rgba(238,242,249,.1)] p-4">
          <Select
            className="w-auto"
            value={severity}
            onChange={(e) => { setSeverity(e.target.value as LogSeverity | ''); setPage(0); }}
          >
            <option value="">All severities</option>
            <option value="ERROR">Error</option>
            <option value="WARNING">Warning</option>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={data?.content ?? []}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="No application log entries found."
        />
        <Pagination
          page={data?.page ?? 0}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
