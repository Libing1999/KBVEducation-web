import { paths } from '@/routes/paths';

/**
 * Admin routes that have a real Modern-themed page (wired via modernAware()
 * in router.tsx). Every other admin route still renders its Default page
 * content unchanged, so ModernAppShell wraps it in a light panel — otherwise
 * Default's dark-on-white text (e.g. PageHeader's title) would render
 * unreadably dark-on-dark against the Modern shell's navy background.
 * Add a path here the same turn its Modern page is wired into the router.
 */
export const MODERN_PORTED_ADMIN_PATHS = new Set<string>([
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
  paths.profile,
  paths.notifications,
  paths.search,
]);
