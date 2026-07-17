import type { SearchEntityType } from '@/features/search/types/search.types';

const LABELS: Record<SearchEntityType, string> = {
  USER: 'User',
  COHORT: 'Cohort',
  LESSON: 'Lesson',
  HOMEWORK: 'Homework',
  QUIZ: 'Quiz',
  REFLECTION_QUESTION: 'Reflection Question',
  PRACTICE_SESSION: 'Practice Session',
  CERTIFICATE: 'Certificate',
  AUDIT_LOG: 'Audit Log',
};

export function entityTypeLabel(type: SearchEntityType): string {
  return LABELS[type] ?? type;
}
