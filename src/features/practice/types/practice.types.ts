// Legacy values (PAST_PAPER / WEAKNESS_PRACTICE / GENERAL_PRACTICE) are kept only so
// historical sessions still type-check and display correctly; the create form no longer
// offers them — see CURRENT_STUDY_TYPES below.
export type StudyType =
  | 'PAST_PAPER'
  | 'WEAKNESS_PRACTICE'
  | 'GENERAL_PRACTICE'
  | 'PAST_PAPER_TEST_DAY'
  | 'PAST_PAPER_IMPROVEMENT_DAY'
  | 'TOPIC_STUDY'
  | 'STRUCTURE_STUDY'
  | 'OTHER';

/** Study types offered when logging a new practice session. */
export const CURRENT_STUDY_TYPES: StudyType[] = [
  'PAST_PAPER_TEST_DAY',
  'PAST_PAPER_IMPROVEMENT_DAY',
  'TOPIC_STUDY',
  'STRUCTURE_STUDY',
  'OTHER',
];

/** Study types that require a Year to be selected. */
export const PAST_PAPER_STUDY_TYPES: StudyType[] = ['PAST_PAPER_TEST_DAY', 'PAST_PAPER_IMPROVEMENT_DAY'];
export type PracticeStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
export type ReviewRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PracticeFile {
  id: string;
  fileName: string;
  fileType?: string | null;
  fileSize?: number | null;
  uploadedDate?: string | null;
}

export interface ReviewRequest {
  id: string;
  status: ReviewRequestStatus;
  reason?: string | null;
  adminNotes?: string | null;
  resolvedByName?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface PracticeSession {
  id: string;
  studentId: string;
  studentName: string;
  cohortName?: string | null;
  studyDate: string;
  subject: string;
  durationMinutes: number;
  studyType: StudyType;
  notes?: string | null;
  transcript?: string | null;
  year?: number | null;
  status: PracticeStatus;
  adminComment?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  files: PracticeFile[];
  reviewRequests: ReviewRequest[];
}

export interface CreatePracticeInput {
  studyDate: string;
  subject: string;
  durationMinutes: number;
  studyType: StudyType;
  notes?: string;
  transcript?: string;
  year?: number;
}

export const STUDY_TYPE_LABELS: Record<StudyType, string> = {
  // Legacy — historical rows only.
  PAST_PAPER: 'Past Paper',
  WEAKNESS_PRACTICE: 'Weakness Practice',
  GENERAL_PRACTICE: 'General Practice',
  // Current
  PAST_PAPER_TEST_DAY: 'Past Paper Test Day',
  PAST_PAPER_IMPROVEMENT_DAY: 'Past Paper Improvement Day',
  TOPIC_STUDY: 'Topic Study',
  STRUCTURE_STUDY: 'Structure Study',
  OTHER: 'Other',
};

export const PRACTICE_STATUS_LABELS: Record<PracticeStatus, string> = {
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export interface AdminPracticeQuery {
  cohortId?: string;
  studentId?: string;
  status?: PracticeStatus;
  studyType?: StudyType;
  search?: string;
  page?: number;
  size?: number;
}

export interface AdminUpdatePracticeInput {
  studyDate: string;
  subject: string;
  durationMinutes: number;
  studyType: StudyType;
  notes?: string | null;
  adminComment?: string | null;
}

export interface ReviewRequestAdminSummary {
  id: string;
  practiceSessionId: string;
  studentId: string;
  studentName: string;
  cohortName?: string | null;
  subject: string;
  reason?: string | null;
  status: ReviewRequestStatus;
  createdAt: string;
}
