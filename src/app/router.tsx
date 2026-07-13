import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleGuard } from '@/routes/RoleGuard';
import { paths } from '@/routes/paths';

import LoginPage from '@/features/auth/pages/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import ProfilePage from '@/features/profile/pages/ProfilePage';
import UsersPage from '@/features/users/pages/UsersPage';
import StudentsPage from '@/features/students/pages/StudentsPage';
import ParentsPage from '@/features/parents/pages/ParentsPage';
import CohortsPage from '@/features/cohorts/pages/CohortsPage';
import LessonsPage from '@/features/lessons/pages/LessonsPage';
import LessonDetailsPage from '@/features/lessons/pages/LessonDetailsPage';
import MyLessonsPage from '@/features/learn/pages/MyLessonsPage';
import StudentLessonDetailPage from '@/features/learn/pages/StudentLessonDetailPage';
import TakeQuizPage from '@/features/learn/pages/TakeQuizPage';
import NotFoundPage from '@/features/misc/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    // Public / unauthenticated
    element: <AuthLayout />,
    children: [
      { path: paths.login, element: <LoginPage /> },
      { path: paths.forgotPassword, element: <ForgotPasswordPage /> },
    ],
  },
  {
    // Authenticated
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to={paths.dashboard} replace /> },
          { path: paths.dashboard, element: <DashboardPage /> },
          { path: paths.profile, element: <ProfilePage /> },
          {
            // Student & parent learning
            element: <RoleGuard allow={['STUDENT', 'PARENT']} />,
            children: [
              { path: paths.myLessons, element: <MyLessonsPage /> },
              { path: '/lessons/:id', element: <StudentLessonDetailPage /> },
            ],
          },
          {
            // Student-only quiz taking
            element: <RoleGuard allow={['STUDENT']} />,
            children: [{ path: '/quizzes/:quizId', element: <TakeQuizPage /> }],
          },
          {
            // Admin-only subtree
            element: <RoleGuard allow={['SUPER_ADMIN']} />,
            children: [
              { path: paths.admin.users, element: <UsersPage /> },
              { path: paths.admin.students, element: <StudentsPage /> },
              { path: paths.admin.parents, element: <ParentsPage /> },
              { path: paths.admin.cohorts, element: <CohortsPage /> },
              { path: paths.admin.lessons, element: <LessonsPage /> },
              { path: '/admin/lessons/:id', element: <LessonDetailsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: paths.notFound, element: <NotFoundPage /> },
]);
