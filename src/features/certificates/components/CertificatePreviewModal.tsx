import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/Spinner';
import { certificateTemplatesApi } from '@/features/certificates/api/certificatesApi';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  templateId: string | null;
  onClose: () => void;
}

/** Fetches the preview PDF as a blob and renders it inline — nothing is persisted. */
export function CertificatePreviewModal({ templateId, onClose }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    let cancelled = false;
    let url: string | null = null;
    setLoading(true);
    certificateTemplatesApi
      .fetchPreviewBlobUrl(templateId)
      .then((fetched) => {
        if (cancelled) {
          URL.revokeObjectURL(fetched);
          return;
        }
        url = fetched;
        setBlobUrl(fetched);
      })
      .catch((e: unknown) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
      setBlobUrl(null);
    };
  }, [templateId]);

  return (
    <Modal open={templateId !== null} onClose={onClose} title="Certificate Preview" size="lg">
      <div className="h-[70vh]">
        {loading || !blobUrl ? (
          <LoadingState label="Rendering preview…" />
        ) : (
          <iframe title="Certificate preview" src={blobUrl} className="h-full w-full rounded-lg border border-slate-200" />
        )}
      </div>
    </Modal>
  );
}
