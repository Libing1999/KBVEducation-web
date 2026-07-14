import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Inbox, Paperclip } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { useAdminPractice } from '@/features/practice/hooks/useAdminPractice';
import { useCohorts } from '@/features/cohorts/hooks/useCohorts';
import { useTableControls } from '@/hooks/useTableControls';
import { practiceStatusTone } from '@/features/practice/statusTone';
import { STUDY_TYPE_LABELS, PRACTICE_STATUS_LABELS } from '@/features/practice/types/practice.types';
import { formatDate } from '@/lib/format';
import { paths } from '@/routes/paths';
import type { PracticeSession, PracticeStatus, StudyType } from '@/features/practice/types/practice.types';

const PAGE_SIZE = 10;

export default function AdminPracticePage() {
  const { page, setPage, search, setSearch, debouncedSearch } = useTableControls();
  const [cohortId, setCohortId] = useState('');
  const [status, setStatus] = useState<PracticeStatus | ''>('');
  const [studyType, setStudyType] = useState<StudyType | ''>('');

  const { data: cohortPage } = useCohorts({ page: 0, size: 100 });
  const { data, isLoading } = useAdminPractice({
    cohortId: cohortId || undefined,
    status: status || undefined,
    studyType: studyType || undefined,
    search: debouncedSearch || undefined,
    page,
    size: PAGE_SIZE,
  });

  const list = data?.content ?? [];

  const columns: Column<PracticeSession>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (s) => (
        <div>
          <Link to={paths.admin.practiceDetail(s.id)} className="font-medium text-primary hover:text-primary-600">{s.studentName}</Link>
          <p className="text-xs text-slate-500">{s.cohortName ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Session',
      render: (s) => (
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
            {s.subject}{s.files.length > 0 && <Paperclip className="h-3.5 w-3.5 text-slate-400" />}
          </p>
          <p className="text-xs text-slate-500">{formatDate(s.studyDate)} · {s.durationMinutes} min · {STUDY_TYPE_LABELS[s.studyType]}</p>
        </div>
      ),
    },
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
          <Link to={paths.admin.reviewRequests}>
            <Button variant="secondary"><Inbox className="h-4 w-4" /> Review requests</Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search subject or student…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select className="w-auto" value={cohortId} onChange={(e) => { setCohortId(e.target.value); setPage(0); }}>
            <option value="">All cohorts</option>
            {cohortPage?.content.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select className="w-auto" value={status} onChange={(e) => { setStatus(e.target.value as PracticeStatus | ''); setPage(0); }}>
            <option value="">All statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Select>
          <Select className="w-auto" value={studyType} onChange={(e) => { setStudyType(e.target.value as StudyType | ''); setPage(0); }}>
            <option value="">All types</option>
            <option value="PAST_PAPER">Past Paper</option>
            <option value="WEAKNESS_PRACTICE">Weakness Practice</option>
            <option value="GENERAL_PRACTICE">General Practice</option>
          </Select>
        </div>

        <DataTable columns={columns} data={list} rowKey={(s) => s.id} isLoading={isLoading} emptyMessage="No practice sessions found." />
        <Pagination page={data?.page ?? 0} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements ?? 0} onPageChange={setPage} />
      </Card>
    </div>
  );
}
