import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Inbox, Paperclip, CheckCheck, CheckSquare } from 'lucide-react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card } from '@/components/modern/ui/Card';
import { Button } from '@/components/modern/ui/Button';
import { Input } from '@/components/modern/ui/Input';
import { Select } from '@/components/modern/ui/Select';
import { Badge } from '@/components/modern/ui/Badge';
import { DataTable, type Column } from '@/components/modern/ui/Table';
import { Pagination } from '@/components/modern/ui/Pagination';
import { useAdminPractice, useAdminPracticeMutations } from '@/features/practice/hooks/useAdminPractice';
import { useCohorts } from '@/features/cohorts/hooks/useCohorts';
import { useTableControls } from '@/hooks/useTableControls';
import { practiceStatusTone } from '@/features/practice/statusTone';
import { STUDY_TYPE_LABELS, PRACTICE_STATUS_LABELS } from '@/features/practice/types/practice.types';
import { usePracticeReview, isGreenWaiting, type RatingSort } from '@/features/ai/hooks/usePracticeReview';
import { AiPracticeCell } from '@/features/ai/components/AiPracticeCell';
import { rowColourClasses, type RatingColour } from '@/features/ai/rating';
import type { Recommendation } from '@/features/ai/types/ai.types';
import { formatDate } from '@/lib/format';
import { paths } from '@/routes/paths';
import type { PracticeSession, PracticeStatus, StudyType } from '@/features/practice/types/practice.types';

const PAGE_SIZE = 25;

/** Modern port of AdminPracticePage — same hooks/columns, dark styling. */
export default function ModernAdminPracticePage() {
  const { page, setPage, search, setSearch, debouncedSearch } = useTableControls();
  const [cohortId, setCohortId] = useState('');
  const [status, setStatus] = useState<PracticeStatus | ''>('');
  const [studyType, setStudyType] = useState<StudyType | ''>('');
  const review = usePracticeReview();
  const { bulkApprove } = useAdminPracticeMutations();

  const { data: cohortPage } = useCohorts({ page: 0, size: 100 });
  const { data, isLoading } = useAdminPractice({
    cohortId: cohortId || undefined,
    status: status || undefined,
    studyType: studyType || undefined,
    search: debouncedSearch || undefined,
    ...review.query,
    page,
    size: PAGE_SIZE,
  });

  const list = data?.content ?? [];
  const greenOnPage = list.filter((s) => isGreenWaiting(s, review.ranges)).length;
  const resetPage = () => setPage(0);

  const columns: Column<PracticeSession>[] = [
    {
      key: 'select',
      header: <span className="sr-only">Select</span>,
      className: 'w-10',
      render: (s) => (
        <input
          type="checkbox"
          aria-label={`Select ${s.studentName}, ${s.subject}`}
          checked={review.selected.has(s.id)}
          disabled={s.status !== 'PENDING_REVIEW'}
          onChange={() => review.toggle(s.id)}
          className="h-4 w-4 rounded accent-[#DBB652] disabled:opacity-30"
        />
      ),
    },
    {
      key: 'student',
      header: 'Student',
      render: (s) => (
        <div>
          <Link to={paths.admin.practiceDetail(s.id)} className="font-medium text-[#DBB652] hover:underline">{s.studentName}</Link>
          <p className="text-xs text-[rgba(238,242,249,.5)]">{s.cohortName ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Session',
      render: (s) => (
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-[#EEF2F9]">
            {s.subject}{s.files.length > 0 && <Paperclip className="h-3.5 w-3.5 text-[rgba(238,242,249,.4)]" />}
          </p>
          <p className="text-xs text-[rgba(238,242,249,.5)]">{formatDate(s.studyDate)} · {s.durationMinutes} min · {STUDY_TYPE_LABELS[s.studyType]}</p>
        </div>
      ),
    },
    { key: 'ai', header: 'AI review', render: (s) => <AiPracticeCell session={s} ranges={review.ranges} /> },
    { key: 'status', header: 'Status', render: (s) => <Badge tone={practiceStatusTone(s.status)}>{PRACTICE_STATUS_LABELS[s.status]}</Badge> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) => (
        <Link to={paths.admin.practiceDetail(s.id)}>
          <Button variant="ghost" size="sm" title="Review"><Eye className="h-4 w-4" /></Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Practice Review"
        subtitle="Approve, reject and edit logged study sessions."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to={paths.admin.autoApproved}>
              <Button variant="outline"><CheckCheck className="h-4 w-4" /> Auto-approved</Button>
            </Link>
            <Link to={paths.admin.reviewRequests}>
              <Button variant="secondary"><Inbox className="h-4 w-4" /> Review requests</Button>
            </Link>
          </div>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-[rgba(238,242,249,.1)] p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(238,242,249,.35)]" />
            <Input className="pl-9" placeholder="Search subject or student…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select className="w-auto" value={cohortId} onChange={(e) => { setCohortId(e.target.value); resetPage(); }}>
            <option value="">All cohorts</option>
            {cohortPage?.content.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select className="w-auto" value={status} onChange={(e) => { setStatus(e.target.value as PracticeStatus | ''); resetPage(); }}>
            <option value="">All statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Select>
          <Select className="w-auto" value={studyType} onChange={(e) => { setStudyType(e.target.value as StudyType | ''); resetPage(); }}>
            <option value="">All types</option>
            <option value="PAST_PAPER">Past Paper (legacy)</option>
            <option value="WEAKNESS_PRACTICE">Weakness Practice (legacy)</option>
            <option value="GENERAL_PRACTICE">General Practice (legacy)</option>
            <option value="PAST_PAPER_TEST_DAY">Past Paper Test Day</option>
            <option value="PAST_PAPER_IMPROVEMENT_DAY">Past Paper Improvement Day</option>
            <option value="TOPIC_STUDY">Topic Study</option>
            <option value="STRUCTURE_STUDY">Structure Study</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-[rgba(238,242,249,.1)] p-4">
          <Select className="w-auto" value={review.colour} onChange={(e) => { review.setColour(e.target.value as RatingColour | ''); resetPage(); }}>
            <option value="">All ratings</option>
            <option value="green">Green ({review.ranges.greenMinRating} to 10)</option>
            <option value="amber">Amber ({review.ranges.amberMinRating} to {review.ranges.greenMinRating - 1})</option>
            <option value="red">Red (1 to {review.ranges.amberMinRating - 1})</option>
          </Select>
          <Select className="w-auto" value={review.recommendation} onChange={(e) => { review.setRecommendation(e.target.value as Recommendation | ''); resetPage(); }}>
            <option value="">All recommendations</option>
            <option value="approve">Approve</option>
            <option value="look">Look</option>
            <option value="reject_recommended">Reject recommended</option>
          </Select>
          <Select className="w-auto" value={review.flagged} onChange={(e) => { review.setFlagged(e.target.value as '' | 'yes' | 'no'); resetPage(); }}>
            <option value="">Flags: any</option>
            <option value="yes">With flags</option>
            <option value="no">No flags</option>
          </Select>
          <Select className="w-auto" value={review.sort} onChange={(e) => { review.setSort(e.target.value as RatingSort); resetPage(); }}>
            <option value="">Newest first</option>
            <option value="rating-asc">Lowest rating first</option>
            <option value="rating-desc">Highest rating first</option>
            <option value="flags-desc">Most flags first</option>
          </Select>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => review.selectAllGreen(list)} disabled={greenOnPage === 0}>
              <CheckSquare className="h-4 w-4" /> Select all green ({greenOnPage})
            </Button>
            <Button
              size="sm"
              disabled={review.selected.size === 0}
              isLoading={bulkApprove.isPending}
              onClick={() => bulkApprove.mutate([...review.selected], { onSuccess: review.clear })}
            >
              <CheckCheck className="h-4 w-4" /> Approve selected ({review.selected.size})
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={list}
          rowKey={(s) => s.id}
          isLoading={isLoading}
          emptyMessage="No practice sessions found."
          rowClassName={(s) => {
            const c = review.rowColour(s);
            return c ? rowColourClasses[c] : undefined;
          }}
        />
        <Pagination page={data?.page ?? 0} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements ?? 0} onPageChange={setPage} />
      </Card>
    </div>
  );
}
