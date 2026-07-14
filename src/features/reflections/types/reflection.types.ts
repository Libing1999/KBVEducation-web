export type ReflectionType = 'TYPED' | 'VOICE' | 'BOTH';

export interface ReflectionQuestion {
  id: string;
  questionText: string;
  displayOrder: number;
  enabled: boolean;
}

export interface ReflectionAnswerView {
  questionId: string;
  questionText: string;
  answerText?: string | null;
}

export interface Reflection {
  id: string;
  studentId: string;
  studentName: string;
  cohortName?: string | null;
  reflectionDate: string;
  reflectionType: ReflectionType;
  submittedAt: string;
  editable: boolean;
  hasAudio: boolean;
  audioFileName?: string | null;
  answers: ReflectionAnswerView[];
}

export interface TodayReflection {
  date: string;
  questions: ReflectionQuestion[];
  reflection: Reflection | null;
}

export interface AnswerInput {
  questionId: string;
  answerText: string;
}

export interface AdminReflectionSummary {
  id: string;
  studentId: string;
  studentName: string;
  cohortName?: string | null;
  reflectionDate: string;
  submittedAt: string;
  reflectionType: ReflectionType;
  textPreview?: string | null;
  hasAudio: boolean;
}

export interface AdminReflectionQuery {
  cohortId?: string;
  studentId?: string;
  type?: ReflectionType;
  search?: string;
  page?: number;
  size?: number;
}
