export type QuestionType = 'MCQ' | 'OPEN_ENDED';

export interface StudentFile {
  id: string;
  fileName: string;
  fileType?: string | null;
  fileSize?: number | null;
  uploadedDate?: string | null;
}

/** Card in the student's "My Lessons" list — published lessons only. */
export interface StudentLessonResponse {
  id: string;
  lessonNumber: number;
  title: string;
  summary?: string | null;
  lessonDate?: string | null;
  fileCount: number;
  hasQuiz: boolean;
  quizCompleted: boolean;
  hasHomework: boolean;
  homeworkSubmitted: boolean;
}

/** Full student/parent view of a single lesson. */
export interface StudentLessonDetailResponse {
  id: string;
  lessonNumber: number;
  title: string;
  summary?: string | null;
  description?: string | null;
  lessonDate?: string | null;
  files: StudentFile[];

  hasQuiz: boolean;
  quizId?: string | null;
  quizTitle?: string | null;
  quizCompleted: boolean;

  hasHomework: boolean;
  homeworkId?: string | null;
  homeworkTitle?: string | null;
  homeworkInstructions?: string | null;
  homeworkDueDate?: string | null;
  homeworkAllowedFileTypes?: string[] | null;
  homeworkMaxFileSizeMb?: number | null;
  homeworkSubmitted: boolean;
}

/** Quiz as served to a student for taking — no correct answers included. */
export interface StudentQuizResponse {
  id: string;
  lessonId: string;
  title: string;
  description?: string | null;
  durationMinutes?: number | null;
  alreadySubmitted: boolean;
  questions: StudentQuizQuestion[];
}

export interface StudentQuizQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  marks: number;
  displayOrder: number;
  options: StudentQuizOption[];
}

export interface StudentQuizOption {
  id: string;
  optionText: string;
}

export interface SubmitAnswer {
  questionId: string;
  selectedOptionId?: string | null;
  answerText?: string | null;
}

export interface QuizSubmissionResult {
  attemptId: string;
  submittedAt: string;
  totalQuestions: number;
  answered: number;
  message: string;
}

export interface HomeworkSubmissionResponse {
  id: string;
  homeworkId: string;
  lessonId: string;
  lessonTitle: string;
  studentId: string;
  studentName: string;
  note?: string | null;
  submittedAt: string;
  files: StudentFile[];
}
