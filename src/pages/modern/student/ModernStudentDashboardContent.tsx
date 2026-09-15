import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyDashboard, useMyTier } from '@/features/dashboard/hooks/useDashboard';
import { romanTierLabel, tierQualifier } from '@/theme/tierDisplay';
import { paths } from '@/routes/paths';
import '@/pages/modern/student/kbvDashboard.css';

// Two distinct ring treatments per the design (Medallion = dark, r=104 of a 240 viewBox;
// Almanac = light, r=102) — see the .f-coin / .f-arc CSS in kbvDashboard.css for sizing/stroke.
const COIN_R = 104;
const COIN_C = 2 * Math.PI * COIN_R;
const ARC_R = 102;
const ARC_C = 2 * Math.PI * ARC_R;

/** A callback ref (not useRef+useEffect([])) so the observer attaches exactly when React
 * mounts the DOM node — on a genuine first visit that node doesn't exist yet during the
 * loading-state render, so a mount-once effect would see a null ref and never retry once
 * the real content (and its ref) appears. A callback ref re-fires every time the node
 * changes, including that later mount. */
function useReveal<T extends HTMLElement>() {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((el: T | null) => {
    observerRef.current?.disconnect();
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    observerRef.current = io;
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [ref, inView] as const;
}

const PILLAR_LABELS: Record<string, string> = {
  practice: 'Practice',
  reflection: 'Reflection',
  homework: 'Post-Lesson Homework',
  quiz: 'Post-Lesson Quiz',
};

export function ModernStudentDashboardContent() {
  const { data: dashboard, isLoading, isError, isFetching, refetch } = useMyDashboard();
  const { data: tier } = useMyTier();
  const detailRef = useRef<HTMLDivElement>(null);
  const [trendRef, trendIn] = useReveal<HTMLDivElement>();
  const [detailIn2, setDetailIn2] = useState(false);

  useEffect(() => {
    if (trendIn) {
      const t = setTimeout(() => setDetailIn2(true), 150);
      return () => clearTimeout(t);
    }
  }, [trendIn]);

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-[rgba(238,242,249,.6)]">Loading your standing…</div>;
  }
  if (isError || !dashboard) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center text-[rgba(238,242,249,.72)]">
        <p>Failed to load your standing.</p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg border border-[rgba(238,242,249,.2)] px-4 py-2 text-sm hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isFetching ? 'Retrying…' : 'Retry'}
        </button>
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
      return { text: `${gap} to ${nextLabel}`, gap, nextLabel };
    }
    return { text: `Next: ${nextLabel}`, gap: null, nextLabel };
  })();

  const daysToExam = dashboard.cohort?.examDate
    ? Math.ceil((new Date(dashboard.cohort.examDate).getTime() - Date.now()) / 86_400_000)
    : null;

  const pillars = [
    { key: 'practice', value: dashboard.practicePercentage, weight: dashboard.weights.practice },
    { key: 'reflection', value: dashboard.reflectionPercentage, weight: dashboard.weights.reflection },
    { key: 'homework', value: dashboard.homeworkPercentage, weight: dashboard.weights.homework },
    { key: 'quiz', value: dashboard.quizPercentage, weight: dashboard.weights.quiz },
  ];
  const biggestLever = pillars.reduce((min, p) => (p.value < min.value ? p : min), pillars[0]);

  const pace = dashboard.pace;
  const trajNow = Math.max(0, Math.min(100, pace.atRecentPace));
  const trajThresh = pace.nextTierThreshold != null ? Math.max(0, Math.min(100, pace.nextTierThreshold)) : null;
  const trajGap = trajThresh != null ? Math.round(trajThresh - trajNow) : null;

  const attendance = dashboard.attendance;
  const availableDays = attendance.filter((d) => !d.voided && !d.restOrSkip).length;
  const activeDays = attendance.filter((d) => d.active && !d.voided && !d.restOrSkip).length;

  const scrollToDetail = () => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="kbv-dash">
      {/* Layer 1 — Glance */}
      <section className="glance">
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <defs>
            <linearGradient id="ggold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#B0821C" />
              <stop offset=".5" stopColor="#D8AB3E" />
              <stop offset="1" stopColor="#F4D888" />
            </linearGradient>
            <linearGradient id="ggoldC" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#E9C766" />
              <stop offset=".5" stopColor="#F7E2A0" />
              <stop offset="1" stopColor="#FFF4CE" />
            </linearGradient>
          </defs>
        </svg>

        <p className="lab">Composite standing</p>
        <div className="focal">
          {/* MEDALLION — dark theme: number-as-hero on navy, one luminous gold hairline */}
          <div className="f f-coin">
            <div
              className="ringwrap"
              role="img"
              aria-label={`Composite standing ${Math.round(dashboard.compositeScore)} out of 100, ${tierLabel}`}
            >
              <svg className="kbv-ring" viewBox="0 0 240 240" aria-hidden="true">
                <circle className="g-track" cx="120" cy="120" r={COIN_R} fill="none" />
                <circle
                  className="g-fill"
                  cx="120"
                  cy="120"
                  r={COIN_R}
                  fill="none"
                  transform="rotate(-90 120 120)"
                  strokeDasharray={COIN_C}
                  strokeDashoffset={COIN_C * (1 - Math.max(0, Math.min(100, dashboard.compositeScore)) / 100)}
                />
              </svg>
              <div className="gnum">{Math.round(dashboard.compositeScore)}</div>
            </div>
          </div>

          {/* ALMANAC — light theme: the quiet instrument on paper */}
          <div className="f f-arc">
            <div
              className="ringwrap"
              role="img"
              aria-label={`Composite standing ${Math.round(dashboard.compositeScore)} out of 100, ${tierLabel}`}
            >
              <svg className="kbv-ring" viewBox="0 0 240 240" aria-hidden="true">
                <circle className="g-track" cx="120" cy="120" r={ARC_R} fill="none" />
                <circle
                  className="g-fill"
                  cx="120"
                  cy="120"
                  r={ARC_R}
                  fill="none"
                  transform="rotate(-90 120 120)"
                  strokeDasharray={ARC_C}
                  strokeDashoffset={ARC_C * (1 - Math.max(0, Math.min(100, dashboard.compositeScore)) / 100)}
                />
                {/* <line className="g-notch" x1="120" y1="8" x2="120" y2="30" transform="rotate(324 120 120)" />
                <g className="g-tip in" transform="rotate(316.8 120 120)">
                  <circle cx="120" cy="20" r="6" />
                </g> */}
              </svg>
              <div className="gnum">{Math.round(dashboard.compositeScore)}</div>
            </div>
          </div>
        </div>
        <div className="meta">
          <span className="rl" />
          <div className="tier">
            {tierLabel}
            {qualifier && (
              <>
                {' '}— <em>{qualifier}</em>
              </>
            )}
          </div>
          {goal && (
            <div className="goal">
              <span>{goal.text}</span>
            </div>
          )}
        </div>
        <button type="button" className="cue" onClick={scrollToDetail}>
          Your standing, below
          <span className="arw" />
        </button>
      </section>

      {/* Layer 2 — Trend */}
      <section className="trend" ref={trendRef}>
        <div className="band">
          <p className={`sec-lab reveal ${trendIn ? 'in' : ''}`}>Where you&rsquo;re heading</p>
          {daysToExam != null && (
            <div className={`exam reveal ${trendIn ? 'in' : ''}`}>
              <b>{daysToExam >= 0 ? `${daysToExam} day${daysToExam === 1 ? '' : 's'}` : 'Exam day has passed'}</b>
              {daysToExam >= 0 && ' to the exam'}
            </div>
          )}
          <div className={`traj reveal ${trendIn ? 'in' : ''}`}>
            <div className="traj-lab">On your recent pace</div>
            <div className="traj-track">
              <i className="traj-now" style={{ width: trendIn ? `${trajNow}%` : 0 }} />
              {trajThresh != null && (
                <>
                  <i className="traj-thresh" style={{ left: `${trajThresh}%` }} />
                  <span className="traj-thresh-label" style={{ left: `${trajThresh}%`, position: 'absolute' }}>
                    {pace.nextTierName}
                  </span>
                </>
              )}
              <i className="traj-dot" style={{ left: trendIn ? `${trajThresh ?? trajNow}%` : '0%' }} />
            </div>
            <div className="traj-cap">
              {trajThresh == null ? (
                <>Keep up your current pace to stay on track.</>
              ) : trajGap != null && trajGap > 0 ? (
                <>
                  <b>{trajGap} points</b> to <em>{pace.nextTierName}</em> — hold your pace and you cross the line.
                </>
              ) : (
                <>
                  You&rsquo;re pacing for <em>{pace.nextTierName}</em>.
                </>
              )}
            </div>
          </div>
          <div className={`cad reveal ${trendIn ? 'in' : ''}`}>
            <div className="cad-lab">
              <span className="l">Consistency</span>
              <span className="r">
                showed up <b>{activeDays} of {availableDays}</b> days
              </span>
            </div>
            <div className="cad-grid">
              {attendance.map((d) => (
                <i
                  key={d.date}
                  title={d.restOrSkip ? 'Rest/Skip day — not counted' : d.voided ? 'Voided — not counted' : undefined}
                  className={d.voided ? 'void' : d.restOrSkip ? 'rest' : undefined}
                  style={{ opacity: detailIn2 ? (d.active ? 1 : d.voided || d.restOrSkip ? 1 : 0.16) : 0 }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Layer 3 — Detail */}
      <section className="detail" ref={detailRef}>
        <div className="band">
          <p className={`sec-lab reveal ${detailIn2 ? 'in' : ''}`}>What&rsquo;s behind it</p>
          <div className={`pil reveal ${detailIn2 ? 'in' : ''}`}>
            {pillars.map((p) => (
              <div className="pil-i" key={p.key}>
                <div className="pil-n">{PILLAR_LABELS[p.key]}</div>
                <div className="pil-v">{Math.round(p.value)}</div>
                <div className="pil-t">
                  <i className="pil-f" style={{ width: detailIn2 ? `${Math.max(0, Math.min(100, p.value))}%` : 0 }} />
                </div>
                <div className="pil-w">{p.weight}% weight</div>
              </div>
            ))}
          </div>
          <div className={`pace reveal ${detailIn2 ? 'in' : ''}`}>
            <div className="pq">
              <div className="l">Now</div>
              <div className="v">{Math.round(pace.now)}</div>
              <div className="t">{tierLabel}</div>
            </div>
            <div className="pq h">
              <div className="l">At recent pace</div>
              <div className="v">{Math.round(pace.atRecentPace)}</div>
              <div className="t">{pace.nextTierName ?? tierLabel}</div>
            </div>
            <div className="pq">
              <div className="l">Last 3 days</div>
              <div className="v">{Math.round(pace.last3Days)}</div>
              <div className="t">{pace.nextTierName ?? tierLabel}</div>
            </div>
          </div>
          <div className={`nudge reveal ${detailIn2 ? 'in' : ''}`}>
            <div className="t">
              {goal?.gap ? (
                <>
                  <b>{goal.gap} points</b> from <em>{goal.nextLabel}</em> · your biggest lever is{' '}
                  <b>{PILLAR_LABELS[biggestLever.key]}</b>.
                </>
              ) : (
                <>
                  Your biggest lever is <b>{PILLAR_LABELS[biggestLever.key]}</b>.
                </>
              )}
            </div>
            <Link to={paths.log}>
              <button type="button">Log a session →</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
