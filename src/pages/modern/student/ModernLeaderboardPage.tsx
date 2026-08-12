import { useState } from 'react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card } from '@/components/modern/ui/Card';
import { Badge } from '@/components/modern/ui/Badge';
import { DataTable, type Column } from '@/components/modern/ui/Table';
import { ErrorState } from '@/components/modern/ui/ErrorState';
import { useAuthStore } from '@/features/auth/store/authStore';
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

/** Modern port of LeaderboardPage (student view) — same hooks/logic, dark styling. */
export default function ModernLeaderboardPage() {
  const [sortBy, setSortBy] = useState<LeaderboardSortField>('COMPOSITE');
  const userId = useAuthStore((s) => s.user?.id);
  const { data, isLoading, isError, error, refetch } = useMyLeaderboard(sortBy);

  const columns: Column<LeaderboardEntry>[] = [
    { key: 'rank', header: 'Rank', render: (e) => <span className="font-semibold text-[#EEF2F9]">#{e.rank}</span> },
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
      <PageHeader title="Leaderboard" subtitle="See how you rank within your cohort." />

      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(238,242,249,.1)] p-4">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSortBy(opt.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                sortBy === opt.value ? 'bg-[#B0821C] text-[#231803]' : 'text-[rgba(238,242,249,.7)] hover:bg-white/[.06]',
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
            data={data ?? []}
            rowKey={(e) => e.studentId}
            isLoading={isLoading}
            emptyMessage="No rankings yet."
            rowClassName={(e) => (e.studentId === userId ? 'bg-[#B0821C]/[.1]' : undefined)}
          />
        )}
      </Card>
    </div>
  );
}
