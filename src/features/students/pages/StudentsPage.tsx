import { useState } from 'react';
import { Plus, Pencil, GraduationCap, Trash2, Search, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { UserStatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { StudentFormModal } from '@/features/students/components/StudentFormModal';
import { AssignCohortModal } from '@/features/students/components/AssignCohortModal';
import { useStudents, useStudentMutations } from '@/features/students/hooks/useStudents';
import type { StudentResponse, StudentsQuery } from '@/features/students/types/student.types';
import type { UserStatus } from '@/features/users/types/user.types';
import { useTableControls } from '@/hooks/useTableControls';
import { formatDate } from '@/lib/format';

const PAGE_SIZE = 10;

export default function StudentsPage() {
  const { page, setPage, search, setSearch, debouncedSearch } = useTableControls();
  const [status, setStatus] = useState<UserStatus | ''>('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StudentResponse | null>(null);
  const [assignStudent, setAssignStudent] = useState<StudentResponse | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentResponse | null>(null);

  const query: StudentsQuery = {
    search: debouncedSearch || undefined,
    status: status || undefined,
    page,
    size: PAGE_SIZE,
  };
  const { data, isLoading } = useStudents(query);
  const { removeFromCohort, remove } = useStudentMutations();

  const columns: Column<StudentResponse>[] = [
    {
      key: 'name',
      header: 'Student',
      render: (s) => (
        <div>
          <p className="font-medium text-slate-800">{s.firstName} {s.lastName}</p>
          <p className="text-xs text-slate-500">{s.email}</p>
        </div>
      ),
    },
    {
      key: 'cohort',
      header: 'Cohort',
      render: (s) =>
        s.cohort ? (
          <Badge tone="info">{s.cohort.name}</Badge>
        ) : (
          <span className="text-xs text-slate-400">Unassigned</span>
        ),
    },
    { key: 'status', header: 'Status', render: (s) => <UserStatusBadge status={s.status} /> },
    { key: 'createdAt', header: 'Created', render: (s) => formatDate(s.createdAt) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" title="Edit" onClick={() => { setEditing(s); setFormOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Assign cohort" onClick={() => setAssignStudent(s)}>
            <GraduationCap className="h-4 w-4" />
          </Button>
          {s.cohort && (
            <Button
              variant="ghost"
              size="sm"
              title="Remove from cohort"
              onClick={() => removeFromCohort.mutate(s.id)}
            >
              <XCircle className="h-4 w-4 text-accent" />
            </Button>
          )}
          <Button variant="ghost" size="sm" title="Delete" onClick={() => setDeleteStudent(s)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Students Management"
        subtitle="Manage students and cohort assignments."
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Create student
          </Button>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select className="w-auto" value={status} onChange={(e) => { setStatus(e.target.value as UserStatus | ''); setPage(0); }}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>

        <DataTable columns={columns} data={data?.content ?? []} rowKey={(s) => s.id} isLoading={isLoading} emptyMessage="No students found." />
        <Pagination page={data?.page ?? 0} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements ?? 0} onPageChange={setPage} />
      </Card>

      <StudentFormModal open={formOpen} onClose={() => setFormOpen(false)} student={editing} />
      <AssignCohortModal open={!!assignStudent} onClose={() => setAssignStudent(null)} student={assignStudent} />
      <ConfirmDialog
        open={!!deleteStudent}
        title="Delete student"
        message={`Delete ${deleteStudent?.firstName} ${deleteStudent?.lastName}? This can’t be undone.`}
        confirmLabel="Delete"
        danger
        isLoading={remove.isPending}
        onConfirm={() => deleteStudent && remove.mutate(deleteStudent.id, { onSuccess: () => setDeleteStudent(null) })}
        onClose={() => setDeleteStudent(null)}
      />
    </div>
  );
}
