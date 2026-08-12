import { useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card, CardBody } from '@/components/modern/ui/Card';
import { Button } from '@/components/modern/ui/Button';
import { Input } from '@/components/modern/ui/Input';
import { Badge } from '@/components/modern/ui/Badge';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
import { Modal } from '@/components/modern/ui/Modal';
import { ConfirmDialog } from '@/components/modern/ui/ConfirmDialog';
import { FormField } from '@/components/modern/ui/FormField';
import { useSubjects, useSubjectMutations } from '@/features/subjects/hooks/useSubjects';
import type { Subject } from '@/features/subjects/types/subject.types';

/** Modern port of SubjectManagementPage — same hooks/mutations, dark styling. */
export default function ModernSubjectManagementPage() {
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
        <Card><CardBody className="py-12 text-center text-sm text-[rgba(238,242,249,.55)]">No subjects yet. Add your first one.</CardBody></Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-[rgba(238,242,249,.08)]">
              {list.map((s, idx) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <GripVertical className="h-4 w-4 shrink-0 text-[rgba(238,242,249,.3)]" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${s.enabled ? 'font-medium text-[#EEF2F9]' : 'text-[rgba(238,242,249,.35)] line-through'}`}>{s.name}</p>
                  </div>
                  <Badge tone={s.enabled ? 'success' : 'neutral'}>{s.enabled ? 'Active' : 'Inactive'}</Badge>
                  <div className="flex items-center">
                    <Button variant="ghost" size="sm" title="Move up" disabled={idx === 0 || reorder.isPending} onClick={() => move(idx, 'up')}><ArrowUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" title="Move down" disabled={idx === list.length - 1 || reorder.isPending} onClick={() => move(idx, 'down')}><ArrowDown className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setEnabled.mutate({ id: s.id, enabled: !s.enabled })}>
                      {s.enabled ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="ghost" size="sm" title="Edit" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" title="Delete" onClick={() => setToDelete(s)}><Trash2 className="h-4 w-4 text-[#e08a8a]" /></Button>
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
        <FormField label="Subject name" htmlFor="m-subject-name" required>
          <Input
            id="m-subject-name"
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
