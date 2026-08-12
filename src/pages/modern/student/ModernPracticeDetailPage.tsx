import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Clock, CalendarDays, MessageSquare, RotateCcw } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/modern/ui/Card';
import { Button } from '@/components/modern/ui/Button';
import { Badge } from '@/components/modern/ui/Badge';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
import { Modal } from '@/components/modern/ui/Modal';
import { usePractice, usePracticeMutations } from '@/features/practice/hooks/usePractice';
import { practiceApi } from '@/features/practice/api/practiceApi';
import { practiceStatusTone, reviewStatusTone } from '@/features/practice/statusTone';
import { STUDY_TYPE_LABELS, PRACTICE_STATUS_LABELS } from '@/features/practice/types/practice.types';
import { downloadFile } from '@/lib/download';
import { formatDate, formatDateTime, formatFileSize } from '@/lib/format';
import { paths } from '@/routes/paths';
import type { PracticeFile } from '@/features/practice/types/practice.types';

/** Modern port of PracticeDetailPage — same hooks/logic, dark styling. */
export default function ModernPracticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: s, isLoading, isError, refetch } = usePractice(id);
  const { requestReview } = usePracticeMutations();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (isLoading) return <LoadingState label="Loading session…" />;
  if (isError || !s) return <ErrorState onRetry={() => refetch()} />;

  const doDownload = (f: PracticeFile) => downloadFile(practiceApi.fileDownloadUrl(f.id), f.fileName);
  const hasPendingRequest = s.reviewRequests.some((r) => r.status === 'PENDING');

  return (
    <div className="space-y-5">
      <Link to={paths.practice} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#DBB652] hover:text-[#e8c876]">
        <ArrowLeft className="h-4 w-4" /> Back to practice log
      </Link>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-garamond text-xl font-medium text-[#F6F9FE]">{s.subject}</h1>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[rgba(238,242,249,.55)]">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDate(s.studyDate)}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {s.durationMinutes} min</span>
                <span>{STUDY_TYPE_LABELS[s.studyType]}{s.year ? ` · ${s.year}` : ''}</span>
              </div>
            </div>
            <Badge tone={practiceStatusTone(s.status)}>{PRACTICE_STATUS_LABELS[s.status]}</Badge>
          </div>

          {s.notes && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.4)]">Notes</p>
              <p className="mt-1 whitespace-pre-line text-sm text-[rgba(238,242,249,.8)]">{s.notes}</p>
            </div>
          )}

          {s.transcript && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.4)]">Transcript</p>
              <p className="mt-1 whitespace-pre-line text-sm text-[rgba(238,242,249,.8)]">{s.transcript}</p>
            </div>
          )}

          {s.adminComment && (
            <div className="rounded-lg bg-white/[.04] px-4 py-3">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">
                <MessageSquare className="h-3.5 w-3.5" /> Reviewer comment
              </p>
              <p className="mt-1 text-sm text-[rgba(238,242,249,.8)]">{s.adminComment}</p>
              {s.reviewedByName && (
                <p className="mt-1 text-xs text-[rgba(238,242,249,.4)]">— {s.reviewedByName}{s.reviewedAt ? `, ${formatDateTime(s.reviewedAt)}` : ''}</p>
              )}
            </div>
          )}

          {s.status === 'REJECTED' && (
            <div>
              <Button
                variant="secondary"
                size="sm"
                disabled={hasPendingRequest}
                onClick={() => setReviewOpen(true)}
              >
                <RotateCcw className="h-4 w-4" /> {hasPendingRequest ? 'Re-review pending' : 'Request another review'}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {s.files.length > 0 && (
        <Card>
          <CardHeader title="Attachments" />
          <CardBody className="p-0">
            <ul className="divide-y divide-[rgba(238,242,249,.08)]">
              {s.files.map((f) => (
                <li key={f.id} className="flex items-center gap-3 px-5 py-3">
                  <FileText className="h-4 w-4 shrink-0 text-[#DBB652]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#EEF2F9]">{f.fileName}</p>
                    <p className="text-xs text-[rgba(238,242,249,.5)]">{formatFileSize(f.fileSize)}</p>
                  </div>
                  <Button variant="ghost" size="sm" title="Download" onClick={() => doDownload(f)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {s.reviewRequests.length > 0 && (
        <Card>
          <CardHeader title="Review requests" subtitle="Your re-review history" />
          <CardBody className="space-y-3">
            {s.reviewRequests.map((r) => (
              <div key={r.id} className="rounded-lg border border-[rgba(238,242,249,.1)] px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[rgba(238,242,249,.4)]">{formatDateTime(r.createdAt)}</span>
                  <Badge tone={reviewStatusTone(r.status)}>{r.status}</Badge>
                </div>
                {r.reason && <p className="mt-1 text-sm text-[rgba(238,242,249,.8)]">{r.reason}</p>}
                {r.adminNotes && <p className="mt-1 text-xs text-[rgba(238,242,249,.5)]">Reviewer: {r.adminNotes}</p>}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Request another review"
        footer={
          <>
            <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={requestReview.isPending}>Cancel</Button>
            <Button
              onClick={() => requestReview.mutate({ id: s.id, reason }, { onSuccess: () => { setReviewOpen(false); setReason(''); } })}
              isLoading={requestReview.isPending}
            >
              Send request
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <p className="text-sm text-[rgba(238,242,249,.7)]">Tell the reviewer what changed or why it should be reconsidered.</p>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional message…"
            className="w-full rounded-lg border border-[rgba(238,242,249,.15)] bg-[#0A1424] px-3 py-2 text-sm text-[#EEF2F9] placeholder:text-[rgba(238,242,249,.35)] focus:border-[#B0821C] focus:outline-none focus:ring-2 focus:ring-[#B0821C]/30"
          />
        </div>
      </Modal>
    </div>
  );
}
