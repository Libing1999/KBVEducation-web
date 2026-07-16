export type ExportDataset =
  | 'STUDENTS'
  | 'PARENTS'
  | 'COHORTS'
  | 'LESSONS'
  | 'HOMEWORK'
  | 'QUIZZES'
  | 'REFLECTIONS'
  | 'PRACTICE_LOGS'
  | 'ANALYTICS'
  | 'AUDIT_LOGS';

export type ExportFilterType = 'DATE' | 'COHORT' | 'STUDENT' | 'STATUS';

export interface ExportDatasetMetadata {
  dataset: ExportDataset;
  label: string;
  supportedFilters: ExportFilterType[];
}

export interface ExportHistoryEntry {
  id: string;
  dataset: string;
  format: string;
  rowCount: number | null;
  exportedByName: string;
  createdAt: string;
}

export interface DatasetExportFilters {
  from?: string;
  to?: string;
  cohortId?: string;
  studentId?: string;
  status?: string;
}
