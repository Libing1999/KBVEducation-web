import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNotifications, useNotificationMutations } from '@/features/notifications/hooks/useNotifications';
import { notificationIcon, notificationLink } from '@/features/notifications/notificationMeta';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { NotificationResponse } from '@/features/notifications/types/notification.types';

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const { data: page, isLoading, isError, refetch } = useNotifications(unreadOnly);
  const { markRead, markAllRead } = useNotificationMutations();

  const items = page?.content ?? [];
  const hasUnread = items.some((n) => !n.read);

  const onItemClick = (n: NotificationResponse) => {
    if (!n.read) markRead.mutate(n.id);
    const link = notificationLink(role, n);
    if (link) navigate(link);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500">Updates about your lessons, quizzes and homework.</p>
        </div>
        {hasUnread && (
          <Button variant="secondary" size="sm" onClick={() => markAllRead.mutate()} isLoading={markAllRead.isPending}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm">
        <button
          type="button"
          onClick={() => setUnreadOnly(false)}
          className={cn('rounded-md px-3 py-1.5 font-medium transition-colors', !unreadOnly ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50')}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setUnreadOnly(true)}
          className={cn('rounded-md px-3 py-1.5 font-medium transition-colors', unreadOnly ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50')}
        >
          Unread
        </button>
      </div>

      {isLoading ? (
        <LoadingState label="Loading notifications…" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary">
              <Bell className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">
              {unreadOnly ? 'No unread notifications.' : 'You have no notifications yet.'}
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {items.map((n) => {
                const Icon = notificationIcon(n.type);
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => onItemClick(n)}
                      className={cn(
                        'flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50',
                        !n.read && 'bg-primary-50/50',
                      )}
                    >
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800">{n.title}</span>
                          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                        </span>
                        <span className="mt-0.5 block text-sm text-slate-600">{n.message}</span>
                        <span className="mt-1 block text-xs text-slate-400">{formatRelativeTime(n.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
