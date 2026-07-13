import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  FileQuestion,
  ClipboardList,
  CheckCircle2,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useMyLessonDetail } from '@/features/learn/hooks/useLearn';
import { learnApi } from '@/features/learn/api/learnApi';
import { downloadFile } from '@/lib/download';
import { formatDate, formatDateTime, formatFileSize } from '@/lib/format';
import { useAuthStore } from '@/features/auth/store/authStore';
import { paths } from '@/routes/paths';
import type { StudentFile } from '@/features/learn/types/learn.types';

export default function StudentLessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const isStudent = role === 'STUDENT';
  const { data: lesson, isLoading, isError, refetch } = useMyLessonDetail(id);

  if (isLoading) return <LoadingState label="Loading lesson…" />;
  if (isError || !lesson) return <ErrorState onRetry={() => refetch()} />;

  const doDownload = (file: StudentFile) =>
    downloadFile(learnApi.lessonFileDownloadUrl(lesson.id, file.id), file.fileName);

  return (
    <div className="space-y-5">
      <Link to={paths.myLessons} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> Back to my lessons
      </Link>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-accent">Lesson {lesson.lessonNumber}</p>
            <h1 className="text-xl font-bold text-slate-800">{lesson.title}</h1>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(lesson.lessonDate)}</span>
          </div>
          {lesson.summary && <p className="text-sm text-slate-700">{lesson.summary}</p>}
          {lesson.description && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Details</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{lesson.description}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Materials */}
      <Card>
        <CardHeader title="Materials" subtitle="Files shared for this lesson" />
        <CardBody className="p-0">
          {lesson.files.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No materials for this lesson.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lesson.files.map((f) => (
                <li key={f.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{f.fileName}</p>
                    <p className="text-xs text-slate-500">
                      {(f.fileType ?? '').toUpperCase()} · {formatFileSize(f.fileSize)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" title="Download" onClick={() => doDownload(f)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Quiz */}
        <Card>
          <CardHeader title="Quiz" />
          <CardBody className="space-y-3">
            {!lesson.hasQuiz ? (
              <p className="py-4 text-center text-sm text-slate-500">No quiz for this lesson.</p>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                    <FileQuestion className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{lesson.quizTitle}</p>
                    <p className="text-xs text-slate-500">
                      {lesson.quizCompleted ? 'You have completed this quiz.' : 'Not attempted yet.'}
                    </p>
                  </div>
                </div>
                {lesson.quizCompleted ? (
                  <Badge tone="success"><CheckCircle2 className="mr-1 h-3 w-3" /> Completed</Badge>
                ) : isStudent && lesson.quizId ? (
                  <Button size="sm" onClick={() => navigate(paths.takeQuiz(lesson.quizId as string))}>
                    Take quiz <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Badge tone="info">Not attempted</Badge>
                )}
              </>
            )}
          </CardBody>
        </Card>

        {/* Homework */}
        <Card>
          <CardHeader title="Homework" />
          <CardBody className="space-y-3">
            {!lesson.hasHomework ? (
              <p className="py-4 text-center text-sm text-slate-500">No homework for this lesson.</p>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{lesson.homeworkTitle}</p>
                    {lesson.homeworkDueDate && (
                      <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <CalendarClock className="h-3 w-3" /> Due {formatDateTime(lesson.homeworkDueDate)}
                      </p>
                    )}
                  </div>
                </div>
                {lesson.homeworkInstructions && (
                  <p className="whitespace-pre-line text-sm text-slate-700">{lesson.homeworkInstructions}</p>
                )}
                {lesson.homeworkSubmitted ? (
                  <Badge tone="success"><CheckCircle2 className="mr-1 h-3 w-3" /> Submitted</Badge>
                ) : (
                  <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-slate-500">
                    Submission opens with the homework tool in the next update.
                  </p>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
