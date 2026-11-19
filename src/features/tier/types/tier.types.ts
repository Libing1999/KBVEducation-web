export interface CurrentTier {
  calculatedTier: string | null;
  confirmedTier: string | null;
  isOverride: boolean;
  nextPossibleTier: string | null;
  remainingRequirements: { metric: string; current: number; required: number }[];
}

export type TierEventSource = 'SYSTEM' | 'ADMIN_CONFIRM' | 'ADMIN_OVERRIDE';

export interface TierHistoryEntry {
  id: string;
  studentId: string;
  calculatedTier: string;
  confirmedTier: string | null;
  isOverride: boolean;
  overrideReason: string | null;
  compositeScore: number;
  practicePercentage: number;
  fullPapersCount: number;
  decidedByName: string | null;
  source: TierEventSource;
  createdAt: string;
}
