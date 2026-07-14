/** Keys used for persisting auth state in localStorage. */
export const STORAGE_KEYS = {
  AUTH: 'kbv.auth',
} as const;

/** Default pagination values, mirrored from the backend AppConstants. */
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const QUERY_KEYS = {
  authMe: ['auth', 'me'] as const,
  users: ['users'] as const,
  students: ['students'] as const,
  parents: ['parents'] as const,
  cohorts: ['cohorts'] as const,
  lessons: ['lessons'] as const,
  quizzes: ['quizzes'] as const,
  homework: ['homework'] as const,
  myLessons: ['my-lessons'] as const,
  studentQuiz: ['student-quiz'] as const,
  reflections: ['reflections'] as const,
  reflectionQuestions: ['reflection-questions'] as const,
  practice: ['practice'] as const,
  progress: ['progress'] as const,
  activity: ['activity'] as const,
  calendar: ['calendar'] as const,
  adminStats: ['admin-stats'] as const,
  notifications: ['notifications'] as const,
  adminDashboard: ['dashboard', 'admin'] as const,
  studentDashboard: ['dashboard', 'student'] as const,
} as const;
