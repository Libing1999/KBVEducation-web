import { Award, Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMyCertificates, useParentCertificates } from '@/features/certificates/hooks/useCertificates';
import { certificatesApi } from '@/features/certificates/api/certificatesApi';
import { formatDateTime } from '@/lib/format';
import type { Certificate, CertificateType } from '@/features/certificates/types/certificates.types';

const typeLabels: Record<CertificateType, string> = {
  TIER_1: 'Tier 1',
  TIER_2: 'Tier 2',
  TIER_3: 'Tier 3',
  COMPLETION: 'Completion',
};

/** Shared route for STUDENT and PARENT — content and API calls switch by role, matching
 * how ScoreDashboard's isParentView already resolves parent-to-linked-student. */
export default function MyCertificatesPage() {
  const isParent = useAuthStore((s) => s.user?.role) === 'PARENT';
  const studentQuery = useMyCertificates(!isParent);
  const parentQuery = useParentCertificates(isParent);
  const { data: certificates, isLoading, isError, refetch } = isParent ? parentQuery : studentQuery;

  const download = (c: Certificate) =>
    isParent
      ? certificatesApi.downloadForParent(c.id, c.certificateNumber)
      : certificatesApi.downloadMine(c.id, c.certificateNumber);

  return (
    <div className="space-y-5">
      <PageHeader
        title={isParent ? "My Child's Certificates" : 'My Certificates'}
        subtitle="Certificates issued by your administrator."
      />

      {isLoading ? (
        <LoadingState label="Loading certificates…" />
      ) : isError || !certificates ? (
        <ErrorState
          message={isParent ? 'Could not load your linked student’s certificates.' : 'Failed to load your certificates.'}
          onRetry={() => refetch()}
        />
      ) : certificates.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-12 text-center">
            <Award className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">No certificates issued yet.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((c) => (
            <Card key={c.id}>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-500">
                    <Award className="h-5 w-5" />
                  </div>
                  <Badge tone="accent">{typeLabels[c.certificateType]}</Badge>
                </div>
                <div>
                  <p className="font-mono text-xs text-slate-500">{c.certificateNumber}</p>
                  <p className="text-sm text-slate-600">{c.cohortName ?? 'No cohort'}</p>
                  <p className="text-xs text-slate-400">Issued {formatDateTime(c.issuedAt)}</p>
                </div>
                <Button variant="outline" size="sm" fullWidth onClick={() => download(c)}>
                  <Download className="h-4 w-4" /> Download
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
