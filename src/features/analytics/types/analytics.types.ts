export interface AdminAnalytics {
  averageComposite: number;
  highestScore: number;
  lowestScore: number;
  averagePractice: number;
  averageReflection: number;
  averageHomework: number;
  averageQuiz: number;
  tierDistribution: Record<string, number>;
  activeStudents: number;
  atRiskStudents: number;
  weeklyActivity: number;
  monthlyActivity: number;
  computedAt: string;
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface StudentTrend {
  studentId: string;
  studentName: string;
  points: TrendPoint[];
}
