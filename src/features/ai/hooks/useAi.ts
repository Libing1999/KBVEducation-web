import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { aiApi } from '@/features/ai/api/aiApi';
import type { UpdateAiSettingsInput } from '@/features/ai/types/ai.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

const onError = (e: unknown) => toast.error(getErrorMessage(e));

export function useAiSettings() {
  return useQuery({ queryKey: [...QUERY_KEYS.ai, 'settings'], queryFn: aiApi.getSettings });
}

export function useAiStatus() {
  return useQuery({
    queryKey: [...QUERY_KEYS.ai, 'status'],
    queryFn: aiApi.status,
    // Refresh while a run is in progress, so "Running…" clears by itself.
    refetchInterval: (q) => (q.state.data?.running ? 10_000 : false),
  });
}

export function useMorningDashboard(date?: string) {
  return useQuery({ queryKey: [...QUERY_KEYS.ai, 'morning', date], queryFn: () => aiApi.morning(date) });
}

export function useAiSettingsMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ai });

  const update = useMutation({
    mutationFn: (payload: UpdateAiSettingsInput) => aiApi.updateSettings(payload),
    onSuccess: () => { invalidate(); toast.success('AI settings saved'); },
    onError,
  });

  const runNow = useMutation({
    mutationFn: aiApi.runNow,
    onSuccess: () => { invalidate(); toast.success('AI run started. Results appear as they come back.'); },
    onError,
  });

  return { update, runNow };
}

// --- reference pack ---

export function useReferencePack() {
  return useQuery({ queryKey: [...QUERY_KEYS.ai, 'pack', 'active'], queryFn: aiApi.activePack });
}

export function useReferencePackVersions() {
  return useQuery({ queryKey: [...QUERY_KEYS.ai, 'pack', 'versions'], queryFn: aiApi.packVersions });
}

export function useReferencePackVersion(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ai, 'pack', 'version', id],
    queryFn: () => aiApi.packVersion(id as string),
    enabled: !!id,
  });
}

export function useReferencePackMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [...QUERY_KEYS.ai, 'pack'] });
  const done = (msg: string) => () => { invalidate(); toast.success(msg); };

  const upload = useMutation({
    mutationFn: ({ files, note }: { files: File[]; note?: string }) => aiApi.uploadPackFiles(files, note),
    onSuccess: done('Files uploaded. A new version is active from the next run.'),
    onError,
  });

  const save = useMutation({
    mutationFn: ({ fileName, content, note }: { fileName: string; content: string; note?: string }) =>
      aiApi.savePackFile(fileName, content, note),
    onSuccess: done('File saved. A new version is active from the next run.'),
    onError,
  });

  const remove = useMutation({
    mutationFn: (fileName: string) => aiApi.deletePackFile(fileName),
    onSuccess: done('File deleted. A new version is active from the next run.'),
    onError,
  });

  const activate = useMutation({
    mutationFn: (id: string) => aiApi.activatePackVersion(id),
    onSuccess: done('Version activated. It is used from the next run.'),
    onError,
  });

  return { upload, save, remove, activate };
}

// --- per item ---

export function usePracticeAiCard(sessionId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ai, 'practice', sessionId],
    queryFn: () => aiApi.practiceCard(sessionId as string),
    enabled: !!sessionId,
  });
}

export function useReflectionAiCard(reflectionId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ai, 'reflection', reflectionId],
    queryFn: () => aiApi.reflectionCard(reflectionId as string),
    enabled: !!reflectionId,
  });
}

export function useReanalyse() {
  const qc = useQueryClient();
  const onSuccess = () => {
    toast.success('Analysis started. Refresh in a minute to see the result.');
    qc.invalidateQueries({ queryKey: QUERY_KEYS.ai });
  };
  const practice = useMutation({ mutationFn: aiApi.reanalysePractice, onSuccess, onError });
  const reflection = useMutation({ mutationFn: aiApi.reanalyseReflection, onSuccess, onError });
  return { practice, reflection };
}
