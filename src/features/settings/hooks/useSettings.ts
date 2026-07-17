import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { settingsApi } from '@/features/settings/api/settingsApi';
import type { UpdateSystemSettingsRequest } from '@/features/settings/types/settings.types';
import { getErrorMessage } from '@/lib/utils';

const KEYS = {
  settings: ['system-settings'] as const,
  public: ['system-settings', 'public'] as const,
};

export function useSystemSettings() {
  return useQuery({ queryKey: KEYS.settings, queryFn: settingsApi.get });
}

export function usePublicSettings() {
  return useQuery({ queryKey: KEYS.public, queryFn: settingsApi.getPublic, staleTime: 5 * 60_000 });
}

export function useUpdateSystemSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSystemSettingsRequest) => settingsApi.update(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.settings });
      qc.invalidateQueries({ queryKey: KEYS.public });
      toast.success('Settings updated');
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}
