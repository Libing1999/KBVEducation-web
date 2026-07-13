import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Settings2,
  ChevronUp,
  ChevronDown,
  ListChecks,
  FileQuestion,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useLessonQuiz, useQuizMutations } from '@/features/quizzes/hooks/useQuiz';
import { QuizSettingsModal } from '@/features/quizzes/components/QuizSettingsModal';
import { QuestionFormModal } from '@/features/quizzes/components/QuestionFormModal';
import { QuizPreviewModal } from '@/features/quizzes/components/QuizPreviewModal';
import type { QuestionResponse } from '@/features/quizzes/types/quiz.types';

export function QuizBuilder({ lessonId }: { lessonId: string }) {
  const { data: quiz, isLoading } = useLessonQuiz(lessonId);
  const { remove, deleteQuestion, reorderQuestions } = useQuizMutations(lessonId);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [questionModal, setQuestionModal] = useState<{ open: boolean; question: QuestionResponse | null }>({
    open: false,
    question: null,
  });
  const [deleteQuizOpen, setDeleteQuizOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<QuestionResponse | null>(null);

  const questions = quiz ? [...quiz.questions].sort((a, b) => a.displayOrder - b.displayOrder) : [];
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const move = (index: number, dir: -1 | 1) => {
    if (!quiz) return;
    const next = index + dir;
    if (next < 0 || next >= questions.length) return;
    const reordered = [...questions];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    reorderQuestions.mutate({
      quizId: quiz.id,
      items: reordered.map((q, i) => ({ id: q.id, displayOrder: i })),
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Quiz" />
        <CardBody className="flex justify-center py-10"><Spinner /></CardBody>
      </Card>
    );
  }

  if (!quiz) {
    return (
      <>
        <Card>
          <CardHeader title="Quiz" subtitle="No quiz configured for this lesson" />
          <CardBody className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary">
              <FileQuestion className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">Add a quiz so students can test their understanding.</p>
            <Button size="sm" onClick={() => setSettingsOpen(true)}>
              <Plus className="h-4 w-4" /> Create quiz
            </Button>
          </CardBody>
        </Card>
        <QuizSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} lessonId={lessonId} />
      </>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            Quiz <Badge tone={quiz.status === 'PUBLISHED' ? 'success' : 'neutral'}>{quiz.status}</Badge>
          </span>
        }
        subtitle={quiz.title}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" title="Preview" onClick={() => setPreviewOpen(true)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Settings" onClick={() => setSettingsOpen(true)}>
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Delete quiz" onClick={() => setDeleteQuizOpen(true)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        }
      />
      <CardBody className="space-y-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><ListChecks className="h-3.5 w-3.5" /> {questions.length} questions</span>
          <span>· {totalMarks} marks total</span>
          {quiz.durationMinutes ? <span>· {quiz.durationMinutes} min</span> : null}
          {quiz.passingMarks != null ? <span>· pass ≥ {quiz.passingMarks}</span> : null}
        </div>

        {questions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
            No questions yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
            {questions.map((q, idx) => (
              <li key={q.id} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 text-sm font-semibold text-slate-400">{idx + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{q.questionText}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    <Badge tone={q.questionType === 'MCQ' ? 'info' : 'accent'}>
                      {q.questionType === 'MCQ' ? 'Multiple choice' : 'Open ended'}
                    </Badge>
                    <span className="ml-2">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center">
                  <Button variant="ghost" size="sm" title="Move up" disabled={idx === 0 || reorderQuestions.isPending} onClick={() => move(idx, -1)}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Move down" disabled={idx === questions.length - 1 || reorderQuestions.isPending} onClick={() => move(idx, 1)}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Edit" onClick={() => setQuestionModal({ open: true, question: q })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Delete" onClick={() => setQuestionToDelete(q)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Button variant="secondary" size="sm" onClick={() => setQuestionModal({ open: true, question: null })}>
          <Plus className="h-4 w-4" /> Add question
        </Button>
      </CardBody>

      <QuizSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} lessonId={lessonId} quiz={quiz} />
      <QuizPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} quiz={quiz} />
      {questionModal.open && (
        <QuestionFormModal
          open={questionModal.open}
          onClose={() => setQuestionModal({ open: false, question: null })}
          lessonId={lessonId}
          quizId={quiz.id}
          question={questionModal.question}
        />
      )}

      <ConfirmDialog
        open={deleteQuizOpen}
        title="Delete quiz"
        message="Delete this quiz and all of its questions? This can’t be undone."
        confirmLabel="Delete quiz"
        danger
        isLoading={remove.isPending}
        onConfirm={() => remove.mutate(quiz.id, { onSuccess: () => setDeleteQuizOpen(false) })}
        onClose={() => setDeleteQuizOpen(false)}
      />

      <ConfirmDialog
        open={!!questionToDelete}
        title="Delete question"
        message="Delete this question? This can’t be undone."
        confirmLabel="Delete"
        danger
        isLoading={deleteQuestion.isPending}
        onConfirm={() =>
          questionToDelete &&
          deleteQuestion.mutate(questionToDelete.id, { onSuccess: () => setQuestionToDelete(null) })
        }
        onClose={() => setQuestionToDelete(null)}
      />
    </Card>
  );
}
