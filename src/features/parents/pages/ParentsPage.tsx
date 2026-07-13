import { useState } from 'react';
import { Plus, Pencil, Link2, Unlink, Trash2, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { UserStatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { ParentFormModal } from '@/features/parents/components/ParentFormModal';
import { LinkStudentModal } from '@/features/parents/components/LinkStudentModal';
import { useParents, useParentMutations } from '@/features/parents/hooks/useParents';
import type { ParentResponse, ParentsQuery } from '@/features/parents/types/parent.types';
import type { UserStatus } from '@/features/users/types/user.types';
import { useTableControls } from '@/hooks/useTableControls';
import { formatDate } from '@/lib/format';

const PAGE_SIZE = 10;

export default function ParentsPage() {
  const { page, setPage, search, setSearch, debouncedSearch } = useTableControls();
  const [status, setStatus] = useState<UserStatus | ''>('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ParentResponse | null>(null);
  const [linkParent, setLinkParent] = useState<ParentResponse | null>(null);
  const [deleteParent, setDeleteParent] = useState<ParentResponse | null>(null);

  const query: ParentsQuery = {
    search: debouncedSearch || undefined,
    status: status || undefined,
    page,
    size: PAGE_SIZE,
  };
  const { data, isLoading } = useParents(query);
  const { unlinkStudent, remove } = useParentMutations();

  const columns: Column<ParentResponse>[] = [
    {
      key: 'name',
      header: 'Parent',
      render: (p) => (
        <div>
          <p className="font-medium text-slate-800">{p.firstName} {p.lastName}</p>
          <p className="text-xs text-slate-500">{p.email}</p>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'Linked student',
      render: (p) =>
        p.student ? (
          <span className="text-slate-700">{p.student.firstName} {p.student.lastName}</span>
        ) : (
          <span className="text-xs text-slate-400">Not linked</span>
        ),
    },
    { key: 'status', header: 'Status', render: (p) => <UserStatusBadge status={p.status} /> },
    { key: 'createdAt', header: 'Created', render: (p) => formatDate(p.createdAt) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" title="Edit" onClick={() => { setEditing(p); setFormOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Link student" onClick={() => setLinkParent(p)}>
            <Link2 className="h-4 w-4" />
          </Button>
          {p.student && (
            <Button variant="ghost" size="sm" title="Unlink student" onClick={() => unlinkStudent.mutate(p.id)}>
              <Unlink className="h-4 w-4 text-accent" />
            </Button>
          )}
          <Button variant="ghost" size="sm" title="Delete" onClick={() => setDeleteParent(p)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Parents Management"
        subtitle="Manage parents and their linked students."
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Create parent
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

        <DataTable columns={columns} data={data?.content ?? []} rowKey={(p) => p.id} isLoading={isLoading} emptyMessage="No parents found." />
        <Pagination page={data?.page ?? 0} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements ?? 0} onPageChange={setPage} />
      </Card>

      <ParentFormModal open={formOpen} onClose={() => setFormOpen(false)} parent={editing} />
      <LinkStudentModal open={!!linkParent} onClose={() => setLinkParent(null)} parent={linkParent} />
      <ConfirmDialog
        open={!!deleteParent}
        title="Delete parent"
        message={`Delete ${deleteParent?.firstName} ${deleteParent?.lastName}? This can’t be undone.`}
        confirmLabel="Delete"
        danger
        isLoading={remove.isPending}
        onConfirm={() => deleteParent && remove.mutate(deleteParent.id, { onSuccess: () => setDeleteParent(null) })}
        onClose={() => setDeleteParent(null)}
      />
    </div>
  );
}
