import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSentForReview } from '@/components/feedback/sentForReviewStore';

const MESSAGE = 'Sent for review by KBV staff and AI services.';
const VISIBLE_MS = 4000;

/**
 * The on-screen message, mounted once for the whole app. It rises in slowly with a soft
 * bounce and fades out after a few seconds. With "reduce motion" switched on in the
 * device settings it simply appears, with no animation (see .kbv-sent-in in index.css).
 * Students never see anything the AI writes; this only says their work was sent.
 */
export function SentForReviewOverlay() {
  const { visible, key, hide } = useSentForReview();

  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(hide, VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, [visible, key, hide]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[100] flex justify-center px-4" role="status" aria-live="polite">
      <div
        key={key}
        onClick={hide}
        className="kbv-sent-in pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-emerald-200 bg-white/95 px-5 py-4 text-sm font-medium text-slate-700 shadow-xl backdrop-blur"
      >
        <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
        <span>{MESSAGE}</span>
      </div>
    </div>
  );
}
