import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate } from 'react-router-dom';
import { ModernAuthLayout } from '@/layouts/modern/ModernAuthLayout';
import { ModernSegmentedControl } from '@/components/modern/ModernSegmentedControl';
import { PasswordInput } from '@/components/form/PasswordInput';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { loginSchema, type LoginFormValues } from '@/features/auth/schema/authSchemas';
import { paths } from '@/routes/paths';
import { setWelcomePending } from '@/theme/modernWelcomeFlag';
import { cn } from '@/lib/utils';

const fieldClasses = cn(
  'min-h-[50px] rounded-[11px] border-[rgba(255,255,255,.13)] bg-[#0A1424] px-[15px] py-[14px] text-[14.5px]',
  'text-[#EEF2F9] placeholder:text-[rgba(238,242,249,.4)]',
  'focus:border-[#B0821C] focus:outline-none focus:ring-0',
);

/**
 * Modern UI's login screen. Visual-only reimplementation of the Default
 * LoginPage: same react-hook-form + zod schema, same useAuth() mutation,
 * same validation/error/loading behavior, same navigation on success. The
 * only Modern-specific addition is flagging the Welcome screen to show next
 * (see AuthenticatedShell) — no auth/business logic is altered.
 */
export function ModernLoginPage() {
  const { login, isLoggingIn, isAuthenticated } = useAuth();
  const [audience, setAudience] = useState<'Student' | 'Parent'>('Student');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isAuthenticated) {
    return <Navigate to={paths.dashboard} replace />;
  }

  const onSubmit = (values: LoginFormValues) => {
    login(values, { onSuccess: () => setWelcomePending() });
  };

  return (
    <ModernAuthLayout>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1 className="mb-2 font-garamond text-[clamp(28px,3.4vw,34px)] font-medium text-[#EEF2F9]">
          Sign in
        </h1>
        <p className="mb-[clamp(24px,4vh,32px)] text-[13px] leading-[1.5] text-[rgba(238,242,249,.72)]">
          For enrolled students and parents.
        </p>

        <ModernSegmentedControl
          options={['Student', 'Parent']}
          value={audience}
          onChange={(v) => setAudience(v as 'Student' | 'Parent')}
          className="mb-[22px]"
        />

        <div className="mb-4">
          <label
            htmlFor="modern-email"
            className="mb-2 block text-[10.5px] uppercase tracking-[0.16em] text-[rgba(238,242,249,.66)]"
          >
            Username
          </label>
          <Input
            id="modern-email"
            type="email"
            autoComplete="username"
            aria-invalid={!!errors.email}
            className={fieldClasses}
            {...register('email')}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="mb-4">
          <label
            htmlFor="modern-password"
            className="mb-2 block text-[10.5px] uppercase tracking-[0.16em] text-[rgba(238,242,249,.66)]"
          >
            Password
          </label>
          <PasswordInput
            id="modern-password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            className={fieldClasses}
            {...register('password')}
          />
          {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoggingIn}
          className={cn(
            'mt-1.5 min-h-[52px] w-full rounded-xl text-[14.5px] font-semibold text-[#231803] transition-transform',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'hover:-translate-y-px',
          )}
          style={{
            background: 'linear-gradient(180deg,#F4D888,#B0821C)',
            boxShadow: '0 1px 0 rgba(255,255,255,.4) inset, 0 6px 16px rgba(176,130,28,.32)',
          }}
        >
          {isLoggingIn ? 'Signing in…' : 'Continue'}
        </button>

        <p className="mt-5 text-center text-[12.5px]">
          <Link
            to={paths.forgotPassword}
            className="text-[rgba(238,242,249,.72)] hover:text-[#F4D888]"
          >
            Trouble signing in?
          </Link>
        </p>
      </form>
    </ModernAuthLayout>
  );
}

export default ModernLoginPage;
