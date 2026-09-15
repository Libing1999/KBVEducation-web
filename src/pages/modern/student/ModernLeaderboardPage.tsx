import { useEffect, useState } from 'react';
import { useMyLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard';
import { useMyMessages, useMarkMessageRead } from '@/features/messages/hooks/useMessages';
import { formatRelativeTime } from '@/lib/format';
import { cn, getErrorMessage } from '@/lib/utils';
import '@/pages/modern/student/kbvLeaderboard.css';

function ordinalSuffix(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * "Where You Stand" — content only (the shared 3-tab header, theme orb, and
 * background are provided by <ModernStudentShell>; see LeaderboardRoute).
 * Ported from the approved design's Student UI/05-leaderboard.
 *
 * Privacy: `data` is exactly what LeaderboardServiceImpl.studentView returns
 * — the public top-N entries plus the caller's own entry, never the full
 * cohort ranking — so this component has no way to render more than that
 * even if it wanted to.
 *
 * "Top three" in the design is rendered here as "Top {topN}", driven by the
 * admin-configurable ScoreConfig.publicTopN (default 3) rather than a
 * hardcoded count.
 *
 * Weekly rank movement ("Up 2 places this week") from the design is
 * intentionally omitted: the backend doesn't track historical rank, and
 * fabricating a trend would misrepresent the student's real standing (same
 * rule ModernStandingDashboard's Layer 2 omission follows).
 */
export default function ModernLeaderboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useMyLeaderboard();
  const { data: messages } = useMyMessages();
  const markRead = useMarkMessageRead();
  const [liveOpen, setLiveOpen] = useState(false);
  const [rowsIn, setRowsIn] = useState(false);

  useEffect(() => {
    if (!data) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setRowsIn(true), reduce ? 0 : 250);
    return () => clearTimeout(t);
  }, [data]);

  if (isLoading) {
    return <main className="lb-main"><p className="lb-kicker">Loading your standing…</p></main>;
  }
  if (isError || !data) {
    // Most of what lands here isn't a broken server — it's a legitimate state a student can be
    // in (not assigned to a cohort yet, the leaderboard turned off, not ranked yet because
    // nothing's been calculated for them) — the backend already says exactly which one via a
    // real message, so show that instead of a generic "something's broken" banner. Retry stays
    // available since an admin fixing the underlying cause (e.g. assigning a cohort) is exactly
    // what a retry here picks up, without the student needing to reload the page.
    const message = isError
      ? getErrorMessage(error, 'The leaderboard is not available right now.')
      : 'The leaderboard is not available right now.';
    return (
      <main className="lb-main">
        <p className="lb-foot">{message}</p>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="lb-you-move"
            style={{ cursor: isFetching ? 'default' : 'pointer', border: 'none', opacity: isFetching ? 0.6 : 1 }}
          >
            {isFetching ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      </main>
    );
  }

  const { topEntries, ownEntry, totalStudents, topN } = data;
  const podiumEntry = topEntries.length > 0 ? topEntries[topEntries.length - 1] : null;
  const gap = podiumEntry ? Math.max(0, podiumEntry.compositeScore - ownEntry.compositeScore) : 0;
  const onPodium = gap <= 0;
  const railPct = podiumEntry && podiumEntry.compositeScore > 0
    ? Math.min(100, Math.max(0, (ownEntry.compositeScore / podiumEntry.compositeScore) * 100))
    : 100;

  const unread = messages?.filter((m) => !m.read) ?? [];

  const openLive = () => {
    setLiveOpen(true);
    unread.forEach((m) => markRead.mutate(m.id));
  };

  return (
    <>
      <main className="lb-main">
        <p className="lb-kicker">Your cohort standing</p>

        <div className="lb-panels">
          <section className="lb-panel">
            <p className="lb-p-lab">Your climb</p>
            <div className="lb-you-rank">
              <span className="lb-yr-n">{ownEntry.rank}</span>
              <span className="lb-yr-ord">{ordinalSuffix(ownEntry.rank)}</span>
              <span className="lb-yr-of">of {totalStudents} students</span>
            </div>
          </section>

          {podiumEntry && (
            <div className="lb-bridge">
              <div className="lb-rail-track">
                <i className="lb-rail-fill" style={{ transform: `scaleX(${railPct / 100})` }} />
                <i className="lb-rail-thresh" style={{ left: '100%' }} />
                <i className="lb-rail-dot" style={{ left: `${railPct}%` }} />
              </div>
              <p className="lb-bridge-cap">
                {onPodium ? (
                  <>You&rsquo;re <em>on the podium</em> — <b>{Math.round(ownEntry.compositeScore)}</b>.</>
                ) : (
                  <>
                    <em>{Math.round(gap)} points</em> from the podium — <b>{Math.round(podiumEntry.compositeScore)}</b> vs your{' '}
                    <b>{Math.round(ownEntry.compositeScore)}</b>.
                  </>
                )}
              </p>
            </div>
          )}

          <section className="lb-panel">
            <p className="lb-p-lab">Top {topN}</p>
            <div className="lb-t3-list">
              {topEntries.map((e, i) => (
                <div
                  key={e.studentId}
                  className={cn('lb-m-row', rowsIn && 'in', e.studentId === ownEntry.studentId && 'mine')}
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <span className="lb-m-rk">{String(e.rank).padStart(2, '0')}</span>
                  <span className="lb-m-nm">{e.studentName}</span>
                  <span className="lb-m-sc">{Math.round(e.compositeScore)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <p className="lb-foot">
          Standing is your <b>composite</b> — mostly consistency: study days and reflections, not raw scores.
          Everyone&rsquo;s climb counts.
        </p>
      </main>

      <button
        className={cn('live-tab', unread.length > 0 && 'unread')}
        type="button"
        onClick={openLive}
        aria-label="Open Live Action"
      >
        <span className="live-dot" />
        Live Action
      </button>
      <div className={cn('live-scrim', liveOpen && 'open')} onClick={() => setLiveOpen(false)} aria-hidden />
      <aside className={cn('live-panel', liveOpen && 'open')} aria-label="Live Action">
        <div className="live-head">
          <span className="live-title">Live Action</span>
          <button className="live-close" type="button" onClick={() => setLiveOpen(false)} aria-label="Close">
            &times;
          </button>
        </div>
        <p className="live-sub">From your coach &mdash; only when there&rsquo;s something worth saying.</p>
        <div className="live-list">
          {!messages || messages.length === 0 ? (
            <p className="lm-empty">Nothing here yet.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={cn('live-msg', !m.read && 'unread')}>
                <span className="lm-tag">{m.tag}</span>
                <p className="lm-text">{m.text}</p>
                <span className="lm-date">{formatRelativeTime(m.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
