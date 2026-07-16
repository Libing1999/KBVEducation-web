import { useState } from 'react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { CertificateTemplateFormModal } from '@/features/certificates/components/CertificateTemplateFormModal';
import { CertificatePreviewModal } from '@/features/certificates/components/CertificatePreviewModal';
import { useActivateCertificateTemplate, useCertificateTemplates } from '@/features/certificates/hooks/useCertificates';
import type { CertificateTemplate } from '@/features/certificates/types/certificates.types';

const typeLabels: Record<CertificateTemplate['certificateType'], string> = {
  TIER_1: 'Tier 1',
  TIER_2: 'Tier 2',
  TIER_3: 'Tier 3',
  COMPLETION: 'Completion',
};

export default function CertificateTemplatesPage() {
  const { data: templates, isLoading, isError, refetch } = useCertificateTemplates();
  const activate = useActivateCertificateTemplate();
  const [editing, setEditing] = useState<CertificateTemplate | null | undefined>(undefined);
  const [previewId, setPreviewId] = useState<string | null>(null);

  if (isLoading) return <LoadingState label="Loading certificate templates…" />;
  if (isError || !templates) {
    return <ErrorState message="Failed to load certificate templates." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Certificate Templates"
        subtitle="Define the layout admins issue Tier 1/2/3 and Completion certificates from. At most one template per type may be active."
        action={
          <Button onClick={() => setEditing(null)}>
            <Plus className="h-4 w-4" /> New Template
          </Button>
        }
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-secondary">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Color</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    No certificate templates yet. Create one to start issuing certificates.
                  </td>
                </tr>
              ) : (
                templates.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                    <td className="px-4 py-3 text-slate-600">{typeLabels[t.certificateType]}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block h-5 w-5 rounded-full border border-slate-200 align-middle"
                        style={{ backgroundColor: t.primaryColorHex }}
                        aria-label={t.primaryColorHex}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={t.active ? 'success' : 'neutral'}>{t.active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setPreviewId(t.id)} aria-label={`Preview ${t.name}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(t)} aria-label={`Edit ${t.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!t.active && (
                          <Button
                            variant="outline"
                            size="sm"
                            isLoading={activate.isPending && activate.variables === t.id}
                            onClick={() => activate.mutate(t.id)}
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CertificateTemplateFormModal
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        template={editing}
      />
      <CertificatePreviewModal templateId={previewId} onClose={() => setPreviewId(null)} />
    </div>
  );
}
