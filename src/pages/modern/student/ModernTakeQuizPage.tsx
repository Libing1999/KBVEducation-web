import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Send } from 'lucide-react';
import { Card, CardBody } from '@/components/modern/ui/Card';
import { Button } from '@/components/modern/ui/Button';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
import { ConfirmDialog } from '@/components/modern/ui/ConfirmDialog';
import { useTakeQuiz, useSubmitQuiz } from '@/features/learn/hooks/useLearn';
import { paths } from '@/routes/paths';
import type { QuizSubmissionResult, SubmitAnswer } from '@/features/learn/types/learn.types';

/** Modern port of TakeQuizPage — same hooks/answer-state logic, dark styling. */
export default function ModernTakeQuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const { data: quiz, isLoading, isError, refetch } = useTakeQuiz(quizId);
  const submit = useSubmitQuiz(quizId as string);

  const [answers, setAnswers] = useState<Record<string, { optionId?: string; text?: string }>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);

  if (isLoading) return <LoadingState label="Loading Post-Lesson Quiz…" />;
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8fd6ae]/15 text-[#8fd6ae]">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="font-garamond text-lg font-medium text-[#F6F9FE]">Post-Lesson Quiz submitted</h1>
            <p className="max-w-sm text-sm text-[rgba(238,242,249,.55)]">
              {result
                ? `You answered ${result.answered} of ${result.totalQuestions} questions. Your responses have been recorded.`
                : 'You have already completed this Post-Lesson Quiz. It can only be taken once.'}
            </p>
            <Link
              to={backToLesson}
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-[#B0821C] px-4 py-2 text-sm font-medium text-[#DBB652] hover:bg-[#B0821C]/[.1]"
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
      <Link to={backToLesson} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#DBB652] hover:text-[#e8c876]">
        <ArrowLeft className="h-4 w-4" /> Back to lesson
      </Link>

      <Card>
        <CardBody className="space-y-2">
          <h1 className="font-garamond text-xl font-medium text-[#F6F9FE]">{quiz.title}</h1>
          {quiz.description && <p className="text-sm text-[rgba(238,242,249,.7)]">{quiz.description}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[rgba(238,242,249,.5)]">
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
              <p className="text-sm font-medium text-[#EEF2F9]">
                {idx + 1}. {q.questionText}
              </p>
              <span className="shrink-0 text-xs text-[rgba(238,242,249,.4)]">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
            </div>

            {q.questionType === 'MCQ' ? (
              <div className="space-y-2">
                {q.options.map((o) => {
                  const selected = answers[q.id]?.optionId === o.id;
                  return (
                    <label
                      key={o.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                        selected ? 'border-[#B0821C] bg-[#B0821C]/[.12] text-[#DBB652]' : 'border-[rgba(238,242,249,.15)] text-[rgba(238,242,249,.8)] hover:bg-white/[.04]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={o.id}
                        checked={selected}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: { optionId: o.id } }))}
                        className="h-4 w-4 accent-[#B0821C]"
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
                className="w-full rounded-lg border border-[rgba(238,242,249,.15)] bg-[#0A1424] px-3 py-2 text-sm text-[#EEF2F9] placeholder:text-[rgba(238,242,249,.35)] focus:border-[#B0821C] focus:outline-none focus:ring-2 focus:ring-[#B0821C]/30"
              />
            )}
          </CardBody>
        </Card>
      ))}

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[rgba(238,242,249,.55)]">
            {answeredCount} of {questions.length} answered · you can submit once
          </p>
          <Button onClick={() => setConfirmOpen(true)} isLoading={submit.isPending}>
            {!submit.isPending && <Send className="h-4 w-4" />} Submit Post-Lesson Quiz
          </Button>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Submit Post-Lesson Quiz?"
        message={`You've answered ${answeredCount} of ${questions.length} questions. Once submitted, the Post-Lesson Quiz can't be retaken.`}
        confirmLabel="Submit"
        isLoading={submit.isPending}
        onConfirm={doSubmit}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
