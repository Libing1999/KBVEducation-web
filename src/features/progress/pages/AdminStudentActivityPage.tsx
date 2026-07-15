import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Flame, ClipboardList, FileQuestion, GraduationCap, PenLine, BookOpenCheck } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { ActivityList } from '@/features/progress/components/ActivityList';
import { ActivityCalendar } from '@/features/progress/components/ActivityCalendar';
import { useStudentProgress, useStudentActivity, useStudentCalendar } from '@/features/progress/hooks/useAdminStats';
import { paths } from '@/routes/paths';
import { ExportButtons } from '@/features/export/components/ExportButtons';
import { exportApi } from '@/features/export/api/exportApi';

function iso(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AdminStudentActivityPage() {
  const { id } = useParams<{ id: string }>();
  const { data: progress, isLoading, isError, refetch } = useStudentProgress(id);
  const [page, setPage] = useState(0);
  const { data: activity } = useStudentActivity(id, page, 15);
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const from = iso(new Date(month.getFullYear(), month.getMonth(), 1));
  const to = iso(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const { data: days } = useStudentCalendar(id, from, to);

  if (isLoading) return <LoadingState label="Loading student…" />;
  if (isError || !progress) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <Link to={paths.admin.reflections} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{progress.studentName}</h1>
          <p className="text-sm text-slate-500">Activity &amp; progress</p>
        </div>
        <ExportButtons
          csvUrl={exportApi.progressUrl(id!, 'CSV')}
          xlsxUrl={exportApi.progressUrl(id!, 'XLSX')}
          fileBaseName="progress"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Reflection streak" value={`${progress.reflectionStreak} d`} icon={Flame} tone="accent" />
        <StatCard label="Practice streak" value={`${progress.practiceStreak} d`} icon={Flame} tone="accent" />
        <StatCard label="Homework submitted" value={progress.courseTotal.homeworkSubmitted} icon={ClipboardList} />
        <StatCard label="Quizzes completed" value={progress.courseTotal.quizzesCompleted} icon={FileQuestion} />
      </div>

      <Card>
        <CardHeader title="Course total" subtitle="Since the start of the course" />
        <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Metric icon={PenLine} label="Reflection days" value={progress.courseTotal.reflectionDays} />
          <Metric icon={BookOpenCheck} label="Practice days" value={progress.courseTotal.practiceDays} />
          <Metric icon={ClipboardList} label="Homework" value={progress.courseTotal.homeworkSubmitted} />
          <Metric icon={FileQuestion} label="Quizzes" value={progress.courseTotal.quizzesCompleted} />
          <Metric icon={GraduationCap} label="Lessons" value={progress.courseTotal.lessonsCompleted} />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={`${MONTHS[month.getMonth()]} ${month.getFullYear()}`}
            action={
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setMonth((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setMonth((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            }
          />
          <CardBody><ActivityCalendar month={month} days={days ?? []} /></CardBody>
        </Card>

        <Card>
          <CardHeader title="Activity timeline" />
          <CardBody className="p-0">
            <ActivityList items={activity?.content ?? []} />
          </CardBody>
          {(activity?.totalPages ?? 0) > 1 && (
            <Pagination page={activity?.page ?? 0} totalPages={activity?.totalPages ?? 0} totalElements={activity?.totalElements ?? 0} onPageChange={setPage} />
          )}
        </Card>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof PenLine; label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary"><Icon className="h-4 w-4" /></div>
      <p className="text-lg font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
