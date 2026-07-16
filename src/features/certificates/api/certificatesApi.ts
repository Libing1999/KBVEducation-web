import { apiClient } from '@/lib/apiClient';
import { downloadFile, fetchBlobUrl } from '@/lib/download';
import type { ApiResponse } from '@/types/api';
import type {
  Certificate,
  CertificateTemplate,
  GenerateCertificateRequest,
  UpsertCertificateTemplateRequest,
} from '@/features/certificates/types/certificates.types';

export const certificateTemplatesApi = {
  list: async (): Promise<CertificateTemplate[]> => {
    const { data } = await apiClient.get<ApiResponse<CertificateTemplate[]>>('/admin/certificate-templates');
    return data.data;
  },

  create: async (payload: UpsertCertificateTemplateRequest): Promise<CertificateTemplate> => {
    const { data } = await apiClient.post<ApiResponse<CertificateTemplate>>('/admin/certificate-templates', payload);
    return data.data;
  },

  update: async (id: string, payload: UpsertCertificateTemplateRequest): Promise<CertificateTemplate> => {
    const { data } = await apiClient.put<ApiResponse<CertificateTemplate>>(
      `/admin/certificate-templates/${id}`,
      payload,
    );
    return data.data;
  },

  activate: async (id: string): Promise<CertificateTemplate> => {
    const { data } = await apiClient.put<ApiResponse<CertificateTemplate>>(
      `/admin/certificate-templates/${id}/activate`,
    );
    return data.data;
  },

  fetchPreviewBlobUrl: (id: string): Promise<string> =>
    fetchBlobUrl(`/admin/certificate-templates/${id}/preview`),
};

export const certificatesApi = {
  listForAdmin: async (): Promise<Certificate[]> => {
    const { data } = await apiClient.get<ApiResponse<Certificate[]>>('/admin/certificates');
    return data.data;
  },

  generate: async (payload: GenerateCertificateRequest): Promise<Certificate> => {
    const { data } = await apiClient.post<ApiResponse<Certificate>>('/admin/certificates', payload);
    return data.data;
  },

  downloadForAdmin: (id: string, certificateNumber: string): Promise<void> =>
    downloadFile(`/admin/certificates/${id}/download`, `${certificateNumber}.pdf`),

  listMine: async (): Promise<Certificate[]> => {
    const { data } = await apiClient.get<ApiResponse<Certificate[]>>('/student/certificates');
    return data.data;
  },

  downloadMine: (id: string, certificateNumber: string): Promise<void> =>
    downloadFile(`/student/certificates/${id}/download`, `${certificateNumber}.pdf`),

  listForParent: async (): Promise<Certificate[]> => {
    const { data } = await apiClient.get<ApiResponse<Certificate[]>>('/parent/certificates');
    return data.data;
  },

  downloadForParent: (id: string, certificateNumber: string): Promise<void> =>
    downloadFile(`/parent/certificates/${id}/download`, `${certificateNumber}.pdf`),
};
