export type NotificationType =
  | 'NEW_LESSON_PUBLISHED'
  | 'QUIZ_AVAILABLE'
  | 'HOMEWORK_DUE_TOMORROW'
  | 'HOMEWORK_SUBMITTED'
  | 'QUIZ_SUBMITTED';

export type ReferenceType = 'LESSON' | 'QUIZ' | 'HOMEWORK';

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
