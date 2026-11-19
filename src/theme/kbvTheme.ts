import { useEffect, useState } from 'react';

/**
 * Shared dark/light register for the Modern Student tab screens (Dashboard,
 * Log, Leaderboard) — one `localStorage` key so toggling the theme orb on any
 * one screen keeps the other two in sync, per the design system's NOTES.md
 * ("one shared kbv-theme register drives Dashboard/Log/Leaderboard together").
 */
export type KbvTheme = 'dark' | 'light';

const STORAGE_KEY = 'kbv-theme';

export function getKbvTheme(fallback: KbvTheme = 'dark'): KbvTheme {
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : fallback;
}

export function setKbvTheme(theme: KbvTheme): void {
  window.localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: theme }));
}

/** @param fallback only matters the first time a visitor arrives with no stored preference —
 * every screen except the Parent summary falls back to 'dark'. */
export function useKbvTheme(fallback: KbvTheme = 'dark'): [KbvTheme, (t: KbvTheme) => void] {
  const [theme, setThemeState] = useState<KbvTheme>(() => getKbvTheme(fallback));

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setThemeState(getKbvTheme(fallback));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [fallback]);

  const setTheme = (t: KbvTheme) => {
    setKbvTheme(t);
    setThemeState(t);
  };

  return [theme, setTheme];
}
