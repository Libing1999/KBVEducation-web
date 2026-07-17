import { useEffect, type ReactNode } from 'react';
import { usePublicSettings } from '@/features/settings/hooks/useSettings';

/**
 * Applies admin-configured branding as CSS custom properties on the document
 * root. Scope is deliberately bounded (decision #7 in the implementation
 * plan): only Sidebar/Topbar/the primary Button variant consume these
 * variables — the other ~95% of the app keeps its static Tailwind
 * `bg-primary`/`text-accent` tokens untouched, which is why the seeded
 * settings defaults match tailwind.config.js's static values exactly (no
 * flash-of-wrong-color before the first fetch resolves). Logo + app name
 * apply immediately wherever they're already shown.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data } = usePublicSettings();

  useEffect(() => {
    if (!data) return;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', data.primaryColorHex);
    root.style.setProperty('--color-secondary', data.secondaryColorHex);
    root.style.setProperty('--color-accent', data.accentColorHex);
  }, [data]);

  return <>{children}</>;
}
