import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Layers, Trash2 } from 'lucide-react';
import { Card, CardBody } from '@/components/modern/ui/Card';
import { Button } from '@/components/modern/ui/Button';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNotifications, useNotificationMutations } from '@/features/notifications/hooks/useNotifications';
import { notificationIcon, notificationLink, notificationTypeLabel } from '@/features/notifications/notificationMeta';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { NotificationResponse, NotificationType } from '@/features/notifications/types/notification.types';

/** Modern port of NotificationsPage — same hooks/mutations/grouping logic, dark styling. */
export default function ModernNotificationsPage() {
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
            'flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[.04]',
            !n.read && 'bg-[#B0821C]/[.06]',
          )}
        >
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[.06] text-[#DBB652]">
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1 pr-8">
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#EEF2F9]">{n.title}</span>
              {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#DBB652]" />}
            </span>
            <span className="mt-0.5 block text-sm text-[rgba(238,242,249,.7)]">{n.message}</span>
            <span className="mt-1 block text-xs text-[rgba(238,242,249,.4)]">{formatRelativeTime(n.createdAt)}</span>
          </span>
        </button>
        <button
          type="button"
          aria-label="Delete notification"
          onClick={(e) => { e.stopPropagation(); deleteNotification.mutate(n.id); }}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[rgba(238,242,249,.3)] opacity-0 transition-opacity hover:bg-white/[.08] hover:text-[#e08a8a] group-hover:opacity-100"
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
          <h1 className="font-garamond text-xl font-medium text-[#F6F9FE]">Notifications</h1>
          <p className="text-sm text-[rgba(238,242,249,.55)]">Updates about your lessons, Post-Lesson Quizzes and Post-Lesson Homework.</p>
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

      <div className="inline-flex rounded-lg border border-[rgba(238,242,249,.15)] bg-white/[.03] p-1 text-sm">
        <button
          type="button"
          onClick={() => setUnreadOnly(false)}
          className={cn(
            'rounded-md px-3 py-1.5 font-medium transition-colors',
            !unreadOnly ? 'bg-[#B0821C] text-[#231803]' : 'text-[rgba(238,242,249,.7)] hover:bg-white/[.06]',
          )}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setUnreadOnly(true)}
          className={cn(
            'rounded-md px-3 py-1.5 font-medium transition-colors',
            unreadOnly ? 'bg-[#B0821C] text-[#231803]' : 'text-[rgba(238,242,249,.7)] hover:bg-white/[.06]',
          )}
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[.06] text-[#DBB652]">
              <Bell className="h-6 w-6" />
            </div>
            <p className="text-sm text-[rgba(238,242,249,.55)]">
              {unreadOnly ? 'No unread notifications.' : 'You have no notifications yet.'}
            </p>
          </CardBody>
        </Card>
      ) : groups ? (
        <div className="space-y-5">
          {groups.map(([type, groupItems]) => (
            <Card key={type}>
              <div className="border-b border-[rgba(238,242,249,.1)] px-5 py-3">
                <h2 className="text-sm font-semibold text-[rgba(238,242,249,.8)]">
                  {notificationTypeLabel(type)} <span className="font-normal text-[rgba(238,242,249,.4)]">({groupItems.length})</span>
                </h2>
              </div>
              <CardBody className="p-0">
                <ul className="divide-y divide-[rgba(238,242,249,.08)]">{groupItems.map(renderItem)}</ul>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-[rgba(238,242,249,.08)]">{items.map(renderItem)}</ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
