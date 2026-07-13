import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/form/FormField';
import { useQuizMutations } from '@/features/quizzes/hooks/useQuiz';
import type { QuestionResponse } from '@/features/quizzes/types/quiz.types';

const OPTION_COUNT = 4;
const EMPTY_OPTIONS = Array.from({ length: OPTION_COUNT }, () => ({ optionText: '' }));

const schema = z
  .object({
    questionText: z.string().min(1, 'Question text is required'),
    questionType: z.enum(['MCQ', 'OPEN_ENDED']),
    marks: z.coerce.number().int('Whole number').positive('Must be greater than 0'),
    correctIndex: z.coerce.number().int().min(0).max(OPTION_COUNT - 1),
    options: z.array(z.object({ optionText: z.string() })).length(OPTION_COUNT),
  })
  .superRefine((val, ctx) => {
    if (val.questionType === 'MCQ') {
      val.options.forEach((o, i) => {
        if (!o.optionText.trim()) {
          ctx.addIssue({ path: ['options', i, 'optionText'], code: z.ZodIssueCode.custom, message: 'Required' });
        }
      });
    }
  });
type FormValues = z.input<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  lessonId: string;
  quizId: string;
  question?: QuestionResponse | null;
}

export function QuestionFormModal({ open, onClose, lessonId, quizId, question }: Props) {
  const isEdit = !!question;
  const { addQuestion, updateQuestion } = useQuizMutations(lessonId);

  const editOptions =
    question && question.questionType === 'MCQ'
      ? [...question.options]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((o) => ({ optionText: o.optionText }))
      : EMPTY_OPTIONS;
  const editCorrectIndex =
    question && question.questionType === 'MCQ'
      ? Math.max(
          0,
          [...question.options].sort((a, b) => a.displayOrder - b.displayOrder).findIndex((o) => o.correct),
        )
      : 0;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      questionText: question?.questionText ?? '',
      questionType: question?.questionType ?? 'MCQ',
      marks: question?.marks ?? 1,
      correctIndex: editCorrectIndex,
      options: editOptions.length === OPTION_COUNT ? editOptions : EMPTY_OPTIONS,
    },
  });

  const type = watch('questionType');

  const submit = handleSubmit((v) => {
    const payload =
      v.questionType === 'MCQ'
        ? {
            questionText: v.questionText.trim(),
            questionType: 'MCQ' as const,
            marks: Number(v.marks),
            options: v.options.map((o, i) => ({
              optionText: o.optionText.trim(),
              correct: i === Number(v.correctIndex),
            })),
          }
        : {
            questionText: v.questionText.trim(),
            questionType: 'OPEN_ENDED' as const,
            marks: Number(v.marks),
          };

    const done = () => { reset(); onClose(); };
    if (isEdit) {
      updateQuestion.mutate({ questionId: question!.id, payload }, { onSuccess: done });
    } else {
      addQuestion.mutate({ quizId, payload }, { onSuccess: done });
    }
  });

  const isPending = addQuestion.isPending || updateQuestion.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit question' : 'Add question'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={isPending}>{isEdit ? 'Save question' : 'Add question'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Type" htmlFor="qt-type" error={errors.questionType?.message} required>
            <Select id="qt-type" {...register('questionType')}>
              <option value="MCQ">Multiple choice</option>
              <option value="OPEN_ENDED">Open ended</option>
            </Select>
          </FormField>
          <FormField label="Marks" htmlFor="qt-marks" error={errors.marks?.message} required>
            <Input id="qt-marks" type="number" min={1} {...register('marks')} />
          </FormField>
        </div>

        <FormField label="Question" htmlFor="qt-text" error={errors.questionText?.message} required>
          <textarea
            id="qt-text"
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            {...register('questionText')}
          />
        </FormField>

        {type === 'MCQ' ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              Options <span className="text-slate-400">— select the correct answer</span>
            </p>
            {EMPTY_OPTIONS.map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <input
                  type="radio"
                  value={i}
                  aria-label={`Mark option ${i + 1} correct`}
                  className="mt-3 h-4 w-4 shrink-0 accent-primary"
                  {...register('correctIndex')}
                />
                <div className="flex-1">
                  <Input
                    placeholder={`Option ${i + 1}`}
                    aria-invalid={!!errors.options?.[i]?.optionText}
                    {...register(`options.${i}.optionText` as const)}
                  />
                  {errors.options?.[i]?.optionText && (
                    <p className="mt-1 text-xs text-red-600">{errors.options[i]?.optionText?.message}</p>
                  )}
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-400">Exactly 4 options are required, with one marked correct.</p>
          </div>
        ) : (
          <p className="rounded-lg bg-secondary px-4 py-3 text-sm text-slate-500">
            Open-ended questions are answered in free text by the student and reviewed manually. No options needed.
          </p>
        )}
      </form>
    </Modal>
  );
}
