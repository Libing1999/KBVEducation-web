import type { Role } from '@/features/auth/types/auth.types';
import type { UserResponse } from '@/features/users/types/user.types';
import type { CohortResponse } from '@/features/cohorts/types/cohort.types';

export interface AdminDashboard {
  totalStudents: number;
  totalParents: number;
  totalCohorts: number;
  activeCohorts: number;
  inactiveCohorts: number;
  todaysLogins: number;
  recentUsers: UserResponse[];
  recentCohorts: CohortResponse[];
}

export interface LessonPlaceholder {
  title: string;
  scheduledFor: string;
}

export interface NotificationPlaceholder {
  title: string;
  message: string;
  createdAt: string;
}

export interface ScoreDashboard {
  name: string;
  role: Role;
  cohort: { name: string; status: string } | null;
  compositeScore: number;
  practicePercentage: number;
  reflectionPercentage: number;
  homeworkPercentage: number;
  quizPercentage: number;
  currentTier: string;
  upcomingLessons: LessonPlaceholder[];
  recentNotifications: NotificationPlaceholder[];
}
