import { useState } from 'react';
import { Plus, Pencil, KeyRound, Power, Trash2, Search, LockKeyholeOpen } from 'lucide-react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card } from '@/components/modern/ui/Card';
import { Button } from '@/components/modern/ui/Button';
import { Input } from '@/components/modern/ui/Input';
import { Select } from '@/components/modern/ui/Select';
import { Badge } from '@/components/modern/ui/Badge';
import { DataTable, type Column } from '@/components/modern/ui/Table';
import { Pagination } from '@/components/modern/ui/Pagination';
import { UserStatusBadge } from '@/components/modern/ui/StatusBadge';
import { ConfirmDialog } from '@/components/modern/ui/ConfirmDialog';
import { ModernUserFormModal } from '@/components/modern/admin/ModernUserFormModal';
import { ModernResetPasswordModal } from '@/components/modern/admin/ModernResetPasswordModal';
import { useUsers, useUserMutations } from '@/features/users/hooks/useUsers';
import type { UserResponse, UsersQuery } from '@/features/users/types/user.types';
import type { Role } from '@/features/auth/types/auth.types';
import type { UserStatus } from '@/features/users/types/user.types';
import { useTableControls } from '@/hooks/useTableControls';
import { formatDate, roleLabel } from '@/lib/format';

const PAGE_SIZE = 10;

/** Modern port of UsersPage — same hooks/mutations/columns, dark styling. */
export default function ModernUsersPage() {
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
  const { updateStatus, remove, unlock } = useUserMutations();

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (u: UserResponse) => { setEditing(u); setFormOpen(true); };

  const columns: Column<UserResponse>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (u) => (
        <div>
          <p className="font-medium text-[#EEF2F9]">{u.firstName} {u.lastName}</p>
          <p className="text-xs text-[rgba(238,242,249,.5)]">{u.email}</p>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (u) => roleLabel(u.role) },
    {
      key: 'status',
      header: 'Status',
      render: (u) => (
        <div className="flex items-center gap-1.5">
          <UserStatusBadge status={u.status} />
          {u.locked && <Badge tone="danger">Locked</Badge>}
        </div>
      ),
    },
    { key: 'lastLoginAt', header: 'Last login', render: (u) => formatDate(u.lastLoginAt) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) => (
        <div className="flex justify-end gap-1">
          {u.locked && (
            <Button variant="ghost" size="sm" title="Unlock account" onClick={() => unlock.mutate(u.id)}>
              <LockKeyholeOpen className="h-4 w-4 text-[#DBB652]" />
            </Button>
          )}
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
            <Power className={u.status === 'ACTIVE' ? 'h-4 w-4 text-[#8fd6ae]' : 'h-4 w-4 text-[rgba(238,242,249,.35)]'} />
          </Button>
          <Button variant="ghost" size="sm" title="Delete" onClick={() => setDeleteUser(u)}>
            <Trash2 className="h-4 w-4 text-[#e08a8a]" />
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
        <div className="flex flex-wrap items-center gap-3 border-b border-[rgba(238,242,249,.1)] p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(238,242,249,.35)]" />
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

      <ModernUserFormModal open={formOpen} onClose={() => setFormOpen(false)} user={editing} />
      <ModernResetPasswordModal open={!!resetUser} onClose={() => setResetUser(null)} user={resetUser} />
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
