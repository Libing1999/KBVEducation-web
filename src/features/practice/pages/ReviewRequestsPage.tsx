import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Inbox } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
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

export default function ReviewRequestsPage() {
  const [status, setStatus] = useState<ReviewRequestStatus | ''>('PENDING');
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, refetch } = useReviewRequests(status || undefined, page, 20);

  const list = data?.content ?? [];

  return (
    <div className="space-y-5">
      <Link to={paths.admin.practice} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> Back to practice review
      </Link>

      <PageHeader title="Review Requests" subtitle="Students who asked for a rejected session to be reviewed again." />

      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm">
        {TABS.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => { setStatus(t.value); setPage(0); }}
            className={cn('rounded-md px-3 py-1.5 font-medium transition-colors', status === t.value ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50')}
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary"><Inbox className="h-6 w-6" /></div>
            <p className="text-sm text-slate-500">No review requests here.</p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {list.map((r) => (
                <li key={r.id}>
                  <Link to={paths.admin.practiceDetail(r.practiceSessionId)} className="flex items-center gap-3 px-5 py-4 hover:bg-secondary/60">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">{r.studentName} · {r.subject}</p>
                      {r.reason && <p className="truncate text-xs text-slate-500">{r.reason}</p>}
                      <p className="mt-0.5 text-[11px] text-slate-400">{r.cohortName ?? '—'} · {formatDateTime(r.createdAt)}</p>
                    </div>
                    <Badge tone={reviewStatusTone(r.status)}>{r.status}</Badge>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
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
