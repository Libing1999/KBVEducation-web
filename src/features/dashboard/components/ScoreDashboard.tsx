import { GraduationCap, Bell, CalendarDays, Award } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ScoreMeter } from '@/features/dashboard/components/ScoreMeter';
import { TierProgressCard } from '@/features/dashboard/components/TierProgressCard';
import { LeaderboardPositionCard } from '@/features/dashboard/components/LeaderboardPositionCard';
import { TodayAndActivitySection } from '@/features/dashboard/components/TodayAndActivitySection';
import { useMyDashboard } from '@/features/dashboard/hooks/useDashboard';
import { formatDateTime, roleLabel } from '@/lib/format';

// Keyed on the spec's default tier names. An admin who renames a tier (Step 7's Tier
// Rules editor allows it) just gets the neutral fallback instead of a wrong color.
const tierTone: Record<string, 'accent' | 'info' | 'neutral' | 'danger'> = {
  'Tier 1': 'accent',
  'Tier 2': 'info',
  'Tier 3': 'neutral',
  'Not Passing': 'danger',
};

export function ScoreDashboard({ isParentView = false }: { isParentView?: boolean }) {
  const { data, isLoading, isError, refetch } = useMyDashboard();

  if (isLoading) return <LoadingState label="Loading dashboard…" />;
  if (isError || !data) {
    return (
      <ErrorState
        message={
          isParentView
            ? 'Could not load your linked student’s dashboard. They may not be linked yet.'
            : 'Failed to load your dashboard.'
        }
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {isParentView ? `${data.name}'s Dashboard` : 'My Dashboard'}
          </h1>
          <p className="text-sm text-slate-500">
            {isParentView ? 'Viewing your linked student’s progress.' : 'Your progress at a glance.'}
          </p>
        </div>
        <Badge tone={tierTone[data.currentTier] ?? 'neutral'}>
          <Award className="mr-1 h-3.5 w-3.5" /> {data.currentTier} Tier
        </Badge>
      </div>

      {/* Identity + composite */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-800">{data.name}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {data.cohort ? data.cohort.name : 'No cohort assigned'}
                </span>
                <span aria-hidden>·</span>
                <span>{roleLabel(data.role)}</span>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs uppercase tracking-wide text-slate-400">Composite Score</p>
              <p className="text-3xl font-bold text-primary">{data.compositeScore.toFixed(1)}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex h-full flex-col justify-center gap-1 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">Cohort Status</p>
            <p className="text-lg font-semibold text-slate-800">
              {data.cohort ? data.cohort.status : '—'}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Score breakdown */}
      <Card>
        <CardHeader title="Score Breakdown" subtitle="Category performance" />
        <CardBody className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ScoreMeter label="Practice" value={data.practicePercentage} />
          <ScoreMeter label="Reflection" value={data.reflectionPercentage} />
          <ScoreMeter label="Homework" value={data.homeworkPercentage} />
          <ScoreMeter label="Quiz" value={data.quizPercentage} />
        </CardBody>
      </Card>

      {/* Tier progress + leaderboard position - student-only, backend endpoints are STUDENT-role-guarded */}
      {!isParentView && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TierProgressCard />
          <LeaderboardPositionCard />
        </div>
      )}

      {/* Placeholders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Upcoming Lessons" />
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {data.upcomingLessons.map((lesson, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{lesson.title}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(lesson.scheduledFor)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent Notifications" />
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {data.recentNotifications.map((n, i) => (
                <li key={i} className="flex items-start gap-3 px-5 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-500">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{formatDateTime(n.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      {!isParentView && <TodayAndActivitySection />}
    </div>
  );
}
