import { activityIcon } from '@/features/progress/activityMeta';
import { formatRelativeTime } from '@/lib/format';
import type { ActivityLog } from '@/features/progress/types/progress.types';

/** Modern port of ActivityList — same prop contract, dark palette. */
export function ModernActivityList({ items, empty = 'No activity yet.' }: { items: ActivityLog[]; empty?: string }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-[rgba(238,242,249,.55)]">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-[rgba(238,242,249,.08)]">
      {items.map((a) => {
        const Icon = activityIcon(a.type);
        return (
          <li key={a.id} className="flex items-start gap-3 px-5 py-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[.06] text-[#DBB652]">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#EEF2F9]">{a.title}</p>
              {a.description && <p className="truncate text-xs text-[rgba(238,242,249,.55)]">{a.description}</p>}
              <p className="mt-0.5 text-[11px] text-[rgba(238,242,249,.4)]">{formatRelativeTime(a.occurredAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
