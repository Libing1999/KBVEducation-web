export type QuizStatus = 'DRAFT' | 'PUBLISHED';
export type QuestionType = 'MCQ' | 'OPEN_ENDED';

export interface OptionResponse {
  id: string;
  optionText: string;
  correct: boolean;
  displayOrder: number;
}

export interface QuestionResponse {
  id: string;
  questionText: string;
  questionType: QuestionType;
  marks: number;
  displayOrder: number;
  options: OptionResponse[];
}

export interface QuizResponse {
  id: string;
  lessonId: string;
  title: string;
  description?: string | null;
  durationMinutes?: number | null;
  passingMarks?: number | null;
  status: QuizStatus;
  questionCount: number;
  questions: QuestionResponse[];
}

export interface QuizRequest {
  title: string;
  description?: string | null;
  durationMinutes?: number | null;
  passingMarks?: number | null;
  status: QuizStatus;
}

export interface OptionRequest {
  optionText: string;
  correct: boolean;
}

export interface QuestionRequest {
  questionText: string;
  questionType: QuestionType;
  marks: number;
  options?: OptionRequest[];
}

export interface ReorderItem {
  id: string;
  displayOrder: number;
}
