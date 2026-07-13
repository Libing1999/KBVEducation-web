export interface HomeworkResponse {
  id: string;
  lessonId: string;
  lessonTitle: string;
  title: string;
  instructions?: string | null;
  dueDate?: string | null;
  allowedFileTypes?: string[] | null;
  maxFileSizeMb?: number | null;
}

export interface HomeworkRequest {
  title: string;
  instructions?: string | null;
  dueDate?: string | null;
  allowedFileTypes?: string[] | null;
  maxFileSizeMb?: number | null;
}
