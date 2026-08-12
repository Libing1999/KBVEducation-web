import { useState } from 'react';
import { Plus, Pencil, Users, Archive, Search } from 'lucide-react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card } from '@/components/modern/ui/Card';
import { Button } from '@/components/modern/ui/Button';
import { Input } from '@/components/modern/ui/Input';
import { Select } from '@/components/modern/ui/Select';
import { DataTable, type Column } from '@/components/modern/ui/Table';
import { Pagination } from '@/components/modern/ui/Pagination';
import { CohortStatusBadge } from '@/components/modern/ui/StatusBadge';
import { ConfirmDialog } from '@/components/modern/ui/ConfirmDialog';
import { ModernCohortFormModal } from '@/components/modern/admin/ModernCohortFormModal';
import { ModernCohortStudentsModal } from '@/components/modern/admin/ModernCohortStudentsModal';
import { useCohorts, useCohortMutations } from '@/features/cohorts/hooks/useCohorts';
import type { CohortResponse, CohortsQuery, CohortStatus } from '@/features/cohorts/types/cohort.types';
import { useTableControls } from '@/hooks/useTableControls';
import { formatDate } from '@/lib/format';

const PAGE_SIZE = 10;

/** Modern port of CohortsPage — same hooks/mutations/columns, dark styling. */
export default function ModernCohortsPage() {
  const { page, setPage, search, setSearch, debouncedSearch } = useTableControls();
  const [status, setStatus] = useState<CohortStatus | ''>('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CohortResponse | null>(null);
  const [manageCohort, setManageCohort] = useState<CohortResponse | null>(null);
  const [archiveCohort, setArchiveCohort] = useState<CohortResponse | null>(null);

  const query: CohortsQuery = {
    search: debouncedSearch || undefined,
    status: status || undefined,
    page,
    size: PAGE_SIZE,
  };
  const { data, isLoading } = useCohorts(query);
  const { archive } = useCohortMutations();

  const columns: Column<CohortResponse>[] = [
    {
      key: 'name',
      header: 'Cohort',
      render: (c) => (
        <div>
          <p className="font-medium text-[#EEF2F9]">{c.name}</p>
          <p className="text-xs text-[rgba(238,242,249,.5)]">Exam: {formatDate(c.examDate)}</p>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Duration',
      render: (c) => (
        <span className="text-[rgba(238,242,249,.75)]">
          {formatDate(c.startDate)} – {formatDate(c.endDate)}
        </span>
      ),
    },
    {
      key: 'students',
      header: 'Students',
      render: (c) => (
        <span className="text-[rgba(238,242,249,.8)]">
          {c.studentCount}
          {c.maxStudents > 0 ? ` / ${c.maxStudents}` : ''}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (c) => <CohortStatusBadge status={c.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" title="Manage students" onClick={() => setManageCohort(c)}>
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Edit" onClick={() => { setEditing(c); setFormOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Archive" onClick={() => setArchiveCohort(c)}>
            <Archive className="h-4 w-4 text-[#DBB652]" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Cohorts Management"
        subtitle="Create and manage course intakes."
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Create cohort
          </Button>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-[rgba(238,242,249,.1)] p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(238,242,249,.35)]" />
            <Input className="pl-9" placeholder="Search cohorts…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select className="w-auto" value={status} onChange={(e) => { setStatus(e.target.value as CohortStatus | ''); setPage(0); }}>
            <option value="">All statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>

        <DataTable columns={columns} data={data?.content ?? []} rowKey={(c) => c.id} isLoading={isLoading} emptyMessage="No cohorts found." />
        <Pagination page={data?.page ?? 0} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements ?? 0} onPageChange={setPage} />
      </Card>

      <ModernCohortFormModal open={formOpen} onClose={() => setFormOpen(false)} cohort={editing} />
      <ModernCohortStudentsModal open={!!manageCohort} onClose={() => setManageCohort(null)} cohort={manageCohort} />
      <ConfirmDialog
        open={!!archiveCohort}
        title="Archive cohort"
        message={`Archive "${archiveCohort?.name}"? It will be removed from active lists and its students unassigned.`}
        confirmLabel="Archive"
        danger
        isLoading={archive.isPending}
        onConfirm={() => archiveCohort && archive.mutate(archiveCohort.id, { onSuccess: () => setArchiveCohort(null) })}
        onClose={() => setArchiveCohort(null)}
      />
    </div>
  );
}
