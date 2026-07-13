import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Send, Undo2, Calendar, Layers } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LessonFormModal } from '@/features/lessons/components/LessonFormModal';
import { LessonFilesManager } from '@/features/lessons/components/LessonFilesManager';
import { QuizBuilder } from '@/features/quizzes/components/QuizBuilder';
import { HomeworkConfigCard } from '@/features/homework/components/HomeworkConfigCard';
import { useLesson, useLessonMutations } from '@/features/lessons/hooks/useLessons';
import { formatDate } from '@/lib/format';
import { paths } from '@/routes/paths';

export default function LessonDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lesson, isLoading, isError, refetch } = useLesson(id);
  const { publish, unpublish } = useLessonMutations();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <LoadingState label="Loading lesson…" />;
  if (isError || !lesson) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={paths.admin.lessons} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600">
          <ArrowLeft className="h-4 w-4" /> Back to lessons
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          {lesson.status === 'PUBLISHED' ? (
            <Button variant="outline" size="sm" onClick={() => unpublish.mutate(lesson.id)} isLoading={unpublish.isPending}>
              {!unpublish.isPending && <Undo2 className="h-4 w-4" />} Unpublish
            </Button>
          ) : (
            <Button size="sm" onClick={() => publish.mutate(lesson.id)} isLoading={publish.isPending}>
              {!publish.isPending && <Send className="h-4 w-4" />} Publish
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Lesson {lesson.lessonNumber}</p>
              <h1 className="text-xl font-bold text-slate-800">{lesson.title}</h1>
            </div>
            <Badge tone={lesson.status === 'PUBLISHED' ? 'success' : 'neutral'}>{lesson.status}</Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Layers className="h-4 w-4" /> {lesson.cohortName}</span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(lesson.lessonDate)}</span>
          </div>

          {lesson.summary && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Summary</p>
              <p className="mt-1 text-sm text-slate-700">{lesson.summary}</p>
            </div>
          )}
          {lesson.description && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{lesson.description}</p>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <LessonFilesManager lessonId={lesson.id} />
        <HomeworkConfigCard lessonId={lesson.id} />
      </div>

      <QuizBuilder lessonId={lesson.id} />

      <LessonFormModal open={editOpen} onClose={() => setEditOpen(false)} lesson={lesson} />
    </div>
  );
}
