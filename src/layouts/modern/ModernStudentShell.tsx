import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { paths } from '@/routes/paths';
import { useKbvTheme, type KbvTheme } from '@/theme/kbvTheme';
import '@/pages/modern/student/kbvStudentShell.css';

interface Props {
  active: 'dashboard' | 'log' | 'leaderboard';
  children: React.ReactNode;
  /** Only the Parent summary screen (not built by this shell) falls back to light; every
   * Student tab screen falls back to dark when no theme preference is stored yet. */
  themeFallback?: KbvTheme;
}

/**
 * Replaces the old hamburger side-panel entirely for the Modern Student
 * experience: a permanently visible 3-tab bar (Dashboard/Log/Leaderboard),
 * per the customer's design. No menu button, no drawer — matches
 * Student UI/03-dashboard, 04-log, 05-leaderboard's shared header exactly.
 */
export function ModernStudentShell({ active, children, themeFallback = 'dark' }: Props) {
  const user = useAuthStore((s) => s.user);
  const [theme, setTheme] = useKbvTheme(themeFallback);
  const [acctOpen, setAcctOpen] = useState(false);
  const acctRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

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

  return (
    <div className="kbv-shell" data-theme={theme}>
      <div className="field" />
      <div className="grain" />

      <header className="bar">
        <div className="bmark">
          KBV
          <span className="rule" />
          <span className="sb">Education</span>
        </div>
        <nav className="topnav">
          <Link to={paths.dashboard} className={active === 'dashboard' ? 'on' : undefined}>
            Dashboard
          </Link>
          <Link to={paths.log} className={active === 'log' ? 'on' : undefined}>
            Log
          </Link>
          <Link to={paths.leaderboard} className={active === 'leaderboard' ? 'on' : undefined}>
            Leaderboard
          </Link>
        </nav>
        <div className="headright">
          <span className="who">{user?.firstName}</span>
          <div className="acct-wrap" ref={acctRef}>
            <button
              type="button"
              className="acct-btn"
              onClick={() => setAcctOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={acctOpen}
              aria-label="Account"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8.4" r="3.5" />
                <path d="M5 19.6c1.15-3.6 3.9-5.4 7-5.4s5.85 1.8 7 5.4" />
              </svg>
            </button>
            {acctOpen && (
              <div className="acct-pop" role="dialog" aria-label="Account">
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
                <button type="button" className="acct-logout" onClick={() => logout()}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {children}

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
    </div>
  );
}
