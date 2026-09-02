import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/Table';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useMyLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard';
import type { LeaderboardEntry, LeaderboardSortField } from '@/features/leaderboard/types/leaderboard.types';
import { cn, getErrorMessage } from '@/lib/utils';

const SORT_OPTIONS: { value: LeaderboardSortField; label: string }[] = [
  { value: 'COMPOSITE', label: 'Composite Score' },
  { value: 'PRACTICE', label: 'Practice %' },
  { value: 'REFLECTION', label: 'Reflection %' },
  { value: 'HOMEWORK', label: 'Homework %' },
  { value: 'QUIZ', label: 'Quiz %' },
];

/**
 * Privacy note: the backend only ever returns the public top-N entries plus
 * the caller's own entry (never the full cohort ranking) — see
 * LeaderboardServiceImpl.studentView. This table renders exactly what it's
 * given: the top-N rows, plus a highlighted "You" row appended when the
 * student's own rank falls outside the top-N.
 */
export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<LeaderboardSortField>('COMPOSITE');
  const { data, isLoading, isError, error, refetch } = useMyLeaderboard(sortBy);

  const rows: LeaderboardEntry[] = data
    ? data.topEntries.some((e) => e.studentId === data.ownEntry.studentId)
      ? data.topEntries
      : [...data.topEntries, data.ownEntry]
    : [];

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
        subtitle={
          data
            ? `You're #${data.ownEntry.rank} of ${data.totalStudents} in your cohort — showing the top ${data.topN}.`
            : 'See how you rank within your cohort.'
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-4">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSortBy(opt.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                sortBy === opt.value ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {isError ? (
          <div className="p-8">
            <ErrorState
              message={getErrorMessage(error, 'The leaderboard is not available right now.')}
              onRetry={() => refetch()}
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            rowKey={(e) => e.studentId}
            isLoading={isLoading}
            emptyMessage="No rankings yet."
            rowClassName={(e) => (data && e.studentId === data.ownEntry.studentId ? 'bg-accent-50/60' : undefined)}
          />
        )}
      </Card>
    </div>
  );
}
