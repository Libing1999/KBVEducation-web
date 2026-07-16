import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { notificationsApi } from '@/features/notifications/api/notificationsApi';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useNotifications(unreadOnly: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEYS.notifications, 'list', unreadOnly],
    queryFn: () => notificationsApi.list(unreadOnly, 0, 30),
  });
}

/** Unread badge count — polled so it stays fresh as events fire elsewhere. */
export function useUnreadCount() {
  return useQuery({
    queryKey: [...QUERY_KEYS.notifications, 'unread-count'],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useNotificationMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: invalidate,
    onError,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => { invalidate(); toast.success('All notifications marked as read'); },
    onError,
  });

  const deleteNotification = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => { invalidate(); toast.success('Notification deleted'); },
    onError,
  });

  return { markRead, markAllRead, deleteNotification };
}
