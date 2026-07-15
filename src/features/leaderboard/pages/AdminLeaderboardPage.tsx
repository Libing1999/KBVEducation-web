import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { useCohorts } from '@/features/cohorts/hooks/useCohorts';
import { useAdminLeaderboard, useRegenerateLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard';
import type { LeaderboardEntry, LeaderboardSortField } from '@/features/leaderboard/types/leaderboard.types';
import { ExportButtons } from '@/features/export/components/ExportButtons';
import { exportApi } from '@/features/export/api/exportApi';

const PAGE_SIZE = 20;

const SORT_OPTIONS: { value: LeaderboardSortField; label: string }[] = [
  { value: 'COMPOSITE', label: 'Composite Score' },
  { value: 'PRACTICE', label: 'Practice %' },
  { value: 'REFLECTION', label: 'Reflection %' },
  { value: 'HOMEWORK', label: 'Homework %' },
  { value: 'QUIZ', label: 'Quiz %' },
];

export default function AdminLeaderboardPage() {
  const [cohortId, setCohortId] = useState('');
  const [sortBy, setSortBy] = useState<LeaderboardSortField>('COMPOSITE');
  const [page, setPage] = useState(0);

  const { data: cohortPage } = useCohorts({ page: 0, size: 100 });
  const cohorts = cohortPage?.content ?? [];
  // Defaults to the first cohort once the list loads - the endpoint requires one - without
  // needing an effect: derived from render state, only diverges once the user picks one.
  const effectiveCohortId = cohortId || cohorts[0]?.id || '';

  const { data, isLoading } = useAdminLeaderboard({ cohortId: effectiveCohortId, sortBy, page, size: PAGE_SIZE });
  const regenerate = useRegenerateLeaderboard();

  const columns: Column<LeaderboardEntry>[] = [
    { key: 'rank', header: 'Rank', render: (e) => <span className="font-semibold text-slate-800">#{e.rank}</span> },
    { key: 'name', header: 'Name', render: (e) => e.studentName },
    { key: 'composite', header: 'Composite', align: 'right', render: (e) => e.compositeScore.toFixed(1) },
    {
      key: 'tier',
      header: 'Tier',
      render: (e) => (e.currentTier ? <Badge tone="accent">{e.currentTier}</Badge> : '—'),
    },
    { key: 'practice', header: 'Practice %', align: 'right', render: (e) => `${e.practicePercentage.toFixed(1)}%` },
    { key: 'reflection', header: 'Reflection %', align: 'right', render: (e) => `${e.reflectionPercentage.toFixed(1)}%` },
    { key: 'homework', header: 'Homework %', align: 'right', render: (e) => `${e.homeworkPercentage.toFixed(1)}%` },
    { key: 'quiz', header: 'Quiz %', align: 'right', render: (e) => `${e.quizPercentage.toFixed(1)}%` },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leaderboard"
        subtitle="Per-cohort student rankings."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <ExportButtons
              csvUrl={exportApi.leaderboardUrl(effectiveCohortId, sortBy, 'CSV')}
              xlsxUrl={exportApi.leaderboardUrl(effectiveCohortId, sortBy, 'XLSX')}
              fileBaseName="leaderboard"
              disabled={!effectiveCohortId}
            />
            <Button
              variant="outline"
              isLoading={regenerate.isPending}
              disabled={!effectiveCohortId}
              onClick={() => effectiveCohortId && regenerate.mutate(effectiveCohortId)}
            >
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
          </div>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <Select className="w-auto" value={effectiveCohortId} onChange={(e) => { setCohortId(e.target.value); setPage(0); }}>
            {cohorts.length === 0 && <option value="">No cohorts</option>}
            {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select className="w-auto" value={sortBy} onChange={(e) => { setSortBy(e.target.value as LeaderboardSortField); setPage(0); }}>
            {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
        </div>

        {!effectiveCohortId ? (
          <p className="p-8 text-center text-sm text-slate-500">Select a cohort to view its leaderboard.</p>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.content ?? []}
              rowKey={(e) => e.studentId}
              isLoading={isLoading}
              emptyMessage="No rankings yet for this cohort."
            />
            <Pagination
              page={data?.page ?? 0}
              totalPages={data?.totalPages ?? 0}
              totalElements={data?.totalElements ?? 0}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
