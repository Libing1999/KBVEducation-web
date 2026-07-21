import { useEffect, type ReactNode } from 'react';
import { usePublicSettings } from '@/features/settings/hooks/useSettings';
import { applyTheme } from '@/features/settings/lib/theme';

/**
 * Applies admin-configured branding to the whole app at runtime. The brand
 * Tailwind tokens (primary/secondary/accent, full ramp) resolve to CSS custom
 * properties, so stamping the vars here re-themes every component that uses a
 * brand utility class — sidebar, header, cards, buttons, forms, tables, badges,
 * progress bars, hover/active/focus states, login, all dashboards — with no
 * per-component code and no page reload (the browser repaints on var change).
 *
 * `/settings/public` is fetched on load and re-fetched (invalidated) after each
 * settings save, so a color change applies immediately and also persists across
 * refresh, login/logout, and server restart (it's read back from the DB).
 * Charts keep their CVD-validated data-viz palettes by design.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data } = usePublicSettings();

  useEffect(() => {
    if (!data) return;
    applyTheme({
      primary: data.primaryColorHex,
      secondary: data.secondaryColorHex,
      accent: data.accentColorHex,
    });
  }, [data]);

  return <>{children}</>;
}
