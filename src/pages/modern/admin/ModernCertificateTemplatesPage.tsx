import { useState } from 'react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card } from '@/components/modern/ui/Card';
import { Button } from '@/components/modern/ui/Button';
import { Badge } from '@/components/modern/ui/Badge';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
import { ModernCertificateTemplateFormModal } from '@/components/modern/admin/ModernCertificateTemplateFormModal';
import { ModernCertificatePreviewModal } from '@/components/modern/admin/ModernCertificatePreviewModal';
import { useActivateCertificateTemplate, useCertificateTemplates } from '@/features/certificates/hooks/useCertificates';
import type { CertificateTemplate } from '@/features/certificates/types/certificates.types';

const typeLabels: Record<CertificateTemplate['certificateType'], string> = {
  TIER_1: 'Tier 1',
  TIER_2: 'Tier 2',
  TIER_3: 'Tier 3',
  COMPLETION: 'Completion',
};

/** Modern port of CertificateTemplatesPage — same hooks/mutations, dark styling. */
export default function ModernCertificateTemplatesPage() {
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
              <tr className="border-b border-[rgba(238,242,249,.1)] bg-white/[.02]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Color</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(238,242,249,.08)]">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[rgba(238,242,249,.55)]">
                    No certificate templates yet. Create one to start issuing certificates.
                  </td>
                </tr>
              ) : (
                templates.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-medium text-[#EEF2F9]">{t.name}</td>
                    <td className="px-4 py-3 text-[rgba(238,242,249,.75)]">{typeLabels[t.certificateType]}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block h-5 w-5 rounded-full border border-[rgba(238,242,249,.2)] align-middle"
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

      <ModernCertificateTemplateFormModal
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        template={editing}
      />
      <ModernCertificatePreviewModal templateId={previewId} onClose={() => setPreviewId(null)} />
    </div>
  );
}
