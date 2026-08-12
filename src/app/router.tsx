import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleGuard } from '@/routes/RoleGuard';
import { LoginRoute } from '@/routes/LoginRoute';
import { AuthenticatedShell } from '@/routes/AuthenticatedShell';
import { DashboardRoute } from '@/routes/DashboardRoute';
import { ProfileRoute } from '@/routes/ProfileRoute';
import { NotificationsRoute } from '@/routes/NotificationsRoute';
import { modernAware } from '@/routes/modernAware';
import { paths } from '@/routes/paths';

import ModernUsersPage from '@/pages/modern/admin/ModernUsersPage';
import ModernStudentsPage from '@/pages/modern/admin/ModernStudentsPage';
import ModernParentsPage from '@/pages/modern/admin/ModernParentsPage';
import ModernCohortsPage from '@/pages/modern/admin/ModernCohortsPage';
import ModernLessonsPage from '@/pages/modern/admin/ModernLessonsPage';
import ModernAdminReflectionsPage from '@/pages/modern/admin/ModernAdminReflectionsPage';
import ModernReflectionQuestionsPage from '@/pages/modern/admin/ModernReflectionQuestionsPage';
import ModernSubjectManagementPage from '@/pages/modern/admin/ModernSubjectManagementPage';
import ModernAdminPracticePage from '@/pages/modern/admin/ModernAdminPracticePage';
import ModernReviewRequestsPage from '@/pages/modern/admin/ModernReviewRequestsPage';
import ModernScoreConfigPage from '@/pages/modern/admin/ModernScoreConfigPage';
import ModernTierRulesPage from '@/pages/modern/admin/ModernTierRulesPage';
import ModernAdminLeaderboardPage from '@/pages/modern/admin/ModernAdminLeaderboardPage';
import ModernAdminAnalyticsPage from '@/pages/modern/admin/ModernAdminAnalyticsPage';
import ModernCertificateTemplatesPage from '@/pages/modern/admin/ModernCertificateTemplatesPage';
import ModernAdminCertificatesPage from '@/pages/modern/admin/ModernAdminCertificatesPage';
import ModernSettingsPage from '@/pages/modern/admin/ModernSettingsPage';
import ModernEmailSettingsPage from '@/pages/modern/admin/ModernEmailSettingsPage';
import ModernDataExportPage from '@/pages/modern/admin/ModernDataExportPage';
import ModernAuditLogPage from '@/pages/modern/admin/ModernAuditLogPage';
import ModernAuditTrailPage from '@/pages/modern/admin/ModernAuditTrailPage';
import ModernApplicationLogsPage from '@/pages/modern/admin/ModernApplicationLogsPage';
import ModernBackupPage from '@/pages/modern/admin/ModernBackupPage';

import ModernMyLessonsPage from '@/pages/modern/student/ModernMyLessonsPage';
import ModernStudentLessonDetailPage from '@/pages/modern/student/ModernStudentLessonDetailPage';
import ModernTakeQuizPage from '@/pages/modern/student/ModernTakeQuizPage';
import ModernReflectionsPage from '@/pages/modern/student/ModernReflectionsPage';
import ModernPracticePage from '@/pages/modern/student/ModernPracticePage';
import ModernPracticeDetailPage from '@/pages/modern/student/ModernPracticeDetailPage';
import ModernLeaderboardPage from '@/pages/modern/student/ModernLeaderboardPage';
import ModernTimelinePage from '@/pages/modern/student/ModernTimelinePage';
import ModernCalendarPage from '@/pages/modern/student/ModernCalendarPage';
import ModernMyCertificatesPage from '@/pages/modern/student/ModernMyCertificatesPage';

import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
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
import SubjectManagementPage from '@/features/subjects/pages/SubjectManagementPage';
import AdminPracticeDetailPage from '@/features/practice/pages/AdminPracticeDetailPage';
import ReviewRequestsPage from '@/features/practice/pages/ReviewRequestsPage';
import AdminStudentActivityPage from '@/features/progress/pages/AdminStudentActivityPage';
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
import EmailSettingsPage from '@/features/settings/pages/EmailSettingsPage';
import BackupPage from '@/features/backup/pages/BackupPage';
import ApplicationLogsPage from '@/features/applicationLogs/pages/ApplicationLogsPage';
import SearchResultsPage from '@/features/search/pages/SearchResultsPage';
import ModernSearchResultsPage from '@/pages/modern/admin/ModernSearchResultsPage';

export const router = createBrowserRouter([
  {
    // Public / unauthenticated
    children: [
      { path: paths.login, element: <LoginRoute /> },
      {
        path: paths.forgotPassword,
        element: (
          <AuthLayout>
            <ForgotPasswordPage />
          </AuthLayout>
        ),
      },
    ],
  },
  {
    // Authenticated
    element: <ProtectedRoute />,
    children: [
      {
        element: <AuthenticatedShell />,
        children: [
          { index: true, element: <Navigate to={paths.dashboard} replace /> },
          { path: paths.dashboard, element: <DashboardRoute /> },
          { path: paths.profile, element: <ProfileRoute /> },
          { path: paths.notifications, element: <NotificationsRoute /> },
          {
            // Student & parent: learning + read-only activity views (Phase 3)
            element: <RoleGuard allow={['STUDENT', 'PARENT']} />,
            children: [
              { path: paths.myLessons, Component: modernAware(MyLessonsPage, ModernMyLessonsPage) },
              { path: '/lessons/:id', Component: modernAware(StudentLessonDetailPage, ModernStudentLessonDetailPage) },
              { path: paths.activity, Component: modernAware(TimelinePage, ModernTimelinePage) },
              { path: paths.calendar, Component: modernAware(CalendarPage, ModernCalendarPage) },
              { path: paths.certificates, Component: modernAware(MyCertificatesPage, ModernMyCertificatesPage) },
            ],
          },
          {
            // Student-only: quiz taking + logging reflections/practice
            element: <RoleGuard allow={['STUDENT']} />,
            children: [
              { path: '/quizzes/:quizId', Component: modernAware(TakeQuizPage, ModernTakeQuizPage) },
              { path: paths.reflections, Component: modernAware(ReflectionsPage, ModernReflectionsPage) },
              { path: paths.practice, Component: modernAware(PracticePage, ModernPracticePage) },
              { path: '/practice/:id', Component: modernAware(PracticeDetailPage, ModernPracticeDetailPage) },
              { path: paths.leaderboard, Component: modernAware(LeaderboardPage, ModernLeaderboardPage) },
            ],
          },
          {
            // Admin-only subtree
            element: <RoleGuard allow={['SUPER_ADMIN']} />,
            children: [
              { path: paths.admin.users, Component: modernAware(UsersPage, ModernUsersPage) },
              { path: paths.admin.students, Component: modernAware(StudentsPage, ModernStudentsPage) },
              { path: paths.admin.parents, Component: modernAware(ParentsPage, ModernParentsPage) },
              { path: paths.admin.cohorts, Component: modernAware(CohortsPage, ModernCohortsPage) },
              { path: paths.admin.lessons, Component: modernAware(LessonsPage, ModernLessonsPage) },
              { path: '/admin/lessons/:id', element: <LessonDetailsPage /> },
              { path: paths.admin.reflections, Component: modernAware(AdminReflectionsPage, ModernAdminReflectionsPage) },
              { path: '/admin/reflections/:id', element: <AdminReflectionDetailPage /> },
              { path: paths.admin.reflectionQuestions, Component: modernAware(ReflectionQuestionsPage, ModernReflectionQuestionsPage) },
              { path: paths.admin.subjects, Component: modernAware(SubjectManagementPage, ModernSubjectManagementPage) },
              { path: paths.admin.practice, Component: modernAware(AdminPracticePage, ModernAdminPracticePage) },
              { path: '/admin/practice/:id', element: <AdminPracticeDetailPage /> },
              { path: paths.admin.reviewRequests, Component: modernAware(ReviewRequestsPage, ModernReviewRequestsPage) },
              { path: '/admin/students/:id/activity', element: <AdminStudentActivityPage /> },
              { path: paths.admin.scoreConfig, Component: modernAware(ScoreConfigPage, ModernScoreConfigPage) },
              { path: paths.admin.tierRules, Component: modernAware(TierRulesPage, ModernTierRulesPage) },
              { path: paths.admin.auditLog, Component: modernAware(AuditLogPage, ModernAuditLogPage) },
              { path: paths.admin.leaderboard, Component: modernAware(AdminLeaderboardPage, ModernAdminLeaderboardPage) },
              { path: paths.admin.analytics, Component: modernAware(AdminAnalyticsPage, ModernAdminAnalyticsPage) },
              { path: paths.admin.certificateTemplates, Component: modernAware(CertificateTemplatesPage, ModernCertificateTemplatesPage) },
              { path: paths.admin.certificates, Component: modernAware(AdminCertificatesPage, ModernAdminCertificatesPage) },
              { path: paths.admin.dataExport, Component: modernAware(DataExportPage, ModernDataExportPage) },
              { path: paths.admin.auditTrail, Component: modernAware(AuditTrailPage, ModernAuditTrailPage) },
              { path: paths.admin.settings, Component: modernAware(SettingsPage, ModernSettingsPage) },
              { path: paths.admin.emailSettings, Component: modernAware(EmailSettingsPage, ModernEmailSettingsPage) },
              { path: paths.admin.backups, Component: modernAware(BackupPage, ModernBackupPage) },
              { path: paths.admin.applicationLogs, Component: modernAware(ApplicationLogsPage, ModernApplicationLogsPage) },
              { path: paths.search, Component: modernAware(SearchResultsPage, ModernSearchResultsPage) },
            ],
          },
        ],
      },
    ],
  },
  { path: paths.notFound, element: <NotFoundPage /> },
]);
