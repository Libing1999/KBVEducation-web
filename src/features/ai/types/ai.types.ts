// Admin-only AI types. Students and parents never receive any of this.

export type AiProvider = 'CLAUDE' | 'GEMINI';
export type AiCallMode = 'BATCH' | 'NORMAL';
export type AiEffort = 'LOW' | 'MEDIUM' | 'HIGH';
export type AiJobStatus = 'QUEUED' | 'SUBMITTED' | 'SUCCEEDED' | 'NOT_ANALYSED';
export type TranscriptStatus = 'NONE' | 'DONE' | 'FAILED';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type AiFailureReason =
  | 'ERROR'
  | 'EMPTY'
  | 'BLOCKED'
  | 'TRUNCATED'
  | 'INVALID_FORMAT'
  | 'NO_CREDIT'
  | 'EXPIRED'
  | 'NOT_CONFIGURED'
  | 'NO_CONTENT';

export type Recommendation = 'approve' | 'look' | 'reject_recommended';

export const PROVIDER_LABELS: Record<AiProvider, string> = { CLAUDE: 'Claude', GEMINI: 'Gemini' };

export const RECOMMENDATION_LABELS: Record<Recommendation, string> = {
  approve: 'Approve',
  look: 'Look',
  reject_recommended: 'Reject recommended',
};

export const PRACTICE_FLAG_LABELS: Record<string, string> = {
  not_wholehearted: 'Not wholehearted',
  ai_written: 'Answers look AI-written',
  low_effort: 'Low effort',
  ended_short: 'Ended short',
};

export const REFLECTION_FLAG_LABELS: Record<string, string> = {
  worrying: 'Worrying',
  disengaged: 'Disengaged',
  overloaded: 'Overloaded',
};

export const FAILURE_LABELS: Record<AiFailureReason, string> = {
  ERROR: 'The AI returned an error',
  EMPTY: 'The answer was empty',
  BLOCKED: 'The answer was blocked',
  TRUNCATED: 'The answer stopped before the end',
  INVALID_FORMAT: 'The answer was not in the fixed format',
  NO_CREDIT: 'No credit left or spending limit reached',
  EXPIRED: 'The batch did not finish in time',
  NOT_CONFIGURED: 'The AI is not set up (no key on the server)',
  NO_CONTENT: 'Nothing to analyse',
};

export interface AiSettings {
  aiEnabled: boolean;
  practiceProvider: AiProvider;
  reflectionProvider: AiProvider;
  claudeModel: string;
  geminiModel: string;
  geminiTranscribeModel: string;
  claudeEffort: AiEffort;
  callMode: AiCallMode;
  backupEnabled: boolean;
  nightlyRunTime: string; // "HH:mm:ss"
  runTimezone: string;
  autoApproveEnabled: boolean;
  autoApproveMinRating: number;
  autoApproveRequireNoFlags: boolean;
  spotCheckPercent: number;
  greenMinRating: number;
  amberMinRating: number;
  needsMeDaysWithoutSession: number;
  weeklyReviewDay: DayOfWeek;
  monthlySpendLimitUsd?: number | null;
  lastRunDate?: string | null;
  analyseFrom?: string | null;
  claudeConfigured: boolean;
  geminiConfigured: boolean;
}

export type UpdateAiSettingsInput = Omit<
  AiSettings,
  'lastRunDate' | 'analyseFrom' | 'claudeConfigured' | 'geminiConfigured'
>;

export interface AiUsage {
  provider: AiProvider;
  results: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

export interface AiStatus {
  aiEnabled: boolean;
  claudeConfigured: boolean;
  geminiConfigured: boolean;
  running: boolean;
  lastRunDate?: string | null;
  openBatches: number;
  jobsWaiting: number;
  jobsNotAnalysedThisMonth: number;
  usageThisMonth: AiUsage[];
}

export interface ReferencePackFile {
  id: string;
  fileName: string;
  content: string;
  sizeBytes: number;
}

export interface ReferencePackVersion {
  id: string;
  versionNo: number;
  note?: string | null;
  active: boolean;
  fileCount: number;
  createdAt: string;
  files?: ReferencePackFile[] | null;
}

/** The AI headline on an admin practice row. */
export interface PracticeAiHeadline {
  status?: AiJobStatus | null;
  trustRating?: number | null;
  recommendation?: Recommendation | null;
  flagCount?: number | null;
  autoApproved: boolean;
  autoApprovedAt?: string | null;
  spotCheck: boolean;
  overrideReason?: string | null;
  turnCount?: number | null;
  transcriptChars?: number | null;
}

export interface PracticeFlag {
  type: string;
  quote: string;
  explanation: string;
  turn_from: number;
  turn_to: number;
  quote_verified: boolean;
}

export interface PracticeAiResult {
  recommendation: Recommendation;
  trust_rating: number;
  summary: string;
  past_paper_score: string;
  engagement_rating: number;
  engagement_reason: string;
  engagement_quote: string;
  engagement_quote_verified?: boolean;
  topics: { topic: string; depth: 'touched' | 'practised' | 'secure' }[];
  weak_topics: string[];
  flags: PracticeFlag[];
  analysed_in_parts?: number;
}

export interface TranscriptTurn {
  n: number;
  speaker: 'STUDENT' | 'TUTOR' | 'UNKNOWN';
  text: string;
}

export interface PracticeAiCard {
  sessionId: string;
  status?: AiJobStatus | null;
  provider?: AiProvider | null;
  model?: string | null;
  backupUsed: boolean;
  referencePackVersionNo?: number | null;
  viaBatch: boolean;
  analysedAt?: string | null;
  failureReason?: AiFailureReason | null;
  failureDetail?: string | null;
  result?: PracticeAiResult | null;
  length: {
    studyType: string;
    chars?: number | null;
    turns?: number | null;
    classMedianChars?: number | null;
    classMedianTurns?: number | null;
    studentMedianChars?: number | null;
    studentMedianTurns?: number | null;
  };
  turnSplitMethod?: string | null;
  turns: TranscriptTurn[];
  overrideReason?: string | null;
}

export interface ReflectionFlag {
  type: string;
  quote: string;
  explanation: string;
  quote_verified: boolean;
}

export interface ReflectionAiCard {
  reflectionId: string;
  status?: AiJobStatus | null;
  provider?: AiProvider | null;
  model?: string | null;
  backupUsed: boolean;
  referencePackVersionNo?: number | null;
  analysedAt?: string | null;
  failureReason?: AiFailureReason | null;
  failureDetail?: string | null;
  result?: { summary: string; flags: ReflectionFlag[]; needs_attention: boolean } | null;
  needsAttention: boolean;
  transcriptStatus: TranscriptStatus;
  transcript?: string | null;
  transcriptModel?: string | null;
  transcribedAt?: string | null;
}

export interface MorningStudent {
  id: string;
  name: string;
}

export interface MorningDashboard {
  date: string;
  timezone: string;
  numbers: {
    totalStudents: number;
    studentsWithPractice: number;
    totalSessions: number;
    studentsWithReflection: number;
    studentsWithNothing: MorningStudent[];
  };
  suspiciousSessions: {
    sessionId: string;
    student: MorningStudent;
    subject: string;
    studyType: string;
    aiStatus?: AiJobStatus | null;
    trustRating?: number | null;
    flagCount?: number | null;
    summary?: string | null;
  }[];
  reflections: {
    student: MorningStudent;
    items: {
      reflectionId: string;
      type: 'TYPED' | 'VOICE' | 'BOTH';
      aiStatus?: AiJobStatus | null;
      flagCount?: number | null;
      needsAttention: boolean;
      summary?: string | null;
      hasAudio: boolean;
    }[];
  }[];
  needsMe: { student: MorningStudent; reasons: string[] }[];
}

export interface AiModelOption {
  id: string;
  label: string;
}

/** Models offered by each provider. `*Live` is false when the list is the built-in fallback. */
export interface AiModels {
  claude: AiModelOption[];
  claudeLive: boolean;
  gemini: AiModelOption[];
  geminiLive: boolean;
}
