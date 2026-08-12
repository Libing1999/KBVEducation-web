import { useState } from 'react';
import { Modal } from '@/components/modern/ui/Modal';
import { Button } from '@/components/modern/ui/Button';
import { Select } from '@/components/modern/ui/Select';
import { FormField } from '@/components/modern/ui/FormField';
import { useStudentMutations } from '@/features/students/hooks/useStudents';
import { useCohorts } from '@/features/cohorts/hooks/useCohorts';
import type { StudentResponse } from '@/features/students/types/student.types';

interface Props {
  open: boolean;
  onClose: () => void;
  student: StudentResponse | null;
}

/** Modern port of AssignCohortModal — same mutation, dark styling. */
export function ModernAssignCohortModal({ open, onClose, student }: Props) {
  const { assignCohort } = useStudentMutations();
  const { data: cohortPage } = useCohorts({ page: 0, size: 100 });
  const [cohortId, setCohortId] = useState('');

  const submit = () => {
    if (!student || !cohortId) return;
    assignCohort.mutate(
      { id: student.id, cohortId },
      { onSuccess: () => { setCohortId(''); onClose(); } },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign to Cohort"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={assignCohort.isPending}>Cancel</Button>
          <Button onClick={submit} isLoading={assignCohort.isPending} disabled={!cohortId}>Assign</Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-[rgba(238,242,249,.55)]">
          Assign <span className="font-medium text-[#EEF2F9]">{student?.firstName} {student?.lastName}</span> to a
          cohort. This replaces any current active cohort.
        </p>
        <FormField label="Cohort" htmlFor="m-assign-cohort">
          <Select id="m-assign-cohort" value={cohortId} onChange={(e) => setCohortId(e.target.value)}>
            <option value="">Select a cohort…</option>
            {cohortPage?.content.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </FormField>
      </div>
    </Modal>
  );
}
