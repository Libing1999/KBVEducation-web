import { AlertTriangle, MicOff } from 'lucide-react';
import { AiStatusBadge, FlagCount } from '@/features/ai/components/AiBadges';
import type { AdminReflectionSummary } from '@/features/reflections/types/reflection.types';

/** The AI column of the admin reflections list (admin only). */
export function AiReflectionCell({ reflection: r }: { reflection: AdminReflectionSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {r.aiNeedsAttention && (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
          <AlertTriangle className="h-3.5 w-3.5" /> Needs attention
        </span>
      )}
      {r.aiStatus === 'SUCCEEDED' ? <FlagCount count={r.aiFlagCount ?? 0} /> : <AiStatusBadge status={r.aiStatus} />}
      {r.transcriptStatus === 'FAILED' && (
        <span className="inline-flex items-center gap-1 text-xs text-amber-700" title="The voice note could not be turned into text">
          <MicOff className="h-3.5 w-3.5" /> Not transcribed
        </span>
      )}
    </div>
  );
}
