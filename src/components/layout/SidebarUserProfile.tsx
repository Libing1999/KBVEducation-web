import { LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { initials, roleLabel } from '@/lib/format';

/**
 * Pinned user card at the very bottom of the sidebar — replaces both the old
 * topbar profile block and the static sidebar footer. Self-contained on
 * purpose: future account options (My Profile, Change Password, Preferences,
 * Theme) can become a popover opened from this card without the sidebar
 * itself changing.
 */
export function SidebarUserProfile({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const handleLogout = () => {
    // Close the mobile drawer first so it doesn't linger over the login page.
    onNavigate?.();
    void logout();
  };

  return (
    <div className="border-t border-white/10 p-3">
      <div className="rounded-xl bg-black/20 p-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
              {initials(user.firstName, user.lastName)}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--color-primary)] bg-green-400"
              aria-hidden
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-primary-200">{roleLabel(user.role)}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
          <span className="flex items-center gap-1.5 text-xs text-primary-200">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" aria-hidden />
            Online
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary-100 transition-colors hover:bg-white/10 hover:text-accent-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
