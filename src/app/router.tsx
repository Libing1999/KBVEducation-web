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
import ReflectionsPage from '@/features/reflections/pages/ReflectionsPage';
import PracticePage from '@/features/practice/pages/PracticePage';
import PracticeDetailPage from '@/features/practice/pages/PracticeDetailPage';
import TimelinePage from '@/features/progress/pages/TimelinePage';
import CalendarPage from '@/features/progress/pages/CalendarPage';
import AdminReflectionsPage from '@/features/reflections/pages/AdminReflectionsPage';
import AdminReflectionDetailPage from '@/features/reflections/pages/AdminReflectionDetailPage';
import ReflectionQuestionsPage from '@/features/reflections/pages/ReflectionQuestionsPage';
import AdminPracticePage from '@/features/practice/pages/AdminPracticePage';
import AdminPracticeDetailPage from '@/features/practice/pages/AdminPracticeDetailPage';
import ReviewRequestsPage from '@/features/practice/pages/ReviewRequestsPage';
import AdminStudentActivityPage from '@/features/progress/pages/AdminStudentActivityPage';
import NotificationsPage from '@/features/notifications/pages/NotificationsPage';
import NotFoundPage from '@/features/misc/pages/NotFoundPage';
import ScoreConfigPage from '@/features/scoring/pages/ScoreConfigPage';
import TierRulesPage from '@/features/scoring/pages/TierRulesPage';
import AuditLogPage from '@/features/scoring/pages/AuditLogPage';
import LeaderboardPage from '@/features/leaderboard/pages/LeaderboardPage';
import AdminLeaderboardPage from '@/features/leaderboard/pages/AdminLeaderboardPage';
import AdminAnalyticsPage from '@/features/analytics/pages/AdminAnalyticsPage';
import CertificateTemplatesPage from '@/features/certificates/pages/CertificateTemplatesPage';
import AdminCertificatesPage from '@/features/certificates/pages/AdminCertificatesPage';
import MyCertificatesPage from '@/features/certificates/pages/MyCertificatesPage';
import DataExportPage from '@/features/export/pages/DataExportPage';
import AuditTrailPage from '@/features/auditTrail/pages/AuditTrailPage';
import SettingsPage from '@/features/settings/pages/SettingsPage';
import BackupPage from '@/features/backup/pages/BackupPage';
import ApplicationLogsPage from '@/features/applicationLogs/pages/ApplicationLogsPage';
import SearchResultsPage from '@/features/search/pages/SearchResultsPage';

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
          { path: paths.notifications, element: <NotificationsPage /> },
          {
            // Student & parent: learning + read-only activity views (Phase 3)
            element: <RoleGuard allow={['STUDENT', 'PARENT']} />,
            children: [
              { path: paths.myLessons, element: <MyLessonsPage /> },
              { path: '/lessons/:id', element: <StudentLessonDetailPage /> },
              { path: paths.activity, element: <TimelinePage /> },
              { path: paths.calendar, element: <CalendarPage /> },
              { path: paths.certificates, element: <MyCertificatesPage /> },
            ],
          },
          {
            // Student-only: quiz taking + logging reflections/practice
            element: <RoleGuard allow={['STUDENT']} />,
            children: [
              { path: '/quizzes/:quizId', element: <TakeQuizPage /> },
              { path: paths.reflections, element: <ReflectionsPage /> },
              { path: paths.practice, element: <PracticePage /> },
              { path: '/practice/:id', element: <PracticeDetailPage /> },
              { path: paths.leaderboard, element: <LeaderboardPage /> },
            ],
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
              { path: paths.admin.reflections, element: <AdminReflectionsPage /> },
              { path: '/admin/reflections/:id', element: <AdminReflectionDetailPage /> },
              { path: paths.admin.reflectionQuestions, element: <ReflectionQuestionsPage /> },
              { path: paths.admin.practice, element: <AdminPracticePage /> },
              { path: '/admin/practice/:id', element: <AdminPracticeDetailPage /> },
              { path: paths.admin.reviewRequests, element: <ReviewRequestsPage /> },
              { path: '/admin/students/:id/activity', element: <AdminStudentActivityPage /> },
              { path: paths.admin.scoreConfig, element: <ScoreConfigPage /> },
              { path: paths.admin.tierRules, element: <TierRulesPage /> },
              { path: paths.admin.auditLog, element: <AuditLogPage /> },
              { path: paths.admin.leaderboard, element: <AdminLeaderboardPage /> },
              { path: paths.admin.analytics, element: <AdminAnalyticsPage /> },
              { path: paths.admin.certificateTemplates, element: <CertificateTemplatesPage /> },
              { path: paths.admin.certificates, element: <AdminCertificatesPage /> },
              { path: paths.admin.dataExport, element: <DataExportPage /> },
              { path: paths.admin.auditTrail, element: <AuditTrailPage /> },
              { path: paths.admin.settings, element: <SettingsPage /> },
              { path: paths.admin.backups, element: <BackupPage /> },
              { path: paths.admin.applicationLogs, element: <ApplicationLogsPage /> },
              { path: paths.search, element: <SearchResultsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: paths.notFound, element: <NotFoundPage /> },
]);
