import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { StudyDay } from '@/features/progress/types/progress.types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DOTS: { key: keyof Pick<StudyDay, 'hasReflection' | 'hasPractice' | 'hasHomework' | 'hasQuiz'>; label: string; cls: string }[] = [
  { key: 'hasReflection', label: 'Reflection', cls: 'bg-[#8fc7e8]' },
  { key: 'hasPractice', label: 'Practice', cls: 'bg-[#DBB652]' },
  { key: 'hasHomework', label: 'Homework', cls: 'bg-[#8fd6ae]' },
  { key: 'hasQuiz', label: 'Quiz', cls: 'bg-[#b9a3e8]' },
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

/** Modern port of ActivityCalendar — same prop contract/grid logic, dark palette. */
export function ModernActivityCalendar({ month, days, selected, onSelect }: Props) {
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
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-[rgba(238,242,249,.4)]">
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
                isSelected ? 'border-[#B0821C] bg-[#B0821C]/[.12]' : 'border-[rgba(238,242,249,.1)] hover:bg-white/[.04]',
                isToday && !isSelected && 'border-[#DBB652]',
              )}
            >
              <span className={cn('text-xs font-medium', isToday ? 'text-[#DBB652]' : 'text-[rgba(238,242,249,.7)]')}>{date.getDate()}</span>
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
          <span key={dot.key} className="inline-flex items-center gap-1.5 text-xs text-[rgba(238,242,249,.55)]">
            <span className={cn('h-2 w-2 rounded-full', dot.cls)} /> {dot.label}
          </span>
        ))}
      </div>
    </div>
  );
}
