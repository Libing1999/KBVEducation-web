import { useMemo, useState } from 'react';
import { useAiSettings } from '@/features/ai/hooks/useAi';
import { DEFAULT_RANGES, ratingColour, type RatingColour, type RatingRanges } from '@/features/ai/rating';
import type { Recommendation } from '@/features/ai/types/ai.types';
import type { AdminPracticeQuery, PracticeSession } from '@/features/practice/types/practice.types';

export type RatingSort = '' | 'rating-asc' | 'rating-desc' | 'flags-desc';

/**
 * Shared state for the AI parts of the practice review list (memo 12.10.2026, 4.2):
 * filters on recommendation / flags / colour, sorting by rating or flags, row selection,
 * "select all green" and bulk approve. Used by both the Default and Modern list pages.
 */
export function usePracticeReview() {
  const { data: settings } = useAiSettings();
  const ranges: RatingRanges = settings
    ? { greenMinRating: settings.greenMinRating, amberMinRating: settings.amberMinRating }
    : DEFAULT_RANGES;

  const [recommendation, setRecommendation] = useState<Recommendation | ''>('');
  const [flagged, setFlagged] = useState<'' | 'yes' | 'no'>('');
  const [colour, setColour] = useState<RatingColour | ''>('');
  const [sort, setSort] = useState<RatingSort>('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const query: Partial<AdminPracticeQuery> = useMemo(() => {
    const q: Partial<AdminPracticeQuery> = {
      recommendation: recommendation || undefined,
      flagged: flagged === '' ? undefined : flagged === 'yes',
    };
    if (colour === 'green') q.minRating = ranges.greenMinRating;
    if (colour === 'amber') { q.minRating = ranges.amberMinRating; q.maxRating = ranges.greenMinRating - 1; }
    if (colour === 'red') q.maxRating = ranges.amberMinRating - 1;
    if (sort === 'rating-asc') { q.sort = 'aiTrustRating'; q.direction = 'asc'; }
    if (sort === 'rating-desc') { q.sort = 'aiTrustRating'; q.direction = 'desc'; }
    if (sort === 'flags-desc') { q.sort = 'aiFlagCount'; q.direction = 'desc'; }
    return q;
  }, [recommendation, flagged, colour, sort, ranges.greenMinRating, ranges.amberMinRating]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const clear = () => setSelected(new Set());

  /** Selects every waiting session on the page whose rating is green. */
  const selectAllGreen = (rows: PracticeSession[]) =>
    setSelected(new Set(rows.filter((s) => isGreenWaiting(s, ranges)).map((s) => s.id)));

  const rowColour = (s: PracticeSession): RatingColour | null =>
    s.ai?.trustRating != null ? ratingColour(s.ai.trustRating, ranges) : null;

  return {
    ranges,
    recommendation, setRecommendation,
    flagged, setFlagged,
    colour, setColour,
    sort, setSort,
    selected, toggle, clear, selectAllGreen,
    rowColour,
    query,
  };
}

export function isGreenWaiting(s: PracticeSession, ranges: RatingRanges) {
  return s.status === 'PENDING_REVIEW' && s.ai?.trustRating != null && s.ai.trustRating >= ranges.greenMinRating;
}
