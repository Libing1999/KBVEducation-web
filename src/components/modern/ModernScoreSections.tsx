import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Award,
  Flame,
  ClipboardList,
  FileQuestion,
  CalendarDays,
  Bell,
  PenLine,
  BookOpenCheck,
  ArrowRight,
  GraduationCap,
  Lock,
} from 'lucide-react';
import { ModernCard } from '@/components/modern/ModernCard';
import { useMyLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard';
import { useMyCertificates, useParentCertificates } from '@/features/certificates/hooks/useCertificates';
import { useProgress, useActivity } from '@/features/progress/hooks/useProgress';
import { useTodayReflection } from '@/features/reflections/hooks/useReflections';
import { usePracticeList } from '@/features/practice/hooks/usePractice';
import { useMyLessons } from '@/features/learn/hooks/useLearn';
import { activityIcon } from '@/features/progress/activityMeta';
import { paths } from '@/routes/paths';
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/format';
import type { TierDetail } from '@/features/dashboard/types/dashboard.types';
import type { ProgressMetrics } from '@/features/progress/types/progress.types';

/** Modern-themed port of the Score Breakdown card (ScoreMeter grid) — same dashboard percentages. */
export function ModernScoreBreakdownCard({
  practicePercentage,
  reflectionPercentage,
  homeworkPercentage,
  quizPercentage,
}: {
  practicePercentage: number;
  reflectionPercentage: number;
  homeworkPercentage: number;
  quizPercentage: number;
}) {
  const meters = [
    { label: 'Practice', value: practicePercentage },
    { label: 'Reflection', value: reflectionPercentage },
    { label: 'Homework', value: homeworkPercentage },
    { label: 'Quiz', value: quizPercentage },
  ];
  return (
    <ModernCard title="Score Breakdown" subtitle="Category performance" bodyClassName="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {meters.map((m) => {
        const clamped = Math.max(0, Math.min(100, m.value));
        return (
          <div key={m.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[rgba(238,242,249,.6)]">{m.label}</span>
              <span className="font-semibold text-[#EEF2F9]">{clamped.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#B0821C]" style={{ width: `${clamped}%` }} />
            </div>
          </div>
        );
      })}
    </ModernCard>
  );
}

/** Modern-themed port of TierProgressCard — same useMyTier data, dark styling. */
export function ModernTierProgressCard({ tier }: { tier: TierDetail }) {
  const displayTier = tier.confirmedTier ?? tier.calculatedTier;
  return (
    <ModernCard
      title="Tier Progress"
      subtitle={tier.isOverride ? 'Set by an administrator' : undefined}
      action={
        <span className="rounded-full border border-[rgba(219,182,82,.35)] px-2.5 py-1 text-[11px] font-medium text-[#DBB652]">
          {displayTier}
        </span>
      }
    >
      {!tier.nextPossibleTier ? (
        <p className="text-sm text-[rgba(238,242,249,.6)]">You&rsquo;re at the top tier.</p>
      ) : tier.remainingRequirements.length === 0 ? (
        <p className="text-sm text-[#8fd6ae]">
          You already meet every requirement for{' '}
          <span className="font-semibold text-[#EEF2F9]">{tier.nextPossibleTier}</span> — keep it up!
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-[rgba(238,242,249,.6)]">
            Next tier: <span className="font-semibold text-[#EEF2F9]">{tier.nextPossibleTier}</span>
          </p>
          <ul className="space-y-3">
            {tier.remainingRequirements.map((r) => {
              const pct = r.required > 0 ? Math.min(100, (r.current / r.required) * 100) : 100;
              return (
                <li key={r.metric}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-[rgba(238,242,249,.6)]">{r.metric}</span>
                    <span className="font-medium text-[#EEF2F9]">
                      {r.current.toFixed(1)} / {r.required.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#B0821C]" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </ModernCard>
  );
}

/**
 * Modern-themed port of LeaderboardPositionCard — same useMyLeaderboard data.
 * Renders nothing if disabled/no cohort. The backend only ever returns the
 * public top-N entries plus the caller's own entry (never the full cohort
 * ranking — see LeaderboardServiceImpl.studentView), so `ownEntry` is used
 * directly rather than searching a full list for "me".
 */
export function ModernLeaderboardCard() {
  const { data, isLoading, isError } = useMyLeaderboard();

  if (isLoading || isError || !data) return null;

  return (
    <ModernCard
      title="Leaderboard Position"
      action={
        <Link to={paths.leaderboard} className="text-xs font-medium text-[#DBB652] hover:underline">
          View full leaderboard →
        </Link>
      }
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[.06] text-[#DBB652]">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <p className="font-garamond text-2xl font-semibold text-[#F6F9FE]">#{data.ownEntry.rank}</p>
          <p className="text-sm text-[rgba(238,242,249,.6)]">out of {data.totalStudents} in your cohort</p>
        </div>
      </div>
    </ModernCard>
  );
}

/** Modern-themed port of CertificateStatusCard — same hooks per variant. */
export function ModernCertificateCard({ variant }: { variant: 'student' | 'parent' }) {
  const isParent = variant === 'parent';
  const studentQuery = useMyCertificates(!isParent);
  const parentQuery = useParentCertificates(isParent);
  const { data: certificates, isLoading } = isParent ? parentQuery : studentQuery;

  if (isLoading) return null;
  const count = certificates?.length ?? 0;

  return (
    <ModernCard title={variant === 'parent' ? 'Certificate Availability' : 'Certificate Status'}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[.06] text-[#DBB652]">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="font-garamond text-2xl font-semibold text-[#F6F9FE]">{count}</p>
            <p className="text-xs text-[rgba(238,242,249,.55)]">
              {count === 0
                ? variant === 'parent'
                  ? 'No certificates issued yet'
                  : "You haven't earned a certificate yet"
                : `${count} certificate${count === 1 ? '' : 's'} issued`}
            </p>
          </div>
        </div>
        <Link to={paths.certificates} className="text-sm font-medium text-[#DBB652] hover:underline">
          View
        </Link>
      </div>
    </ModernCard>
  );
}

interface ListItem {
  icon: LucideIcon;
  primary: string;
  secondary?: string;
}

/** Generic dark list card — used for Upcoming Lessons / Recent Notifications. */
export function ModernListCard({ title, items, empty }: { title: string; items: ListItem[]; empty: string }) {
  return (
    <ModernCard title={title} bodyClassName="p-0">
      {items.length === 0 ? (
        <p className="p-6 text-sm text-[rgba(238,242,249,.55)]">{empty}</p>
      ) : (
        <ul className="divide-y divide-[rgba(238,242,249,.08)]">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-3 px-6 py-3.5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[.06] text-[#DBB652]">
                <it.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#EEF2F9]">{it.primary}</p>
                {it.secondary && (
                  <p className="truncate text-xs text-[rgba(238,242,249,.55)]">{it.secondary}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </ModernCard>
  );
}

export function upcomingLessonItems(lessons: { title: string; scheduledFor: string }[]): ListItem[] {
  return lessons.map((l) => ({
    icon: CalendarDays,
    primary: l.title,
    secondary: formatDateTime(l.scheduledFor),
  }));
}

export function notificationItems(notifications: { title: string; message: string }[]): ListItem[] {
  return notifications.map((n) => ({
    icon: Bell,
    primary: n.title,
    secondary: n.message,
  }));
}

/**
 * Modern-themed port of ParentDashboard's activity section — same
 * useProgress/useActivity hooks, own loading/error state (independent query
 * from the composite-score hero above, matching the Default UI's layout).
 */
export function ModernParentActivitySection() {
  const { data: progress, isLoading, isError, refetch } = useProgress();
  const { data: activity } = useActivity(0, 6);

  if (isLoading) {
    return <p className="text-center text-sm text-[rgba(238,242,249,.6)]">Loading your child’s activity…</p>;
  }
  if (isError || !progress) {
    return (
      <div className="flex flex-col items-center gap-3 text-center text-sm text-[rgba(238,242,249,.72)]">
        <p>We couldn’t load your child’s activity. They may not be linked to your account yet.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg border border-[rgba(238,242,249,.2)] px-4 py-2 text-sm hover:bg-white/5"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ModernStat icon={Flame} label="Reflection streak" value={`${progress.reflectionStreak} ${progress.reflectionStreak === 1 ? 'day' : 'days'}`} />
        <ModernStat icon={Flame} label="Practice streak" value={`${progress.practiceStreak} ${progress.practiceStreak === 1 ? 'day' : 'days'}`} />
        <ModernStat icon={ClipboardList} label="Homework submitted" value={progress.courseTotal.homeworkSubmitted} />
        <ModernStat icon={FileQuestion} label="Quizzes completed" value={progress.courseTotal.quizzesCompleted} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ModernMetricsCard title="This month" metrics={progress.currentMonth} />
        <ModernMetricsCard title="Course total" metrics={progress.courseTotal} />
      </div>

      <ModernCard
        title="Recent activity"
        bodyClassName="p-0"
        action={
          <Link to={paths.activity} className="text-sm font-medium text-[#DBB652] hover:underline">
            View all
          </Link>
        }
      >
        {(activity?.content?.length ?? 0) === 0 ? (
          <p className="p-6 text-sm text-[rgba(238,242,249,.55)]">No activity to show yet.</p>
        ) : (
          <ul className="divide-y divide-[rgba(238,242,249,.08)]">
            {(activity?.content ?? []).map((a) => {
              const Icon = activityIcon(a.type);
              return (
                <li key={a.id} className="flex items-start gap-3 px-6 py-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[.06] text-[#DBB652]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#EEF2F9]">{a.title}</p>
                    {a.description && (
                      <p className="truncate text-xs text-[rgba(238,242,249,.55)]">{a.description}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-[rgba(238,242,249,.4)]">{formatRelativeTime(a.occurredAt)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ModernCard>

      <p className="inline-flex items-center gap-1.5 text-xs text-[rgba(238,242,249,.4)]">
        <Lock className="h-3.5 w-3.5" /> Reflection answers and practice notes are private to your child.
      </p>
    </div>
  );
}

function ModernStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[rgba(238,242,249,.12)] bg-white/[.03] p-4 text-center">
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/[.06] text-[#DBB652]">
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-garamond text-xl font-semibold text-[#F6F9FE]">{value}</p>
      <p className="mt-0.5 text-[11px] text-[rgba(238,242,249,.55)]">{label}</p>
    </div>
  );
}

function ModernMetricsCard({ title, metrics }: { title: string; metrics: ProgressMetrics }) {
  const items = [
    { label: 'Reflection days', value: metrics.reflectionDays },
    { label: 'Practice days', value: metrics.practiceDays },
    { label: 'Homework', value: metrics.homeworkSubmitted },
    { label: 'Quizzes', value: metrics.quizzesCompleted },
    { label: 'Lessons', value: metrics.lessonsCompleted },
  ];
  return (
    <ModernCard title={title} bodyClassName="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {items.map(({ label, value }) => (
        <div key={label} className="text-center">
          <p className="font-garamond text-lg font-semibold text-[#F6F9FE]">{value}</p>
          <p className="text-xs text-[rgba(238,242,249,.55)]">{label}</p>
        </div>
      ))}
    </ModernCard>
  );
}

function todayIso() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Modern-themed port of TodayAndActivitySection — same student-scoped hooks
 * (useProgress, useTodayReflection, usePracticeList, useMyLessons, useActivity).
 * STUDENT-only, same as the Default UI's version.
 */
export function ModernTodayAndActivity() {
  const { data: progress, isLoading } = useProgress();
  const { data: today } = useTodayReflection();
  const { data: practice } = usePracticeList();
  const { data: activity } = useActivity(0, 6);
  const { data: lessons } = useMyLessons();

  if (isLoading || !progress) return null;

  const reflectedToday = !!today?.reflection;
  const practisedToday = (practice ?? []).some((p) => p.studyDate === todayIso());
  const upcoming = lessons?.content?.[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ModernStat icon={Flame} label="Reflection streak" value={`${progress.reflectionStreak} ${progress.reflectionStreak === 1 ? 'day' : 'days'}`} />
        <ModernStat icon={Flame} label="Practice streak" value={`${progress.practiceStreak} ${progress.practiceStreak === 1 ? 'day' : 'days'}`} />
        <ModernStat icon={ClipboardList} label="Homework submitted" value={progress.courseTotal.homeworkSubmitted} />
        <ModernStat icon={FileQuestion} label="Quizzes completed" value={progress.courseTotal.quizzesCompleted} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ModernCard title="Today" subtitle={formatDate(todayIso())} bodyClassName="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[rgba(238,242,249,.1)] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[.06] text-[#DBB652]">
                <PenLine className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-[#EEF2F9]">Reflection</p>
                {reflectedToday ? (
                  <span className="text-xs text-[#8fd6ae]">Done</span>
                ) : (
                  <span className="text-xs text-[rgba(238,242,249,.55)]">Not yet today</span>
                )}
              </div>
            </div>
            <Link
              to={paths.reflections}
              className="inline-flex items-center gap-1 rounded-lg bg-[#B0821C] px-3 py-1.5 text-xs font-semibold text-[#231803]"
            >
              {reflectedToday ? 'Edit' : 'Reflect'} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-[rgba(238,242,249,.1)] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[.06] text-[#DBB652]">
                <BookOpenCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-[#EEF2F9]">Practice</p>
                {practisedToday ? (
                  <span className="text-xs text-[#8fd6ae]">Logged</span>
                ) : (
                  <span className="text-xs text-[rgba(238,242,249,.55)]">Nothing logged yet</span>
                )}
              </div>
            </div>
            <Link
              to={paths.practice}
              className="inline-flex items-center gap-1 rounded-lg bg-[#B0821C] px-3 py-1.5 text-xs font-semibold text-[#231803]"
            >
              Log <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </ModernCard>

        <ModernCard title="Upcoming lesson">
          {upcoming ? (
            <Link to={paths.myLessonDetail(upcoming.id)} className="group flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/[.06] text-[#DBB652]">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#EEF2F9]">{upcoming.title}</p>
                <p className="inline-flex items-center gap-1 text-xs text-[rgba(238,242,249,.55)]">
                  <CalendarDays className="h-3.5 w-3.5" /> Lesson {upcoming.lessonNumber} · {formatDate(upcoming.lessonDate)}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[rgba(238,242,249,.3)] group-hover:text-[#DBB652]" />
            </Link>
          ) : (
            <p className="py-6 text-center text-sm text-[rgba(238,242,249,.55)]">No lessons published yet.</p>
          )}
        </ModernCard>
      </div>

      <ModernCard
        title="Recent activity"
        bodyClassName="p-0"
        action={
          <Link to={paths.activity} className="text-sm font-medium text-[#DBB652] hover:underline">
            View all
          </Link>
        }
      >
        {(activity?.content?.length ?? 0) === 0 ? (
          <p className="p-6 text-sm text-[rgba(238,242,249,.55)]">Your recent activity will show up here.</p>
        ) : (
          <ul className="divide-y divide-[rgba(238,242,249,.08)]">
            {(activity?.content ?? []).map((a) => {
              const Icon = activityIcon(a.type);
              return (
                <li key={a.id} className="flex items-start gap-3 px-6 py-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[.06] text-[#DBB652]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#EEF2F9]">{a.title}</p>
                    {a.description && (
                      <p className="truncate text-xs text-[rgba(238,242,249,.55)]">{a.description}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-[rgba(238,242,249,.4)]">{formatRelativeTime(a.occurredAt)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ModernCard>
    </div>
  );
}
