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

  // Student daily activity (Phase 3)
  reflections: '/reflections',
  practice: '/practice',
  practiceDetail: (id: string) => `/practice/${id}`,
  activity: '/activity',
  calendar: '/calendar',

  // Admin
  admin: {
    users: '/admin/users',
    students: '/admin/students',
    parents: '/admin/parents',
    cohorts: '/admin/cohorts',
    lessons: '/admin/lessons',
    lessonDetail: (id: string) => `/admin/lessons/${id}`,

    // Phase 3 admin panels
    reflections: '/admin/reflections',
    reflectionDetail: (id: string) => `/admin/reflections/${id}`,
    reflectionQuestions: '/admin/reflection-questions',
    practice: '/admin/practice',
    practiceDetail: (id: string) => `/admin/practice/${id}`,
    reviewRequests: '/admin/review-requests',
    studentActivity: (id: string) => `/admin/students/${id}/activity`,
  },

  notFound: '*',
} as const;
