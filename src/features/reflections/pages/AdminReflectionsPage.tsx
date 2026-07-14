import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Mic, Settings2, Eye } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { useAdminReflections } from '@/features/reflections/hooks/useAdminReflections';
import { useCohorts } from '@/features/cohorts/hooks/useCohorts';
import { useTableControls } from '@/hooks/useTableControls';
import { formatDate, formatDateTime } from '@/lib/format';
import { paths } from '@/routes/paths';
import type { AdminReflectionSummary, ReflectionType } from '@/features/reflections/types/reflection.types';

const PAGE_SIZE = 10;

export default function AdminReflectionsPage() {
  const { page, setPage, search, setSearch, debouncedSearch } = useTableControls();
  const [cohortId, setCohortId] = useState('');
  const [type, setType] = useState<ReflectionType | ''>('');

  const { data: cohortPage } = useCohorts({ page: 0, size: 100 });
  const { data, isLoading } = useAdminReflections({
    cohortId: cohortId || undefined,
    type: type || undefined,
    search: debouncedSearch || undefined,
    page,
    size: PAGE_SIZE,
  });

  const list = data?.content ?? [];

  const columns: Column<AdminReflectionSummary>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (r) => (
        <div>
          <Link to={paths.admin.reflectionDetail(r.id)} className="font-medium text-primary hover:text-primary-600">{r.studentName}</Link>
          <p className="text-xs text-slate-500">{r.cohortName ?? '—'}</p>
        </div>
      ),
    },
    { key: 'date', header: 'Date', render: (r) => <span className="text-slate-600">{formatDate(r.reflectionDate)}</span> },
    { key: 'submitted', header: 'Submitted', render: (r) => <span className="text-xs text-slate-500">{formatDateTime(r.submittedAt)}</span> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone={r.reflectionType === 'TYPED' ? 'info' : 'accent'}>{r.reflectionType}</Badge> },
    {
      key: 'preview',
      header: 'Preview',
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.hasAudio && <Mic className="h-3.5 w-3.5 shrink-0 text-accent" />}
          <span className="line-clamp-1 max-w-md text-sm text-slate-600">{r.textPreview || <span className="text-slate-400">Voice note only</span>}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <Link to={paths.admin.reflectionDetail(r.id)}>
          <Button variant="ghost" size="sm" title="Open"><Eye className="h-4 w-4" /></Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Daily Reflections"
        subtitle="Review student reflections, newest first."
        action={
          <Link to={paths.admin.reflectionQuestions}>
            <Button variant="secondary"><Settings2 className="h-4 w-4" /> Manage questions</Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search by student…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select className="w-auto" value={cohortId} onChange={(e) => { setCohortId(e.target.value); setPage(0); }}>
            <option value="">All cohorts</option>
            {cohortPage?.content.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select className="w-auto" value={type} onChange={(e) => { setType(e.target.value as ReflectionType | ''); setPage(0); }}>
            <option value="">All types</option>
            <option value="TYPED">Typed</option>
            <option value="VOICE">Voice</option>
            <option value="BOTH">Both</option>
          </Select>
        </div>

        <DataTable columns={columns} data={list} rowKey={(r) => r.id} isLoading={isLoading} emptyMessage="No reflections found." />
        <Pagination page={data?.page ?? 0} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements ?? 0} onPageChange={setPage} />
      </Card>
    </div>
  );
}
