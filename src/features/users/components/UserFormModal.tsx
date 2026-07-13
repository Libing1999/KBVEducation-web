import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PasswordInput } from '@/components/form/PasswordInput';
import { FormField } from '@/components/form/FormField';
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

/** Create (all fields) or edit (profile fields only) a user. */
export function UserFormModal({ open, onClose, user }: UserFormModalProps) {
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
          // Unused in edit mode but needed to satisfy the shared form type.
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
          <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message} required>
            <Input id="firstName" aria-invalid={!!errors.firstName} {...register('firstName')} />
          </FormField>
          <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message} required>
            <Input id="lastName" aria-invalid={!!errors.lastName} {...register('lastName')} />
          </FormField>
        </div>

        {!isEdit && (
          <>
            <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
              <Input id="email" type="email" aria-invalid={!!errors.email} {...register('email')} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
                <PasswordInput id="password" aria-invalid={!!errors.password} {...register('password')} />
              </FormField>
              <FormField label="Role" htmlFor="role" error={errors.role?.message} required>
                <Select id="role" {...register('role')}>
                  <option value="STUDENT">Student</option>
                  <option value="PARENT">Parent</option>
                  <option value="SUPER_ADMIN">Administrator</option>
                </Select>
              </FormField>
            </div>
          </>
        )}

        <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" {...register('phone')} />
        </FormField>
      </form>
    </Modal>
  );
}
