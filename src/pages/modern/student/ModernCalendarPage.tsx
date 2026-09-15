import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/modern/ui/Card';
import { Button } from '@/components/modern/ui/Button';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
import { ModernActivityCalendar } from '@/components/modern/student/ModernActivityCalendar';
import { useCalendar } from '@/features/progress/hooks/useProgress';
import { useAuthStore } from '@/features/auth/store/authStore';
import { formatDate } from '@/lib/format';

function iso(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Modern port of CalendarPage — same hooks/logic, dark styling. */
export default function ModernCalendarPage() {
  const isParent = useAuthStore((s) => s.user?.role) === 'PARENT';
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState<string | null>(null);

  const from = iso(new Date(month.getFullYear(), month.getMonth(), 1));
  const to = iso(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const { data: days, isLoading, isError, refetch } = useCalendar(from, to);

  const selectedDay = useMemo(
    () => (selected ? days?.find((d) => d.date === selected) : undefined),
    [selected, days],
  );

  const shift = (delta: number) => {
    setSelected(null);
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-garamond text-xl font-medium text-[#F6F9FE]">Activity Calendar</h1>
        <p className="text-sm text-[rgba(238,242,249,.55)]">{isParent ? 'Days your child reflected, practised, or submitted work.' : 'Days you reflected, practised, or submitted work.'}</p>
      </div>

      <Card>
        <CardHeader
          title={`${MONTHS[month.getMonth()]} ${month.getFullYear()}`}
          action={
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => shift(-1)} title="Previous month"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => shift(1)} title="Next month"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          }
        />
        <CardBody>
          {isLoading ? (
            <LoadingState label="Loading calendar…" />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <ModernActivityCalendar month={month} days={days ?? []} selected={selected} onSelect={setSelected} />
          )}
        </CardBody>
      </Card>

      {selected && (
        <Card>
          <CardHeader title={formatDate(selected)} />
          <CardBody>
            {selectedDay ? (
              <div className="flex flex-wrap gap-2">
                {selectedDay.hasReflection && <span className="rounded-full bg-[#8fc7e8]/15 px-3 py-1 text-sm text-[#8fc7e8]">Reflection</span>}
                {selectedDay.hasPractice && <span className="rounded-full bg-[#DBB652]/15 px-3 py-1 text-sm text-[#DBB652]">Practice</span>}
                {selectedDay.hasHomework && <span className="rounded-full bg-[#8fd6ae]/15 px-3 py-1 text-sm text-[#8fd6ae]">Post-Lesson Homework</span>}
                {selectedDay.hasQuiz && <span className="rounded-full bg-[#b9a3e8]/15 px-3 py-1 text-sm text-[#b9a3e8]">Post-Lesson Quiz</span>}
              </div>
            ) : (
              <p className="text-sm text-[rgba(238,242,249,.55)]">No activity recorded on this day.</p>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
