import { useState } from 'react';
import { Download, GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/modern/ui/Card';
import { Button } from '@/components/modern/ui/Button';
import { Input } from '@/components/modern/ui/Input';
import { Select } from '@/components/modern/ui/Select';
import { Badge } from '@/components/modern/ui/Badge';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { ErrorState } from '@/components/modern/ui/ErrorState';
import { useDebounce } from '@/hooks/useDebounce';
import { useStudents } from '@/features/students/hooks/useStudents';
import { useAdminCertificates, useGenerateCertificate } from '@/features/certificates/hooks/useCertificates';
import { certificatesApi } from '@/features/certificates/api/certificatesApi';
import { formatDateTime } from '@/lib/format';
import type { CertificateType } from '@/features/certificates/types/certificates.types';

const typeLabels: Record<CertificateType, string> = {
  TIER_1: 'Tier 1',
  TIER_2: 'Tier 2',
  TIER_3: 'Tier 3',
  COMPLETION: 'Completion',
};

/** Modern port of AdminCertificatesPage — same hooks/mutations, dark styling. */
export default function ModernAdminCertificatesPage() {
  const { data: certificates, isLoading, isError, refetch } = useAdminCertificates();
  const generate = useGenerateCertificate();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const { data: studentPage } = useStudents({ search: debouncedSearch, page: 0, size: 10 });
  const [studentId, setStudentId] = useState('');
  const [certificateType, setCertificateType] = useState<CertificateType>('TIER_1');

  const handleGenerate = () => {
    if (!studentId) return;
    generate.mutate({ studentId, certificateType }, { onSuccess: () => setStudentId('') });
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Certificates" subtitle="Issue and manage student certificates." />

      <Card>
        <CardHeader title="Generate a Certificate" subtitle="Search for a student, pick the certificate type, and issue it." />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="mcert-student-search" className="block text-sm font-medium text-[rgba(238,242,249,.75)]">
                Student
              </label>
              <Input
                id="mcert-student-search"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setStudentId('');
                }}
              />
              {debouncedSearch && (
                <Select
                  aria-label="Matching students"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="mt-1"
                >
                  <option value="">Select a student…</option>
                  {studentPage?.content.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.email})
                    </option>
                  ))}
                </Select>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="mcert-type" className="block text-sm font-medium text-[rgba(238,242,249,.75)]">
                Certificate Type
              </label>
              <Select
                id="mcert-type"
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value as CertificateType)}
              >
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleGenerate} isLoading={generate.isPending} disabled={!studentId}>
              <GraduationCap className="h-4 w-4" /> Generate Certificate
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Issued Certificates" />
        {isLoading ? (
          <CardBody><LoadingState label="Loading certificates…" /></CardBody>
        ) : isError || !certificates ? (
          <CardBody><ErrorState message="Failed to load certificates." onRetry={() => refetch()} /></CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[rgba(238,242,249,.1)] bg-white/[.02]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Certificate No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Cohort</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Issued</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.5)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(238,242,249,.08)]">
                {certificates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-[rgba(238,242,249,.55)]">
                      No certificates issued yet.
                    </td>
                  </tr>
                ) : (
                  certificates.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-medium text-[#EEF2F9]">{c.studentName}</td>
                      <td className="px-4 py-3"><Badge tone="info">{typeLabels[c.certificateType]}</Badge></td>
                      <td className="px-4 py-3 font-mono text-xs text-[rgba(238,242,249,.75)]">{c.certificateNumber}</td>
                      <td className="px-4 py-3 text-[rgba(238,242,249,.75)]">{c.cohortName ?? '—'}</td>
                      <td className="px-4 py-3 text-[rgba(238,242,249,.75)]">{formatDateTime(c.issuedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => certificatesApi.downloadForAdmin(c.id, c.certificateNumber)}
                        >
                          <Download className="h-4 w-4" /> Download
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
