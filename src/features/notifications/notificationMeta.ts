import {
  BookOpen, FileQuestion, CalendarClock, ClipboardCheck, ClipboardList, Bell,
  PenLine, BookOpenCheck, CheckCircle2, XCircle, RotateCcw, type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/features/auth/types/auth.types';
import { paths } from '@/routes/paths';
import type { NotificationResponse, NotificationType } from '@/features/notifications/types/notification.types';

const ICONS: Record<NotificationType, LucideIcon> = {
  NEW_LESSON_PUBLISHED: BookOpen,
  QUIZ_AVAILABLE: FileQuestion,
  HOMEWORK_DUE_TOMORROW: CalendarClock,
  QUIZ_REMINDER: FileQuestion,
  REVIEW_APPROVED: CheckCircle2,
  REVIEW_REJECTED: XCircle,
  HOMEWORK_SUBMITTED: ClipboardList,
  QUIZ_SUBMITTED: ClipboardCheck,
  REFLECTION_SUBMITTED: PenLine,
  PRACTICE_SUBMITTED: BookOpenCheck,
  REVIEW_REQUESTED: RotateCcw,
};

export function notificationIcon(type: NotificationType): LucideIcon {
  return ICONS[type] ?? Bell;
}

/**
 * Where clicking a notification should take the user, or null when there is no
 * dedicated screen for it (in that case the click just marks it read).
 */
export function notificationLink(role: Role | undefined, n: NotificationResponse): string | null {
  if (!n.referenceId) return null;
  if (n.referenceType === 'LESSON') {
    return role === 'SUPER_ADMIN' ? paths.admin.lessonDetail(n.referenceId) : paths.myLessonDetail(n.referenceId);
  }
  if (n.referenceType === 'QUIZ' && role === 'STUDENT') {
    return paths.takeQuiz(n.referenceId);
  }
  if (n.referenceType === 'PRACTICE') {
    // Students see their own practice detail; admins see the review panel detail.
    return role === 'SUPER_ADMIN' ? paths.admin.practiceDetail(n.referenceId) : paths.practiceDetail(n.referenceId);
  }
  if (n.referenceType === 'REFLECTION' && role === 'SUPER_ADMIN') {
    return paths.admin.reflectionDetail(n.referenceId);
  }
  return null;
}
