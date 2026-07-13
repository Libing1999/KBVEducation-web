import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { Role } from '@/features/auth/types/auth.types';
import { paths } from '@/routes/paths';

interface RoleGuardProps {
  allow: Role[];
}

/**
 * Restricts a route subtree to the given roles. Users without an allowed role
 * are bounced back to their dashboard rather than the login page.
 */
export function RoleGuard({ allow }: RoleGuardProps) {
  const role = useAuthStore((s) => s.user?.role);

  if (!role || !allow.includes(role)) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <Outlet />;
}
