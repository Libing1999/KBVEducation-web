/** Centralized route paths. Import these instead of hardcoding strings. */
export const paths = {
  login: '/login',
  forgotPassword: '/forgot-password',

  // Authenticated
  dashboard: '/dashboard',
  profile: '/profile',
  notifications: '/notifications',

  // Student / parent learning
  myLessons: '/lessons',
  myLessonDetail: (id: string) => `/lessons/${id}`,
  takeQuiz: (quizId: string) => `/quizzes/${quizId}`,

  // Admin
  admin: {
    users: '/admin/users',
    students: '/admin/students',
    parents: '/admin/parents',
    cohorts: '/admin/cohorts',
    lessons: '/admin/lessons',
    lessonDetail: (id: string) => `/admin/lessons/${id}`,
  },

  notFound: '*',
} as const;
