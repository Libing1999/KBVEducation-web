import { useState } from 'react';
import { TrendingUp, Award, AlertTriangle, Users, Activity, CalendarRange } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { ScoreMeter } from '@/features/dashboard/components/ScoreMeter';
import { useCohorts } from '@/features/cohorts/hooks/useCohorts';
import { useAdminLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard';
import { useAdminAnalytics, useTrend, useStudentTrend } from '@/features/analytics/hooks/useAnalytics';
import { CompositeDistributionChart } from '@/features/analytics/components/CompositeDistributionChart';
import { TrendChart } from '@/features/analytics/components/TrendChart';
import { TierDistributionChart } from '@/features/analytics/components/TierDistributionChart';
import { LeaderboardTrendChart } from '@/features/analytics/components/LeaderboardTrendChart';
import { ExportButtons } from '@/features/export/components/ExportButtons';
import { exportApi } from '@/features/export/api/exportApi';

const TOP_N = 5;

export default function AdminAnalyticsPage() {
  const [cohortId, setCohortId] = useState('');
  const { data: cohortPage } = useCohorts({ page: 0, size: 100 });
  const cohorts = cohortPage?.content ?? [];
  const effectiveCohortId = cohortId || cohorts[0]?.id || '';

  const { data: analytics, isLoading, isError, refetch } = useAdminAnalytics(effectiveCohortId || undefined);
  const { data: leaderboard } = useAdminLeaderboard({
    cohortId: effectiveCohortId,
    sortBy: 'COMPOSITE',
    page: 0,
    size: 100,
  });

  const { data: practiceTrend, isLoading: practiceLoading } = useTrend('PRACTICE', effectiveCohortId || undefined);
  const { data: reflectionTrend, isLoading: reflectionLoading } = useTrend('REFLECTION', effectiveCohortId || undefined);
  const { data: quizTrend, isLoading: quizLoading } = useTrend('QUIZ', effectiveCohortId || undefined);

  const topStudentIds = (leaderboard?.content ?? []).slice(0, TOP_N).map((e) => e.studentId);
  const { data: studentTrends, isLoading: studentTrendLoading } = useStudentTrend(topStudentIds);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        subtitle="Cohort-wide score and engagement trends."
        action={
          <div className="flex flex-wrap items-center gap-4">
            <ExportButtons
              label="Scores"
              csvUrl={exportApi.scoresUrl(effectiveCohortId, 'CSV')}
              xlsxUrl={exportApi.scoresUrl(effectiveCohortId, 'XLSX')}
              fileBaseName="scores"
              disabled={!effectiveCohortId}
            />
            <ExportButtons
              label="Tiers"
              csvUrl={exportApi.tiersUrl(effectiveCohortId, 'CSV')}
              xlsxUrl={exportApi.tiersUrl(effectiveCohortId, 'XLSX')}
              fileBaseName="tiers"
              disabled={!effectiveCohortId}
            />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select className="w-auto" value={effectiveCohortId} onChange={(e) => setCohortId(e.target.value)}>
          {cohorts.length === 0 && <option value="">All cohorts</option>}
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <LoadingState label="Loading analytics…" />
      ) : isError || !analytics ? (
        <ErrorState message="Failed to load analytics." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Average composite" value={analytics.averageComposite.toFixed(1)} icon={TrendingUp} />
            <StatCard label="Highest score" value={analytics.highestScore.toFixed(1)} icon={Award} tone="accent" />
            <StatCard label="Lowest score" value={analytics.lowestScore.toFixed(1)} icon={TrendingUp} tone="neutral" />
            <StatCard label="Active students" value={analytics.activeStudents} icon={Users} />
            <StatCard label="Students at risk" value={analytics.atRiskStudents} icon={AlertTriangle} tone="accent" />
            <StatCard label="Weekly activity" value={analytics.weeklyActivity} icon={Activity} />
            <StatCard label="Monthly activity" value={analytics.monthlyActivity} icon={CalendarRange} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CompositeDistributionChart scores={(leaderboard?.content ?? []).map((e) => e.compositeScore)} />
            <TierDistributionChart distribution={analytics.tierDistribution} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TrendChart title="Practice Trend" data={practiceTrend} isLoading={practiceLoading} color="#3F6FA8" />
            <TrendChart title="Reflection Trend" data={reflectionTrend} isLoading={reflectionLoading} color="#C4972A" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TrendChart
              title="Quiz Performance"
              subtitle="Average quiz score over time"
              data={quizTrend}
              isLoading={quizLoading}
              color="#0D9488"
            />
            <Card>
              <CardHeader title="Homework Completion" subtitle="Cohort average" />
              <CardBody className="flex h-full flex-col justify-center">
                <ScoreMeter label="Homework" value={analytics.averageHomework} tone="accent" />
              </CardBody>
            </Card>
          </div>

          <LeaderboardTrendChart students={studentTrends} isLoading={studentTrendLoading} />
        </>
      )}
    </div>
  );
}
