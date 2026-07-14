import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminPracticeApi } from '@/features/practice/api/adminPracticeApi';
import type {
  AdminPracticeQuery,
  AdminUpdatePracticeInput,
  ReviewRequestStatus,
} from '@/features/practice/types/practice.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useAdminPractice(query: AdminPracticeQuery) {
  return useQuery({
    queryKey: [...QUERY_KEYS.practice, 'admin', query],
    queryFn: () => adminPracticeApi.list(query),
  });
}

export function useAdminPracticeSession(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.practice, 'admin', 'detail', id],
    queryFn: () => adminPracticeApi.get(id as string),
    enabled: !!id,
  });
}

export function useReviewRequests(status: ReviewRequestStatus | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: [...QUERY_KEYS.practice, 'review-requests', status, page, size],
    queryFn: () => adminPracticeApi.listReviewRequests(status, page, size),
  });
}

export function useAdminPracticeMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.practice });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.adminStats });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const approve = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => adminPracticeApi.approve(id, comment),
    onSuccess: () => { invalidate(); toast.success('Practice approved'); },
    onError,
  });

  const reject = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => adminPracticeApi.reject(id, comment),
    onSuccess: () => { invalidate(); toast.success('Practice rejected'); },
    onError,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUpdatePracticeInput }) =>
      adminPracticeApi.update(id, payload),
    onSuccess: () => { invalidate(); toast.success('Practice updated'); },
    onError,
  });

  const approveRequest = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => adminPracticeApi.approveRequest(id, notes),
    onSuccess: () => { invalidate(); toast.success('Review request approved'); },
    onError,
  });

  const rejectRequest = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => adminPracticeApi.rejectRequest(id, notes),
    onSuccess: () => { invalidate(); toast.success('Review request rejected'); },
    onError,
  });

  return { approve, reject, update, approveRequest, rejectRequest };
}
