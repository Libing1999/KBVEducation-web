import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/Spinner';
import { useMyCertificates, useParentCertificates } from '@/features/certificates/hooks/useCertificates';
import { paths } from '@/routes/paths';

interface Props {
  /** Student sees their own status; parent sees their linked student's availability. */
  variant: 'student' | 'parent';
}

export function CertificateStatusCard({ variant }: Props) {
  const isParent = variant === 'parent';
  const studentQuery = useMyCertificates(!isParent);
  const parentQuery = useParentCertificates(isParent);
  const { data: certificates, isLoading } = isParent ? parentQuery : studentQuery;

  if (isLoading) return <LoadingState label="Loading certificates…" />;

  const count = certificates?.length ?? 0;

  return (
    <Card>
      <CardHeader title={variant === 'parent' ? 'Certificate Availability' : 'Certificate Status'} />
      <CardBody className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-500">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-800">{count}</p>
            <p className="text-xs text-slate-500">
              {count === 0
                ? variant === 'parent'
                  ? 'No certificates issued yet'
                  : "You haven't earned a certificate yet"
                : `${count} certificate${count === 1 ? '' : 's'} issued`}
            </p>
          </div>
        </div>
        <Link to={paths.certificates} className="text-sm font-medium text-primary hover:text-primary-600">
          View
        </Link>
      </CardBody>
    </Card>
  );
}
