import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { cn, getErrorMessage } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import { paths } from '@/routes/paths';
import { usePillarAnalytics } from '@/features/pillarAnalytics/api/pillarAnalyticsApi';
import { PillarChartCard, type ChartClick } from '@/features/pillarAnalytics/components/PillarChartCard';
import { ExactTableCard } from '@/features/pillarAnalytics/components/ExactTableCard';
import { WhoPicker, type Who, type WhoMode } from '@/features/pillarAnalytics/components/WhoPicker';
import { PILLARS, type Pillar, type TableRow } from '@/features/pillarAnalytics/types/pillarAnalytics.types';
import type { PracticeStatus } from '@/features/practice/types/practice.types';

/** Local calendar date as YYYY-MM-DD (toISOString would shift to UTC). */
function localIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localIso(d);
}

const PRESETS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: '1 year', days: 365 },
];

const STATUS_OPTIONS: { value: '' | PracticeStatus; label: string }[] = [
  { value: '', label: 'All sessions' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PENDING_REVIEW', label: 'Waiting' },
  { value: 'REJECTED', label: 'Rejected' },
];

/**
 * The Analytics screen from the "AI plan" memo (17.10.2026, section 2): pick Who, the dates and
 * a pillar. With several students every point is one day (average for scores and lengths,
 * total for counts); click it to see the students behind it, then one student, then one session.
 */
export default function PillarAnalyticsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [clicked, setClicked] = useState<ChartClick | null>(null);

  const pillar = (PILLARS.some((p) => p.key === params.get('p')) ? params.get('p') : 'practice') as Pillar;
  const from = params.get('from') ?? daysAgo(29);
  const to = params.get('to') ?? daysAgo(0);
  const status = (params.get('status') ?? '') as '' | PracticeStatus;
  const who: Who = {
    mode: (['class', 'cohort', 'students'].includes(params.get('who') ?? '') ? params.get('who') : 'class') as WhoMode,
    cohortId: params.get('cohort') ?? undefined,
    studentIds: (params.get('s') ?? '').split(',').filter(Boolean),
  };

  /** Every change is a new history entry, so Back goes one level up after a drill-down. */
  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };
  const setWho = (w: Who) =>
    update({ who: w.mode, cohort: w.cohortId, s: w.studentIds.length ? w.studentIds.join(',') : undefined });
  const focusStudent = (id: string) => {
    setClicked(null);
    setWho({ mode: 'students', studentIds: [id] });
  };

  const ready =
    from <= to && (who.mode === 'class' || (who.mode === 'cohort' && !!who.cohortId) || (who.mode === 'students' && who.studentIds.length > 0));
  const { data, isLoading, isFetching, error } = usePillarAnalytics(
    {
      pillar,
      from,
      to,
      studentIds: who.mode === 'students' ? who.studentIds : undefined,
      cohortId: who.mode === 'cohort' ? who.cohortId : undefined,
      status: pillar === 'practice' && status ? status : undefined,
    },
    ready,
  );
  const names = useMemo(() => Object.fromEntries((data?.students ?? []).map((s) => [s.id, s.name])), [data]);
  const single = data?.singleStudent ? data.students[0] : undefined;

  const onPointClick = (c: ChartClick) => {
    const points = Object.values(c.points);
    const item = points.find((p) => p.refId);
    if (item?.refId && data?.singleStudent) {
      if (c.chart.drill === 'practice') navigate(paths.admin.practiceDetail(item.refId));
      else if (c.chart.drill === 'reflection') navigate(paths.admin.reflectionDetail(item.refId));
      else if (single) navigate(paths.admin.studentActivity(single.id));
      return;
    }
    setClicked(c);
  };

  const onRowOpen = (row: TableRow) => {
    if (!row.refId) return;
    if (row.refType === 'practice') navigate(paths.admin.practiceDetail(row.refId));
    else if (row.refType === 'reflection') navigate(paths.admin.reflectionDetail(row.refId));
    else if (row.refType === 'student') focusStudent(row.refId);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Detailed analytics"
        subtitle="Practice, reflections, homework and quizzes over time, for one student, a few, a cohort or the whole class."
      />

      {/* Filters: one row above the charts. */}
      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <WhoPicker value={who} names={names} onChange={setWho} />
          <div className="flex flex-wrap items-end gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">From</span>
              <Input type="date" className="w-40" value={from} max={to} onChange={(e) => e.target.value && update({ from: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">To</span>
              <Input type="date" className="w-40" value={to} min={from} onChange={(e) => e.target.value && update({ to: e.target.value })} />
            </label>
            <div className="flex gap-1 pb-1">
              {PRESETS.map((p) => {
                const on = from === daysAgo(p.days - 1) && to === daysAgo(0);
                return (
                  <button
                    key={p.days}
                    type="button"
                    onClick={() => update({ from: daysAgo(p.days - 1), to: daysAgo(0) })}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs font-medium',
                      on ? 'border-primary bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
          {pillar === 'practice' && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Sessions</span>
              <Select className="w-40" value={status} onChange={(e) => update({ status: e.target.value || undefined })}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </label>
          )}
        </div>
        <div role="tablist" aria-label="Pillar" className="flex gap-1 border-b border-slate-200">
          {PILLARS.map((p) => (
            <button
              key={p.key}
              role="tab"
              type="button"
              aria-selected={pillar === p.key}
              onClick={() => update({ p: p.key })}
              className={cn(
                '-mb-px border-b-2 px-4 py-2 text-sm font-medium',
                pillar === p.key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Card>

      {!ready ? (
        <p className="py-10 text-center text-sm text-slate-500">
          {from > to ? 'Choose a start date on or before the end date.' : who.mode === 'cohort' ? 'Choose a cohort.' : 'Choose at least one student.'}
        </p>
      ) : isLoading ? (
        <LoadingState label="Building the graphs…" />
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} />
      ) : data ? (
        <div className={cn('space-y-5 transition-opacity', isFetching && 'opacity-60')}>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
            <span>
              {single ? (
                <>
                  <UserRound className="mr-1 inline h-4 w-4" />
                  <strong className="text-slate-800">{single.name}</strong>: one point per {pillar === 'homework' ? 'submission' : pillar === 'quiz' ? 'attempt' : pillar === 'practice' ? 'session' : 'reflection'}
                </>
              ) : (
                <>
                  <strong className="text-slate-800">{data.students.length}</strong> student{data.students.length === 1 ? '' : 's'} · one point per day
                </>
              )}
              {' · '}
              {formatDate(data.from)} to {formatDate(data.to)}
            </span>
            {single && (
              <Link to={paths.admin.studentActivity(single.id)} className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-600">
                Student activity <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {data.stats.map((s) => (
              <Card key={s.label} className="p-4">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{s.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {data.charts.map((c) => (
              <PillarChartCard key={c.key} chart={c} single={data.singleStudent} onPointClick={onPointClick} />
            ))}
          </div>

          {data.tables.map((t) => (
            <ExactTableCard key={t.key} table={t} onRowOpen={onRowOpen} />
          ))}
        </div>
      ) : null}

      {clicked && <ContributorsDialog click={clicked} onClose={() => setClicked(null)} onStudent={focusStudent} />}
    </div>
  );
}

/** One level down from a day's point: the students behind it, each with their own value. */
function ContributorsDialog({ click, onClose, onStudent }: { click: ChartClick; onClose: () => void; onStudent: (id: string) => void }) {
  const series = Object.entries(click.points).filter(([, p]) => (p.contributors?.length ?? 0) > 0);
  const unit = click.chart.unit;
  const fmt = (v: number) => {
    const n = Number.isInteger(v) ? String(v) : v.toFixed(1);
    return !unit ? n : unit.startsWith('%') ? `${n}${unit}` : `${n} ${unit}`;
  };
  return (
    <Modal open onClose={onClose} title={`${click.chart.title}: ${formatDate(click.x)}`} size="lg">
      <div className="space-y-5">
        {series.map(([name, p]) => (
          <div key={name}>
            <p className="mb-2 text-sm text-slate-600">
              {series.length > 1 && <strong className="text-slate-800">{name}: </strong>}
              {click.chart.aggregation === 'sum' ? 'Total' : 'Average'} {fmt(p.value)} from {p.contributors!.length} student
              {p.contributors!.length === 1 ? '' : 's'}
            </p>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {p.contributors!.map((c) => (
                <li key={c.studentId} className="flex items-center justify-between gap-3 px-4 py-2">
                  <span className="text-sm text-slate-800">{c.name}</span>
                  <span className="flex items-center gap-4">
                    <span className="text-sm font-semibold tabular-nums text-slate-900">{fmt(c.value)}</span>
                    <button
                      type="button"
                      onClick={() => onStudent(c.studentId)}
                      className="text-sm font-medium text-primary hover:text-primary-600"
                    >
                      Look at this student
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="text-xs text-slate-500">
          &quot;Look at this student&quot; shows the same graphs for that student alone, one point per session. Use your
          browser&apos;s Back button to return here.
        </p>
      </div>
    </Modal>
  );
}
