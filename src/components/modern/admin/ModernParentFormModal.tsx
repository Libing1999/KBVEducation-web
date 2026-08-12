import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/modern/ui/Modal';
import { Button } from '@/components/modern/ui/Button';
import { Input } from '@/components/modern/ui/Input';
import { Select } from '@/components/modern/ui/Select';
import { PasswordInput } from '@/components/modern/ui/PasswordInput';
import { FormField } from '@/components/modern/ui/FormField';
import { useParentMutations } from '@/features/parents/hooks/useParents';
import { useStudents } from '@/features/students/hooks/useStudents';
import type { ParentResponse } from '@/features/parents/types/parent.types';

const createSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().max(30).optional().or(z.literal('')),
  studentId: z.string().optional().or(z.literal('')),
});
const editSchema = createSchema.pick({ firstName: true, lastName: true, phone: true });
type FormValues = z.infer<typeof createSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  parent?: ParentResponse | null;
}

/** Modern port of ParentFormModal — same schema/mutations, dark styling. */
export function ModernParentFormModal({ open, onClose, parent }: Props) {
  const isEdit = !!parent;
  const { create, update } = useParentMutations();
  const { data: studentPage } = useStudents({ page: 0, size: 100 });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    values: isEdit
      ? { firstName: parent!.firstName, lastName: parent!.lastName, phone: parent!.phone ?? '', email: '', password: '', studentId: '' }
      : { firstName: '', lastName: '', email: '', password: '', phone: '', studentId: '' },
  });

  const submit = handleSubmit((v) => {
    const phone = v.phone?.trim() ? v.phone.trim() : undefined;
    if (isEdit) {
      update.mutate(
        { id: parent!.id, payload: { firstName: v.firstName, lastName: v.lastName, phone } },
        { onSuccess: () => { reset(); onClose(); } },
      );
    } else {
      create.mutate(
        { email: v.email, password: v.password, firstName: v.firstName, lastName: v.lastName, phone, studentId: v.studentId || undefined },
        { onSuccess: () => { reset(); onClose(); } },
      );
    }
  });

  const isPending = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Parent' : 'Create Parent'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={isPending}>{isEdit ? 'Save changes' : 'Create parent'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="First name" htmlFor="mp-firstName" error={errors.firstName?.message} required>
            <Input id="mp-firstName" aria-invalid={!!errors.firstName} {...register('firstName')} />
          </FormField>
          <FormField label="Last name" htmlFor="mp-lastName" error={errors.lastName?.message} required>
            <Input id="mp-lastName" aria-invalid={!!errors.lastName} {...register('lastName')} />
          </FormField>
        </div>

        {!isEdit && (
          <>
            <FormField label="Email" htmlFor="mp-email" error={errors.email?.message} required>
              <Input id="mp-email" type="email" aria-invalid={!!errors.email} {...register('email')} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Password" htmlFor="mp-password" error={errors.password?.message} required>
                <PasswordInput id="mp-password" aria-invalid={!!errors.password} {...register('password')} />
              </FormField>
              <FormField label="Link student (optional)" htmlFor="mp-student" error={errors.studentId?.message}>
                <Select id="mp-student" {...register('studentId')}>
                  <option value="">None</option>
                  {studentPage?.content.map((s) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} · {s.email}</option>
                  ))}
                </Select>
              </FormField>
            </div>
          </>
        )}

        <FormField label="Phone" htmlFor="mp-phone" error={errors.phone?.message}>
          <Input id="mp-phone" {...register('phone')} />
        </FormField>
      </form>
    </Modal>
  );
}
