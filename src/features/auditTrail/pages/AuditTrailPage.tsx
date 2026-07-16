import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { useAuditTrail } from '@/features/auditTrail/hooks/useAuditTrail';
import type { AuditTrailEntry } from '@/features/auditTrail/types/auditTrail.types';
import { formatDateTime } from '@/lib/format';

const PAGE_SIZE = 20;

// The explicit action list @Audited is applied to (Phase 5 Step 4) — see AuditAspect.
const ACTIONS = [
  'LOGIN', 'LOGIN_FAILED', 'LOGOUT',
  'USER_CREATED', 'USER_UPDATED', 'USER_STATUS_CHANGED',
  'LESSON_CREATED', 'QUIZ_EDITED', 'HOMEWORK_DELETED', 'REFLECTION_EDITED',
  'PRACTICE_APPROVED', 'TIER_OVERRIDDEN', 'CERTIFICATE_GENERATED', 'EXPORT_GENERATED',
];

export default function AuditTrailPage() {
  const [page, setPage] = useState(0);
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading } = useAuditTrail({
    action: action || undefined,
    entityType: entityType || undefined,
    from: from ? `${from}T00:00:00Z` : undefined,
    to: to ? `${to}T23:59:59Z` : undefined,
    page,
    size: PAGE_SIZE,
  });

  const columns: Column<AuditTrailEntry>[] = [
    {
      key: 'createdAt',
      header: 'When',
      render: (r) => <span className="text-slate-600">{formatDateTime(r.createdAt)}</span>,
    },
    { key: 'actorName', header: 'Actor', render: (r) => <span className="font-medium text-slate-800">{r.actorName}</span> },
    { key: 'action', header: 'Action', render: (r) => <Badge tone="info">{r.action.replaceAll('_', ' ')}</Badge> },
    { key: 'entityType', header: 'Entity', render: (r) => r.entityType.replaceAll('_', ' ') },
    {
      key: 'ipAddress',
      header: 'IP',
      render: (r) => <span className="font-mono text-xs text-slate-500">{r.ipAddress ?? '—'}</span>,
    },
    {
      key: 'newValue',
      header: 'Detail',
      render: (r) => (
        <div className="max-w-xs truncate text-xs text-slate-500" title={r.newValue ?? ''}>
          {r.newValue ?? '—'}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Trail"
        subtitle="Every login, CRUD action, certificate, and export the platform has recorded."
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <Select
            className="w-auto"
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(0); }}
          >
            <option value="">All actions</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>{a.replaceAll('_', ' ')}</option>
            ))}
          </Select>
          <Input
            className="w-auto"
            placeholder="Entity type (e.g. USER)"
            value={entityType}
            onChange={(e) => { setEntityType(e.target.value); setPage(0); }}
          />
          <Input type="date" className="w-auto" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} />
          <span className="text-sm text-slate-400">to</span>
          <Input type="date" className="w-auto" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} />
        </div>

        <DataTable
          columns={columns}
          data={data?.content ?? []}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="No audit trail entries found."
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
