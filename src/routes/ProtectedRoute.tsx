import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { paths } from '@/routes/paths';

/**
 * Gate for authenticated areas. Redirects unauthenticated users to the login
 * page, preserving the attempted location so they can be returned after login.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
