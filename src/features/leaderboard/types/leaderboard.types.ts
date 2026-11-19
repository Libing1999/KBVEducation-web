export type LeaderboardSortField = 'COMPOSITE' | 'PRACTICE' | 'QUIZ' | 'REFLECTION' | 'HOMEWORK';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  compositeScore: number;
  currentTier: string | null;
  practicePercentage: number;
  reflectionPercentage: number;
  homeworkPercentage: number;
  quizPercentage: number;
}

/**
 * The authenticated student's own cohort standing. Privacy-safe by
 * construction — the backend never sends more than `topN` public entries
 * plus the caller's own row, so there is no full-ranking payload to render
 * (or accidentally leak) here even if the UI wanted to.
 */
export interface LeaderboardStanding {
  topEntries: LeaderboardEntry[];
  ownEntry: LeaderboardEntry;
  totalStudents: number;
  topN: number;
}
