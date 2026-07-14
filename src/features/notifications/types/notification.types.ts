export type NotificationType =
  | 'NEW_LESSON_PUBLISHED'
  | 'QUIZ_AVAILABLE'
  | 'HOMEWORK_DUE_TOMORROW'
  | 'QUIZ_REMINDER'
  | 'REVIEW_APPROVED'
  | 'REVIEW_REJECTED'
  | 'HOMEWORK_SUBMITTED'
  | 'QUIZ_SUBMITTED'
  | 'REFLECTION_SUBMITTED'
  | 'PRACTICE_SUBMITTED'
  | 'REVIEW_REQUESTED';

export type ReferenceType = 'LESSON' | 'QUIZ' | 'HOMEWORK' | 'REFLECTION' | 'PRACTICE';

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  referenceType?: ReferenceType | null;
  referenceId?: string | null;
  createdAt: string;
}
