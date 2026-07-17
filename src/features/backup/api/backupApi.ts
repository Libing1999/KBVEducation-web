import { apiClient } from '@/lib/apiClient';
import { downloadFile } from '@/lib/download';
import type { ApiResponse } from '@/types/api';
import type { BackupHistoryEntry } from '@/features/backup/types/backup.types';

export const backupApi = {
  list: async (): Promise<BackupHistoryEntry[]> => {
    const { data } = await apiClient.get<ApiResponse<BackupHistoryEntry[]>>('/admin/backups');
    return data.data;
  },

  create: async (): Promise<BackupHistoryEntry> => {
    const { data } = await apiClient.post<ApiResponse<BackupHistoryEntry>>('/admin/backups');
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/backups/${id}`);
  },

  download: (id: string, fileBaseName: string): Promise<void> =>
    downloadFile(`/admin/backups/${id}/download`, `${fileBaseName}.dump`),
};
