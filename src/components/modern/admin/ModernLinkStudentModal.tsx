import { useState } from 'react';
import { Modal } from '@/components/modern/ui/Modal';
import { Button } from '@/components/modern/ui/Button';
import { Select } from '@/components/modern/ui/Select';
import { FormField } from '@/components/modern/ui/FormField';
import { useParentMutations } from '@/features/parents/hooks/useParents';
import { useStudents } from '@/features/students/hooks/useStudents';
import type { ParentResponse } from '@/features/parents/types/parent.types';

interface Props {
  open: boolean;
  onClose: () => void;
  parent: ParentResponse | null;
}

/** Modern port of LinkStudentModal — same mutation, dark styling. */
export function ModernLinkStudentModal({ open, onClose, parent }: Props) {
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
        <p className="text-sm text-[rgba(238,242,249,.55)]">
          Link an additional student to{' '}
          <span className="font-medium text-[#EEF2F9]">{parent?.firstName} {parent?.lastName}</span>.
        </p>
        <FormField label="Student" htmlFor="m-link-student">
          <Select id="m-link-student" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
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
