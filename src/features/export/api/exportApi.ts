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
};
