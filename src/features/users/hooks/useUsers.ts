import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '@/features/users/api/usersApi';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UsersQuery,
  UserStatus,
} from '@/features/users/types/user.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useUsers(query: UsersQuery) {
  return useQuery({
    queryKey: [...QUERY_KEYS.users, query],
    queryFn: () => usersApi.list(query),
  });
}

/** Create/update/status/reset/delete mutations, with cache invalidation + toasts. */
export function useUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.users });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.adminDashboard });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const create = useMutation({
    mutationFn: (payload: CreateUserRequest) => usersApi.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success('User created');
    },
    onError,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserRequest }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success('User updated');
    },
    onError,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      usersApi.updateStatus(id, status),
    onSuccess: (_d, v) => {
      invalidate();
      toast.success(v.status === 'ACTIVE' ? 'User activated' : 'User deactivated');
    },
    onError,
  });

  const resetPassword = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersApi.resetPassword(id, newPassword),
    onSuccess: () => toast.success('Password reset'),
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success('User deleted');
    },
    onError,
  });

  return { create, update, updateStatus, resetPassword, remove };
}
