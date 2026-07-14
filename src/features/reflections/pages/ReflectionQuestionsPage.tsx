import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ArrowLeft, GripVertical } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useReflectionQuestions, useReflectionQuestionMutations } from '@/features/reflections/hooks/useReflectionQuestions';
import { paths } from '@/routes/paths';
import type { ReflectionQuestion } from '@/features/reflections/types/reflection.types';

export default function ReflectionQuestionsPage() {
  const { data: questions, isLoading, isError, refetch } = useReflectionQuestions();
  const { create, update, setEnabled, reorder, remove } = useReflectionQuestionMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ReflectionQuestion | null>(null);
  const [text, setText] = useState('');
  const [toDelete, setToDelete] = useState<ReflectionQuestion | null>(null);

  const list = questions ?? [];

  const openCreate = () => { setEditing(null); setText(''); setFormOpen(true); };
  const openEdit = (q: ReflectionQuestion) => { setEditing(q); setText(q.questionText); setFormOpen(true); };

  const save = () => {
    if (!text.trim()) return;
    const done = () => setFormOpen(false);
    if (editing) update.mutate({ id: editing.id, questionText: text.trim() }, { onSuccess: done });
    else create.mutate(text.trim(), { onSuccess: done });
  };

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

  return (
    <div className="space-y-5">
      <Link to={paths.admin.reflections} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> Back to reflections
      </Link>

      <PageHeader
        title="Reflection Questions"
        subtitle="Configure the daily questions students answer. Disabled questions are hidden from students."
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add question</Button>}
      />

      {isLoading ? (
        <LoadingState label="Loading questions…" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        <Card><CardBody className="py-12 text-center text-sm text-slate-500">No questions yet. Add your first one.</CardBody></Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {list.map((q, idx) => (
                <li key={q.id} className="flex items-center gap-3 px-5 py-3">
                  <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${q.enabled ? 'font-medium text-slate-800' : 'text-slate-400 line-through'}`}>{q.questionText}</p>
                  </div>
                  <Badge tone={q.enabled ? 'success' : 'neutral'}>{q.enabled ? 'Enabled' : 'Disabled'}</Badge>
                  <div className="flex items-center">
                    <Button variant="ghost" size="sm" title="Move up" disabled={idx === 0 || reorder.isPending} onClick={() => move(idx, 'up')}><ArrowUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" title="Move down" disabled={idx === list.length - 1 || reorder.isPending} onClick={() => move(idx, 'down')}><ArrowDown className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setEnabled.mutate({ id: q.id, enabled: !q.enabled })}>
                      {q.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button variant="ghost" size="sm" title="Edit" onClick={() => openEdit(q)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" title="Delete" onClick={() => setToDelete(q)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit question' : 'Add question'}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={create.isPending || update.isPending}>Cancel</Button>
            <Button onClick={save} isLoading={create.isPending || update.isPending}>{editing ? 'Save' : 'Add'}</Button>
          </>
        }
      >
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. What did you accomplish today?"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete question"
        message="Delete this reflection question? Existing answers are kept."
        confirmLabel="Delete"
        danger
        isLoading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
