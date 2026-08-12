import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/modern/ui/Modal';
import { Button } from '@/components/modern/ui/Button';
import { Input } from '@/components/modern/ui/Input';
import { Select } from '@/components/modern/ui/Select';
import { PasswordInput } from '@/components/modern/ui/PasswordInput';
import { FormField } from '@/components/modern/ui/FormField';
import { useStudentMutations } from '@/features/students/hooks/useStudents';
import { useCohorts } from '@/features/cohorts/hooks/useCohorts';
import type { StudentResponse } from '@/features/students/types/student.types';

const createSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().max(30).optional().or(z.literal('')),
  cohortId: z.string().optional().or(z.literal('')),
});
const editSchema = createSchema.pick({ firstName: true, lastName: true, phone: true });
type FormValues = z.infer<typeof createSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  student?: StudentResponse | null;
}

/** Modern port of StudentFormModal — same schema/mutations, dark styling. */
export function ModernStudentFormModal({ open, onClose, student }: Props) {
  const isEdit = !!student;
  const { create, update } = useStudentMutations();
  const { data: cohortPage } = useCohorts({ page: 0, size: 100 });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    values: isEdit
      ? { firstName: student!.firstName, lastName: student!.lastName, phone: student!.phone ?? '', email: '', password: '', cohortId: '' }
      : { firstName: '', lastName: '', email: '', password: '', phone: '', cohortId: '' },
  });

  const submit = handleSubmit((v) => {
    const phone = v.phone?.trim() ? v.phone.trim() : undefined;
    if (isEdit) {
      update.mutate(
        { id: student!.id, payload: { firstName: v.firstName, lastName: v.lastName, phone } },
        { onSuccess: () => { reset(); onClose(); } },
      );
    } else {
      create.mutate(
        {
          email: v.email,
          password: v.password,
          firstName: v.firstName,
          lastName: v.lastName,
          phone,
          cohortId: v.cohortId ? v.cohortId : undefined,
        },
        { onSuccess: () => { reset(); onClose(); } },
      );
    }
  });

  const isPending = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Student' : 'Create Student'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={isPending}>{isEdit ? 'Save changes' : 'Create student'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="First name" htmlFor="ms-firstName" error={errors.firstName?.message} required>
            <Input id="ms-firstName" aria-invalid={!!errors.firstName} {...register('firstName')} />
          </FormField>
          <FormField label="Last name" htmlFor="ms-lastName" error={errors.lastName?.message} required>
            <Input id="ms-lastName" aria-invalid={!!errors.lastName} {...register('lastName')} />
          </FormField>
        </div>

        {!isEdit && (
          <>
            <FormField label="Email" htmlFor="ms-email" error={errors.email?.message} required>
              <Input id="ms-email" type="email" aria-invalid={!!errors.email} {...register('email')} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Password" htmlFor="ms-password" error={errors.password?.message} required>
                <PasswordInput id="ms-password" aria-invalid={!!errors.password} {...register('password')} />
              </FormField>
              <FormField label="Cohort (optional)" htmlFor="ms-cohort" error={errors.cohortId?.message}>
                <Select id="ms-cohort" {...register('cohortId')}>
                  <option value="">Unassigned</option>
                  {cohortPage?.content.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </FormField>
            </div>
          </>
        )}

        <FormField label="Phone" htmlFor="ms-phone" error={errors.phone?.message}>
          <Input id="ms-phone" {...register('phone')} />
        </FormField>
      </form>
    </Modal>
  );
}
