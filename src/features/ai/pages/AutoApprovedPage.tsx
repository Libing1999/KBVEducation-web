import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Undo2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/ui/Table';
import { useAdminPracticeMutations, useAutoApprovedPractice } from '@/features/practice/hooks/useAdminPractice';
import { usePracticeReview } from '@/features/ai/hooks/usePracticeReview';
import { AiPracticeCell } from '@/features/ai/components/AiPracticeCell';
import { STUDY_TYPE_LABELS, type PracticeSession } from '@/features/practice/types/practice.types';
import { formatDate, formatDateTime } from '@/lib/format';
import { paths } from '@/routes/paths';

/** Sessions the AI auto-approved (memo 12.10.2026, 4.3). Each can be undone. */
export default function AutoApprovedPage() {
  const { data = [], isLoading } = useAutoApprovedPractice();
  const { undoAutoApprove } = useAdminPracticeMutations();
  const { ranges } = usePracticeReview();

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
      key: 'session',
      header: 'Session',
      render: (s) => (
        <div>
          <p className="text-sm font-medium text-slate-800">{s.subject}</p>
          <p className="text-xs text-slate-500">{formatDate(s.studyDate)} · {STUDY_TYPE_LABELS[s.studyType]}</p>
        </div>
      ),
    },
    { key: 'ai', header: 'AI review', render: (s) => <AiPracticeCell session={s} ranges={ranges} /> },
    {
      key: 'when',
      header: 'Auto-approved',
      render: (s) => <span className="text-sm text-slate-600">{s.ai?.autoApprovedAt ? formatDateTime(s.ai.autoApprovedAt) : '—'}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) => (
        <div className="flex justify-end gap-1">
          <Link to={paths.admin.practiceDetail(s.id)}>
            <Button variant="ghost" size="sm" title="Open the review card"><Eye className="h-4 w-4" /></Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => undoAutoApprove.mutate(s.id)}
            isLoading={undoAutoApprove.isPending && undoAutoApprove.variables === s.id}
            title="Undo: the session goes back to waiting for you"
          >
            <Undo2 className="h-4 w-4" /> Undo
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <Link to={paths.admin.practice} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> Back to practice review
      </Link>
      <PageHeader
        title="Auto-approved sessions"
        subtitle="Sessions the AI approved because they met your auto-approve rating. Spot checks also appear in your review queue."
      />
      <Card>
        <DataTable
          columns={columns}
          data={data}
          rowKey={(s) => s.id}
          isLoading={isLoading}
          emptyMessage="Nothing has been auto-approved. Auto-approve is off unless you switch it on in AI settings."
        />
      </Card>
    </div>
  );
}
