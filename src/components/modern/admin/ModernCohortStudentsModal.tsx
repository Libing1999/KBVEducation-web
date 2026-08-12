import { useState } from 'react';
import { UserMinus } from 'lucide-react';
import { Modal } from '@/components/modern/ui/Modal';
import { Button } from '@/components/modern/ui/Button';
import { Select } from '@/components/modern/ui/Select';
import { Spinner } from '@/components/modern/ui/Spinner';
import { useCohortStudents, useCohortMutations } from '@/features/cohorts/hooks/useCohorts';
import { useStudents } from '@/features/students/hooks/useStudents';
import type { CohortResponse } from '@/features/cohorts/types/cohort.types';

interface Props {
  open: boolean;
  onClose: () => void;
  cohort: CohortResponse | null;
}

/** Modern port of CohortStudentsModal — same hooks/mutations, dark styling. */
export function ModernCohortStudentsModal({ open, onClose, cohort }: Props) {
  const cohortId = open ? cohort?.id ?? null : null;
  const { data: students, isLoading } = useCohortStudents(cohortId);
  const { data: allStudents } = useStudents({ page: 0, size: 100 });
  const { assignStudent, removeStudent } = useCohortMutations();
  const [studentId, setStudentId] = useState('');

  const assignedIds = new Set((students ?? []).map((s) => s.id));
  const available = (allStudents?.content ?? []).filter((s) => !assignedIds.has(s.id));

  const doAssign = () => {
    if (!cohort || !studentId) return;
    assignStudent.mutate({ id: cohort.id, studentId }, { onSuccess: () => setStudentId('') });
  };

  return (
    <Modal open={open} onClose={onClose} title={`Students — ${cohort?.name ?? ''}`} size="lg">
      <div className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="m-assign-select" className="mb-1.5 block text-sm font-medium text-[rgba(238,242,249,.75)]">
              Add a student
            </label>
            <Select id="m-assign-select" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">Select a student…</option>
              {available.map((s) => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} · {s.email}</option>
              ))}
            </Select>
          </div>
          <Button onClick={doAssign} isLoading={assignStudent.isPending} disabled={!studentId}>
            Assign
          </Button>
        </div>

        <div className="rounded-lg border border-[rgba(238,242,249,.12)]">
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (students?.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-sm text-[rgba(238,242,249,.55)]">No students assigned yet.</p>
          ) : (
            <ul className="divide-y divide-[rgba(238,242,249,.08)]">
              {students!.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#EEF2F9]">{s.firstName} {s.lastName}</p>
                    <p className="truncate text-xs text-[rgba(238,242,249,.5)]">{s.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Remove from cohort"
                    onClick={() => cohort && removeStudent.mutate({ id: cohort.id, studentId: s.id })}
                  >
                    <UserMinus className="h-4 w-4 text-[#e08a8a]" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
