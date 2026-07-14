import type { PracticeStatus, ReviewRequestStatus } from '@/features/practice/types/practice.types';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

export function practiceStatusTone(status: PracticeStatus): Tone {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    default:
      return 'warning';
  }
}

export function reviewStatusTone(status: ReviewRequestStatus): Tone {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    default:
      return 'warning';
  }
}
