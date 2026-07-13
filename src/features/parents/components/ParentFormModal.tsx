import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PasswordInput } from '@/components/form/PasswordInput';
import { FormField } from '@/components/form/FormField';
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

export function ParentFormModal({ open, onClose, parent }: Props) {
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
          <FormField label="First name" htmlFor="p-firstName" error={errors.firstName?.message} required>
            <Input id="p-firstName" aria-invalid={!!errors.firstName} {...register('firstName')} />
          </FormField>
          <FormField label="Last name" htmlFor="p-lastName" error={errors.lastName?.message} required>
            <Input id="p-lastName" aria-invalid={!!errors.lastName} {...register('lastName')} />
          </FormField>
        </div>

        {!isEdit && (
          <>
            <FormField label="Email" htmlFor="p-email" error={errors.email?.message} required>
              <Input id="p-email" type="email" aria-invalid={!!errors.email} {...register('email')} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Password" htmlFor="p-password" error={errors.password?.message} required>
                <PasswordInput id="p-password" aria-invalid={!!errors.password} {...register('password')} />
              </FormField>
              <FormField label="Link student (optional)" htmlFor="p-student" error={errors.studentId?.message}>
                <Select id="p-student" {...register('studentId')}>
                  <option value="">None</option>
                  {studentPage?.content.map((s) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} · {s.email}</option>
                  ))}
                </Select>
              </FormField>
            </div>
          </>
        )}

        <FormField label="Phone" htmlFor="p-phone" error={errors.phone?.message}>
          <Input id="p-phone" {...register('phone')} />
        </FormField>
      </form>
    </Modal>
  );
}
