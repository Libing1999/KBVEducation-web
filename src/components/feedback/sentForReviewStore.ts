import { create } from 'zustand';

interface SentForReviewState {
  visible: boolean;
  key: number;
  show: () => void;
  hide: () => void;
}

/**
 * Opens the "Sent for review" message after a student submits a practice session or a
 * reflection (memo 17.10.2026, 1.7). Rendered by SentForReviewOverlay.
 */
export const useSentForReview = create<SentForReviewState>((set) => ({
  visible: false,
  key: 0,
  show: () => set((s) => ({ visible: true, key: s.key + 1 })),
  hide: () => set({ visible: false }),
}));
