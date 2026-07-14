import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { useAuditLog } from '@/features/scoring/hooks/useAuditLog';
import type { ScoreAuditEntityType, ScoreAuditLogEntry } from '@/features/scoring/types/scoring.types';
import { formatDateTime } from '@/lib/format';

const PAGE_SIZE = 20;

const ENTITY_TYPES: ScoreAuditEntityType[] = [
  'SCORE_CONFIG',
  'STUDENT_SCORE',
  'TIER',
  'PRACTICE',
  'HOMEWORK',
  'REFLECTION',
  'QUIZ',
];

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const [entityType, setEntityType] = useState<ScoreAuditEntityType | ''>('');

  const { data, isLoading } = useAuditLog({ entityType: entityType || undefined, page, size: PAGE_SIZE });

  const columns: Column<ScoreAuditLogEntry>[] = [
    {
      key: 'createdAt',
      header: 'When',
      render: (r) => <span className="text-slate-600">{formatDateTime(r.createdAt)}</span>,
    },
    {
      key: 'entityType',
      header: 'Entity',
      render: (r) => <Badge tone="info">{r.entityType.replaceAll('_', ' ')}</Badge>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => <span className="font-medium text-slate-800">{r.action.replaceAll('_', ' ')}</span>,
    },
    { key: 'student', header: 'Student', render: (r) => r.studentName ?? '—' },
    {
      key: 'change',
      header: 'Change',
      render: (r) => {
        const change = [r.previousValue, r.newValue].filter(Boolean).join(' → ');
        const text = r.reason || change || '—';
        return (
          <div className="max-w-xs truncate text-xs text-slate-500" title={text}>
            {text}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Score Audit Log" subtitle="Every score-related change: weight edits, tier overrides, and more." />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <Select
            className="w-auto"
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value as ScoreAuditEntityType | '');
              setPage(0);
            }}
          >
            <option value="">All entity types</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replaceAll('_', ' ')}
              </option>
            ))}
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={data?.content ?? []}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="No audit log entries found."
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
