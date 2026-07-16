import { apiClient } from '@/lib/apiClient';

/**
 * Download a protected file through the authenticated Axios client. Fetches the
 * bytes as a blob (so the bearer token is attached) and triggers a browser save.
 */
export async function downloadFile(url: string, fallbackName = 'download'): Promise<void> {
  const response = await apiClient.get(url, { responseType: 'blob' });

  const disposition = response.headers['content-disposition'] as string | undefined;
  let filename = fallbackName;
  if (disposition) {
    const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(disposition);
    if (match?.[1]) {
      filename = decodeURIComponent(match[1].replace(/"/g, ''));
    }
  }

  const blobUrl = URL.createObjectURL(response.data as Blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}

/**
 * Fetch a protected file as an in-memory blob URL for inline display (e.g. an
 * <iframe> preview) instead of triggering a save. Caller must revoke the
 * returned URL (URL.revokeObjectURL) once it's no longer displayed.
 */
export async function fetchBlobUrl(url: string): Promise<string> {
  const response = await apiClient.get(url, { responseType: 'blob' });
  return URL.createObjectURL(response.data as Blob);
}
