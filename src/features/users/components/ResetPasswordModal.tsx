import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/form/PasswordInput';
import { FormField } from '@/components/form/FormField';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/users/schema/userSchemas';
import { useUserMutations } from '@/features/users/hooks/useUsers';
import type { UserResponse } from '@/features/users/types/user.types';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  user: UserResponse | null;
}

export function ResetPasswordModal({ open, onClose, user }: ResetPasswordModalProps) {
  const { resetPassword } = useUserMutations();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '' },
  });

  const submit = handleSubmit((values) => {
    if (!user) return;
    resetPassword.mutate(
      { id: user.id, newPassword: values.newPassword },
      { onSuccess: () => { reset(); onClose(); } },
    );
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset Password"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={resetPassword.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={resetPassword.isPending}>
            Reset password
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <p className="text-sm text-slate-500">
          Set a new password for{' '}
          <span className="font-medium text-slate-700">
            {user?.firstName} {user?.lastName}
          </span>
          . Their active sessions will be signed out.
        </p>
        <FormField label="New password" htmlFor="newPassword" error={errors.newPassword?.message} required>
          <PasswordInput id="newPassword" aria-invalid={!!errors.newPassword} {...register('newPassword')} />
        </FormField>
      </form>
    </Modal>
  );
}
