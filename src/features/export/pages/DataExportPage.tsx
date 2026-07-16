import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useCohorts } from '@/features/cohorts/hooks/useCohorts';
import { EXPORT_QUERY_KEYS, useExportDatasets, useExportHistory } from '@/features/export/hooks/useExport';
import { exportApi, type ExportFormat } from '@/features/export/api/exportApi';
import { downloadFile } from '@/lib/download';
import { formatDateTime } from '@/lib/format';
import type { ExportDataset, ExportFilterType } from '@/features/export/types/export.types';

const STATUS_OPTIONS: Partial<Record<ExportDataset, { value: string; label: string }[]>> = {
  STUDENTS: [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }],
  PARENTS: [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }],
  COHORTS: [
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ARCHIVED', label: 'Archived' },
  ],
  LESSONS: [{ value: 'DRAFT', label: 'Draft' }, { value: 'PUBLISHED', label: 'Published' }],
  QUIZZES: [{ value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'SUBMITTED', label: 'Submitted' }],
  PRACTICE_LOGS: [
    { value: 'PENDING_REVIEW', label: 'Pending Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ],
};

export default function DataExportPage() {
  const queryClient = useQueryClient();
  const { data: datasets, isLoading, isError, refetch } = useExportDatasets();
  const { data: history } = useExportHistory();
  const { data: cohortPage } = useCohorts({ page: 0, size: 100 });

  const [dataset, setDataset] = useState<ExportDataset>('STUDENTS');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState('');

  const activeMeta = useMemo(() => datasets?.find((d) => d.dataset === dataset), [datasets, dataset]);
  const supports = (filter: ExportFilterType) => activeMeta?.supportedFilters.includes(filter) ?? false;

  const handleExport = async (format: ExportFormat) => {
    const url = exportApi.datasetUrl(dataset, format, {
      from: from || undefined,
      to: to || undefined,
      cohortId: cohortId || undefined,
      studentId: studentId || undefined,
      status: status || undefined,
    });
    await downloadFile(url, `${dataset.toLowerCase()}.${format.toLowerCase()}`);
    queryClient.invalidateQueries({ queryKey: EXPORT_QUERY_KEYS.history });
  };

  if (isLoading) return <LoadingState label="Loading export options…" />;
  if (isError || !datasets) return <ErrorState message="Failed to load export options." onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Data Export" subtitle="Export any dataset as CSV or Excel, filtered by date, cohort, student, or status." />

      <Card>
        <CardHeader title="Build an Export" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="exp-dataset" className="block text-sm font-medium text-slate-700">Dataset</label>
              <Select
                id="exp-dataset"
                value={dataset}
                onChange={(e) => { setDataset(e.target.value as ExportDataset); setStatus(''); }}
              >
                {datasets.map((d) => (
                  <option key={d.dataset} value={d.dataset}>{d.label}</option>
                ))}
              </Select>
            </div>

            {supports('DATE') && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="exp-from" className="block text-sm font-medium text-slate-700">From</label>
                  <Input id="exp-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="exp-to" className="block text-sm font-medium text-slate-700">To</label>
                  <Input id="exp-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
              </>
            )}

            {supports('COHORT') && (
              <div className="space-y-1.5">
                <label htmlFor="exp-cohort" className="block text-sm font-medium text-slate-700">Cohort</label>
                <Select id="exp-cohort" value={cohortId} onChange={(e) => setCohortId(e.target.value)}>
                  <option value="">All cohorts</option>
                  {cohortPage?.content.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
            )}

            {supports('STUDENT') && (
              <div className="space-y-1.5">
                <label htmlFor="exp-student-id" className="block text-sm font-medium text-slate-700">Student ID (optional)</label>
                <Input
                  id="exp-student-id"
                  placeholder="Paste a student's ID to filter to one"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
            )}

            {supports('STATUS') && STATUS_OPTIONS[dataset] && (
              <div className="space-y-1.5">
                <label htmlFor="exp-status" className="block text-sm font-medium text-slate-700">Status</label>
                <Select id="exp-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Any status</option>
                  {STATUS_OPTIONS[dataset]!.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleExport('CSV')}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={() => handleExport('XLSX')}>
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Recent Exports" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-secondary">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Dataset</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Format</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Rows</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!history || history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No exports yet.</td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{h.dataset}</td>
                    <td className="px-4 py-3 text-slate-600">{h.format}</td>
                    <td className="px-4 py-3 text-slate-600">{h.rowCount ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{h.exportedByName}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(h.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
