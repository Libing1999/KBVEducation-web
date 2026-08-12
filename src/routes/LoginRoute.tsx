import { AuthLayout } from '@/components/layout/AuthLayout';
import LoginPage from '@/features/auth/pages/LoginPage';
import { ModernLoginPage } from '@/pages/modern/ModernLoginPage';
import { useSelectedUI } from '@/theme/uiSelector';

/**
 * Resolves the /login route to the Default or Modern UI based on the
 * selected-ui preference. The URL, guards, and underlying LoginPage/useAuth
 * logic are identical either way — only the rendered component differs.
 */
export function LoginRoute() {
  const ui = useSelectedUI();

  if (ui === 'modern') {
    return <ModernLoginPage />;
  }

  return (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  );
}
