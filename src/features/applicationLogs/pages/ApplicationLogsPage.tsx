import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { useApplicationLogs } from '@/features/applicationLogs/hooks/useApplicationLogs';
import type { ApplicationLogEntry, LogSeverity } from '@/features/applicationLogs/types/applicationLog.types';
import { formatDateTime } from '@/lib/format';

const PAGE_SIZE = 20;

export default function ApplicationLogsPage() {
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
      render: (r) => <span className="text-slate-600">{formatDateTime(r.createdAt)}</span>,
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (r) => <Badge tone={r.severity === 'ERROR' ? 'danger' : 'warning'}>{r.severity}</Badge>,
    },
    { key: 'source', header: 'Source', render: (r) => <span className="font-mono text-xs text-slate-700">{r.source}</span> },
    {
      key: 'endpoint',
      header: 'Endpoint',
      render: (r) => (
        <span className="text-xs text-slate-500">
          {r.httpMethod ?? ''} {r.endpoint ?? '—'}
        </span>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      render: (r) => (
        <div className="max-w-md truncate text-xs text-slate-600" title={r.message ?? ''}>
          {r.message ?? '—'}
        </div>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP',
      render: (r) => <span className="font-mono text-xs text-slate-500">{r.ipAddress ?? '—'}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Application Logs"
        subtitle="Unhandled errors and authentication/authorization warnings captured by the API."
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
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
