export type ActivityType =
  | 'REFLECTION_SUBMITTED'
  | 'PRACTICE_LOGGED'
  | 'HOMEWORK_SUBMITTED'
  | 'QUIZ_COMPLETED'
  | 'REVIEW_APPROVED'
  | 'REVIEW_REJECTED'
  | 'REVIEW_REQUESTED';

export interface ProgressMetrics {
  reflectionDays: number;
  practiceDays: number;
  homeworkSubmitted: number;
  quizzesCompleted: number;
  lessonsCompleted: number;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  currentMonth: ProgressMetrics;
  courseTotal: ProgressMetrics;
  reflectionStreak: number;
  practiceStreak: number;
}

export interface ActivityLog {
  id: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  referenceType?: 'LESSON' | 'QUIZ' | 'HOMEWORK' | 'REFLECTION' | 'PRACTICE' | null;
  referenceId?: string | null;
  occurredAt: string;
}

export interface StudyDay {
  date: string;
  hasReflection: boolean;
  hasPractice: boolean;
  hasHomework: boolean;
  hasQuiz: boolean;
}
