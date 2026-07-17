export type SearchEntityType =
  | 'USER'
  | 'COHORT'
  | 'LESSON'
  | 'HOMEWORK'
  | 'QUIZ'
  | 'REFLECTION_QUESTION'
  | 'PRACTICE_SESSION'
  | 'CERTIFICATE'
  | 'AUDIT_LOG';

export interface SearchResultItem {
  entityType: SearchEntityType;
  id: string;
  title: string;
  subtitle: string | null;
}
