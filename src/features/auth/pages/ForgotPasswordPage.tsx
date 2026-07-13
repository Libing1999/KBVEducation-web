import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { FormField } from '@/components/form/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/features/auth/api/authApi';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schema/authSchemas';
import { paths } from '@/routes/paths';

/**
 * UI-only forgot-password flow for Phase 1. Submits to the backend stub, which
 * always responds success (no email is actually delivered yet).
 */
export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordFormValues) => authApi.forgotPassword(values.email),
  });

  if (mutation.isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary">
          <MailCheck className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Check your email</h2>
        <p className="text-sm text-slate-500">
          If an account exists for <span className="font-medium">{getValues('email')}</span>, we’ve
          sent password reset instructions.
        </p>
        <Link
          to={paths.login}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-800">Forgot password</h2>
        <p className="text-sm text-slate-500">
          Enter your email and we’ll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <Button type="submit" fullWidth isLoading={mutation.isPending}>
          Send reset link
        </Button>

        <Link
          to={paths.login}
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </form>
    </div>
  );
}
