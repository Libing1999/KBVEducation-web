import { paths } from '@/routes/paths';

/**
 * Routes that have a real Modern-themed page (wired via modernAware() in
 * router.tsx), across every role — admin, student, and parent. Every other
 * route still renders its Default page content unchanged, so ModernAppShell
 * wraps it in a light panel — otherwise Default's dark-on-white text (e.g.
 * PageHeader's title) would render unreadably dark-on-dark against the
 * Modern shell's navy background.
 * Add a path here the same turn its Modern page is wired into the router.
 */
export const MODERN_PORTED_PATHS = new Set<string>([
  // Admin
  paths.admin.users,
  paths.admin.students,
  paths.admin.parents,
  paths.admin.cohorts,
  paths.admin.lessons,
  paths.admin.reflections,
  paths.admin.reflectionQuestions,
  paths.admin.subjects,
  paths.admin.practice,
  paths.admin.reviewRequests,
  paths.admin.scoreConfig,
  paths.admin.tierRules,
  paths.admin.leaderboard,
  paths.admin.analytics,
  paths.admin.certificateTemplates,
  paths.admin.certificates,
  paths.admin.settings,
  paths.admin.emailSettings,
  paths.admin.dataExport,
  paths.admin.auditLog,
  paths.admin.auditTrail,
  paths.admin.applicationLogs,
  paths.admin.backups,
  paths.search,

  // Shared across roles
  paths.profile,
  paths.notifications,

  // Student / parent
  paths.myLessons,
  paths.activity,
  paths.calendar,
  paths.certificates,
  paths.reflections,
  paths.practice,
  paths.leaderboard,
]);

/** Path prefixes for dynamic (`:id`-style) routes that have Modern pages. */
const MODERN_PORTED_DYNAMIC_PREFIXES: string[] = [
  '/lessons/', // student lesson detail
  '/quizzes/', // take quiz
  '/practice/', // practice detail
];

/** True if `pathname` (exact or dynamic) has a real Modern page wired up. */
export function isModernPortedPath(pathname: string): boolean {
  if (MODERN_PORTED_PATHS.has(pathname)) return true;
  return MODERN_PORTED_DYNAMIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
