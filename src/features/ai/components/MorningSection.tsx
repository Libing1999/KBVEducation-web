import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Flag, Loader2, Mic, Sunrise } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import { paths } from '@/routes/paths';
import { useMorningDashboard, useAiSettings } from '@/features/ai/hooks/useAi';
import { TrustBadge } from '@/features/ai/components/AiBadges';
import type { AiJobStatus } from '@/features/ai/types/ai.types';

type Variant = 'light' | 'dark';

const styles = {
  light: {
    card: 'rounded-card border border-slate-200 bg-white shadow-card',
    head: 'border-b border-slate-100',
    title: 'text-slate-800',
    text: 'text-slate-700',
    muted: 'text-slate-500',
    link: 'text-primary hover:text-primary-600',
    item: 'border-slate-100',
    stat: 'bg-secondary',
  },
  dark: {
    card: 'rounded-2xl border border-[rgba(238,242,249,.1)] bg-[rgba(12,24,48,.6)] backdrop-blur',
    head: 'border-b border-[rgba(238,242,249,.1)]',
    title: 'text-[#EEF2F9]',
    text: 'text-[rgba(238,242,249,.85)]',
    muted: 'text-[rgba(238,242,249,.55)]',
    link: 'text-[#DBB652] hover:underline',
    item: 'border-[rgba(238,242,249,.08)]',
    stat: 'bg-[rgba(238,242,249,.05)]',
  },
} as const;

const busy = (s?: AiJobStatus | null) => s === 'QUEUED' || s === 'SUBMITTED';

/**
 * Morning section of the admin dashboard (memo 12.10.2026, 4.5), for yesterday in the AI
 * time zone: numbers (always complete), suspicious sessions, reflections, and "Needs me".
 * AI parts show "being analysed" until their results are back.
 */
export function MorningSection({ variant = 'light' }: { variant?: Variant }) {
  const { data, isLoading, isError } = useMorningDashboard();
  const { data: settings } = useAiSettings();
  const s = styles[variant];
  const ranges = settings ? { greenMinRating: settings.greenMinRating, amberMinRating: settings.amberMinRating } : undefined;

  if (isLoading) {
    return <div className={cn(s.card, 'p-5 text-sm', s.muted)}>Loading this morning’s summary…</div>;
  }
  if (isError || !data) return null;

  const n = data.numbers;

  return (
    <section className={s.card}>
      <div className={cn('flex flex-wrap items-center justify-between gap-2 p-5', s.head)}>
        <h2 className={cn('inline-flex items-center gap-2 text-base font-semibold', s.title)}>
          <Sunrise className="h-5 w-5 text-amber-500" /> This morning: {formatDate(data.date)}
        </h2>
        <span className={cn('text-xs', s.muted)}>Yesterday in {data.timezone} · only you see this</span>
      </div>

      <div className="space-y-6 p-5">
        {/* 1. Numbers */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat s={s} label="Uploaded a practice session" value={`${n.studentsWithPractice} of ${n.totalStudents}`} />
          <Stat s={s} label="Practice sessions" value={String(n.totalSessions)} />
          <Stat s={s} label="Uploaded a reflection" value={`${n.studentsWithReflection} of ${n.totalStudents}`} />
          <Stat s={s} label="Uploaded nothing" value={String(n.studentsWithNothing.length)} />
        </div>
        {n.studentsWithNothing.length > 0 && (
          <p className={cn('text-sm', s.text)}>
            <span className={s.muted}>Nothing from: </span>
            {n.studentsWithNothing.map((st, i) => (
              <span key={st.id}>
                {i > 0 && ', '}
                <Link to={paths.admin.studentActivity(st.id)} className={s.link}>{st.name}</Link>
              </span>
            ))}
          </p>
        )}

        {/* 4. Needs me (shown before the detail lists so it is seen first) */}
        <Block s={s} title="Needs me" empty="Nobody needs you this morning." count={data.needsMe.length}>
          {data.needsMe.map((item) => (
            <li key={item.student.id} className={cn('border-b py-2 last:border-0', s.item)}>
              <Link to={paths.admin.studentActivity(item.student.id)} className={cn('text-sm font-medium', s.link)}>
                {item.student.name}
              </Link>
              <span className={cn('ml-2 text-sm', s.text)}>{item.reasons.join(' · ')}</span>
            </li>
          ))}
        </Block>

        {/* 2. Suspicious sessions */}
        <Block s={s} title="Suspicious sessions" empty="No flagged or red sessions." count={data.suspiciousSessions.length}>
          {data.suspiciousSessions.map((x) => (
            <li key={x.sessionId} className={cn('flex items-start gap-3 border-b py-2 last:border-0', s.item)}>
              {x.trustRating != null ? <TrustBadge rating={x.trustRating} ranges={ranges} /> : <Loader2 className="mt-1 h-4 w-4 animate-spin" />}
              <div className="min-w-0 flex-1">
                <Link to={paths.admin.practiceDetail(x.sessionId)} className={cn('text-sm font-medium', s.link)}>
                  {x.student.name} · {x.subject}
                </Link>
                {!!x.flagCount && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-red-500"><Flag className="h-3 w-3" /> {x.flagCount}</span>
                )}
                <p className={cn('text-sm', s.text)}>{busy(x.aiStatus) ? 'Being analysed…' : x.summary}</p>
              </div>
            </li>
          ))}
        </Block>

        {/* 3. Reflections, grouped by student, flagged first */}
        <Block s={s} title="Reflections" empty="No reflections yesterday." count={data.reflections.length}>
          {data.reflections.map((g) => (
            <li key={g.student.id} className={cn('border-b py-2 last:border-0', s.item)}>
              <p className={cn('text-sm font-medium', s.title)}>{g.student.name}</p>
              {g.items.map((r) => (
                <div key={r.reflectionId} className="mt-1 flex items-start gap-2 text-sm">
                  {r.needsAttention && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-label="Needs your attention" />}
                  {r.hasAudio && <Mic className={cn('mt-0.5 h-4 w-4 shrink-0', s.muted)} aria-label="Voice note" />}
                  <span className={s.text}>
                    {busy(r.aiStatus) ? 'Being analysed…' : r.summary ?? (r.aiStatus === 'NOT_ANALYSED' ? 'Not analysed' : '—')}
                  </span>
                  <Link to={paths.admin.reflectionDetail(r.reflectionId)} className={cn('shrink-0 text-xs', s.link)}>Open</Link>
                </div>
              ))}
            </li>
          ))}
        </Block>
      </div>
    </section>
  );
}

function Stat({ s, label, value }: { s: (typeof styles)[Variant]; label: string; value: string }) {
  return (
    <div className={cn('rounded-lg px-4 py-3', s.stat)}>
      <p className={cn('text-xs', s.muted)}>{label}</p>
      <p className={cn('mt-0.5 text-lg font-semibold', s.title)}>{value}</p>
    </div>
  );
}

function Block({
  s,
  title,
  empty,
  count,
  children,
}: {
  s: (typeof styles)[Variant];
  title: string;
  empty: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <div>
      <p className={cn('text-xs font-semibold uppercase tracking-wide', s.muted)}>
        {title} {count > 0 && `(${count})`}
      </p>
      {count === 0 ? <p className={cn('mt-1 text-sm', s.muted)}>{empty}</p> : <ul className="mt-1">{children}</ul>}
    </div>
  );
}
