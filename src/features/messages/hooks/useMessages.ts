import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { messagesApi } from '@/features/messages/api/messagesApi';
import type { SendMessageRequest } from '@/features/messages/types/message.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useAdminMessages(page: number, size = 20) {
  return useQuery({
    queryKey: [...QUERY_KEYS.adminMessages, page, size],
    queryFn: () => messagesApi.adminList(page, size),
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendMessageRequest) => messagesApi.send(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminMessages });
      toast.success('Message sent');
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

/** Live Action drawer's data source — the student's own individual + cohort-collective messages. */
export function useMyMessages() {
  return useQuery({
    queryKey: QUERY_KEYS.myMessages,
    queryFn: messagesApi.myMessages,
  });
}

export function useMarkMessageRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => messagesApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.myMessages });
    },
  });
}
