export type LessonStatus = 'DRAFT' | 'PUBLISHED';

export interface LessonResponse {
  id: string;
  cohortId: string;
  cohortName: string;
  lessonNumber: number;
  title: string;
  summary?: string | null;
  description?: string | null;
  lessonDate?: string | null;
  status: LessonStatus;
  publishedDate?: string | null;
  displayOrder: number;
  fileCount: number;
  hasQuiz: boolean;
  hasHomework: boolean;
  createdAt: string;
}

export interface CreateLessonRequest {
  cohortId: string;
  lessonNumber: number;
  title: string;
  summary?: string;
  description?: string;
  lessonDate?: string | null;
  displayOrder?: number;
}

export interface UpdateLessonRequest {
  lessonNumber: number;
  title: string;
  summary?: string;
  description?: string;
  lessonDate?: string | null;
}

export interface LessonsQuery {
  cohortId?: string;
  status?: LessonStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface LessonFile {
  id: string;
  fileName: string;
  fileType?: string | null;
  fileSize?: number | null;
  uploadedDate?: string | null;
}

export interface ReorderItem {
  id: string;
  displayOrder: number;
}
