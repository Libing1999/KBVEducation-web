import { useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { FormField } from '@/components/form/FormField';
import { useSubjects, useSubjectMutations } from '@/features/subjects/hooks/useSubjects';
import type { Subject } from '@/features/subjects/types/subject.types';

export default function SubjectManagementPage() {
  const { data: subjects, isLoading, isError, refetch } = useSubjects();
  const { create, update, setEnabled, reorder, remove } = useSubjectMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [name, setName] = useState('');
  const [toDelete, setToDelete] = useState<Subject | null>(null);

  const list = subjects ?? [];

  const openCreate = () => { setEditing(null); setName(''); setFormOpen(true); };
  const openEdit = (s: Subject) => { setEditing(s); setName(s.name); setFormOpen(true); };

  const save = () => {
    if (!name.trim()) return;
    const done = () => setFormOpen(false);
    if (editing) update.mutate({ id: editing.id, name: name.trim() }, { onSuccess: done });
    else create.mutate(name.trim(), { onSuccess: done });
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
      <PageHeader
        title="Subject Management"
        subtitle="Configure the subjects students can pick when logging practice. Disabled subjects are hidden from students."
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add subject</Button>}
      />

      {isLoading ? (
        <LoadingState label="Loading subjects…" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        <Card><CardBody className="py-12 text-center text-sm text-slate-500">No subjects yet. Add your first one.</CardBody></Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {list.map((s, idx) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${s.enabled ? 'font-medium text-slate-800' : 'text-slate-400 line-through'}`}>{s.name}</p>
                  </div>
                  <Badge tone={s.enabled ? 'success' : 'neutral'}>{s.enabled ? 'Active' : 'Inactive'}</Badge>
                  <div className="flex items-center">
                    <Button variant="ghost" size="sm" title="Move up" disabled={idx === 0 || reorder.isPending} onClick={() => move(idx, 'up')}><ArrowUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" title="Move down" disabled={idx === list.length - 1 || reorder.isPending} onClick={() => move(idx, 'down')}><ArrowDown className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setEnabled.mutate({ id: s.id, enabled: !s.enabled })}>
                      {s.enabled ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="ghost" size="sm" title="Edit" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" title="Delete" onClick={() => setToDelete(s)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
        title={editing ? 'Edit subject' : 'Add subject'}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={create.isPending || update.isPending}>Cancel</Button>
            <Button onClick={save} isLoading={create.isPending || update.isPending}>{editing ? 'Save' : 'Add'}</Button>
          </>
        }
      >
        <FormField label="Subject name" htmlFor="subject-name" required>
          <Input
            id="subject-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Biology"
            maxLength={100}
          />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete subject"
        message={`Delete "${toDelete?.name}"? This is only possible if no practice session uses it.`}
        confirmLabel="Delete"
        danger
        isLoading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
