import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  DatasetExportFilters,
  ExportDataset,
  ExportDatasetMetadata,
  ExportHistoryEntry,
} from '@/features/export/types/export.types';

export type ExportFormat = 'CSV' | 'XLSX';

export const exportApi = {
  leaderboardUrl: (cohortId: string, sortBy: string, format: ExportFormat): string =>
    `/admin/export/leaderboard?${new URLSearchParams({ cohortId, sortBy, format }).toString()}`,

  scoresUrl: (cohortId: string, format: ExportFormat): string =>
    `/admin/export/scores?${new URLSearchParams({ cohortId, format }).toString()}`,

  tiersUrl: (cohortId: string, format: ExportFormat): string =>
    `/admin/export/tiers?${new URLSearchParams({ cohortId, format }).toString()}`,

  progressUrl: (studentId: string, format: ExportFormat): string =>
    `/admin/export/progress/${studentId}?${new URLSearchParams({ format }).toString()}`,

  // --- Phase 5 Step 3: generic dataset registry ---
  listDatasets: async (): Promise<ExportDatasetMetadata[]> => {
    const { data } = await apiClient.get<ApiResponse<ExportDatasetMetadata[]>>('/admin/export/datasets');
    return data.data;
  },

  listHistory: async (): Promise<ExportHistoryEntry[]> => {
    const { data } = await apiClient.get<ApiResponse<ExportHistoryEntry[]>>('/admin/export/history');
    return data.data;
  },

  datasetUrl: (dataset: ExportDataset, format: ExportFormat, filters: DatasetExportFilters): string => {
    const params: Record<string, string> = { format };
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.cohortId) params.cohortId = filters.cohortId;
    if (filters.studentId) params.studentId = filters.studentId;
    if (filters.status) params.status = filters.status;
    return `/admin/export/dataset/${dataset}?${new URLSearchParams(params).toString()}`;
  },
};
