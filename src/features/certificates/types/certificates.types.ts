export type CertificateType = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'COMPLETION';

export interface CertificateTemplate {
  id: string;
  name: string;
  certificateType: CertificateType;
  bodyTemplate: string;
  primaryColorHex: string;
  institutionNameOverride: string | null;
  logoPathOverride: string | null;
  active: boolean;
}

export interface UpsertCertificateTemplateRequest {
  name: string;
  certificateType: CertificateType;
  bodyTemplate: string;
  primaryColorHex: string;
  institutionNameOverride?: string;
  logoPathOverride?: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  certificateType: CertificateType;
  certificateNumber: string;
  cohortName: string | null;
  tierAtIssue: string | null;
  status: 'ISSUED';
  issuedAt: string;
}

export interface GenerateCertificateRequest {
  studentId: string;
  certificateType: CertificateType;
}
