import { useEffect, useState } from 'react';

/**
 * Selects which UI variant renders the app's screens. Purely a presentation
 * switch — it never affects routing, auth, or business logic, only which
 * component tree a route resolves to (see LoginRoute, AuthenticatedShell).
 */
export type UiVariant = 'default' | 'modern';

const STORAGE_KEY = 'selected-ui';

export function getSelectedUI(): UiVariant {
  if (typeof window === 'undefined') return 'default';
  return window.localStorage.getItem(STORAGE_KEY) === 'modern' ? 'modern' : 'default';
}

export function setSelectedUI(ui: UiVariant): void {
  window.localStorage.setItem(STORAGE_KEY, ui);
}

/** Reactive read of the selected UI variant; picks up cross-tab changes. */
export function useSelectedUI(): UiVariant {
  const [ui, setUi] = useState<UiVariant>(getSelectedUI);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setUi(getSelectedUI());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return ui;
}
