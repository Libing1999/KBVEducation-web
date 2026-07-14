export type LeaderboardSortField = 'COMPOSITE' | 'PRACTICE' | 'QUIZ' | 'REFLECTION' | 'HOMEWORK';

export interface ScoreConfig {
  id: string;
  practiceWeight: number;
  reflectionWeight: number;
  homeworkWeight: number;
  quizWeight: number;
  practiceWindowStart: string | null;
  reflectionWindowStart: string | null;
  reflectionWindowEnd: string | null;
  totalReflectionDays: number;
  totalHomeworkCount: number;
  leaderboardEnabled: boolean;
  leaderboardSortBy: LeaderboardSortField;
  dashboardWidgetsEnabled: boolean;
}

export type ScoreConfigRequest = Omit<ScoreConfig, 'id'>;

export interface TierRule {
  id: string;
  tierName: string;
  tierRank: number;
  minComposite: number;
  maxComposite: number | null;
  minPracticePercentage: number;
  minFullPapers: number;
}

export type TierRuleRequest = TierRule;

export type ScoreAuditEntityType =
  | 'SCORE_CONFIG'
  | 'STUDENT_SCORE'
  | 'TIER'
  | 'PRACTICE'
  | 'HOMEWORK'
  | 'REFLECTION'
  | 'QUIZ';

export interface ScoreAuditLogEntry {
  id: string;
  entityType: ScoreAuditEntityType;
  entityId: string | null;
  studentId: string | null;
  studentName: string | null;
  action: string;
  previousValue: string | null;
  newValue: string | null;
  reason: string | null;
  performedBy: string | null;
  createdAt: string;
}

export interface AuditLogQuery {
  entityType?: ScoreAuditEntityType;
  studentId?: string;
  page?: number;
  size?: number;
}
