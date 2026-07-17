import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { backupApi } from '@/features/backup/api/backupApi';
import { getErrorMessage } from '@/lib/utils';

export const BACKUP_QUERY_KEY = ['backups'] as const;

export function useBackups() {
  return useQuery({ queryKey: BACKUP_QUERY_KEY, queryFn: backupApi.list });
}

export function useCreateBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => backupApi.create(),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: BACKUP_QUERY_KEY });
      if (result.status === 'FAILED') {
        toast.error(`Backup failed: ${result.errorMessage ?? 'unknown error'}`);
      } else {
        toast.success('Backup created');
      }
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => backupApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BACKUP_QUERY_KEY });
      toast.success('Backup deleted');
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}
