import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

/**
 * Modern port of AudioPlayer — same auth'd-blob-fetch logic, dark palette.
 * Plays an audio file served behind auth. A plain <audio src> can't send the
 * bearer token, so we fetch the file as a blob through the API client and hand
 * the player an object URL.
 */
export function ModernAudioPlayer({ url }: { url: string }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let revoked: string | null = null;
    let active = true;
    setStatus('loading');
    apiClient
      .get(url, { responseType: 'blob' })
      .then((res) => {
        if (!active) return;
        const blobUrl = URL.createObjectURL(res.data as Blob);
        revoked = blobUrl;
        setObjectUrl(blobUrl);
        setStatus('ready');
      })
      .catch(() => active && setStatus('error'));
    return () => {
      active = false;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [url]);

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-[rgba(238,242,249,.55)]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading audio…
      </div>
    );
  }
  if (status === 'error' || !objectUrl) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#e08a8a]">
        <AlertCircle className="h-4 w-4" /> Could not load audio.
      </div>
    );
  }
  return <audio controls src={objectUrl} className="h-10 w-full max-w-md" />;
}
