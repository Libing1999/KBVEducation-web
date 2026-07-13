import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Administrator',
  STUDENT: 'Student',
  PARENT: 'Parent',
};

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : '';

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
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
      <div className="ml-auto flex items-center gap-4">
        <NotificationBell />
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary">
            {initials}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-800">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500">{user ? roleLabels[user.role] : ''}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} aria-label="Log out">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
