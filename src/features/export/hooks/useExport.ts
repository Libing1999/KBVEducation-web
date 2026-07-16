import { useQuery } from '@tanstack/react-query';
import { exportApi } from '@/features/export/api/exportApi';

export const EXPORT_QUERY_KEYS = {
  datasets: ['export-datasets'] as const,
  history: ['export-history'] as const,
};
const KEYS = EXPORT_QUERY_KEYS;

export function useExportDatasets() {
  return useQuery({ queryKey: KEYS.datasets, queryFn: exportApi.listDatasets });
}

export function useExportHistory() {
  return useQuery({ queryKey: KEYS.history, queryFn: exportApi.listHistory });
}
