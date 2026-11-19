import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/modern/ui/Modal';
import { Button } from '@/components/modern/ui/Button';
import { Spinner } from '@/components/modern/ui/Spinner';
import { useCohortDays, useCohortDayMutations } from '@/features/cohorts/hooks/useCohorts';
import type { CohortResponse, CohortDayType } from '@/features/cohorts/types/cohort.types';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  cohort: CohortResponse | null;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const TYPE_LABELS: Record<CohortDayType, string> = {
  LESSON_DAY: 'Lesson Day',
  REST_DAY: 'Rest Day',
  SKIP_DAY: 'Skip Day',
};

const TYPE_CLASSES: Record<CohortDayType, string> = {
  LESSON_DAY: 'border-[rgba(238,242,249,.12)] text-[rgba(238,242,249,.75)]',
  REST_DAY: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  SKIP_DAY: 'border-[#DBB652]/30 bg-[#DBB652]/10 text-[#DBB652]',
};

function iso(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Modern port of CohortDaysModal — same hooks/mutations, dark styling. */
export function ModernCohortDaysModal({ open, onClose, cohort }: Props) {
  const cohortId = open ? cohort?.id ?? null : null;
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState<string | null>(null);

  const from = iso(new Date(month.getFullYear(), month.getMonth(), 1));
  const to = iso(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const { data: days, isLoading } = useCohortDays(cohortId, from, to);
  const { setDay, resetDay } = useCohortDayMutations(cohortId);

  const byDate = new Map((days ?? []).map((d) => [d.date, d]));

  const year = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(year, m, 1);
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const leading = first.getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d));

  const selectedDay = selected ? byDate.get(selected) : null;

  return (
    <Modal open={open} onClose={onClose} title={`Day classification — ${cohort?.name ?? ''}`} size="lg">
      <div className="space-y-4">
        <p className="text-sm text-[rgba(238,242,249,.55)]">
          Classify specific dates for this cohort only — another cohort may have a Lesson Day on the same date.
          Rest and Skip Days are both excluded from Practice %/Reflection % scoring.
        </p>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#EEF2F9]">{MONTHS[m]} {year}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setMonth((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setMonth((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-[rgba(238,242,249,.4)]">
              {WEEKDAYS.map((w) => <div key={w} className="py-1">{w}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((date, i) => {
                if (!date) return <div key={`e-${i}`} />;
                const key = iso(date);
                const day = byDate.get(key);
                const type: CohortDayType = day?.dayType ?? 'LESSON_DAY';
                const isSelected = key === selected;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected(key)}
                    className={cn(
                      'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg border p-1 text-xs transition-colors',
                      TYPE_CLASSES[type],
                      isSelected && 'ring-2 ring-[#DBB652] ring-offset-1 ring-offset-[#0A1424]',
                    )}
                  >
                    <span className="font-medium">{date.getDate()}</span>
                    {type !== 'LESSON_DAY' && <span className="text-[10px]">{type === 'REST_DAY' ? 'Rest' : 'Skip'}</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {selected && (
          <div className="rounded-lg border border-[rgba(238,242,249,.12)] bg-white/[.03] p-3">
            <p className="mb-2 text-sm font-medium text-[rgba(238,242,249,.85)]">
              {selected} — currently <b>{TYPE_LABELS[selectedDay?.dayType ?? 'LESSON_DAY']}</b>
              {!selectedDay?.configured && <span className="text-[rgba(238,242,249,.4)]"> (default)</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_LABELS) as CohortDayType[]).map((type) => (
                <Button
                  key={type}
                  variant={type === (selectedDay?.dayType ?? 'LESSON_DAY') ? 'primary' : 'outline'}
                  size="sm"
                  isLoading={setDay.isPending && setDay.variables?.date === selected && setDay.variables?.dayType === type}
                  onClick={() => setDay.mutate({ date: selected, dayType: type })}
                >
                  {TYPE_LABELS[type]}
                </Button>
              ))}
              {selectedDay?.configured && (
                <Button
                  variant="ghost"
                  size="sm"
                  isLoading={resetDay.isPending}
                  onClick={() => resetDay.mutate(selected)}
                >
                  Reset to default
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
