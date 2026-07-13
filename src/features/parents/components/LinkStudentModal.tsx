import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/form/FormField';
import { useParentMutations } from '@/features/parents/hooks/useParents';
import { useStudents } from '@/features/students/hooks/useStudents';
import type { ParentResponse } from '@/features/parents/types/parent.types';

interface Props {
  open: boolean;
  onClose: () => void;
  parent: ParentResponse | null;
}

export function LinkStudentModal({ open, onClose, parent }: Props) {
  const { linkStudent } = useParentMutations();
  const { data: studentPage } = useStudents({ page: 0, size: 100 });
  const [studentId, setStudentId] = useState('');

  const submit = () => {
    if (!parent || !studentId) return;
    linkStudent.mutate(
      { id: parent.id, studentId },
      { onSuccess: () => { setStudentId(''); onClose(); } },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Link Student"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={linkStudent.isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={linkStudent.isPending} disabled={!studentId}>Link</Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-slate-500">
          Link a student to{' '}
          <span className="font-medium text-slate-700">{parent?.firstName} {parent?.lastName}</span>. This replaces
          any current link.
        </p>
        <FormField label="Student" htmlFor="link-student">
          <Select id="link-student" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Select a student…</option>
            {studentPage?.content.map((s) => (
              <option key={s.id} value={s.id}>{s.firstName} {s.lastName} · {s.email}</option>
            ))}
          </Select>
        </FormField>
      </div>
    </Modal>
  );
}
