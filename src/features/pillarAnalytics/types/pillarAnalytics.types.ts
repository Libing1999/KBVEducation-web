import type { PracticeStatus } from '@/features/practice/types/practice.types';

/** Mirrors PillarAnalyticsResponse (memo "AI plan" 17.10.2026, section 2). */
export type Pillar = 'practice' | 'reflection' | 'homework' | 'quiz';

export const PILLARS: { key: Pillar; label: string }[] = [
  { key: 'practice', label: 'Practice' },
  { key: 'reflection', label: 'Reflection' },
  { key: 'homework', label: 'Homework' },
  { key: 'quiz', label: 'Quiz' },
];

export interface PillarQuery {
  pillar: Pillar;
  from: string;
  to: string;
  studentIds?: string[];
  cohortId?: string;
  status?: PracticeStatus;
}

export interface Contributor {
  studentId: string;
  name: string;
  value: number;
}

export interface ChartPoint {
  x: string;
  value: number;
  label?: string | null;
  refId?: string | null;
  contributors?: Contributor[] | null;
}

export interface ChartSeries {
  name: string;
  points: ChartPoint[];
}

export type ChartDrill = 'practice' | 'reflection' | 'homework' | 'quiz' | 'none';

export interface PillarChart {
  key: string;
  title: string;
  unit: string;
  kind: 'line' | 'bar';
  aggregation: 'avg' | 'sum';
  drill: ChartDrill;
  stacked: boolean;
  series: ChartSeries[];
}

export interface TableRow {
  cells: string[];
  refType?: 'practice' | 'reflection' | 'student' | 'none' | null;
  refId?: string | null;
}

export interface PillarTable {
  key: string;
  title: string;
  columns: string[];
  rows: TableRow[];
}

export interface PillarAnalytics {
  pillar: string;
  from: string;
  to: string;
  singleStudent: boolean;
  students: { id: string; name: string }[];
  stats: { label: string; value: string }[];
  charts: PillarChart[];
  tables: PillarTable[];
}
