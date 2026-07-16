import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  useNotifications,
  useUnreadCount,
  useNotificationMutations,
} from '@/features/notifications/hooks/useNotifications';
import { notificationIcon, notificationLink } from '@/features/notifications/notificationMeta';
import { formatRelativeTime } from '@/lib/format';
import { paths } from '@/routes/paths';
import { cn } from '@/lib/utils';
import type { NotificationResponse } from '@/features/notifications/types/notification.types';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const { data: unread = 0 } = useUnreadCount();
  const { data: page, isLoading } = useNotifications(false);
  const { markRead, markAllRead, deleteNotification } = useNotificationMutations();
  const menuRef = useRef<HTMLDivElement>(null);

  const items = (page?.content ?? []).slice(0, 6);

  const onItemClick = (n: NotificationResponse) => {
    if (!n.read) markRead.mutate(n.id);
    const link = notificationLink(role, n);
    setOpen(false);
    if (link) navigate(link);
  };

  // Keyboard nav for the dropdown: Escape closes, Up/Down cycles focus among menu items.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const nodes = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
      if (nodes.length === 0) return;
      e.preventDefault();
      const currentIndex = nodes.indexOf(document.activeElement as HTMLElement);
      const nextIndex = e.key === 'ArrowDown'
        ? (currentIndex + 1) % nodes.length
        : (currentIndex - 1 + nodes.length) % nodes.length;
      nodes[nextIndex].focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            ref={menuRef}
            role="menu"
            aria-label="Notifications"
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-card border border-slate-200 bg-white shadow-xl sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">Notifications</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead.mutate()}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-600"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : items.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">You're all caught up.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {items.map((n) => {
                    const Icon = notificationIcon(n.type);
                    return (
                      <li key={n.id} className="group relative">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => onItemClick(n)}
                          className={cn(
                            'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none',
                            !n.read && 'bg-primary-50/50',
                          )}
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 pr-6">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium text-slate-800">{n.title}</span>
                              {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                            </span>
                            <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500">{n.message}</span>
                            <span className="mt-1 block text-[11px] text-slate-400">{formatRelativeTime(n.createdAt)}</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label="Delete notification"
                          onClick={(e) => { e.stopPropagation(); deleteNotification.mutate(n.id); }}
                          className="absolute right-3 top-3 rounded-lg p-1 text-slate-300 opacity-0 transition-opacity hover:bg-slate-100 hover:text-red-500 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={() => { setOpen(false); navigate(paths.notifications); }}
              className="block w-full border-t border-slate-100 py-2.5 text-center text-sm font-medium text-primary hover:bg-slate-50"
            >
              View all
            </button>
          </div>
        </>
      )}
    </div>
  );
}
