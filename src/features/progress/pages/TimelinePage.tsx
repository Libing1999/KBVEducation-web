import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { ActivityList } from '@/features/progress/components/ActivityList';
import { useActivity } from '@/features/progress/hooks/useProgress';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function TimelinePage() {
  const [page, setPage] = useState(0);
  const isParent = useAuthStore((s) => s.user?.role) === 'PARENT';
  const { data, isLoading, isError, refetch } = useActivity(page, 20);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Activity Timeline</h1>
        <p className="text-sm text-slate-500">{isParent ? 'Your child’s recent activity, newest first.' : 'Everything you’ve done, newest first.'}</p>
      </div>

      {isLoading ? (
        <LoadingState label="Loading activity…" />
      ) : isError || !data ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <Card>
          <CardHeader title="All activity" subtitle={`${data.totalElements} entries`} />
          <CardBody className="p-0">
            <ActivityList items={data.content} />
          </CardBody>
          {data.totalPages > 1 && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onPageChange={setPage}
            />
          )}
        </Card>
      )}
    </div>
  );
}
