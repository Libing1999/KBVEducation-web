import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Flame, ClipboardList, FileQuestion, GraduationCap, PenLine, BookOpenCheck, ShieldOff, ShieldCheck, Award } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { ActivityList } from '@/features/progress/components/ActivityList';
import { ActivityCalendar } from '@/features/progress/components/ActivityCalendar';
import { useStudentProgress, useStudentActivity, useStudentCalendar } from '@/features/progress/hooks/useAdminStats';
import { useStudyDayAdminMutations } from '@/features/studyDays/hooks/useStudyDayAdmin';
import { useCurrentTier, useTierHistory, useTierMutations } from '@/features/tier/hooks/useAdminTier';
import { useTierRules } from '@/features/scoring/hooks/useTierRules';
import { paths } from '@/routes/paths';
import { ExportButtons } from '@/features/export/components/ExportButtons';
import { exportApi } from '@/features/export/api/exportApi';
import { formatDate, formatDateTime } from '@/lib/format';

function iso(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AdminStudentActivityPage() {
  const { id } = useParams<{ id: string }>();
  const { data: progress, isLoading, isError, refetch } = useStudentProgress(id);
  const [page, setPage] = useState(0);
  const { data: activity } = useStudentActivity(id, page, 15);
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const from = iso(new Date(month.getFullYear(), month.getMonth(), 1));
  const to = iso(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const { data: days } = useStudentCalendar(id, from, to);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const { voidDay, unvoidDay } = useStudyDayAdminMutations(id);

  const { data: currentTier } = useCurrentTier(id);
  const { data: tierHistory } = useTierHistory(id, 0, 5);
  const { confirm: confirmTier, override: overrideTier } = useTierMutations(id);
  const { data: tierRules } = useTierRules();
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideTierName, setOverrideTierName] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [voidReason, setVoidReason] = useState('');

  if (isLoading) return <LoadingState label="Loading student…" />;
  if (isError || !progress) return <ErrorState onRetry={() => refetch()} />;

  const selectedStudyDay = days?.find((d) => d.date === selectedDay) ?? null;

  return (
    <div className="space-y-5">
      <Link to={paths.admin.reflections} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{progress.studentName}</h1>
          <p className="text-sm text-slate-500">Activity &amp; progress</p>
        </div>
        <ExportButtons
          csvUrl={exportApi.progressUrl(id!, 'CSV')}
          xlsxUrl={exportApi.progressUrl(id!, 'XLSX')}
          fileBaseName="progress"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Reflection streak" value={`${progress.reflectionStreak} d`} icon={Flame} tone="accent" />
        <StatCard label="Practice streak" value={`${progress.practiceStreak} d`} icon={Flame} tone="accent" />
        <StatCard label="Post-Lesson Homework submitted" value={progress.courseTotal.homeworkSubmitted} icon={ClipboardList} />
        <StatCard label="Quizzes completed" value={progress.courseTotal.quizzesCompleted} icon={FileQuestion} />
      </div>

      <Card>
        <CardHeader title="Course total" subtitle="Since the start of the course" />
        <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Metric icon={PenLine} label="Reflection days" value={progress.courseTotal.reflectionDays} />
          <Metric icon={BookOpenCheck} label="Practice days" value={progress.courseTotal.practiceDays} />
          <Metric icon={ClipboardList} label="Post-Lesson Homework" value={progress.courseTotal.homeworkSubmitted} />
          <Metric icon={FileQuestion} label="Quizzes" value={progress.courseTotal.quizzesCompleted} />
          <Metric icon={GraduationCap} label="Lessons" value={progress.courseTotal.lessonsCompleted} />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={`${MONTHS[month.getMonth()]} ${month.getFullYear()}`}
            action={
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setMonth((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setMonth((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            }
          />
          <CardBody>
            <ActivityCalendar month={month} days={days ?? []} selected={selectedDay} onSelect={setSelectedDay} />
            <p className="mt-3 text-xs text-slate-400">Click a day to void or unvoid it (excludes it from Practice %/Reflection % scoring).</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Activity timeline" />
          <CardBody className="p-0">
            <ActivityList items={activity?.content ?? []} />
          </CardBody>
          {(activity?.totalPages ?? 0) > 1 && (
            <Pagination page={activity?.page ?? 0} totalPages={activity?.totalPages ?? 0} totalElements={activity?.totalElements ?? 0} onPageChange={setPage} />
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Graduation tier" subtitle="System-calculated by default; an admin may confirm or override it" />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">System calculated</p>
              <p className="mt-1 text-lg font-bold text-slate-800">{currentTier?.calculatedTier ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Final (displayed to student)</p>
              <p className="mt-1 flex items-center gap-2 text-lg font-bold text-slate-800">
                {currentTier?.confirmedTier ?? currentTier?.calculatedTier ?? '—'}
                {currentTier?.isOverride && <Badge tone="warning">Overridden</Badge>}
                {currentTier?.confirmedTier && !currentTier.isOverride && <Badge tone="success">Confirmed</Badge>}
              </p>
            </div>
            {currentTier?.nextPossibleTier && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next tier</p>
                <p className="mt-1 text-sm text-slate-600">{currentTier.nextPossibleTier}</p>
              </div>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => confirmTier.mutate()}
                isLoading={confirmTier.isPending}
                disabled={!currentTier?.calculatedTier}
              >
                <ShieldCheck className="h-4 w-4" /> Confirm calculated tier
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setOverrideOpen(true)}>
                <Award className="h-4 w-4" /> Override
              </Button>
            </div>
          </div>

          {tierHistory && tierHistory.content.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recent decisions</p>
              <ul className="divide-y divide-slate-100 text-sm">
                {tierHistory.content.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span>
                      <b>{h.confirmedTier ?? h.calculatedTier}</b>{' '}
                      <span className="text-xs text-slate-400">
                        ({h.source === 'SYSTEM' ? 'system calculated' : h.source === 'ADMIN_CONFIRM' ? 'confirmed' : 'overridden'}
                        {h.decidedByName ? ` by ${h.decidedByName}` : ''})
                      </span>
                      {h.overrideReason && <span className="block text-xs text-slate-500">{h.overrideReason}</span>}
                    </span>
                    <span className="text-xs text-slate-400">{formatDateTime(h.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        title="Override graduation tier"
        footer={
          <>
            <Button variant="outline" onClick={() => setOverrideOpen(false)} disabled={overrideTier.isPending}>Cancel</Button>
            <Button
              onClick={() =>
                overrideTier.mutate(
                  { tierName: overrideTierName, reason: overrideReason },
                  { onSuccess: () => { setOverrideOpen(false); setOverrideTierName(''); setOverrideReason(''); } },
                )
              }
              isLoading={overrideTier.isPending}
              disabled={!overrideTierName || !overrideReason.trim()}
            >
              Override
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Manually set this student&rsquo;s final tier. The system-calculated tier is preserved and stays
            auditable — this only changes what&rsquo;s displayed and used for certificates.
          </p>
          <div>
            <label htmlFor="override-tier" className="mb-1 block text-xs font-medium text-slate-600">Tier</label>
            <Select id="override-tier" value={overrideTierName} onChange={(e) => setOverrideTierName(e.target.value)}>
              <option value="">Select a tier…</option>
              {tierRules?.map((r) => (
                <option key={r.id} value={r.tierName}>{r.tierName}</option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="override-reason" className="mb-1 block text-xs font-medium text-slate-600">Reason (required)</label>
            <textarea
              id="override-reason"
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Why is this student's tier being overridden?"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!selectedDay}
        onClose={() => { setSelectedDay(null); setVoidReason(''); }}
        title={selectedDay ? `Day: ${formatDate(selectedDay)}` : ''}
        footer={
          selectedStudyDay?.voided ? (
            <Button
              variant="secondary"
              onClick={() => selectedDay && unvoidDay.mutate(selectedDay, { onSuccess: () => setSelectedDay(null) })}
              isLoading={unvoidDay.isPending}
            >
              <ShieldCheck className="h-4 w-4" /> Unvoid this day
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={() =>
                selectedDay &&
                voidDay.mutate(
                  { date: selectedDay, reason: voidReason },
                  { onSuccess: () => { setSelectedDay(null); setVoidReason(''); } },
                )
              }
              isLoading={voidDay.isPending}
              disabled={!voidReason.trim()}
            >
              <ShieldOff className="h-4 w-4" /> Void this day
            </Button>
          )
        }
      >
        {selectedStudyDay?.voided ? (
          <p className="text-sm text-slate-600">
            This day is currently <b>voided</b> and excluded from Practice %/Reflection % calculations.
            {selectedStudyDay.voidedReason && (
              <>
                {' '}Reason: <span className="italic">{selectedStudyDay.voidedReason}</span>
              </>
            )}
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Voiding excludes this day from Practice %/Reflection % scoring — it will not count as a normal
              completed or missed day. Use this for illness, technical issues, or other days that shouldn&rsquo;t
              affect the student&rsquo;s score.
            </p>
            <div>
              <label htmlFor="void-reason" className="mb-1 block text-xs font-medium text-slate-600">Reason (required)</label>
              <textarea
                id="void-reason"
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Why is this day being voided?"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof PenLine; label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary"><Icon className="h-4 w-4" /></div>
      <p className="text-lg font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
