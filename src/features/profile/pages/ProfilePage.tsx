import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { FormField } from '@/components/form/FormField';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { profileApi } from '@/features/profile/api/profileApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';
import { roleLabel } from '@/lib/format';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(30).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const setUser = useAuthStore((s) => s.setUser);
  const canEdit = useAuthStore((s) => s.user?.role !== 'PARENT');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.authMe,
    queryFn: profileApi.get,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', phone: '' },
  });

  useEffect(() => {
    if (data) reset({ firstName: data.firstName, lastName: data.lastName, phone: data.phone ?? '' });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      profileApi.update({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone?.trim() ? values.phone.trim() : undefined,
      }),
    onSuccess: (updated) => {
      toast.success('Profile updated');
      setUser({
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role,
        status: updated.status,
      });
      reset({ firstName: updated.firstName, lastName: updated.lastName, phone: updated.phone ?? '' });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) return <LoadingState label="Loading profile…" />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="My Profile" subtitle="View and manage your account details." />

      <Card>
        <CardHeader
          title={`${data.firstName} ${data.lastName}`}
          subtitle={data.email}
          action={<Badge tone="info">{roleLabel(data.role)}</Badge>}
        />
        <CardBody>
          {!canEdit && (
            <p className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
              Your profile is read-only. Contact an administrator to make changes.
            </p>
          )}
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message} required>
                <Input id="firstName" disabled={!canEdit} aria-invalid={!!errors.firstName} {...register('firstName')} />
              </FormField>
              <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message} required>
                <Input id="lastName" disabled={!canEdit} aria-invalid={!!errors.lastName} {...register('lastName')} />
              </FormField>
            </div>

            <FormField label="Email" htmlFor="email">
              <Input id="email" value={data.email} disabled readOnly />
            </FormField>

            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" disabled={!canEdit} {...register('phone')} />
            </FormField>

            {canEdit && (
              <div className="flex justify-end">
                <Button type="submit" isLoading={mutation.isPending} disabled={!isDirty}>
                  Save changes
                </Button>
              </div>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
