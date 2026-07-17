export type BackupStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface BackupHistoryEntry {
  id: string;
  fileSizeBytes: number | null;
  status: BackupStatus;
  errorMessage: string | null;
  createdByName: string;
  createdAt: string;
}
