import { CheckCheck, Eye } from 'lucide-react';
import { AiStatusBadge, FlagCount, RecommendationBadge, TrustBadge } from '@/features/ai/components/AiBadges';
import type { RatingRanges } from '@/features/ai/rating';
import type { PracticeSession } from '@/features/practice/types/practice.types';

/** The AI column of the practice review list: rating, recommendation and flags, or the status. */
export function AiPracticeCell({ session, ranges }: { session: PracticeSession; ranges: RatingRanges }) {
  const ai = session.ai;
  if (!ai || ai.status !== 'SUCCEEDED' || ai.trustRating == null) {
    return <AiStatusBadge status={ai?.status} />;
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <TrustBadge rating={ai.trustRating} ranges={ranges} />
      {ai.recommendation && <RecommendationBadge value={ai.recommendation} />}
      <FlagCount count={ai.flagCount ?? 0} />
      {ai.autoApproved && (
        <span className="inline-flex items-center gap-1 text-xs text-green-700" title="Auto-approved by the AI">
          <CheckCheck className="h-3.5 w-3.5" /> Auto
        </span>
      )}
      {ai.spotCheck && (
        <span className="inline-flex items-center gap-1 text-xs text-primary" title="Auto-approved, picked for a spot check">
          <Eye className="h-3.5 w-3.5" /> Spot check
        </span>
      )}
    </div>
  );
}
