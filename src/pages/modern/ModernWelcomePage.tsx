import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';

type WelcomeTheme = 'dark' | 'light';

const THEME_KEY = 'kbv-theme';

const GREET: Record<string, string> = {
  early: 'Up early,',
  morning: 'Good morning,',
  afternoon: 'Good afternoon,',
  evening: 'Good evening,',
  late: "It's late,",
};

function greetingFromClock(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 7) return 'early';
  if (h >= 7 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'late';
}

function getStoredTheme(): WelcomeTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
}

const GRAIN_DGRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";
const GRAIN_PAPER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012 0.14' numOctaves='3' stitchTiles='stitch'/%3E%3Crect width='100%25' height='100%25' filter='url(%23p)' opacity='0.045'/%3E%3C/svg%3E";

interface ModernWelcomePageProps {
  onContinue: () => void;
}

/**
 * Modern UI's post-login threshold screen — a brief, ambient greeting
 * (name + time-of-day line, no data/tasks) that auto-dismisses into the
 * Dashboard. Presentation-only: no queries, no writes. A tap/click/keypress
 * skips the hold immediately; reduced-motion skips the fade veil too.
 */
export function ModernWelcomePage({ onContinue }: ModernWelcomePageProps) {
  const [theme] = useState<WelcomeTheme>(getStoredTheme);
  const [arriving, setArriving] = useState(false);
  const user = useAuthStore((s) => s.user);
  const doneRef = useRef(false);
  const greetKey = useRef(greetingFromClock()).current;

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const HOLD = 2200;
    const FADE = 480;

    const exit = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      clearTimeout(timer);
      if (reduce) {
        onContinue();
        return;
      }
      setArriving(true);
      setTimeout(onContinue, FADE);
    };

    const timer = setTimeout(exit, HOLD);
    document.addEventListener('click', exit);
    document.addEventListener('touchstart', exit, { passive: true });
    document.addEventListener('keydown', exit);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', exit);
      document.removeEventListener('touchstart', exit);
      document.removeEventListener('keydown', exit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const name = user?.firstName ?? 'there';

  return (
    <div className={arriving ? 'kbv-welcome arriving' : 'kbv-welcome'} data-theme={theme}>
      <style>{`
        .kbv-welcome { position: fixed; inset: 0; height: 100vh; overflow: hidden; font-family: "General Sans", system-ui, sans-serif; -webkit-font-smoothing: antialiased; z-index: 50; }
        .kbv-welcome .stage { position: absolute; inset: 0; overflow: hidden;
          --tx: #EDF2FA; --tx-soft: rgba(237,242,250,.85); --tx-faint: rgba(237,242,250,.6);
          --gold: #DBB652; --name: #F6F9FE; }
        .kbv-welcome[data-theme="light"] .stage { --tx: #23324c; --tx-soft: rgba(35,50,76,.8); --tx-faint: rgba(35,50,76,.62); --gold: #A87E1E; --name: #1B3A6B; }
        .kbv-welcome .stage { background: radial-gradient(120% 120% at 50% -8%, #0d2144, #08182f 58%, #060f22 100%); }
        .kbv-welcome[data-theme="light"] .stage { background: linear-gradient(180deg, #fbfaf5 0%, #f3ede0 100%); }

        .kbv-welcome .atmo { position: absolute; inset: 0; z-index: 0; pointer-events: none; animation: kbvAtmoIn 1.1s ease both; }
        .kbv-welcome .lyr { display: none; }
        .kbv-welcome[data-theme="dark"] .sanctum, .kbv-welcome[data-theme="light"] .paper { display: block; position: absolute; }

        .kbv-welcome .sanctum.shaft { top: -12%; left: 50%; width: 30vw; height: 104vh; transform: translateX(-50%); background: linear-gradient(180deg, rgba(214,228,252,.2), rgba(214,228,252,.05) 48%, transparent 76%); filter: blur(46px); clip-path: polygon(38% 0, 62% 0, 82% 100%, 18% 100%); animation: kbvBreathe 12s ease-in-out infinite; }
        .kbv-welcome .sanctum.floor { left: 50%; bottom: 2vh; width: 64%; height: 26vh; transform: translateX(-50%); background: radial-gradient(58% 100% at 50% 100%, rgba(160,190,236,.24), transparent 72%); filter: blur(26px); }
        .kbv-welcome .sanctum.mote { left: 50%; top: 24%; width: 3px; height: 3px; border-radius: 50%; background: rgba(226,236,255,.8); box-shadow: -60px 40px 0 rgba(226,236,255,.5), 80px 120px 0 rgba(226,236,255,.4), -30px 200px 0 rgba(226,236,255,.35), 50px 260px 0 rgba(226,236,255,.3); filter: blur(.4px); animation: kbvFloat 16s ease-in-out infinite; }
        .kbv-welcome .sanctum.vig { inset: 0; background: radial-gradient(120% 104% at 50% 32%, transparent 40%, rgba(3,8,20,.9) 100%); }

        .kbv-welcome .paper.top { top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(168,126,30,.5), transparent); }
        .kbv-welcome .paper.grain { inset: 0; opacity: .5; mix-blend-mode: multiply; background-image: url("${GRAIN_PAPER}"); }
        .kbv-welcome .paper.glow { left: 50%; top: 22%; width: 46vw; height: 36vh; transform: translateX(-50%); background: radial-gradient(closest-side, rgba(168,126,30,.09), transparent 72%); filter: blur(30px); }

        .kbv-welcome .dgrain { position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: .05; mix-blend-mode: overlay; background-image: url("${GRAIN_DGRAIN}"); }
        .kbv-welcome[data-theme="light"] .dgrain { display: none; }

        .kbv-welcome .screen { position: absolute; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; padding: 48px 24px; }
        .kbv-welcome .wrap { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; max-width: min(680px, 90vw); animation: kbvRise .9s cubic-bezier(.2,.7,.2,1) both; }

        .kbv-welcome .mark { display: inline-flex; flex-direction: column; align-items: center; gap: 6px; line-height: 1; margin-bottom: 40px; opacity: .92; }
        .kbv-welcome .mark .mk { font-family: "EB Garamond", Georgia, serif; font-weight: 500; font-size: 18px; letter-spacing: .34em; color: var(--tx); padding-left: .34em; }
        .kbv-welcome .mark .ru { width: 100%; height: 1px; background: var(--gold); opacity: .85; }
        .kbv-welcome .mark .sb { font-size: 8px; letter-spacing: .32em; text-transform: uppercase; color: var(--tx-faint); padding-left: .32em; }

        .kbv-welcome .greet { font-size: clamp(15px, 1.6vw, 18px); color: var(--tx-soft); margin: 0 0 6px; font-weight: 400; white-space: nowrap; animation: kbvRise .8s cubic-bezier(.2,.7,.2,1) .14s both; }
        .kbv-welcome .name { font-family: "EB Garamond", Georgia, serif; font-weight: 500; color: var(--name); font-size: clamp(64px, 12vw, 128px); line-height: .98; margin: 0; letter-spacing: -.01em; animation: kbvRiseName 1s cubic-bezier(.2,.7,.2,1) .2s both; }
        .kbv-welcome .namerule { width: 52px; height: 2px; background: var(--gold); margin: 26px 0 0; opacity: .9; animation: kbvGrowrule 1.1s cubic-bezier(.2,.7,.2,1) .3s both; }
        .kbv-welcome .orient { font-size: clamp(15px, 1.7vw, 18px); color: var(--tx-soft); line-height: 1.6; margin: 26px 0 0; white-space: nowrap; animation: kbvRise .8s cubic-bezier(.2,.7,.2,1) .5s both; }

        .kbv-welcome .arrival { position: fixed; inset: 0; z-index: 40; background: #080E1C; opacity: 0; pointer-events: none; transition: opacity .45s ease; }
        .kbv-welcome[data-theme="light"] .arrival { background: #FAF7F0; }
        .kbv-welcome.arriving .arrival { opacity: 1; pointer-events: auto; }

        @keyframes kbvBreathe { 0%,100% { opacity: .82; } 50% { opacity: 1; } }
        @keyframes kbvFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes kbvRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes kbvRiseName { from { opacity: 0; transform: translateY(22px); letter-spacing: .04em; } to { opacity: 1; transform: translateY(0); letter-spacing: -.01em; } }
        @keyframes kbvGrowrule { from { width: 0; opacity: 0; } to { width: 52px; opacity: .9; } }
        @keyframes kbvAtmoIn { from { opacity: 0; } to { opacity: 1; } }

        @media (prefers-reduced-motion: reduce) {
          .kbv-welcome .atmo, .kbv-welcome .atmo * { animation: none !important; }
          .kbv-welcome .wrap, .kbv-welcome .greet, .kbv-welcome .name, .kbv-welcome .orient, .kbv-welcome .namerule {
            animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <div className="stage">
        <div className="atmo">
          <div className="lyr sanctum shaft" />
          <div className="lyr sanctum floor" />
          <div className="lyr sanctum mote" />
          <div className="lyr sanctum vig" />
          <div className="lyr paper top" />
          <div className="lyr paper grain" />
          <div className="lyr paper glow" />
        </div>
        <div className="dgrain" />

        <div className="screen">
          <div className="wrap">
            <div className="mark">
              <span className="mk">KBV</span>
              <span className="ru" />
              <span className="sb">Education</span>
            </div>
            <p className="greet">{GREET[greetKey]}</p>
            <h1 className="name">{name}</h1>
            <div className="namerule" />
            <p className="orient">Good to see you.</p>
          </div>
        </div>
      </div>

      <div className="arrival" />
    </div>
  );
}

export default ModernWelcomePage;
