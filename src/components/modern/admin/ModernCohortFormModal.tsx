import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/modern/ui/Modal';
import { Button } from '@/components/modern/ui/Button';
import { Input } from '@/components/modern/ui/Input';
import { Select } from '@/components/modern/ui/Select';
import { FormField } from '@/components/modern/ui/FormField';
import { useCohortMutations } from '@/features/cohorts/hooks/useCohorts';
import type { CohortResponse } from '@/features/cohorts/types/cohort.types';

const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(150),
    description: z.string().max(5000).optional().or(z.literal('')),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    examDate: z.string().optional().or(z.literal('')),
    status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
    maxStudents: z.coerce.number().int('Must be a whole number').min(0, 'Must be 0 or more'),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  });
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  cohort?: CohortResponse | null;
}

/** Modern port of CohortFormModal — same schema/mutations, dark styling. */
export function ModernCohortFormModal({ open, onClose, cohort }: Props) {
  const isEdit = !!cohort;
  const { create, update } = useCohortMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name: cohort?.name ?? '',
      description: cohort?.description ?? '',
      startDate: cohort?.startDate ?? '',
      endDate: cohort?.endDate ?? '',
      examDate: cohort?.examDate ?? '',
      status: cohort?.status ?? 'UPCOMING',
      maxStudents: cohort?.maxStudents ?? 0,
    },
  });

  const submit = handleSubmit((v) => {
    const payload = {
      name: v.name,
      description: v.description?.trim() ? v.description.trim() : undefined,
      startDate: v.startDate,
      endDate: v.endDate,
      examDate: v.examDate ? v.examDate : null,
      status: v.status,
      maxStudents: v.maxStudents,
    };
    if (isEdit) {
      update.mutate({ id: cohort!.id, payload }, { onSuccess: () => { reset(); onClose(); } });
    } else {
      create.mutate(payload, { onSuccess: () => { reset(); onClose(); } });
    }
  });

  const isPending = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Cohort' : 'Create Cohort'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={isPending}>{isEdit ? 'Save changes' : 'Create cohort'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormField label="Name" htmlFor="mc-name" error={errors.name?.message} required>
          <Input id="mc-name" aria-invalid={!!errors.name} {...register('name')} />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Start date" htmlFor="mc-start" error={errors.startDate?.message} required>
            <Input id="mc-start" type="date" aria-invalid={!!errors.startDate} {...register('startDate')} />
          </FormField>
          <FormField label="End date" htmlFor="mc-end" error={errors.endDate?.message} required>
            <Input id="mc-end" type="date" aria-invalid={!!errors.endDate} {...register('endDate')} />
          </FormField>
          <FormField label="Exam date" htmlFor="mc-exam" error={errors.examDate?.message}>
            <Input id="mc-exam" type="date" {...register('examDate')} />
          </FormField>
          <FormField label="Max students" htmlFor="mc-max" error={errors.maxStudents?.message}>
            <Input id="mc-max" type="number" min={0} {...register('maxStudents')} />
          </FormField>
        </div>

        <FormField label="Status" htmlFor="mc-status" error={errors.status?.message} required>
          <Select id="mc-status" {...register('status')}>
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </FormField>

        <FormField label="Description" htmlFor="mc-desc" error={errors.description?.message}>
          <textarea
            id="mc-desc"
            rows={3}
            className="w-full rounded-lg border border-[rgba(238,242,249,.15)] bg-[#0A1424] px-3 py-2 text-sm text-[#EEF2F9] focus:border-[#B0821C] focus:outline-none focus:ring-2 focus:ring-[#B0821C]/30"
            {...register('description')}
          />
        </FormField>
      </form>
    </Modal>
  );
}
