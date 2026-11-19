/** Mirrors the backend's MessageTargetType enum. */
export type MessageTargetType = 'INDIVIDUAL' | 'COLLECTIVE';

/** Staff compose payload — POST /api/admin/messages. Exactly one of studentId/cohortId. */
export interface SendMessageRequest {
  targetType: MessageTargetType;
  studentId?: string;
  cohortId?: string;
  tag: string;
  body: string;
}

/** Admin-facing "recently sent" list entry. */
export interface CoachMessage {
  id: string;
  targetType: MessageTargetType;
  targetStudentId: string | null;
  targetStudentName: string | null;
  targetCohortId: string | null;
  targetCohortName: string | null;
  senderName: string;
  tag: string;
  body: string;
  createdAt: string;
}

/** Student-facing "Live Action" drawer entry, with a read flag for this student. */
export interface StudentMessage {
  id: string;
  targetType: MessageTargetType;
  tag: string;
  text: string;
  createdAt: string;
  read: boolean;
}
