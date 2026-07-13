import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { LoginRequest } from '@/features/auth/types/auth.types';
import { paths } from '@/routes/paths';
import { queryClient } from '@/lib/queryClient';
import { getErrorMessage } from '@/lib/utils';

/**
 * Auth actions and derived state for components. Wraps the API in React Query
 * mutations and keeps the Zustand store in sync.
 */
export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setAuth, logout: clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (res) => {
      setAuth({ user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken });
      toast.success(`Welcome back, ${res.user.firstName}`);
      navigate(paths.dashboard, { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Login failed'));
    },
  });

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort server-side logout; proceed regardless.
    } finally {
      clearAuth();
      queryClient.clear();
      navigate(paths.login, { replace: true });
    }
  };

  return {
    user,
    isAuthenticated,
    role: user?.role,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}
