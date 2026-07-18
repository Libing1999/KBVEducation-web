import { Menu } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { GlobalSearchBar } from '@/features/search/components/GlobalSearchBar';

/** Slim top header: mobile menu + brand, global search (admin), notifications.
 * The user profile/logout lives in the sidebar's pinned bottom card. */
export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-bold text-primary">KBV Education</span>
      </div>
      {user?.role === 'SUPER_ADMIN' && (
        <div className="hidden flex-1 justify-center md:flex">
          <GlobalSearchBar />
        </div>
      )}
      <div className="ml-auto flex items-center gap-4">
        <NotificationBell />
      </div>
    </header>
  );
}
