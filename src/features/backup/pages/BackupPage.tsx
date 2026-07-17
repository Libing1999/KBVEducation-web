import { DatabaseBackup, Download, RotateCcw, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useBackups, useCreateBackup, useDeleteBackup } from '@/features/backup/hooks/useBackups';
import { backupApi } from '@/features/backup/api/backupApi';
import { formatDateTime, formatFileSize } from '@/lib/format';
import type { BackupStatus } from '@/features/backup/types/backup.types';

const STATUS_TONE: Record<BackupStatus, 'success' | 'warning' | 'danger'> = {
  COMPLETED: 'success',
  IN_PROGRESS: 'warning',
  FAILED: 'danger',
};

export default function BackupPage() {
  const { data: backups, isLoading, isError, refetch } = useBackups();
  const create = useCreateBackup();
  const del = useDeleteBackup();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Backups"
        subtitle="Manual database backups. Not scheduled — create one whenever you need it."
        action={
          <Button onClick={() => create.mutate()} isLoading={create.isPending}>
            <DatabaseBackup className="h-4 w-4" /> Create Backup
          </Button>
        }
      />

      <Card>
        <CardHeader title="Backup History" />
        {isLoading ? (
          <CardBody><LoadingState label="Loading backups…" /></CardBody>
        ) : isError || !backups ? (
          <CardBody><ErrorState message="Failed to load backups." onRetry={() => refetch()} /></CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-secondary">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No backups yet.</td>
                  </tr>
                ) : (
                  backups.map((b) => (
                    <tr key={b.id}>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(b.createdAt)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatFileSize(b.fileSizeBytes)}</td>
                      <td className="px-4 py-3 text-slate-600">{b.createdByName}</td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_TONE[b.status]}>{b.status.replace('_', ' ')}</Badge>
                        {b.status === 'FAILED' && b.errorMessage && (
                          <p className="mt-1 max-w-xs truncate text-xs text-red-500" title={b.errorMessage}>{b.errorMessage}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {b.status === 'COMPLETED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => backupApi.download(b.id, `backup-${b.id.slice(0, 8)}`)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={del.isPending && del.variables === b.id}
                            onClick={() => del.mutate(b.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Restore" subtitle="Not yet available." />
        <CardBody className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Restoring from a backup is a future capability. This is a placeholder — no restore runs today.
          </p>
          <Button variant="outline" disabled title="Restore is not yet available">
            <RotateCcw className="h-4 w-4" /> Restore
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
