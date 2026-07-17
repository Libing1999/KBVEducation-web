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
  lockedAccounts: number;
  systemHealthy: boolean;
  freeDiskSpaceMb: number;
  recentUsers: UserResponse[];
  recentCohorts: CohortResponse[];
}

export interface DailyValue {
  date: string;
  value: number;
}

export interface ActivityDay {
  date: string;
  reflections: number;
  practiceLogs: number;
  homeworkSubmissions: number;
  quizAttempts: number;
}

export interface CohortStatusBreakdown {
  active: number;
  inactive: number;
  upcoming: number;
}

export interface TopStudent {
  studentName: string;
  cohortName: string | null;
  compositeScore: number;
}

export interface AdminDashboardTrends {
  studentsGrowth: DailyValue[];
  parentsGrowth: DailyValue[];
  cohortsGrowth: DailyValue[];
  activeCohortsGrowth: DailyValue[];
  loginsPerDay: DailyValue[];
  studentsChangePct: number | null;
  parentsChangePct: number | null;
  cohortsChangePct: number | null;
  activeCohortsChangePct: number | null;
  loginsChangePct: number | null;
  activityTrend: ActivityDay[];
  cohortStatus: CohortStatusBreakdown;
  topStudents: TopStudent[];
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

export interface RemainingRequirement {
  metric: string;
  current: number;
  required: number;
}

export interface TierDetail {
  calculatedTier: string;
  confirmedTier: string | null;
  isOverride: boolean;
  nextPossibleTier: string | null;
  remainingRequirements: RemainingRequirement[];
}
