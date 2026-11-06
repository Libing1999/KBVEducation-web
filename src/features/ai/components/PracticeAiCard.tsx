import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Loader2, Quote, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { useAiSettings, usePracticeAiCard, useReanalyse } from '@/features/ai/hooks/useAi';
import { FlagCount, RecommendationBadge, TrustBadge } from '@/features/ai/components/AiBadges';
import {
  FAILURE_LABELS,
  PRACTICE_FLAG_LABELS,
  PROVIDER_LABELS,
  type PracticeAiCard as AiCardData,
  type TranscriptTurn,
} from '@/features/ai/types/ai.types';

const DEPTH_TONE = { touched: 'neutral', practised: 'info', secure: 'success' } as const;

/**
 * The review card for one practice session (memo 12.10.2026, 4.2): recommendation, trust
 * rating, summary, facts, flags with quotes and turn pointers, and session length beside the
 * class and student medians. The full transcript, split into numbered turns, is one click away.
 */
export function PracticeAiCard({ sessionId, fallbackTranscript }: { sessionId: string; fallbackTranscript?: string | null }) {
  const { data: card, isLoading } = usePracticeAiCard(sessionId);
  const { data: settings } = useAiSettings();
  const { practice: reanalyse } = useReanalyse();
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [highlight, setHighlight] = useState<[number, number] | null>(null);

  // Open the transcript and scroll to the first highlighted turn.
  useEffect(() => {
    if (!highlight) return;
    setTranscriptOpen(true);
    const t = window.setTimeout(() => {
      document.getElementById(`turn-${highlight[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
    return () => window.clearTimeout(t);
  }, [highlight]);

  if (isLoading || !card) {
    return (
      <Card>
        <CardBody className="flex justify-center"><Spinner /></CardBody>
      </Card>
    );
  }

  const ranges = settings ? { greenMinRating: settings.greenMinRating, amberMinRating: settings.amberMinRating } : undefined;
  const r = card.result;

  return (
    <Card>
      <CardHeader
        title={<span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> AI review</span>}
        subtitle={<AnalysedBy card={card} />}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => reanalyse.mutate(sessionId)}
            isLoading={reanalyse.isPending}
            title="Send this session to the AI again now"
          >
            <RefreshCw className="h-4 w-4" /> Analyse again
          </Button>
        }
      />
      <CardBody className="space-y-5">
        <StatusNotice card={card} />

        {r && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <RecommendationBadge value={r.recommendation} />
              <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                Trust <TrustBadge rating={r.trust_rating} ranges={ranges} />
              </span>
              <FlagCount count={r.flags.length} />
              {r.analysed_in_parts && <Badge>Long session: analysed in {r.analysed_in_parts} parts</Badge>}
            </div>

            <p className="text-sm leading-relaxed text-slate-700">{r.summary}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Fact label="Past paper score">
                {r.past_paper_score === 'not applicable' ? '—' : r.past_paper_score}
              </Fact>
              <Fact label="Engagement">
                <span className="font-semibold">{r.engagement_rating}/10</span> — {r.engagement_reason}
                {r.engagement_quote && (
                  <QuoteLine quote={r.engagement_quote} verified={r.engagement_quote_verified !== false} />
                )}
              </Fact>
              <Fact label="Topics studied">
                {r.topics.length === 0 ? '—' : (
                  <div className="flex flex-wrap gap-1.5">
                    {r.topics.map((t) => (
                      <Badge key={t.topic} tone={DEPTH_TONE[t.depth]}>{t.topic} · {t.depth}</Badge>
                    ))}
                  </div>
                )}
              </Fact>
              <Fact label="Weak topics">{r.weak_topics.length === 0 ? '—' : r.weak_topics.join(', ')}</Fact>
            </div>

            {r.flags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Flags</p>
                {r.flags.map((f, i) => (
                  <div key={i} className="rounded-lg border border-red-100 bg-red-50/50 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-red-800">{PRACTICE_FLAG_LABELS[f.type] ?? f.type}</span>
                      <button
                        type="button"
                        onClick={() => setHighlight([f.turn_from, f.turn_to])}
                        className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                      >
                        {f.turn_from === f.turn_to ? `Turn ${f.turn_from}` : `Turns ${f.turn_from} to ${f.turn_to}`}
                      </button>
                    </div>
                    <QuoteLine quote={f.quote} verified={f.quote_verified} />
                    <p className="mt-1 text-sm text-slate-600">{f.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <LengthComparison card={card} />

        <div>
          <button
            type="button"
            onClick={() => setTranscriptOpen((o) => !o)}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-600"
          >
            {transcriptOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {transcriptOpen ? 'Hide' : 'Show'} full transcript
            {card.turns.length > 0 && ` (${card.turns.length} turns)`}
          </button>
          {transcriptOpen && (
            <TranscriptView turns={card.turns} highlight={highlight} fallback={fallbackTranscript} method={card.turnSplitMethod} />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function AnalysedBy({ card }: { card: AiCardData }) {
  if (!card.result || !card.provider) return <>Students never see this.</>;
  return (
    <>
      Analysed by {PROVIDER_LABELS[card.provider]} ({card.model})
      {card.backupUsed && ' as backup'}
      {card.referencePackVersionNo != null && ` · reference pack v${card.referencePackVersionNo}`}
      {card.analysedAt && ` · ${formatDateTime(card.analysedAt)}`}
    </>
  );
}

function StatusNotice({ card }: { card: AiCardData }) {
  if (card.status === 'QUEUED' || card.status === 'SUBMITTED') {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Being analysed. Results come back with tonight's run.
      </p>
    );
  }
  if (card.status === 'NOT_ANALYSED') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <p className="inline-flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" /> Not analysed</p>
        {card.failureReason && <p className="mt-1">{FAILURE_LABELS[card.failureReason]}.</p>}
        {card.failureDetail && <p className="mt-1 text-xs text-amber-700/80">{card.failureDetail}</p>}
        <p className="mt-1">The session stays waiting for your decision.</p>
      </div>
    );
  }
  if (!card.status) {
    return <p className="text-sm text-slate-500">Not analysed yet. New sessions are analysed in the nightly run.</p>;
  }
  return null;
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm text-slate-700">{children}</div>
    </div>
  );
}

function QuoteLine({ quote, verified }: { quote: string; verified: boolean }) {
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-sm italic text-slate-700">
      <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span>
        “{quote}”
        {verified ? (
          <CheckCircle2 className="ml-1 inline h-3.5 w-3.5 text-green-600" aria-label="Quote found word for word" />
        ) : (
          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium not-italic text-amber-800">
            quote not verified
          </span>
        )}
      </span>
    </p>
  );
}

function LengthComparison({ card }: { card: AiCardData }) {
  const l = card.length;
  if (!l.turns) return null;
  const cell = (chars?: number | null, turns?: number | null) =>
    turns == null ? <span className="text-slate-400">not enough sessions yet</span> : `${chars?.toLocaleString()} chars · ${turns} turns`;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Session length (same study type)</p>
      <div className="mt-1 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
        <div><span className="text-slate-500">This session:</span> {cell(l.chars, l.turns)}</div>
        <div><span className="text-slate-500">Class median:</span> {cell(l.classMedianChars, l.classMedianTurns)}</div>
        <div><span className="text-slate-500">Student's median:</span> {cell(l.studentMedianChars, l.studentMedianTurns)}</div>
      </div>
    </div>
  );
}

function TranscriptView({
  turns,
  highlight,
  fallback,
  method,
}: {
  turns: TranscriptTurn[];
  highlight: [number, number] | null;
  fallback?: string | null;
  method?: string | null;
}) {
  if (turns.length === 0) {
    return fallback
      ? <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{fallback}</p>
      : <p className="mt-3 text-sm text-slate-400">No transcript.</p>;
  }
  return (
    <div className="mt-3 max-h-[32rem] space-y-2 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3">
      {method === 'PARAGRAPHS' && (
        <p className="text-xs text-slate-500">No speaker labels were found, so turns are split on blank lines.</p>
      )}
      {turns.map((t) => {
        const on = highlight && t.n >= highlight[0] && t.n <= highlight[1];
        return (
          <div
            key={t.n}
            id={`turn-${t.n}`}
            className={cn(
              'rounded-md px-3 py-2 text-sm transition-colors',
              t.speaker === 'STUDENT' ? 'bg-white' : 'bg-slate-100',
              on && 'bg-amber-100 ring-2 ring-amber-300',
            )}
          >
            <p className="text-xs font-semibold text-slate-500">
              Turn {t.n} · {t.speaker === 'STUDENT' ? 'Student' : t.speaker === 'TUTOR' ? 'Tutor' : 'Message'}
            </p>
            <p className="mt-0.5 whitespace-pre-line text-slate-700">{t.text}</p>
          </div>
        );
      })}
    </div>
  );
}
