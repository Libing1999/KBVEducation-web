import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/form/FormField';
import { useLessonMutations } from '@/features/lessons/hooks/useLessons';
import { useCohorts } from '@/features/cohorts/hooks/useCohorts';
import type { LessonResponse } from '@/features/lessons/types/lesson.types';

const schema = z.object({
  cohortId: z.string(),
  lessonNumber: z.coerce.number().int('Must be a whole number').min(1, 'Must be at least 1'),
  title: z.string().min(1, 'Title is required').max(200),
  summary: z.string().max(5000).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  lessonDate: z.string().optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  lesson?: LessonResponse | null;
  defaultCohortId?: string;
}

export function LessonFormModal({ open, onClose, lesson, defaultCohortId }: Props) {
  const isEdit = !!lesson;
  const { create, update } = useLessonMutations();
  const { data: cohortPage } = useCohorts({ page: 0, size: 100 });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      cohortId: lesson?.cohortId ?? defaultCohortId ?? '',
      lessonNumber: lesson?.lessonNumber ?? 1,
      title: lesson?.title ?? '',
      summary: lesson?.summary ?? '',
      description: lesson?.description ?? '',
      lessonDate: lesson?.lessonDate ?? '',
    },
  });

  const submit = handleSubmit((v) => {
    const common = {
      lessonNumber: v.lessonNumber,
      title: v.title,
      summary: v.summary?.trim() ? v.summary.trim() : undefined,
      description: v.description?.trim() ? v.description.trim() : undefined,
      lessonDate: v.lessonDate ? v.lessonDate : null,
    };
    if (isEdit) {
      update.mutate({ id: lesson!.id, payload: common }, { onSuccess: () => { reset(); onClose(); } });
    } else {
      if (!v.cohortId) return;
      create.mutate({ cohortId: v.cohortId, ...common }, { onSuccess: () => { reset(); onClose(); } });
    }
  });

  const isPending = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Lesson' : 'Create Lesson'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={isPending}>{isEdit ? 'Save changes' : 'Create lesson'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {!isEdit && (
          <FormField label="Cohort" htmlFor="l-cohort" error={errors.cohortId?.message} required>
            <Select id="l-cohort" {...register('cohortId')}>
              <option value="">Select a cohort…</option>
              {cohortPage?.content.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FormField>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Lesson #" htmlFor="l-number" error={errors.lessonNumber?.message} required>
            <Input id="l-number" type="number" min={1} {...register('lessonNumber')} />
          </FormField>
          <FormField label="Title" htmlFor="l-title" error={errors.title?.message} required className="sm:col-span-2">
            <Input id="l-title" aria-invalid={!!errors.title} {...register('title')} />
          </FormField>
        </div>

        <FormField label="Lesson date" htmlFor="l-date" error={errors.lessonDate?.message}>
          <Input id="l-date" type="date" {...register('lessonDate')} />
        </FormField>

        <FormField label="Summary" htmlFor="l-summary" error={errors.summary?.message}>
          <textarea
            id="l-summary"
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            {...register('summary')}
          />
        </FormField>

        <FormField label="Description" htmlFor="l-desc" error={errors.description?.message}>
          <textarea
            id="l-desc"
            rows={3}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            {...register('description')}
          />
        </FormField>
      </form>
    </Modal>
  );
}
