import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/modern/ui/Card';
import { Button } from '@/components/modern/ui/Button';
import { Input } from '@/components/modern/ui/Input';
import { Select } from '@/components/modern/ui/Select';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
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

/** Modern port of DataExportPage — same hooks/logic, dark styling. */
export default function ModernDataExportPage() {
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
              <label htmlFor="mexp-dataset" className="block text-sm font-medium text-[rgba(238,242,249,.75)]">Dataset</label>
              <Select
                id="mexp-dataset"
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
                  <label htmlFor="mexp-from" className="block text-sm font-medium text-[rgba(238,242,249,.75)]">From</label>
                  <Input id="mexp-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="mexp-to" className="block text-sm font-medium text-[rgba(238,242,249,.75)]">To</label>
                  <Input id="mexp-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
              </>
            )}

            {supports('COHORT') && (
              <div className="space-y-1.5">
                <label htmlFor="mexp-cohort" className="block text-sm font-medium text-[rgba(238,242,249,.75)]">Cohort</label>
                <Select id="mexp-cohort" value={cohortId} onChange={(e) => setCohortId(e.target.value)}>
                  <option value="">All cohorts</option>
                  {cohortPage?.content.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
            )}

            {supports('STUDENT') && (
              <div className="space-y-1.5">
                <label htmlFor="mexp-student-id" className="block text-sm font-medium text-[rgba(238,242,249,.75)]">Student ID (optional)</label>
                <Input
                  id="mexp-student-id"
                  placeholder="Paste a student's ID to filter to one"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
            )}

            {supports('STATUS') && STATUS_OPTIONS[dataset] && (
              <div className="space-y-1.5">
                <label htmlFor="mexp-status" className="block text-sm font-medium text-[rgba(238,242,249,.75)]">Status</label>
                <Select id="mexp-status" value={status} onChange={(e) => setStatus(e.target.value)}>
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
              <tr className="border-b border-[rgba(238,242,249,.1)] bg-white/[.02]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Dataset</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Format</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Rows</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(238,242,249,.08)]">
              {!history || history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[rgba(238,242,249,.55)]">No exports yet.</td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id}>
                    <td className="px-4 py-3 font-medium text-[#EEF2F9]">{h.dataset}</td>
                    <td className="px-4 py-3 text-[rgba(238,242,249,.75)]">{h.format}</td>
                    <td className="px-4 py-3 text-[rgba(238,242,249,.75)]">{h.rowCount ?? '—'}</td>
                    <td className="px-4 py-3 text-[rgba(238,242,249,.75)]">{h.exportedByName}</td>
                    <td className="px-4 py-3 text-[rgba(238,242,249,.75)]">{formatDateTime(h.createdAt)}</td>
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
