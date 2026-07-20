import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { emailSettingsApi } from '@/features/settings/api/emailSettingsApi';
import type { UpdateEmailSettingsRequest } from '@/features/settings/types/emailSettings.types';
import { getErrorMessage } from '@/lib/utils';

const KEY = ['email-settings'] as const;

export function useEmailSettings() {
  return useQuery({ queryKey: KEY, queryFn: emailSettingsApi.get });
}

export function useUpdateEmailSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEmailSettingsRequest) => emailSettingsApi.update(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Email settings updated');
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

/** Fires an immediate, synchronous test send (unlike cohort-assignment emails,
 * which are async) so the admin gets pass/fail feedback right away. */
export function useSendTestEmail() {
  return useMutation({
    mutationFn: (recipient: string) => emailSettingsApi.sendTest({ recipient }),
    onSuccess: (message) => toast.success(message),
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}
