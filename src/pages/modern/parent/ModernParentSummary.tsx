import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useKbvTheme } from '@/theme/kbvTheme';
import { useParentSummary, useParentMessages, useParentChildren } from '@/features/parent/hooks/useParentSummary';
import { certificatesApi } from '@/features/certificates/api/certificatesApi';
import { romanTierLabel } from '@/theme/tierDisplay';
import { getErrorMessage } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/format';
import type { ParentWeekMetric } from '@/features/parent/types/parent.types';
import '@/pages/modern/parent/kbvParentSummary.css';

/** done/total tick row for "this week" (never used for the course-so-far line,
 *  which is plain text — matches the reference parent.html's tickRow()). */
function TickRow({ done, total, small }: { done: number; total: number; small?: boolean }) {
  return (
    <div className={small ? 'p-ticks sm' : 'p-ticks'}>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < done ? 'on' : undefined} />
      ))}
    </div>
  );
}

function Metric({
  kind,
  label,
  metric,
}: {
  kind: 'primary' | 'secondary';
  label: string;
  metric: ParentWeekMetric;
}) {
  return (
    <div className={`p-metric p-metric--${kind}`}>
      <div className="p-metric-lab">{label}</div>
      <div className="p-metric-num">
        <span className="num">{metric.done}</span>
        <span className="den">of {metric.total} days</span>
      </div>
      <TickRow done={metric.done} total={metric.total} small={kind === 'secondary'} />
      <div className="p-metric-course">
        Course so far: <b>{metric.courseDone}</b> of <b>{metric.courseTotal}</b> days
      </div>
    </div>
  );
}

/**
 * The Parent screen's single weekly summary — replaces the parent's old
 * 6-link side nav entirely (Dashboard/My Lessons/Activity/Calendar/
 * Certificates/Profile). Ported from the approved design system's Parent UI
 * (parent.html/parent.css), driven by real data instead of the reference
 * file's hardcoded ?state= demo variants. See its NOTES.md for the section
 * order/conditionality this mirrors exactly.
 */
export function ModernParentSummary() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  // Fallback only: every other Modern screen falls back to dark; this
  // screen's fallback is light ("Almanac") per NOTES.md — an existing
  // stored kbv-theme preference still wins here exactly as everywhere else.
  const [theme, setTheme] = useKbvTheme('light');

  // A parent with only one linked child never sees this list surfaced anywhere — the
  // selector below only renders once there's an actual choice to make.
  const { data: children } = useParentChildren();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const effectiveChildId = selectedChildId ?? children?.[0]?.id;

  const { data, isLoading, isError, error, isFetching, refetch } = useParentSummary(effectiveChildId);
  // "Messages from Bhavya" — useParentMessages swallows any failure (see its own doc
  // comment), so an empty/undefined result here just means the card doesn't render below.
  const { data: messages } = useParentMessages(effectiveChildId);

  const [acctOpen, setAcctOpen] = useState(false);
  const acctRef = useRef<HTMLDivElement>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!acctOpen) return;
    const onClick = (e: MouseEvent) => {
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setAcctOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAcctOpen(false);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [acctOpen]);

  // Reset the rotating note back to the latest message whenever the list changes.
  useEffect(() => {
    setMsgIdx(0);
  }, [messages]);

  const handleDownload = async () => {
    if (!data?.certificate) return;
    setDownloading(true);
    try {
      await certificatesApi.downloadForParent(data.certificate.id, data.certificate.certificateNumber, effectiveChildId);
    } finally {
      setDownloading(false);
    }
  };

  const activeMessage = messages && messages.length > 0 ? messages[msgIdx % messages.length] : null;

  return createPortal(
    <div className="kbv-parent" data-theme={theme} data-testid="modern-parent-summary">
      {/* <div className="field" /> */}
      <div className="grain" />

      <header className="bar">
        <div className="bmark">
          KBV
          <span className="rule" />
          <span className="sb">Education</span>
        </div>
        <div className="p-headright">
          {data && children && children.length > 1 ? (
            <div className="who">
              <select
                className="who-child-select"
                aria-label="Select child"
                value={effectiveChildId ?? ''}
                onChange={(e) => setSelectedChildId(e.target.value)}
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
              <span className="who-sep">&middot;</span>
              {data.cohortName}
            </div>
          ) : (
            data && (
              <div className="who">
                {data.childName}
                <span className="who-sep">&middot;</span>
                {data.cohortName}
              </div>
            )
          )}
          <button
            className="theme-orb"
            type="button"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-pressed={theme === 'light'}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <svg className="ti ti-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 3v2.5M12 18.5V21M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M3 12h2.5M18.5 12H21M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
            </svg>
            <svg className="ti ti-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.2 14.7A8.5 8.5 0 1 1 9.3 3.8a7 7 0 0 0 10.9 10.9Z" />
            </svg>
          </button>
          <div className="acct-wrap" ref={acctRef}>
            <button
              className="acct-btn"
              type="button"
              aria-haspopup="true"
              aria-expanded={acctOpen}
              aria-label="Account"
              onClick={() => setAcctOpen((v) => !v)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8.4" r="3.5" />
                <path d="M5 19.6c1.15-3.6 3.9-5.4 7-5.4s5.85 1.8 7 5.4" />
              </svg>
            </button>
            <div className={acctOpen ? 'acct-pop open' : 'acct-pop'} role="dialog" aria-label="Account">
              <div className="acct-row">
                <span className="acct-lab">Name</span>
                <span className="acct-val">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <div className="acct-row">
                <span className="acct-lab">Email</span>
                <span className="acct-val">{user?.email}</span>
              </div>
              {/* Not in the reference design (its popover is read-only) — added because the
                  6-link side nav that used to hold Logout (SidebarUserProfile) is gone for
                  this role, so a parent needs some way to sign out. */}
              <button type="button" className="acct-logout" onClick={() => logout()}>
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        {isLoading && <p className="p-status">Loading your weekly summary&hellip;</p>}

        {isError && (
          <div className="p-error">
            <p>{getErrorMessage(error, 'Could not load your weekly summary.')}</p>
            <button type="button" className="p-retry" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Retrying…' : 'Retry'}
            </button>
          </div>
        )}

        {data && (
          <>
            {data.action && (
              <div className={data.action.urgent ? 'p-action urgent' : 'p-action'}>
                <span className="p-action-dot" />
                <span className="p-action-text">
                  {data.action.label} &middot; <b>{data.action.daysLeftLabel}</b>
                </span>
              </div>
            )}

            <section className="p-week">
              <div className="p-week-head">
                <h2>This week</h2>
                <span className="p-week-range">{data.weekRangeLabel}</span>
              </div>
              {data.justStarted || !data.practice || !data.reflection ? (
                <div className="p-start">
                  <p className="p-start-t">{data.cohortName} started this week.</p>
                  <p className="p-start-s">
                    Practice and reflection will appear here once {data.childName}&rsquo;s first sessions are
                    logged.
                  </p>
                </div>
              ) : (
                <>
                  <Metric kind="primary" label="Studied" metric={data.practice} />
                  <Metric kind="secondary" label="Reflected on" metric={data.reflection} />
                </>
              )}
            </section>

            {!data.justStarted && (data.quizzes.total > 0 || data.homework.total > 0) && (
              <div className="p-counts">
                Post-Lesson Quiz: <b>
                  {data.quizzes.done} of {data.quizzes.total}
                </b>{' '}
                total &middot; Post-Lesson Homework:{' '}
                <b>
                  {data.homework.done} of {data.homework.total}
                </b>{' '}
                total
              </div>
            )}

            {activeMessage && (
              <div className="msg-note">
                <div className="msg-kicker">From Bhavya</div>
                <p className="msg-text">&ldquo;{activeMessage.text}&rdquo;</p>
                <div className="msg-foot">
                  <span className="msg-date">{formatRelativeTime(activeMessage.date)}</span>
                  {messages && messages.length > 1 && (
                    <div className="msg-dots">
                      {messages.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={i === msgIdx ? 'msg-dot on' : 'msg-dot'}
                          aria-label={`Message ${i + 1} of ${messages.length}`}
                          onClick={() => setMsgIdx(i)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.certificate && (
              <div className="p-cert">
                <div className="p-cert-info">
                  <span className="p-cert-lab">Certificate</span>
                  <span className="p-cert-tier">{data.certificate.tierLabel}</span>
                </div>
                <button type="button" className="p-cert-dl" onClick={handleDownload} disabled={downloading}>
                  {downloading ? 'Downloading…' : 'Download'}
                </button>
              </div>
            )}

            {data.tierLine && (
              <p className="p-tier">
                Currently: <b>{romanTierLabel(data.tierLine)}</b>.
              </p>
            )}

            <footer className="p-foot">
              <p className="p-cadence">{data.cadenceText}</p>
            </footer>
          </>
        )}
      </main>
    </div>,
    document.body,
  );
}

export default ModernParentSummary;
