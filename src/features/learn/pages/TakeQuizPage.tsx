import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Send } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useTakeQuiz, useSubmitQuiz } from '@/features/learn/hooks/useLearn';
import { paths } from '@/routes/paths';
import type { QuizSubmissionResult, SubmitAnswer } from '@/features/learn/types/learn.types';

export default function TakeQuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const { data: quiz, isLoading, isError, refetch } = useTakeQuiz(quizId);
  const submit = useSubmitQuiz(quizId as string);

  const [answers, setAnswers] = useState<Record<string, { optionId?: string; text?: string }>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);

  if (isLoading) return <LoadingState label="Loading quiz…" />;
  if (isError || !quiz) return <ErrorState onRetry={() => refetch()} />;

  const backToLesson = paths.myLessonDetail(quiz.lessonId);
  const questions = [...quiz.questions].sort((a, b) => a.displayOrder - b.displayOrder);
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return q.questionType === 'MCQ' ? !!a?.optionId : !!a?.text?.trim();
  }).length;

  // Already submitted (server) or just submitted (this session) → confirmation view.
  if (result || quiz.alreadySubmitted) {
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Quiz submitted</h1>
            <p className="max-w-sm text-sm text-slate-500">
              {result
                ? `You answered ${result.answered} of ${result.totalQuestions} questions. Your responses have been recorded.`
                : 'You have already completed this quiz. It can only be taken once.'}
            </p>
            <Link
              to={backToLesson}
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to lesson
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  const doSubmit = () => {
    const payload: SubmitAnswer[] = [];
    for (const q of questions) {
      const a = answers[q.id];
      if (q.questionType === 'MCQ' && a?.optionId) {
        payload.push({ questionId: q.id, selectedOptionId: a.optionId });
      } else if (q.questionType === 'OPEN_ENDED' && a?.text?.trim()) {
        payload.push({ questionId: q.id, answerText: a.text.trim() });
      }
    }
    submit.mutate(payload, {
      onSuccess: (res) => { setResult(res); setConfirmOpen(false); },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link to={backToLesson} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> Back to lesson
      </Link>

      <Card>
        <CardBody className="space-y-2">
          <h1 className="text-xl font-bold text-slate-800">{quiz.title}</h1>
          {quiz.description && <p className="text-sm text-slate-600">{quiz.description}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>{questions.length} questions</span>
            {quiz.durationMinutes ? (
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {quiz.durationMinutes} min</span>
            ) : null}
            <span>· {answeredCount} answered</span>
          </div>
        </CardBody>
      </Card>

      {questions.map((q, idx) => (
        <Card key={q.id}>
          <CardBody className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-800">
                {idx + 1}. {q.questionText}
              </p>
              <span className="shrink-0 text-xs text-slate-400">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
            </div>

            {q.questionType === 'MCQ' ? (
              <div className="space-y-2">
                {q.options.map((o) => {
                  const selected = answers[q.id]?.optionId === o.id;
                  return (
                    <label
                      key={o.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                        selected ? 'border-primary bg-primary-50 text-primary' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={o.id}
                        checked={selected}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: { optionId: o.id } }))}
                        className="h-4 w-4 accent-primary"
                      />
                      {o.optionText}
                    </label>
                  );
                })}
              </div>
            ) : (
              <textarea
                rows={4}
                placeholder="Type your answer…"
                value={answers[q.id]?.text ?? ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: { text: e.target.value } }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            )}
          </CardBody>
        </Card>
      ))}

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {answeredCount} of {questions.length} answered · you can submit once
          </p>
          <Button onClick={() => setConfirmOpen(true)} isLoading={submit.isPending}>
            {!submit.isPending && <Send className="h-4 w-4" />} Submit quiz
          </Button>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Submit quiz?"
        message={`You've answered ${answeredCount} of ${questions.length} questions. Once submitted, the quiz can't be retaken.`}
        confirmLabel="Submit"
        isLoading={submit.isPending}
        onConfirm={doSubmit}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
