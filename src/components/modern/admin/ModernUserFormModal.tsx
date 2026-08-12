import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/modern/ui/Modal';
import { Button } from '@/components/modern/ui/Button';
import { Input } from '@/components/modern/ui/Input';
import { Select } from '@/components/modern/ui/Select';
import { PasswordInput } from '@/components/modern/ui/PasswordInput';
import { FormField } from '@/components/modern/ui/FormField';
import {
  createUserSchema,
  editUserSchema,
  type CreateUserFormValues,
} from '@/features/users/schema/userSchemas';
import { useUserMutations } from '@/features/users/hooks/useUsers';
import type { UserResponse } from '@/features/users/types/user.types';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: UserResponse | null;
}

/** Modern port of UserFormModal — same schema/mutations, dark styling. */
export function ModernUserFormModal({ open, onClose, user }: UserFormModalProps) {
  const isEdit = !!user;
  const { create, update } = useUserMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(isEdit ? editUserSchema : createUserSchema),
    values: isEdit
      ? {
          firstName: user!.firstName,
          lastName: user!.lastName,
          phone: user!.phone ?? '',
          email: user!.email,
          password: '',
          role: user!.role,
        }
      : { firstName: '', lastName: '', email: '', password: '', phone: '', role: 'STUDENT' },
  });

  const submit = handleSubmit((values) => {
    const phone = values.phone?.trim() ? values.phone.trim() : undefined;
    if (isEdit) {
      update.mutate(
        { id: user!.id, payload: { firstName: values.firstName, lastName: values.lastName, phone } },
        { onSuccess: () => { reset(); onClose(); } },
      );
    } else {
      create.mutate(
        {
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          phone,
          role: values.role,
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
      title={isEdit ? 'Edit User' : 'Create User'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={isPending}>
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="First name" htmlFor="m-firstName" error={errors.firstName?.message} required>
            <Input id="m-firstName" aria-invalid={!!errors.firstName} {...register('firstName')} />
          </FormField>
          <FormField label="Last name" htmlFor="m-lastName" error={errors.lastName?.message} required>
            <Input id="m-lastName" aria-invalid={!!errors.lastName} {...register('lastName')} />
          </FormField>
        </div>

        {!isEdit && (
          <>
            <FormField label="Email" htmlFor="m-email" error={errors.email?.message} required>
              <Input id="m-email" type="email" aria-invalid={!!errors.email} {...register('email')} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Password" htmlFor="m-password" error={errors.password?.message} required>
                <PasswordInput id="m-password" aria-invalid={!!errors.password} {...register('password')} />
              </FormField>
              <FormField label="Role" htmlFor="m-role" error={errors.role?.message} required>
                <Select id="m-role" {...register('role')}>
                  <option value="STUDENT">Student</option>
                  <option value="PARENT">Parent</option>
                  <option value="SUPER_ADMIN">Administrator</option>
                </Select>
              </FormField>
            </div>
          </>
        )}

        <FormField label="Phone" htmlFor="m-phone" error={errors.phone?.message}>
          <Input id="m-phone" {...register('phone')} />
        </FormField>
      </form>
    </Modal>
  );
}
