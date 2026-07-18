import {
  BookOpen,
  BookOpenCheck,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  Layers,
  PenLine,
  ScrollText,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { paths } from '@/routes/paths';
import type { SearchResultItem } from '@/features/search/types/search.types';

export interface ResolvedSearchResult {
  route: string;
  icon: LucideIcon;
}

/**
 * Maps a search hit to a real, existing route (the app has no generic
 * /admin/<entity>/{id} detail pages — see router.tsx):
 * - Entities WITH a detail page (lessons, practice sessions, students via the
 *   activity page) deep-link straight to it.
 * - Entities whose UI is a list page (users, parents, cohorts) deep-link the
 *   list pre-filtered via ?search= (honored by useTableControls).
 * - Homework/quizzes are edited inside their lesson's detail page, but a
 *   search hit carries the homework/quiz's own id, not its lesson's, so the
 *   lessons list is the closest reachable destination.
 */
export function resolveSearchResult(item: SearchResultItem): ResolvedSearchResult {
  switch (item.entityType) {
    case 'USER': {
      // Backend subtitle format: "email · ROLE" (see SearchServiceImpl).
      const [email = '', role = ''] = (item.subtitle ?? '').split('·').map((s) => s.trim());
      if (role === 'STUDENT') {
        return { route: paths.admin.studentActivity(item.id), icon: GraduationCap };
      }
      if (role === 'PARENT') {
        return { route: `${paths.admin.parents}?search=${encodeURIComponent(email)}`, icon: UserRound };
      }
      return { route: `${paths.admin.users}?search=${encodeURIComponent(email)}`, icon: Users };
    }
    case 'COHORT':
      return { route: `${paths.admin.cohorts}?search=${encodeURIComponent(item.title)}`, icon: Layers };
    case 'LESSON':
      return { route: paths.admin.lessonDetail(item.id), icon: BookOpen };
    case 'HOMEWORK':
      return { route: paths.admin.lessons, icon: ClipboardList };
    case 'QUIZ':
      return { route: paths.admin.lessons, icon: FileQuestion };
    case 'REFLECTION_QUESTION':
      return { route: paths.admin.reflectionQuestions, icon: PenLine };
    case 'PRACTICE_SESSION':
      return { route: paths.admin.practiceDetail(item.id), icon: BookOpenCheck };
    case 'CERTIFICATE':
      return { route: paths.admin.certificates, icon: ScrollText };
    case 'AUDIT_LOG':
      return { route: paths.admin.auditTrail, icon: ShieldCheck };
  }
}
