import { Link } from 'react-router-dom';
import { Flame, ClipboardList, FileQuestion, PenLine, BookOpenCheck, GraduationCap, Lock } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { ScoreDashboard } from '@/features/dashboard/components/ScoreDashboard';
import { CertificateStatusCard } from '@/features/certificates/components/CertificateStatusCard';
import { ActivityList } from '@/features/progress/components/ActivityList';
import { useProgress, useActivity } from '@/features/progress/hooks/useProgress';
import { paths } from '@/routes/paths';
import type { ProgressMetrics } from '@/features/progress/types/progress.types';

/**
 * Composite score/tier (ScoreDashboard, isParentView - already resolves parent to their
 * linked student via /dashboard/me, no new backend needed) above the existing Phase 3
 * activity metrics. Each section loads/errors independently rather than one all-or-nothing
 * gate, since they're backed by separate queries.
 */
export function ParentDashboard() {
  const { data: progress, isLoading, isError, refetch } = useProgress();
  const { data: activity } = useActivity(0, 6);

  return (
    <div className="space-y-6">
      <ScoreDashboard isParentView />

      {isLoading ? (
        <LoadingState label="Loading your child’s activity…" />
      ) : isError || !progress ? (
        <ErrorState
          message="We couldn’t load your child’s activity. They may not be linked to your account yet."
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Reflection streak" value={`${progress.reflectionStreak} ${progress.reflectionStreak === 1 ? 'day' : 'days'}`} icon={Flame} tone="accent" />
            <StatCard label="Practice streak" value={`${progress.practiceStreak} ${progress.practiceStreak === 1 ? 'day' : 'days'}`} icon={Flame} tone="accent" />
            <StatCard label="Homework submitted" value={progress.courseTotal.homeworkSubmitted} icon={ClipboardList} />
            <StatCard label="Quizzes completed" value={progress.courseTotal.quizzesCompleted} icon={FileQuestion} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MetricsCard title="This month" metrics={progress.currentMonth} />
            <MetricsCard title="Course total" metrics={progress.courseTotal} />
          </div>

          <CertificateStatusCard variant="parent" />

          <Card>
            <CardHeader
              title="Recent activity"
              action={<Link to={paths.activity} className="text-sm font-medium text-primary hover:text-primary-600">View all</Link>}
            />
            <CardBody className="p-0">
              <ActivityList items={activity?.content ?? []} empty="No activity to show yet." />
            </CardBody>
          </Card>

          <p className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" /> Reflection answers and practice notes are private to your child.
          </p>
        </>
      )}
    </div>
  );
}

function MetricsCard({ title, metrics }: { title: string; metrics: ProgressMetrics }) {
  const items = [
    { icon: PenLine, label: 'Reflection days', value: metrics.reflectionDays },
    { icon: BookOpenCheck, label: 'Practice days', value: metrics.practiceDays },
    { icon: ClipboardList, label: 'Homework', value: metrics.homeworkSubmitted },
    { icon: FileQuestion, label: 'Quizzes', value: metrics.quizzesCompleted },
    { icon: GraduationCap, label: 'Lessons', value: metrics.lessonsCompleted },
  ];
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center">
            <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary"><Icon className="h-4 w-4" /></div>
            <p className="text-lg font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
