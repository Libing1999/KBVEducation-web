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
