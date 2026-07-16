import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Layers, Trash2 } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNotifications, useNotificationMutations } from '@/features/notifications/hooks/useNotifications';
import { notificationIcon, notificationLink, notificationTypeLabel } from '@/features/notifications/notificationMeta';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { NotificationResponse, NotificationType } from '@/features/notifications/types/notification.types';

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [grouped, setGrouped] = useState(false);
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const { data: page, isLoading, isError, refetch } = useNotifications(unreadOnly);
  const { markRead, markAllRead, deleteNotification } = useNotificationMutations();

  const items = useMemo(() => page?.content ?? [], [page]);
  const hasUnread = items.some((n) => !n.read);

  const groups = useMemo(() => {
    if (!grouped) return null;
    const byType = new Map<NotificationType, NotificationResponse[]>();
    for (const n of items) {
      const list = byType.get(n.type) ?? [];
      list.push(n);
      byType.set(n.type, list);
    }
    return Array.from(byType.entries());
  }, [grouped, items]);

  const onItemClick = (n: NotificationResponse) => {
    if (!n.read) markRead.mutate(n.id);
    const link = notificationLink(role, n);
    if (link) navigate(link);
  };

  const renderItem = (n: NotificationResponse) => {
    const Icon = notificationIcon(n.type);
    return (
      <li key={n.id} className="group relative">
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
          <span className="min-w-0 flex-1 pr-8">
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">{n.title}</span>
              {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
            </span>
            <span className="mt-0.5 block text-sm text-slate-600">{n.message}</span>
            <span className="mt-1 block text-xs text-slate-400">{formatRelativeTime(n.createdAt)}</span>
          </span>
        </button>
        <button
          type="button"
          aria-label="Delete notification"
          onClick={(e) => { e.stopPropagation(); deleteNotification.mutate(n.id); }}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-300 opacity-0 transition-opacity hover:bg-slate-100 hover:text-red-500 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </li>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500">Updates about your lessons, quizzes and homework.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={grouped ? 'secondary' : 'outline'} size="sm" onClick={() => setGrouped((g) => !g)}>
            <Layers className="h-4 w-4" /> {grouped ? 'Grouped' : 'Group by type'}
          </Button>
          {hasUnread && (
            <Button variant="secondary" size="sm" onClick={() => markAllRead.mutate()} isLoading={markAllRead.isPending}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          )}
        </div>
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
      ) : groups ? (
        <div className="space-y-5">
          {groups.map(([type, groupItems]) => (
            <Card key={type}>
              <div className="border-b border-slate-100 px-5 py-3">
                <h2 className="text-sm font-semibold text-slate-700">
                  {notificationTypeLabel(type)} <span className="font-normal text-slate-400">({groupItems.length})</span>
                </h2>
              </div>
              <CardBody className="p-0">
                <ul className="divide-y divide-slate-100">{groupItems.map(renderItem)}</ul>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">{items.map(renderItem)}</ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
