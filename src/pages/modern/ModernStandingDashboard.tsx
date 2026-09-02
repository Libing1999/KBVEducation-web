import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMyDashboard, useMyTier } from '@/features/dashboard/hooks/useDashboard';
import { useAuthStore } from '@/features/auth/store/authStore';
import { MedallionRing } from '@/components/modern/MedallionRing';
import { ModernDashboardBar } from '@/components/modern/ModernDashboardBar';
import { useCountUp } from '@/components/modern/useCountUp';
import { romanTierLabel, tierQualifier } from '@/theme/tierDisplay';
import { GRAIN_TEXTURE_URI } from '@/theme/grainTexture';
import { paths } from '@/routes/paths';
import {
  ModernScoreBreakdownCard,
  ModernTierProgressCard,
  ModernLeaderboardCard,
  ModernCertificateCard,
  ModernListCard,
  ModernTodayAndActivity,
  ModernParentActivitySection,
  upcomingLessonItems,
  notificationItems,
} from '@/components/modern/ModernScoreSections';

interface Pillar {
  name: string;
  value: number;
}

function PillarStat({ pillar }: { pillar: Pillar }) {
  const displayed = useCountUp(Math.round(pillar.value), 1200);
  return (
    <span className="flex items-baseline gap-2 border-l border-[rgba(238,242,249,.12)] px-[clamp(16px,3.4vw,28px)] first:border-l-0">
      <span className="text-[11px] tracking-[0.04em] text-[rgba(238,242,249,.6)]">{pillar.name}</span>
      <span className="font-garamond text-[19px] font-semibold leading-none text-[#EEF2F9]">{displayed}</span>
    </span>
  );
}

/**
 * Modern UI's "Standing" dashboard for Student and Parent roles (the backend
 * already resolves a parent's linked student for these same endpoints, same
 * as the Default UI's <ScoreDashboard isParentView />). Reuses useMyDashboard
 * / useMyTier verbatim — no new queries, no new business logic. Layer 2
 * (exam countdown, pace trajectory, consistency calendar) from the design
 * reference is intentionally omitted: the current API exposes none of the
 * data it would need, and fabricating projections would misrepresent a
 * student's real standing.
 */
export function ModernStandingDashboard() {
  const role = useAuthStore((s) => s.user?.role);
  const { data: dashboard, isLoading, isError, isFetching, refetch } = useMyDashboard();
  const { data: tier } = useMyTier();
  const detailRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080E1C] text-[rgba(238,242,249,.6)]">
        Loading your standing…
      </div>
    );
  }
  if (isError || !dashboard) {
    return (
      <div className="min-h-screen bg-[#080E1C] text-[rgba(238,242,249,.72)]">
        {/* Navigation must stay reachable even when the dashboard data fails to
            load — otherwise a student with a failing/empty standing has no way
            to reach Practice/Reflections/Leaderboard/etc. */}
        <ModernDashboardBar />
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 pt-16 text-center">
          <p>
            {role === 'PARENT'
              ? 'Could not load your linked student’s standing. They may not be linked yet.'
              : 'Failed to load your standing.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-lg border border-[rgba(238,242,249,.2)] px-4 py-2 text-sm hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetching ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  const tierLabel = romanTierLabel(dashboard.currentTier);
  const qualifier = tierQualifier(dashboard.currentTier);

  const goal = (() => {
    if (!tier?.nextPossibleTier) return null;
    const composite = tier.remainingRequirements.find((r) => r.metric.toLowerCase().includes('composite'));
    const nextLabel = tierQualifier(tier.nextPossibleTier) ?? tier.nextPossibleTier;
    if (composite) {
      const gap = Math.max(0, Math.ceil(composite.required - composite.current));
      return `${gap} to ${nextLabel}`;
    }
    return `Next: ${nextLabel}`;
  })();

  const pillars: Pillar[] = [
    { name: 'Practice', value: dashboard.practicePercentage },
    { name: 'Reflection', value: dashboard.reflectionPercentage },
    { name: 'Homework', value: dashboard.homeworkPercentage },
    { name: 'Recall', value: dashboard.quizPercentage },
  ];
  const biggestLever = pillars.reduce((min, p) => (p.value < min.value ? p : min), pillars[0]);

  const scrollToDetail = () => {
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative min-h-screen bg-[#080E1C] pb-16 font-modern text-[#EEF2F9]">
      <div
        className="fixed inset-0 -z-20"
        style={{
          background:
            'radial-gradient(56% 44% at 50% 26%, rgba(38,64,112,.34), transparent 66%), linear-gradient(180deg,#0C1830,#0A1428 46%,#070E1C)',
        }}
      />
      <div
        className="fixed inset-0 -z-10 opacity-[.55] mix-blend-overlay"
        style={{ backgroundSize: '170px 170px', backgroundImage: `url("${GRAIN_TEXTURE_URI}")` }}
        aria-hidden
      />

      <ModernDashboardBar />

      {/* Layer 1 — Glance */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-[clamp(96px,14vh,140px)] text-center">
        <p className="mb-[clamp(22px,4vh,44px)] text-[11px] font-medium uppercase tracking-[0.34em] text-[rgba(238,242,249,.6)]">
          Composite standing
        </p>

        <MedallionRing value={dashboard.compositeScore} />

        <div className="mt-[clamp(30px,5vh,56px)] flex flex-col items-center gap-3.5">
          <span className="h-px w-[46px] bg-[#B0821C]" />
          <p className="font-garamond text-[clamp(22px,3vw,28px)] font-medium leading-tight">
            {tierLabel}
            {qualifier && <> — <em className="not-italic text-[#B0821C]">{qualifier}</em></>}
          </p>
          {goal && (
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8a6414]">
              <span className="text-[#B0821C]">{goal}</span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={scrollToDetail}
          className="mt-[clamp(32px,6vh,64px)] flex flex-col items-center gap-2.5 text-[9.5px] uppercase tracking-[0.24em] text-[rgba(238,242,249,.5)] transition-colors hover:text-[#B0821C]"
        >
          Your standing, below
          <span
            className="h-7 w-px"
            style={{ background: 'linear-gradient(180deg,#B0821C,transparent)' }}
            aria-hidden
          />
        </button>
      </section>

      {/* Layer 3 — Detail. Always visible (not gated on scroll-into-view JS
          state) so the content can never get stuck invisible — the ref is
          only used as the "Your standing, below" cue button's scroll target. */}
      <section ref={detailRef} className="mx-auto max-w-[640px] px-6">
        <div className="animate-[kbvReveal_0.8s_cubic-bezier(.16,1,.3,1)_both]">
          <p className="mb-[clamp(28px,4vh,44px)] text-center text-[10.5px] font-medium uppercase tracking-[0.28em] text-[rgba(238,242,249,.5)]">
            What&rsquo;s behind it
          </p>

          <div className="flex flex-wrap items-baseline justify-center gap-y-3">
            {pillars.map((p) => (
              <PillarStat key={p.name} pillar={p} />
            ))}
          </div>

          {role === 'STUDENT' && goal && (
            <div
              className="mx-auto mt-[clamp(42px,7vh,62px)] flex max-w-[620px] flex-wrap items-center justify-center gap-[22px] rounded-2xl border px-7 py-[22px]"
              style={{
                borderColor: 'rgba(176,130,28,.26)',
                background: 'radial-gradient(140% 200% at 0% 50%, rgba(176,130,28,.07), transparent 58%)',
              }}
            >
              <p className="text-[14.5px] text-[rgba(238,242,249,.6)]">
                <span className="font-garamond font-semibold text-[#EEF2F9]">{goal}</span> · your biggest
                lever is <span className="font-garamond font-semibold text-[#EEF2F9]">{biggestLever.name}</span>.
              </p>
              <Link
                to={paths.practice}
                className="whitespace-nowrap rounded-[10px] bg-[#B0821C] px-6 py-3 text-[13.5px] font-medium text-[#231803] transition-transform hover:-translate-y-px"
              >
                Log a session →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Full dashboard — everything the Default UI's ScoreDashboard shows
          (score breakdown, tier progress, leaderboard, certificates, lessons,
          notifications, activity), rebuilt with Modern-themed cards using the
          exact same hooks/data, so Modern UI has complete feature parity
          without pulling in the Default UI's light card styling. */}
      <section className="mx-auto mt-[clamp(56px,9vh,96px)] max-w-6xl space-y-4 px-4 pb-16 sm:px-6">
        <p className="mb-2 text-center text-[10.5px] font-medium uppercase tracking-[0.28em] text-[rgba(238,242,249,.5)]">
          Full dashboard
        </p>

        <ModernScoreBreakdownCard
          practicePercentage={dashboard.practicePercentage}
          reflectionPercentage={dashboard.reflectionPercentage}
          homeworkPercentage={dashboard.homeworkPercentage}
          quizPercentage={dashboard.quizPercentage}
        />

        {role !== 'PARENT' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {tier && <ModernTierProgressCard tier={tier} />}
            <ModernLeaderboardCard />
            <ModernCertificateCard variant="student" />
          </div>
        )}
        {role === 'PARENT' && tier && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ModernTierProgressCard tier={tier} />
            <ModernCertificateCard variant="parent" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ModernListCard
            title="Upcoming Lessons"
            items={upcomingLessonItems(dashboard.upcomingLessons)}
            empty="No upcoming lessons yet."
          />
          <ModernListCard
            title="Recent Notifications"
            items={notificationItems(dashboard.recentNotifications)}
            empty="No notifications yet."
          />
        </div>

        {role === 'PARENT' ? <ModernParentActivitySection /> : <ModernTodayAndActivity />}
      </section>
    </div>
  );
}

export default ModernStandingDashboard;
