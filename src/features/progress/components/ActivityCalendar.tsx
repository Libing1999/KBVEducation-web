import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { StudyDay } from '@/features/progress/types/progress.types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DOTS: { key: keyof Pick<StudyDay, 'hasReflection' | 'hasPractice' | 'hasHomework' | 'hasQuiz'>; label: string; cls: string }[] = [
  { key: 'hasReflection', label: 'Reflection', cls: 'bg-primary' },
  { key: 'hasPractice', label: 'Practice', cls: 'bg-accent' },
  { key: 'hasHomework', label: 'Homework', cls: 'bg-green-500' },
  { key: 'hasQuiz', label: 'Quiz', cls: 'bg-sky-500' },
];

function iso(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface Props {
  month: Date; // any date within the month to render
  days: StudyDay[];
  selected?: string | null;
  onSelect?: (date: string) => void;
}

export function ActivityCalendar({ month, days, selected, onSelect }: Props) {
  const byDate = useMemo(() => {
    const map = new Map<string, StudyDay>();
    days.forEach((d) => map.set(d.date, d));
    return map;
  }, [days]);

  const year = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(year, m, 1);
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const leading = first.getDay();
  const todayIso = iso(new Date());

  const cells: (Date | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d));

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {WEEKDAYS.map((w) => <div key={w} className="py-1">{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;
          const key = iso(date);
          const sd = byDate.get(key);
          const isToday = key === todayIso;
          const isSelected = key === selected;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect?.(key)}
              className={cn(
                'flex min-h-14 flex-col items-center gap-1 rounded-lg border p-1.5 text-sm transition-colors',
                isSelected ? 'border-primary bg-primary-50' : 'border-slate-100 hover:bg-slate-50',
                isToday && !isSelected && 'border-accent',
              )}
            >
              <span className={cn('text-xs font-medium', isToday ? 'text-accent-600' : 'text-slate-600')}>{date.getDate()}</span>
              {sd && (
                <span className="flex flex-wrap items-center justify-center gap-0.5">
                  {DOTS.filter((dot) => sd[dot.key]).map((dot) => (
                    <span key={dot.key} className={cn('h-1.5 w-1.5 rounded-full', dot.cls)} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        {DOTS.map((dot) => (
          <span key={dot.key} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <span className={cn('h-2 w-2 rounded-full', dot.cls)} /> {dot.label}
          </span>
        ))}
      </div>
    </div>
  );
}
