// Trust-rating colours shared by the AI badges and the review lists.

/** Colour ranges from Settings: green 8-10, amber 4-7, red 1-3 by default. */
export interface RatingRanges {
  greenMinRating: number;
  amberMinRating: number;
}

export const DEFAULT_RANGES: RatingRanges = { greenMinRating: 8, amberMinRating: 4 };

export type RatingColour = 'green' | 'amber' | 'red';

export function ratingColour(rating: number, ranges: RatingRanges = DEFAULT_RANGES): RatingColour {
  if (rating >= ranges.greenMinRating) return 'green';
  if (rating >= ranges.amberMinRating) return 'amber';
  return 'red';
}

/** Left border colour for a table row, by trust rating. */
export const rowColourClasses: Record<RatingColour, string> = {
  green: 'border-l-4 border-l-green-500',
  amber: 'border-l-4 border-l-amber-400',
  red: 'border-l-4 border-l-red-500',
};
