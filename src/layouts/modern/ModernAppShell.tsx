import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ModernNavDrawer } from '@/components/modern/ModernNavDrawer';
import { ModernNotificationBell } from '@/components/modern/ModernNotificationBell';
import { ModernGlobalSearchBar } from '@/components/modern/ModernGlobalSearchBar';
import { useAuthStore } from '@/features/auth/store/authStore';
import { GRAIN_TEXTURE_URI } from '@/theme/grainTexture';
import { isModernPortedPath } from '@/routes/modernPortedPaths';
import { cn } from '@/lib/utils';

/**
 * Modern UI shell for every role once selected-ui=modern — same pattern as
 * the Modern Dashboard: full-width content at every breakpoint, no
 * persistent sidebar; the nav (<ModernNavDrawer/>, same component the
 * Dashboard uses) only appears as an overlay when the hamburger button is
 * clicked, and already filters its items by role. <ModernGlobalSearchBar/>
 * is a dark-themed port of GlobalSearchBar (same useSearch/debounce/keyboard-nav
 * logic, SUPER_ADMIN only); <ModernNotificationBell/> is likewise a
 * dark-themed port of NotificationBell (same hooks/mutations/keyboard-nav,
 * every role). Content area stays a dark surface; pages not yet ported to
 * Modern styling render inside a light panel instead (see
 * isModernPortedPath) so their existing light-background text stays legible.
 */
export function ModernAppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const role = useAuthStore((s) => s.user?.role);
  const location = useLocation();
  const isPorted = isModernPortedPath(location.pathname);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#080E1C] font-modern text-[#EEF2F9]">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[.4] mix-blend-overlay"
        style={{ backgroundSize: '170px 170px', backgroundImage: `url("${GRAIN_TEXTURE_URI}")` }}
        aria-hidden
      />

      <ModernNavDrawer open={navOpen} onClose={() => setNavOpen(false)} />

      <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-[rgba(238,242,249,.1)] bg-[#0A1428]/80 px-4 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="rounded-lg p-1.5 text-[rgba(238,242,249,.7)] hover:bg-white/[.08]"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-garamond font-semibold text-[#F6F9FE]">KBV Education</span>
        </div>
        {role === 'SUPER_ADMIN' && (
          <div className="hidden flex-1 justify-center md:flex">
            <ModernGlobalSearchBar />
          </div>
        )}
        <div className="ml-auto flex items-center gap-4">
          <ModernNotificationBell />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
        {isPorted ? (
          <Outlet />
        ) : (
          // Not yet ported to Modern styling: Default's pages assume a light
          // page background (e.g. PageHeader's dark-gray title text), so
          // wrap them in a light panel instead of letting them render
          // directly on the dark shell, where that text would be unreadable.
          <div className={cn('min-h-full rounded-2xl bg-[#F2F6FA] p-4 text-[#232c3b] md:p-6')}>
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}

export default ModernAppShell;
