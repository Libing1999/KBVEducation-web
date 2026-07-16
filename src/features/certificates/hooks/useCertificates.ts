import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { certificateTemplatesApi, certificatesApi } from '@/features/certificates/api/certificatesApi';
import type {
  GenerateCertificateRequest,
  UpsertCertificateTemplateRequest,
} from '@/features/certificates/types/certificates.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useCertificateTemplates() {
  return useQuery({
    queryKey: QUERY_KEYS.certificateTemplates,
    queryFn: certificateTemplatesApi.list,
  });
}

export function useCreateCertificateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertCertificateTemplateRequest) => certificateTemplatesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.certificateTemplates });
      toast.success('Certificate template created');
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateCertificateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertCertificateTemplateRequest }) =>
      certificateTemplatesApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.certificateTemplates });
      toast.success('Certificate template updated');
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

export function useActivateCertificateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => certificateTemplatesApi.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.certificateTemplates });
      toast.success('Certificate template activated');
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

export function useAdminCertificates() {
  return useQuery({
    queryKey: [...QUERY_KEYS.certificates, 'admin'],
    queryFn: certificatesApi.listForAdmin,
  });
}

export function useGenerateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateCertificateRequest) => certificatesApi.generate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.certificates });
      toast.success('Certificate generated');
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

export function useMyCertificates(enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.certificates, 'mine'],
    queryFn: certificatesApi.listMine,
    enabled,
  });
}

export function useParentCertificates(enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.certificates, 'parent'],
    queryFn: certificatesApi.listForParent,
    enabled,
  });
}
