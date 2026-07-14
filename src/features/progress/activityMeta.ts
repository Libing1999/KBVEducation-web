import {
  PenLine,
  BookOpenCheck,
  ClipboardList,
  FileQuestion,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import type { ActivityType } from '@/features/progress/types/progress.types';

const ICONS: Record<ActivityType, LucideIcon> = {
  REFLECTION_SUBMITTED: PenLine,
  PRACTICE_LOGGED: BookOpenCheck,
  HOMEWORK_SUBMITTED: ClipboardList,
  QUIZ_COMPLETED: FileQuestion,
  REVIEW_APPROVED: CheckCircle2,
  REVIEW_REJECTED: XCircle,
  REVIEW_REQUESTED: RotateCcw,
};

export function activityIcon(type: ActivityType): LucideIcon {
  return ICONS[type] ?? Activity;
}
