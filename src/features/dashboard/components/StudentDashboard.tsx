import { Link } from 'react-router-dom';
import { Flame, BookOpenCheck, ClipboardList, FileQuestion, PenLine, ArrowRight, CalendarDays, GraduationCap } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { ActivityList } from '@/features/progress/components/ActivityList';
import { useProgress, useActivity } from '@/features/progress/hooks/useProgress';
import { useTodayReflection } from '@/features/reflections/hooks/useReflections';
import { usePracticeList } from '@/features/practice/hooks/usePractice';
import { useMyLessons } from '@/features/learn/hooks/useLearn';
import { formatDate } from '@/lib/format';
import { paths } from '@/routes/paths';

function todayIso() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function StudentDashboard() {
  const { data: progress, isLoading } = useProgress();
  const { data: today } = useTodayReflection();
  const { data: practice } = usePracticeList();
  const { data: activity } = useActivity(0, 6);
  const { data: lessons } = useMyLessons();

  if (isLoading || !progress) return <LoadingState label="Loading your dashboard…" />;

  const reflectedToday = !!today?.reflection;
  const practisedToday = (practice ?? []).some((p) => p.studyDate === todayIso());
  const upcoming = lessons?.content?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Welcome back, {progress.studentName.split(' ')[0]}</h1>
        <p className="text-sm text-slate-500">Here’s your activity at a glance.</p>
      </div>

      {/* Streaks + totals */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Reflection streak" value={`${progress.reflectionStreak} ${progress.reflectionStreak === 1 ? 'day' : 'days'}`} icon={Flame} tone="accent" />
        <StatCard label="Practice streak" value={`${progress.practiceStreak} ${progress.practiceStreak === 1 ? 'day' : 'days'}`} icon={Flame} tone="accent" />
        <StatCard label="Homework submitted" value={progress.courseTotal.homeworkSubmitted} icon={ClipboardList} />
        <StatCard label="Quizzes completed" value={progress.courseTotal.quizzesCompleted} icon={FileQuestion} />
      </div>

      {/* Today's tasks + upcoming lesson */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Today" subtitle={formatDate(todayIso())} />
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary"><PenLine className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-medium text-slate-800">Reflection</p>
                  {reflectedToday
                    ? <Badge tone="success">Done</Badge>
                    : <span className="text-xs text-slate-500">Not yet today</span>}
                </div>
              </div>
              <Link to={paths.reflections}>
                <Button size="sm" variant={reflectedToday ? 'outline' : 'primary'}>
                  {reflectedToday ? 'Edit' : 'Reflect'} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary"><BookOpenCheck className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-medium text-slate-800">Practice</p>
                  {practisedToday
                    ? <Badge tone="success">Logged</Badge>
                    : <span className="text-xs text-slate-500">Nothing logged yet</span>}
                </div>
              </div>
              <Link to={paths.practice}>
                <Button size="sm" variant={practisedToday ? 'outline' : 'primary'}>
                  Log <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Upcoming lesson" />
          <CardBody>
            {upcoming ? (
              <Link to={paths.myLessonDetail(upcoming.id)} className="group flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary"><GraduationCap className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-primary">{upcoming.title}</p>
                  <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" /> Lesson {upcoming.lessonNumber} · {formatDate(upcoming.lessonDate)}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary" />
              </Link>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">No lessons published yet.</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader
          title="Recent activity"
          action={<Link to={paths.activity} className="text-sm font-medium text-primary hover:text-primary-600">View all</Link>}
        />
        <CardBody className="p-0">
          <ActivityList items={activity?.content ?? []} empty="Your recent activity will show up here." />
        </CardBody>
      </Card>
    </div>
  );
}
