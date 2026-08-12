import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Inbox } from 'lucide-react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card, CardBody } from '@/components/modern/ui/Card';
import { Badge } from '@/components/modern/ui/Badge';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
import { Pagination } from '@/components/modern/ui/Pagination';
import { useReviewRequests } from '@/features/practice/hooks/useAdminPractice';
import { reviewStatusTone } from '@/features/practice/statusTone';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { paths } from '@/routes/paths';
import type { ReviewRequestStatus } from '@/features/practice/types/practice.types';

const TABS: { label: string; value: ReviewRequestStatus | '' }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'All', value: '' },
];

/** Modern port of ReviewRequestsPage — same hooks, dark styling. */
export default function ModernReviewRequestsPage() {
  const [status, setStatus] = useState<ReviewRequestStatus | ''>('PENDING');
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, refetch } = useReviewRequests(status || undefined, page, 20);

  const list = data?.content ?? [];

  return (
    <div className="space-y-5">
      <Link to={paths.admin.practice} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#DBB652] hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to practice review
      </Link>

      <PageHeader title="Review Requests" subtitle="Students who asked for a rejected session to be reviewed again." />

      <div className="inline-flex rounded-lg border border-[rgba(238,242,249,.15)] bg-white/[.03] p-1 text-sm">
        {TABS.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => { setStatus(t.value); setPage(0); }}
            className={cn(
              'rounded-md px-3 py-1.5 font-medium transition-colors',
              status === t.value ? 'bg-[#B0821C] text-[#231803]' : 'text-[rgba(238,242,249,.7)] hover:bg-white/[.06]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState label="Loading requests…" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[.06] text-[#DBB652]"><Inbox className="h-6 w-6" /></div>
            <p className="text-sm text-[rgba(238,242,249,.55)]">No review requests here.</p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-[rgba(238,242,249,.08)]">
              {list.map((r) => (
                <li key={r.id}>
                  <Link to={paths.admin.practiceDetail(r.practiceSessionId)} className="flex items-center gap-3 px-5 py-4 hover:bg-white/[.03]">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#EEF2F9]">{r.studentName} · {r.subject}</p>
                      {r.reason && <p className="truncate text-xs text-[rgba(238,242,249,.5)]">{r.reason}</p>}
                      <p className="mt-0.5 text-[11px] text-[rgba(238,242,249,.4)]">{r.cohortName ?? '—'} · {formatDateTime(r.createdAt)}</p>
                    </div>
                    <Badge tone={reviewStatusTone(r.status)}>{r.status}</Badge>
                    <ArrowRight className="h-4 w-4 text-[rgba(238,242,249,.3)]" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardBody>
          <Pagination page={data?.page ?? 0} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements ?? 0} onPageChange={setPage} />
        </Card>
      )}
    </div>
  );
}
