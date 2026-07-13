import { useState } from 'react';
import { Plus, Pencil, KeyRound, Power, Trash2, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { UserStatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { UserFormModal } from '@/features/users/components/UserFormModal';
import { ResetPasswordModal } from '@/features/users/components/ResetPasswordModal';
import { useUsers, useUserMutations } from '@/features/users/hooks/useUsers';
import type { UserResponse, UsersQuery } from '@/features/users/types/user.types';
import type { Role } from '@/features/auth/types/auth.types';
import type { UserStatus } from '@/features/users/types/user.types';
import { useTableControls } from '@/hooks/useTableControls';
import { formatDate, roleLabel } from '@/lib/format';

const PAGE_SIZE = 10;

export default function UsersPage() {
  const { page, setPage, search, setSearch, debouncedSearch } = useTableControls();
  const [role, setRole] = useState<Role | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [resetUser, setResetUser] = useState<UserResponse | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserResponse | null>(null);

  const query: UsersQuery = {
    search: debouncedSearch || undefined,
    role: role || undefined,
    status: status || undefined,
    page,
    size: PAGE_SIZE,
  };
  const { data, isLoading } = useUsers(query);
  const { updateStatus, remove } = useUserMutations();

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (u: UserResponse) => { setEditing(u); setFormOpen(true); };

  const columns: Column<UserResponse>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (u) => (
        <div>
          <p className="font-medium text-slate-800">{u.firstName} {u.lastName}</p>
          <p className="text-xs text-slate-500">{u.email}</p>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (u) => roleLabel(u.role) },
    { key: 'status', header: 'Status', render: (u) => <UserStatusBadge status={u.status} /> },
    { key: 'lastLoginAt', header: 'Last login', render: (u) => formatDate(u.lastLoginAt) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" title="Edit" onClick={() => openEdit(u)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Reset password" onClick={() => setResetUser(u)}>
            <KeyRound className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            onClick={() =>
              updateStatus.mutate({ id: u.id, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })
            }
          >
            <Power className={u.status === 'ACTIVE' ? 'h-4 w-4 text-green-600' : 'h-4 w-4 text-slate-400'} />
          </Button>
          <Button variant="ghost" size="sm" title="Delete" onClick={() => setDeleteUser(u)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users Management"
        subtitle="Create and manage all platform accounts."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Create user
          </Button>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            className="w-auto"
            value={role}
            onChange={(e) => { setRole(e.target.value as Role | ''); setPage(0); }}
          >
            <option value="">All roles</option>
            <option value="SUPER_ADMIN">Administrator</option>
            <option value="STUDENT">Student</option>
            <option value="PARENT">Parent</option>
          </Select>
          <Select
            className="w-auto"
            value={status}
            onChange={(e) => { setStatus(e.target.value as UserStatus | ''); setPage(0); }}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={data?.content ?? []}
          rowKey={(u) => u.id}
          isLoading={isLoading}
          emptyMessage="No users found."
        />
        <Pagination
          page={data?.page ?? 0}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          onPageChange={setPage}
        />
      </Card>

      <UserFormModal open={formOpen} onClose={() => setFormOpen(false)} user={editing} />
      <ResetPasswordModal open={!!resetUser} onClose={() => setResetUser(null)} user={resetUser} />
      <ConfirmDialog
        open={!!deleteUser}
        title="Delete user"
        message={`Delete ${deleteUser?.firstName} ${deleteUser?.lastName}? This can’t be undone.`}
        confirmLabel="Delete"
        danger
        isLoading={remove.isPending}
        onConfirm={() =>
          deleteUser && remove.mutate(deleteUser.id, { onSuccess: () => setDeleteUser(null) })
        }
        onClose={() => setDeleteUser(null)}
      />
    </div>
  );
}
