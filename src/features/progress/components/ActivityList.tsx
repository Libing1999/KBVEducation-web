import { activityIcon } from '@/features/progress/activityMeta';
import { formatRelativeTime } from '@/lib/format';
import type { ActivityLog } from '@/features/progress/types/progress.types';

export function ActivityList({ items, empty = 'No activity yet.' }: { items: ActivityLog[]; empty?: string }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((a) => {
        const Icon = activityIcon(a.type);
        return (
          <li key={a.id} className="flex items-start gap-3 px-5 py-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800">{a.title}</p>
              {a.description && <p className="truncate text-xs text-slate-500">{a.description}</p>}
              <p className="mt-0.5 text-[11px] text-slate-400">{formatRelativeTime(a.occurredAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
