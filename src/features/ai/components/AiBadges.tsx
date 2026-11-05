import { AlertTriangle, Flag, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { RECOMMENDATION_LABELS, type AiJobStatus, type Recommendation } from '@/features/ai/types/ai.types';
import { ratingColour, type RatingColour, type RatingRanges } from '@/features/ai/rating';

const colourClasses: Record<RatingColour, string> = {
  green: 'bg-green-100 text-green-800 ring-green-600/20',
  amber: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  red: 'bg-red-100 text-red-800 ring-red-600/20',
};

export function TrustBadge({ rating, ranges }: { rating: number; ranges?: RatingRanges }) {
  return (
    <span
      title="Trust rating: 10 = clearly a real, serious study session; 1 = almost certainly faked"
      className={cn(
        'inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-bold ring-1 ring-inset',
        colourClasses[ratingColour(rating, ranges)],
      )}
    >
      {rating}
    </span>
  );
}

export function RecommendationBadge({ value }: { value: Recommendation }) {
  const tone = value === 'approve' ? 'success' : value === 'look' ? 'warning' : 'danger';
  return <Badge tone={tone}>{RECOMMENDATION_LABELS[value]}</Badge>;
}

export function FlagCount({ count }: { count: number }) {
  if (count === 0) return <span className="text-xs text-slate-400">No flags</span>;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
      <Flag className="h-3.5 w-3.5" /> {count} flag{count === 1 ? '' : 's'}
    </span>
  );
}

/** "Being analysed" / "not analysed" / nothing yet, for items without a result. */
export function AiStatusBadge({ status }: { status?: AiJobStatus | null }) {
  if (status === 'QUEUED' || status === 'SUBMITTED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Being analysed
      </span>
    );
  }
  if (status === 'NOT_ANALYSED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5" /> Not analysed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
      <Sparkles className="h-3.5 w-3.5" /> Not yet
    </span>
  );
}
