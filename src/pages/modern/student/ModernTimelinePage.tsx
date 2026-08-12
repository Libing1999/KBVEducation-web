import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/modern/ui/Card';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
import { Pagination } from '@/components/modern/ui/Pagination';
import { ModernActivityList } from '@/components/modern/student/ModernActivityList';
import { useActivity } from '@/features/progress/hooks/useProgress';
import { useAuthStore } from '@/features/auth/store/authStore';

/** Modern port of TimelinePage — same hooks/logic, dark styling. */
export default function ModernTimelinePage() {
  const [page, setPage] = useState(0);
  const isParent = useAuthStore((s) => s.user?.role) === 'PARENT';
  const { data, isLoading, isError, refetch } = useActivity(page, 20);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-garamond text-xl font-medium text-[#F6F9FE]">Activity Timeline</h1>
        <p className="text-sm text-[rgba(238,242,249,.55)]">{isParent ? 'Your child’s recent activity, newest first.' : 'Everything you’ve done, newest first.'}</p>
      </div>

      {isLoading ? (
        <LoadingState label="Loading activity…" />
      ) : isError || !data ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <Card>
          <CardHeader title="All activity" subtitle={`${data.totalElements} entries`} />
          <CardBody className="p-0">
            <ModernActivityList items={data.content} />
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
