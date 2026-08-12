import { Award, Download } from 'lucide-react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card, CardBody } from '@/components/modern/ui/Card';
import { Badge } from '@/components/modern/ui/Badge';
import { Button } from '@/components/modern/ui/Button';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
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

/** Modern port of MyCertificatesPage — shared STUDENT/PARENT route, same hooks/logic, dark styling. */
export default function ModernMyCertificatesPage() {
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
            <Award className="h-8 w-8 text-[rgba(238,242,249,.3)]" />
            <p className="text-sm text-[rgba(238,242,249,.55)]">No certificates issued yet.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((c) => (
            <Card key={c.id}>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B0821C]/20 text-[#DBB652]">
                    <Award className="h-5 w-5" />
                  </div>
                  <Badge tone="accent">{typeLabels[c.certificateType]}</Badge>
                </div>
                <div>
                  <p className="font-mono text-xs text-[rgba(238,242,249,.5)]">{c.certificateNumber}</p>
                  <p className="text-sm text-[rgba(238,242,249,.7)]">{c.cohortName ?? 'No cohort'}</p>
                  <p className="text-xs text-[rgba(238,242,249,.4)]">Issued {formatDateTime(c.issuedAt)}</p>
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
