/**
 * Transient, tab-scoped flag: "the Modern UI just completed a login and
 * should show the Welcome screen before the Dashboard." Set by
 * ModernLoginPage on successful login, consumed once by AuthenticatedShell.
 * Session-scoped (not localStorage) so it never survives across browser
 * sessions or leaks into a Default UI login.
 */
const FLAG_KEY = 'kbv.modern.welcomePending';

export function setWelcomePending(): void {
  window.sessionStorage.setItem(FLAG_KEY, '1');
}

export function peekWelcomePending(): boolean {
  return window.sessionStorage.getItem(FLAG_KEY) === '1';
}

export function clearWelcomePending(): void {
  window.sessionStorage.removeItem(FLAG_KEY);
}
