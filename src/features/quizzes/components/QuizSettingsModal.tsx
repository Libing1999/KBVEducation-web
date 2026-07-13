import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/form/FormField';
import { useQuizMutations } from '@/features/quizzes/hooks/useQuiz';
import type { QuizResponse } from '@/features/quizzes/types/quiz.types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional().or(z.literal('')),
  durationMinutes: z.coerce.number().int().positive('Must be greater than 0').optional().or(z.literal('')),
  passingMarks: z.coerce.number().int().min(0, 'Cannot be negative').optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});
type FormValues = z.input<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  lessonId: string;
  quiz?: QuizResponse | null;
}

export function QuizSettingsModal({ open, onClose, lessonId, quiz }: Props) {
  const isEdit = !!quiz;
  const { upsert } = useQuizMutations(lessonId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      title: quiz?.title ?? '',
      description: quiz?.description ?? '',
      durationMinutes: quiz?.durationMinutes ?? '',
      passingMarks: quiz?.passingMarks ?? '',
      status: quiz?.status ?? 'DRAFT',
    },
  });

  const submit = handleSubmit((v) => {
    upsert.mutate(
      {
        title: v.title,
        description: v.description?.toString().trim() ? v.description.toString().trim() : null,
        durationMinutes: v.durationMinutes === '' || v.durationMinutes == null ? null : Number(v.durationMinutes),
        passingMarks: v.passingMarks === '' || v.passingMarks == null ? null : Number(v.passingMarks),
        status: v.status,
      },
      { onSuccess: () => { reset(); onClose(); } },
    );
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Quiz settings' : 'Create quiz'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={upsert.isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={upsert.isPending}>{isEdit ? 'Save changes' : 'Create quiz'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormField label="Title" htmlFor="q-title" error={errors.title?.message} required>
          <Input id="q-title" aria-invalid={!!errors.title} {...register('title')} />
        </FormField>

        <FormField label="Description" htmlFor="q-desc" error={errors.description?.message}>
          <textarea
            id="q-desc"
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            {...register('description')}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Duration (minutes)" htmlFor="q-duration" error={errors.durationMinutes?.message}>
            <Input id="q-duration" type="number" min={1} placeholder="Optional" {...register('durationMinutes')} />
          </FormField>
          <FormField label="Passing marks" htmlFor="q-passing" error={errors.passingMarks?.message}>
            <Input id="q-passing" type="number" min={0} placeholder="Optional" {...register('passingMarks')} />
          </FormField>
        </div>

        <FormField label="Status" htmlFor="q-status" error={errors.status?.message} required>
          <Select id="q-status" {...register('status')}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </Select>
        </FormField>
      </form>
    </Modal>
  );
}
