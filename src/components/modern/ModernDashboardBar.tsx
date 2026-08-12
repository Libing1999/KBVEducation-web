import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ModernNavDrawer } from '@/components/modern/ModernNavDrawer';

/** Top bar shared by every Modern Dashboard variant — brand mark, nav-drawer trigger, user name. */
export function ModernDashboardBar() {
  const [navOpen, setNavOpen] = useState(false);
  const firstName = useAuthStore((s) => s.user?.firstName);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-[rgba(238,242,249,.08)] bg-[#080E1C]/70 px-[clamp(24px,5vw,70px)] py-[clamp(16px,3vw,28px)] backdrop-blur-md">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          aria-label="Open navigation"
          className="flex items-center gap-3 text-[#EEF2F9]"
        >
          <Menu className="h-4 w-4 opacity-70" />
          <span className="font-garamond text-[17px] font-semibold leading-none tracking-[0.26em]">KBV</span>
        </button>
        <span className="text-xs tracking-[0.02em] text-[rgba(238,242,249,.6)]">{firstName}</span>
      </header>
      <ModernNavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
