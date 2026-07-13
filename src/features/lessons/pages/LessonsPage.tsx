import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Pencil, Copy, Trash2, Search, Send, Undo2, Eye, ArrowUp, ArrowDown,
  FileText, HelpCircle, ClipboardList,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { LessonFormModal } from '@/features/lessons/components/LessonFormModal';
import { useLessons, useLessonMutations } from '@/features/lessons/hooks/useLessons';
import { useCohorts } from '@/features/cohorts/hooks/useCohorts';
import type { LessonResponse, LessonsQuery, LessonStatus } from '@/features/lessons/types/lesson.types';
import { useTableControls } from '@/hooks/useTableControls';
import { formatDate } from '@/lib/format';
import { paths } from '@/routes/paths';

const PAGE_SIZE = 10;

export default function LessonsPage() {
  const { page, setPage, search, setSearch, debouncedSearch } = useTableControls();
  const [cohortId, setCohortId] = useState('');
  const [status, setStatus] = useState<LessonStatus | ''>('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LessonResponse | null>(null);
  const [toDelete, setToDelete] = useState<LessonResponse | null>(null);

  const { data: cohortPage } = useCohorts({ page: 0, size: 100 });
  const query: LessonsQuery = {
    cohortId: cohortId || undefined,
    status: status || undefined,
    search: debouncedSearch || undefined,
    page,
    size: PAGE_SIZE,
  };
  const { data, isLoading } = useLessons(query);
  const { remove, publish, unpublish, duplicate, reorder } = useLessonMutations();

  const list = data?.content ?? [];
  const canReorder = !!cohortId && !debouncedSearch && !status;

  const move = (index: number, dir: 'up' | 'down') => {
    const n = dir === 'up' ? index - 1 : index + 1;
    if (n < 0 || n >= list.length) return;
    const a = list[index];
    const b = list[n];
    reorder.mutate([
      { id: a.id, displayOrder: b.displayOrder },
      { id: b.id, displayOrder: a.displayOrder },
    ]);
  };

  const columns: Column<LessonResponse>[] = [
    { key: 'num', header: '#', className: 'w-12', render: (l) => <span className="font-medium text-slate-700">{l.lessonNumber}</span> },
    {
      key: 'title',
      header: 'Lesson',
      render: (l) => (
        <div>
          <Link to={paths.admin.lessonDetail(l.id)} className="font-medium text-primary hover:text-primary-600">
            {l.title}
          </Link>
          <p className="text-xs text-slate-500">{l.cohortName} · {formatDate(l.lessonDate)}</p>
        </div>
      ),
    },
    {
      key: 'content',
      header: 'Content',
      render: (l) => (
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1" title="Files"><FileText className="h-3.5 w-3.5" />{l.fileCount}</span>
          <span className={l.hasQuiz ? 'inline-flex items-center gap-1 text-primary' : 'inline-flex items-center gap-1'} title="Quiz">
            <HelpCircle className="h-3.5 w-3.5" />{l.hasQuiz ? 'Yes' : '—'}
          </span>
          <span className={l.hasHomework ? 'inline-flex items-center gap-1 text-primary' : 'inline-flex items-center gap-1'} title="Homework">
            <ClipboardList className="h-3.5 w-3.5" />{l.hasHomework ? 'Yes' : '—'}
          </span>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (l) => <Badge tone={l.status === 'PUBLISHED' ? 'success' : 'neutral'}>{l.status}</Badge> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (l) => {
        const idx = list.indexOf(l);
        return (
          <div className="flex justify-end gap-1">
            {canReorder && (
              <>
                <Button variant="ghost" size="sm" title="Move up" disabled={idx === 0} onClick={() => move(idx, 'up')}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Move down" disabled={idx === list.length - 1} onClick={() => move(idx, 'down')}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </>
            )}
            <Link to={paths.admin.lessonDetail(l.id)}>
              <Button variant="ghost" size="sm" title="Details"><Eye className="h-4 w-4" /></Button>
            </Link>
            <Button variant="ghost" size="sm" title="Edit" onClick={() => { setEditing(l); setFormOpen(true); }}>
              <Pencil className="h-4 w-4" />
            </Button>
            {l.status === 'PUBLISHED' ? (
              <Button variant="ghost" size="sm" title="Unpublish" onClick={() => unpublish.mutate(l.id)}>
                <Undo2 className="h-4 w-4 text-accent" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" title="Publish" onClick={() => publish.mutate(l.id)}>
                <Send className="h-4 w-4 text-green-600" />
              </Button>
            )}
            <Button variant="ghost" size="sm" title="Duplicate" onClick={() => duplicate.mutate(l.id)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Delete" onClick={() => setToDelete(l)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lessons"
        subtitle="Create and manage lesson content."
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Create lesson
          </Button>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search lessons…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select className="w-auto" value={cohortId} onChange={(e) => { setCohortId(e.target.value); setPage(0); }}>
            <option value="">All cohorts</option>
            {cohortPage?.content.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select className="w-auto" value={status} onChange={(e) => { setStatus(e.target.value as LessonStatus | ''); setPage(0); }}>
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </Select>
        </div>

        <DataTable columns={columns} data={list} rowKey={(l) => l.id} isLoading={isLoading} emptyMessage="No lessons found." />
        <Pagination page={data?.page ?? 0} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements ?? 0} onPageChange={setPage} />
      </Card>

      {canReorder && (
        <p className="text-xs text-slate-400">Tip: use the arrows to reorder lessons within this cohort.</p>
      )}

      <LessonFormModal open={formOpen} onClose={() => setFormOpen(false)} lesson={editing} defaultCohortId={cohortId || undefined} />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete lesson"
        message={`Delete "${toDelete?.title}"? This can’t be undone.`}
        confirmLabel="Delete"
        danger
        isLoading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
