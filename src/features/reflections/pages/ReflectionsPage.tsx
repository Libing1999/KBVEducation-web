import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Mic, Upload, X, CheckCircle2, Pencil, CalendarDays } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { useTodayReflection, useReflectionHistory, useReflectionMutations } from '@/features/reflections/hooks/useReflections';
import { reflectionsApi } from '@/features/reflections/api/reflectionsApi';
import { formatDate } from '@/lib/format';
import type { AnswerInput } from '@/features/reflections/types/reflection.types';

const AUDIO_ACCEPT = '.mp3,.wav,.m4a,.aac';

export default function ReflectionsPage() {
  const { data: today, isLoading, isError, refetch } = useTodayReflection();
  const { data: history } = useReflectionHistory();
  const { submit, update } = useReflectionMutations();

  const existing = today?.reflection ?? null;
  const isEdit = !!existing;

  // Answers keyed by questionId, seeded from any existing reflection.
  const seeded = useMemo(() => {
    const map: Record<string, string> = {};
    existing?.answers.forEach((a) => { map[a.questionId] = a.answerText ?? ''; });
    return map;
  }, [existing]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [audio, setAudio] = useState<File | null>(null);
  const [removeAudio, setRemoveAudio] = useState(false);
  const audioRef = useRef<HTMLInputElement>(null);
  // Track which reflection the local state was seeded from, to reset on data change.
  const [seededFor, setSeededFor] = useState<string | null | undefined>(undefined);
  if (seededFor !== (existing?.id ?? null)) {
    setSeededFor(existing?.id ?? null);
    setAnswers(seeded);
    setAudio(null);
    setRemoveAudio(false);
  }

  if (isLoading) return <LoadingState label="Loading today's reflection…" />;
  if (isError || !today) return <ErrorState onRetry={() => refetch()} />;

  const onPickAudio = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAudio(file);
    if (file) setRemoveAudio(false);
  };

  const save = () => {
    const payload: AnswerInput[] = today.questions.map((q) => ({
      questionId: q.id,
      answerText: answers[q.id] ?? '',
    }));
    const done = () => { if (audioRef.current) audioRef.current.value = ''; };
    if (isEdit) {
      update.mutate({ id: existing!.id, answers: payload, audio, removeAudio }, { onSuccess: done });
    } else {
      submit.mutate({ answers: payload, audio }, { onSuccess: done });
    }
  };

  const isPending = submit.isPending || update.isPending;
  const hasExistingAudio = !!existing?.hasAudio && !removeAudio;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Daily Reflection</h1>
          <p className="text-sm text-slate-500">
            {formatDate(today.date)} · one reflection per day, editable until midnight.
          </p>
        </div>
        {isEdit && <Badge tone="success"><CheckCircle2 className="mr-1 h-3 w-3" /> Submitted today</Badge>}
      </div>

      {today.questions.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-sm text-slate-500">
            No reflection questions have been set up yet. Check back later.
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title={isEdit ? 'Edit today’s reflection' : 'Today’s reflection'}
            subtitle="Answer in writing, add a voice note, or both — it’s optional."
          />
          <CardBody className="space-y-5">
            {today.questions.map((q, i) => (
              <div key={q.id} className="space-y-1.5">
                <label htmlFor={`q-${q.id}`} className="block text-sm font-medium text-slate-700">
                  {i + 1}. {q.questionText}
                </label>
                <textarea
                  id={`q-${q.id}`}
                  rows={3}
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                  placeholder="Type your answer…"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            ))}

            {/* Voice note */}
            <div className="space-y-2 rounded-lg border border-slate-200 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Mic className="h-4 w-4 text-primary" /> Voice note <span className="font-normal text-slate-400">(optional)</span>
              </p>

              {hasExistingAudio && !audio && (
                <div className="space-y-2">
                  <AudioPlayer url={reflectionsApi.audioUrl(existing!.id)} />
                  <button
                    type="button"
                    onClick={() => setRemoveAudio(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    <X className="h-3.5 w-3.5" /> Remove voice note
                  </button>
                </div>
              )}

              {audio ? (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="truncate">{audio.name}</span>
                  <button type="button" onClick={() => setAudio(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <input ref={audioRef} type="file" accept={AUDIO_ACCEPT} className="hidden" onChange={onPickAudio} />
                  <Button variant="secondary" size="sm" onClick={() => audioRef.current?.click()}>
                    <Upload className="h-4 w-4" /> {hasExistingAudio ? 'Replace voice note' : 'Upload voice note'}
                  </Button>
                  <p className="text-xs text-slate-400">MP3, WAV, M4A or AAC · up to 25 MB. No transcription is done — your file is stored as-is.</p>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={save} isLoading={isPending}>
                {isEdit ? <><Pencil className="h-4 w-4" /> Save changes</> : 'Submit reflection'}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* History */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader title="Past reflections" />
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {history.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{formatDate(r.reflectionDate)}</p>
                    <p className="truncate text-xs text-slate-500">
                      {r.answers.map((a) => a.answerText).filter(Boolean).join(' · ') || 'Voice note only'}
                    </p>
                  </div>
                  <Badge tone={r.reflectionType === 'TYPED' ? 'info' : 'accent'}>{r.reflectionType}</Badge>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
