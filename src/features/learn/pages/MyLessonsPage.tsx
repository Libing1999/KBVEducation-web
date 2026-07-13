import { Link } from 'react-router-dom';
import { BookOpen, FileText, ClipboardList, FileQuestion, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useMyLessons } from '@/features/learn/hooks/useLearn';
import { formatDate } from '@/lib/format';
import { paths } from '@/routes/paths';
import type { StudentLessonResponse } from '@/features/learn/types/learn.types';

export default function MyLessonsPage() {
  const { data, isLoading, isError, refetch } = useMyLessons();

  if (isLoading) return <LoadingState label="Loading your lessons…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const lessons = data?.content ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Lessons</h1>
        <p className="text-sm text-slate-500">Lessons published for your cohort.</p>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">No lessons have been published yet. Check back soon.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}

function LessonCard({ lesson }: { lesson: StudentLessonResponse }) {
  return (
    <Link to={paths.myLessonDetail(lesson.id)} className="group block focus:outline-none">
      <Card className="h-full transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-accent/40">
        <CardBody className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">Lesson {lesson.lessonNumber}</span>
            <span className="text-xs text-slate-400">{formatDate(lesson.lessonDate)}</span>
          </div>

          <h3 className="text-base font-semibold text-slate-800 group-hover:text-primary">{lesson.title}</h3>
          {lesson.summary && <p className="line-clamp-2 text-sm text-slate-500">{lesson.summary}</p>}

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <FileText className="h-3.5 w-3.5" /> {lesson.fileCount} {lesson.fileCount === 1 ? 'file' : 'files'}
            </span>
            {lesson.hasQuiz && (
              <Badge tone={lesson.quizCompleted ? 'success' : 'info'}>
                {lesson.quizCompleted ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <FileQuestion className="mr-1 h-3 w-3" />}
                {lesson.quizCompleted ? 'Quiz done' : 'Quiz'}
              </Badge>
            )}
            {lesson.hasHomework && (
              <Badge tone={lesson.homeworkSubmitted ? 'success' : 'accent'}>
                {lesson.homeworkSubmitted ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <ClipboardList className="mr-1 h-3 w-3" />}
                {lesson.homeworkSubmitted ? 'Homework done' : 'Homework'}
              </Badge>
            )}
          </div>

          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Open lesson <ArrowRight className="h-4 w-4" />
          </span>
        </CardBody>
      </Card>
    </Link>
  );
}
