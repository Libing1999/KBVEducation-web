import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate } from 'react-router-dom';
import { FormField } from '@/components/form/FormField';
import { PasswordInput } from '@/components/form/PasswordInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { loginSchema, type LoginFormValues } from '@/features/auth/schema/authSchemas';
import { paths } from '@/routes/paths';

export default function LoginPage() {
  const { login, isLoggingIn, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Already signed in — skip the login screen.
  if (isAuthenticated) {
    return <Navigate to={paths.dashboard} replace />;
  }

  const onSubmit = (values: LoginFormValues) => login(values);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-800">Sign in</h2>
        <p className="text-sm text-slate-500">Enter your credentials to access your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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

        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <div className="flex justify-end">
          <Link
            to={paths.forgotPassword}
            className="text-sm font-medium text-primary hover:text-primary-600"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={isLoggingIn}>
          Sign in
        </Button>
      </form>
    </div>
  );
}
