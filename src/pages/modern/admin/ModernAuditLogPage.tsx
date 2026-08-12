import { useState } from 'react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card } from '@/components/modern/ui/Card';
import { Select } from '@/components/modern/ui/Select';
import { Badge } from '@/components/modern/ui/Badge';
import { DataTable, type Column } from '@/components/modern/ui/Table';
import { Pagination } from '@/components/modern/ui/Pagination';
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

/** Modern port of AuditLogPage — same hooks/columns, dark styling. */
export default function ModernAuditLogPage() {
  const [page, setPage] = useState(0);
  const [entityType, setEntityType] = useState<ScoreAuditEntityType | ''>('');

  const { data, isLoading } = useAuditLog({ entityType: entityType || undefined, page, size: PAGE_SIZE });

  const columns: Column<ScoreAuditLogEntry>[] = [
    {
      key: 'createdAt',
      header: 'When',
      render: (r) => <span className="text-[rgba(238,242,249,.75)]">{formatDateTime(r.createdAt)}</span>,
    },
    {
      key: 'entityType',
      header: 'Entity',
      render: (r) => <Badge tone="info">{r.entityType.replaceAll('_', ' ')}</Badge>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => <span className="font-medium text-[#EEF2F9]">{r.action.replaceAll('_', ' ')}</span>,
    },
    { key: 'student', header: 'Student', render: (r) => r.studentName ?? '—' },
    {
      key: 'change',
      header: 'Change',
      render: (r) => {
        const change = [r.previousValue, r.newValue].filter(Boolean).join(' → ');
        const text = r.reason || change || '—';
        return (
          <div className="max-w-xs truncate text-xs text-[rgba(238,242,249,.5)]" title={text}>
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
        <div className="flex flex-wrap items-center gap-3 border-b border-[rgba(238,242,249,.1)] p-4">
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
