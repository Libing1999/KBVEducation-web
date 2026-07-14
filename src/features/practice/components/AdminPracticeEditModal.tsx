import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/form/FormField';
import { useAdminPracticeMutations } from '@/features/practice/hooks/useAdminPractice';
import type { PracticeSession, StudyType } from '@/features/practice/types/practice.types';

const schema = z.object({
  studyDate: z.string().min(1, 'Required'),
  subject: z.string().min(1, 'Required').max(200),
  durationMinutes: z.coerce.number().int().positive('Must be greater than 0'),
  studyType: z.enum(['PAST_PAPER', 'WEAKNESS_PRACTICE', 'GENERAL_PRACTICE']),
  notes: z.string().optional().or(z.literal('')),
  adminComment: z.string().optional().or(z.literal('')),
});
type FormValues = z.input<typeof schema>;

export function AdminPracticeEditModal({
  open,
  onClose,
  session,
}: {
  open: boolean;
  onClose: () => void;
  session: PracticeSession;
}) {
  const { update } = useAdminPracticeMutations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      studyDate: session.studyDate,
      subject: session.subject,
      durationMinutes: session.durationMinutes,
      studyType: session.studyType,
      notes: session.notes ?? '',
      adminComment: session.adminComment ?? '',
    },
  });

  const submit = handleSubmit((v) => {
    update.mutate(
      {
        id: session.id,
        payload: {
          studyDate: v.studyDate,
          subject: v.subject,
          durationMinutes: Number(v.durationMinutes),
          studyType: v.studyType as StudyType,
          notes: v.notes?.toString().trim() ? v.notes.toString().trim() : null,
          adminComment: v.adminComment?.toString().trim() ? v.adminComment.toString().trim() : null,
        },
      },
      { onSuccess: onClose },
    );
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Edit practice session"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={update.isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={update.isPending}>Save changes</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Study date" htmlFor="ap-date" error={errors.studyDate?.message} required>
            <Input id="ap-date" type="date" {...register('studyDate')} />
          </FormField>
          <FormField label="Duration (minutes)" htmlFor="ap-duration" error={errors.durationMinutes?.message} required>
            <Input id="ap-duration" type="number" min={1} {...register('durationMinutes')} />
          </FormField>
        </div>
        <FormField label="Subject" htmlFor="ap-subject" error={errors.subject?.message} required>
          <Input id="ap-subject" {...register('subject')} />
        </FormField>
        <FormField label="Study type" htmlFor="ap-type" error={errors.studyType?.message} required>
          <Select id="ap-type" {...register('studyType')}>
            <option value="PAST_PAPER">Past Paper</option>
            <option value="WEAKNESS_PRACTICE">Weakness Practice</option>
            <option value="GENERAL_PRACTICE">General Practice</option>
          </Select>
        </FormField>
        <FormField label="Notes" htmlFor="ap-notes" error={errors.notes?.message}>
          <textarea id="ap-notes" rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30" {...register('notes')} />
        </FormField>
        <FormField label="Reviewer comment" htmlFor="ap-comment" error={errors.adminComment?.message}>
          <textarea id="ap-comment" rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30" {...register('adminComment')} />
        </FormField>
      </form>
    </Modal>
  );
}
