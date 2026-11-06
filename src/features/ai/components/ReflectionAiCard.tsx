import { AlertTriangle, CheckCircle2, Loader2, Quote, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { formatDateTime } from '@/lib/format';
import { useReanalyse, useReflectionAiCard } from '@/features/ai/hooks/useAi';
import { FAILURE_LABELS, PROVIDER_LABELS, REFLECTION_FLAG_LABELS } from '@/features/ai/types/ai.types';

/**
 * The AI's notes on a reflection (memo 12.10.2026, 4.4), plus the voice-note transcript,
 * marked "transcribed by AI". The audio itself is played by the page above.
 */
export function ReflectionAiCard({ reflectionId, hasAudio }: { reflectionId: string; hasAudio: boolean }) {
  const { data: card, isLoading } = useReflectionAiCard(reflectionId);
  const { reflection: reanalyse } = useReanalyse();

  if (isLoading || !card) {
    return (
      <Card>
        <CardBody className="flex justify-center"><Spinner /></CardBody>
      </Card>
    );
  }

  const r = card.result;
  return (
    <Card>
      <CardHeader
        title={<span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> AI notes</span>}
        subtitle={
          card.result && card.provider ? (
            <>
              Analysed by {PROVIDER_LABELS[card.provider]} ({card.model}){card.backupUsed && ' as backup'}
              {card.referencePackVersionNo != null && ` · reference pack v${card.referencePackVersionNo}`}
              {card.analysedAt && ` · ${formatDateTime(card.analysedAt)}`}
            </>
          ) : 'Students never see this.'
        }
        action={
          <Button variant="outline" size="sm" onClick={() => reanalyse.mutate(reflectionId)} isLoading={reanalyse.isPending}>
            <RefreshCw className="h-4 w-4" /> Analyse again
          </Button>
        }
      />
      <CardBody className="space-y-4">
        {card.needsAttention && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4" /> Needs your attention
          </div>
        )}

        {(card.status === 'QUEUED' || card.status === 'SUBMITTED') && (
          <p className="inline-flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Being analysed.
          </p>
        )}
        {card.status === 'NOT_ANALYSED' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">Not analysed</p>
            {card.failureReason && <p className="mt-1">{FAILURE_LABELS[card.failureReason]}.</p>}
            {card.failureDetail && <p className="mt-1 text-xs text-amber-700/80">{card.failureDetail}</p>}
          </div>
        )}
        {!card.status && <p className="text-sm text-slate-500">Not analysed yet. New reflections are analysed in the nightly run.</p>}

        {r && (
          <>
            <p className="text-sm leading-relaxed text-slate-700">{r.summary}</p>
            {r.flags.length === 0 ? (
              <p className="text-xs text-slate-400">No flags</p>
            ) : (
              <div className="space-y-2">
                {r.flags.map((f, i) => (
                  <div key={i} className="rounded-lg border border-red-100 bg-red-50/50 px-4 py-3">
                    <Badge tone="danger">{REFLECTION_FLAG_LABELS[f.type] ?? f.type}</Badge>
                    <p className="mt-1.5 flex items-start gap-1.5 text-sm italic text-slate-700">
                      <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>
                        “{f.quote}”
                        {f.quote_verified ? (
                          <CheckCircle2 className="ml-1 inline h-3.5 w-3.5 text-green-600" aria-label="Quote found word for word" />
                        ) : (
                          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium not-italic text-amber-800">
                            quote not verified
                          </span>
                        )}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{f.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {hasAudio && (
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Voice note transcript <Badge tone="info">transcribed by AI</Badge>
            </p>
            {card.transcriptStatus === 'DONE' && card.transcript ? (
              <>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{card.transcript}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {card.transcriptModel}{card.transcribedAt && ` · ${formatDateTime(card.transcribedAt)}`}
                </p>
              </>
            ) : card.transcriptStatus === 'FAILED' ? (
              <p className="mt-1 text-sm text-amber-700">
                The voice note could not be turned into text. It needs your attention; the audio above still plays.
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">Not transcribed yet. Voice notes are transcribed in the nightly run.</p>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
