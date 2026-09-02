import { useState } from 'react';
import { TrendingUp, Award, AlertTriangle, Users, Activity, CalendarRange } from 'lucide-react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Select } from '@/components/modern/ui/Select';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernStatCard } from '@/components/modern/admin/ModernStatCard';
import { ModernExportButtons } from '@/components/modern/admin/ModernExportButtons';
import { ModernCompositeDistributionChart } from '@/components/modern/admin/ModernCompositeDistributionChart';
import { ModernTrendChart } from '@/components/modern/admin/ModernTrendChart';
import { ModernTierDistributionChart } from '@/components/modern/admin/ModernTierDistributionChart';
import { ModernLeaderboardTrendChart } from '@/components/modern/admin/ModernLeaderboardTrendChart';
import { useCohorts } from '@/features/cohorts/hooks/useCohorts';
import { useAdminLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard';
import { useAdminAnalytics, useTrend, useStudentTrend } from '@/features/analytics/hooks/useAnalytics';
import { exportApi } from '@/features/export/api/exportApi';

const TOP_N = 5;

/** Modern port of AdminAnalyticsPage — same hooks/queries, dark styling. */
export default function ModernAdminAnalyticsPage() {
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
            <ModernExportButtons
              label="Scores"
              csvUrl={exportApi.scoresUrl(effectiveCohortId, 'CSV')}
              xlsxUrl={exportApi.scoresUrl(effectiveCohortId, 'XLSX')}
              fileBaseName="scores"
              disabled={!effectiveCohortId}
            />
            <ModernExportButtons
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
            <ModernStatCard label="Average composite" value={analytics.averageComposite.toFixed(1)} icon={TrendingUp} />
            <ModernStatCard label="Highest score" value={analytics.highestScore.toFixed(1)} icon={Award} tone="accent" />
            <ModernStatCard label="Lowest score" value={analytics.lowestScore.toFixed(1)} icon={TrendingUp} tone="neutral" />
            <ModernStatCard label="Active students" value={analytics.activeStudents} icon={Users} />
            <ModernStatCard label="Students at risk" value={analytics.atRiskStudents} icon={AlertTriangle} tone="accent" />
            <ModernStatCard label="Weekly activity" value={analytics.weeklyActivity} icon={Activity} />
            <ModernStatCard label="Monthly activity" value={analytics.monthlyActivity} icon={CalendarRange} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ModernCompositeDistributionChart scores={(leaderboard?.content ?? []).map((e) => e.compositeScore)} />
            <ModernTierDistributionChart distribution={analytics.tierDistribution} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ModernTrendChart title="Practice Trend" data={practiceTrend} isLoading={practiceLoading} color="#8fc7e8" />
            <ModernTrendChart title="Reflection Trend" data={reflectionTrend} isLoading={reflectionLoading} color="#DBB652" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ModernTrendChart
              title="Post-Lesson Quiz Performance"
              subtitle="Average Post-Lesson Quiz score over time"
              data={quizTrend}
              isLoading={quizLoading}
              color="#8fd6ae"
            />
            <ModernCard title="Post-Lesson Homework Completion" subtitle="Cohort average">
              <div className="flex h-full flex-col justify-center space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[rgba(238,242,249,.6)]">Post-Lesson Homework</span>
                  <span className="font-semibold text-[#EEF2F9]">{Math.max(0, Math.min(100, analytics.averageHomework)).toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#B0821C]" style={{ width: `${Math.max(0, Math.min(100, analytics.averageHomework))}%` }} />
                </div>
              </div>
            </ModernCard>
          </div>

          <ModernLeaderboardTrendChart students={studentTrends} isLoading={studentTrendLoading} />
        </>
      )}
    </div>
  );
}
