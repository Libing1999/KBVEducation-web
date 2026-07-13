import { Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { QuizResponse } from '@/features/quizzes/types/quiz.types';

/** Read-only, student-eye preview of the quiz (correct answers highlighted for the admin). */
export function QuizPreviewModal({
  open,
  onClose,
  quiz,
}: {
  open: boolean;
  onClose: () => void;
  quiz: QuizResponse;
}) {
  const questions = [...quiz.questions].sort((a, b) => a.displayOrder - b.displayOrder);
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <Modal open={open} onClose={onClose} size="lg" title={`Preview — ${quiz.title}`}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <Badge tone={quiz.status === 'PUBLISHED' ? 'success' : 'neutral'}>{quiz.status}</Badge>
          <span>{questions.length} questions</span>
          <span>· {totalMarks} marks total</span>
          {quiz.durationMinutes ? <span>· {quiz.durationMinutes} min</span> : null}
          {quiz.passingMarks != null ? <span>· pass ≥ {quiz.passingMarks}</span> : null}
        </div>

        {quiz.description && <p className="text-sm text-slate-600">{quiz.description}</p>}

        {questions.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No questions added yet.</p>
        ) : (
          <ol className="space-y-5">
            {questions.map((q, idx) => (
              <li key={q.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800">
                    {idx + 1}. {q.questionText}
                  </p>
                  <span className="shrink-0 text-xs text-slate-400">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
                </div>

                {q.questionType === 'MCQ' ? (
                  <ul className="mt-3 space-y-1.5">
                    {[...q.options].sort((a, b) => a.displayOrder - b.displayOrder).map((o) => (
                      <li
                        key={o.id}
                        className={
                          o.correct
                            ? 'flex items-center gap-2 rounded-md bg-green-50 px-3 py-1.5 text-sm text-green-800'
                            : 'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-slate-600'
                        }
                      >
                        {o.correct ? (
                          <Check className="h-4 w-4 shrink-0 text-green-600" />
                        ) : (
                          <span className="h-4 w-4 shrink-0 rounded-full border border-slate-300" />
                        )}
                        {o.optionText}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3 rounded-md border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-400">
                    Free-text answer
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </Modal>
  );
}
