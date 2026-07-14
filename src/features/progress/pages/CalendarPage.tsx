import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ActivityCalendar } from '@/features/progress/components/ActivityCalendar';
import { useCalendar } from '@/features/progress/hooks/useProgress';
import { useAuthStore } from '@/features/auth/store/authStore';
import { formatDate } from '@/lib/format';

function iso(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
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
        <h1 className="text-xl font-bold text-slate-800">Activity Calendar</h1>
        <p className="text-sm text-slate-500">{isParent ? 'Days your child reflected, practised, or submitted work.' : 'Days you reflected, practised, or submitted work.'}</p>
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
            <ActivityCalendar month={month} days={days ?? []} selected={selected} onSelect={setSelected} />
          )}
        </CardBody>
      </Card>

      {selected && (
        <Card>
          <CardHeader title={formatDate(selected)} />
          <CardBody>
            {selectedDay ? (
              <div className="flex flex-wrap gap-2">
                {selectedDay.hasReflection && <span className="rounded-full bg-primary-50 px-3 py-1 text-sm text-primary">Reflection</span>}
                {selectedDay.hasPractice && <span className="rounded-full bg-accent-50 px-3 py-1 text-sm text-accent-600">Practice</span>}
                {selectedDay.hasHomework && <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">Homework</span>}
                {selectedDay.hasQuiz && <span className="rounded-full bg-sky-100 px-3 py-1 text-sm text-sky-700">Quiz</span>}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No activity recorded on this day.</p>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
