import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Mic, Upload, X } from 'lucide-react';
import { useTodayReflection, useReflectionMutations } from '@/features/reflections/hooks/useReflections';
import { reflectionsApi } from '@/features/reflections/api/reflectionsApi';
import { ModernVoiceRecorder } from '@/components/modern/student/ModernVoiceRecorder';
import { ModernAudioPlayer } from '@/components/modern/student/ModernAudioPlayer';
import { usePracticeList } from '@/features/practice/hooks/usePractice';
import { ModernPracticeFormModal } from '@/components/modern/student/ModernPracticeFormModal';
import { useTodayLesson, useTakeQuiz, useSubmitQuiz } from '@/features/learn/hooks/useLearn';
import { ModernHomeworkSubmission } from '@/components/modern/student/ModernHomeworkSubmission';
import { Spinner } from '@/components/modern/ui/Spinner';
import { useFileDrop } from '@/hooks/useFileDrop';
import type { AnswerInput } from '@/features/reflections/types/reflection.types';
import type { SubmitAnswer } from '@/features/learn/types/learn.types';
import '@/pages/modern/student/kbvLog.css';

const AUDIO_ACCEPT = '.mp3,.wav,.m4a,.aac';

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type ItemKey = 'reflect' | 'practice' | 'recall' | 'hw';

/** Inline reflection form — same hooks/logic as ModernReflectionsPage, stripped of that page's
 * own header/history section since it lives inside a Log task card here. */
function ReflectCard() {
  const { data: today, isLoading, isError } = useTodayReflection();
  const { submit, update } = useReflectionMutations();
  const existing = today?.reflection ?? null;
  const isEdit = !!existing;

  const seeded = useMemo(() => {
    const map: Record<string, string> = {};
    existing?.answers.forEach((a) => { map[a.questionId] = a.answerText ?? ''; });
    return map;
  }, [existing]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [audio, setAudio] = useState<File | null>(null);
  const [removeAudio, setRemoveAudio] = useState(false);
  const audioRef = useRef<HTMLInputElement>(null);
  const [seededFor, setSeededFor] = useState<string | null | undefined>(undefined);
  if (seededFor !== (existing?.id ?? null)) {
    setSeededFor(existing?.id ?? null);
    setAnswers(seeded);
    setAudio(null);
    setRemoveAudio(false);
  }

  const { isDragging, dropHandlers } = useFileDrop((file) => {
    setAudio(file);
    setRemoveAudio(false);
  });

  if (isLoading) return <div className="flex justify-center py-6"><Spinner /></div>;
  if (isError || !today) return <p className="priv">Couldn&rsquo;t load today&rsquo;s reflection questions.</p>;
  if (today.questions.length === 0) {
    return <p className="priv">No reflection questions have been set up yet. Check back later.</p>;
  }

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
    <div>
      {today.questions.map((q, i) => (
        <div key={q.id} style={{ marginBottom: 12 }}>
          <label htmlFor={`log-q-${q.id}`} className="qmeta" style={{ display: 'block', marginBottom: 6 }}>
            {i + 1}. {q.questionText}
          </label>
          <textarea
            id={`log-q-${q.id}`}
            rows={3}
            value={answers[q.id] ?? ''}
            onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
            placeholder="Type your answer…"
          />
        </div>
      ))}

      <div style={{ marginBottom: 14 }}>
        <p className="qmeta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Mic size={14} /> Voice note (optional)
        </p>

        {hasExistingAudio && !audio && (
          <div style={{ marginBottom: 10 }}>
            <ModernAudioPlayer url={reflectionsApi.audioUrl(existing!.id)} />
            <button type="button" className="btn ghost" style={{ marginTop: 8 }} onClick={() => setRemoveAudio(true)}>
              <X size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Remove voice note
            </button>
          </div>
        )}

        {audio ? (
          <div className="rec">
            <span className="rectime" style={{ minWidth: 'auto' }}>{audio.name}</span>
            <button type="button" className="btn ghost" onClick={() => setAudio(null)}>Remove</button>
          </div>
        ) : (
          <div>
            <div
              {...dropHandlers}
              style={{
                border: `2px dashed ${isDragging ? '#DBB652' : 'rgba(238,242,249,.15)'}`,
                borderRadius: 8,
                padding: 12,
                textAlign: 'center',
                transition: 'border-color .15s',
                background: isDragging ? 'rgba(219,182,82,.08)' : 'transparent',
              }}
            >
              <input ref={audioRef} type="file" accept={AUDIO_ACCEPT} style={{ display: 'none' }} onChange={onPickAudio} />
              <button type="button" className="btn ghost" onClick={() => audioRef.current?.click()}>
                <Upload size={14} style={{ verticalAlign: -2, marginRight: 4 }} /> {hasExistingAudio ? 'Replace voice note' : 'Upload voice note'}
              </button>
              <p className="priv">{isDragging ? 'Drop to upload' : 'or drag a file here'}</p>
            </div>
            <p className="priv">Or record directly in your browser (up to 10 minutes):</p>
            <ModernVoiceRecorder onRecorded={(file) => { setAudio(file); setRemoveAudio(false); }} />
          </div>
        )}
      </div>

      <button type="button" className="btn gold" disabled={isPending} onClick={save}>
        {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Save'}
      </button>
      <p className="priv">Only you and your teacher see this. Voice notes are stored as-is — nothing is transcribed.</p>
    </div>
  );
}

/** Inline quiz-taking — same answer-state logic as ModernTakeQuizPage, embedded in a Log card
 * (fetched lazily, only once this card is actually opened). */
function RecallCard({ quizId, onDone }: { quizId: string; onDone: () => void }) {
  const { data: quiz, isLoading, isError } = useTakeQuiz(quizId);
  const submit = useSubmitQuiz(quizId);
  const [answers, setAnswers] = useState<Record<string, { optionId?: string; text?: string }>>({});
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) return <div className="flex justify-center py-6"><Spinner /></div>;
  if (isError || !quiz) return <p className="priv">Couldn&rsquo;t load today&rsquo;s Post-Lesson Quiz.</p>;

  if (quiz.alreadySubmitted || submitted) {
    return <p className="priv">You&rsquo;ve already completed this Post-Lesson Quiz — it can only be taken once.</p>;
  }

  const questions = [...quiz.questions].sort((a, b) => a.displayOrder - b.displayOrder);
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return q.questionType === 'MCQ' ? !!a?.optionId : !!a?.text?.trim();
  }).length;

  const doSubmit = () => {
    const payload: SubmitAnswer[] = [];
    for (const q of questions) {
      const a = answers[q.id];
      if (q.questionType === 'MCQ' && a?.optionId) payload.push({ questionId: q.id, selectedOptionId: a.optionId });
      else if (q.questionType === 'OPEN_ENDED' && a?.text?.trim()) payload.push({ questionId: q.id, answerText: a.text.trim() });
    }
    submit.mutate(payload, { onSuccess: () => { setSubmitted(true); onDone(); } });
  };

  return (
    <div>
      <p className="qmeta">Question{questions.length === 1 ? '' : 's'} from {quiz.title}</p>
      {questions.map((q, idx) => (
        <div key={q.id} style={{ marginBottom: 18 }}>
          <p className="qq">{idx + 1}. {q.questionText}</p>
          {q.questionType === 'MCQ' ? (
            <div>
              {q.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`qopt${answers[q.id]?.optionId === o.id ? ' sel' : ''}`}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: { optionId: o.id } }))}
                >
                  {o.optionText}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              rows={3}
              placeholder="Type your answer…"
              value={answers[q.id]?.text ?? ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: { text: e.target.value } }))}
            />
          )}
        </div>
      ))}
      <button type="button" className="btn gold" disabled={submit.isPending} onClick={doSubmit}>
        {submit.isPending ? 'Submitting…' : `Finish (${answeredCount} of ${questions.length} answered)`}
      </button>
    </div>
  );
}

export function ModernLogPage() {
  const { data: todayReflection } = useTodayReflection();
  const { data: practiceSessions } = usePracticeList();
  const { data: lesson, isLoading: lessonLoading } = useTodayLesson();

  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [openItem, setOpenItem] = useState<ItemKey | null>(null);
  const [autoOpened, setAutoOpened] = useState(false);

  const practiceToday = (practiceSessions ?? []).some((p) => p.studyDate === todayIso());

  const items: ItemKey[] = useMemo(() => {
    const base: ItemKey[] = ['reflect', 'practice'];
    if (lesson?.hasQuiz) base.push('recall');
    if (lesson?.hasHomework) base.push('hw');
    return base;
  }, [lesson]);

  const done: Record<ItemKey, boolean> = {
    reflect: !!todayReflection?.reflection,
    practice: practiceToday,
    recall: lesson?.quizCompleted ?? false,
    hw: lesson?.homeworkSubmitted ?? false,
  };

  const allLoaded = todayReflection !== undefined && practiceSessions !== undefined && !lessonLoading;
  const allDone = items.length > 0 && items.every((k) => done[k]);

  // Auto-open the first not-done item, once, after data has loaded.
  useEffect(() => {
    if (autoOpened || !allLoaded) return;
    const first = items.find((k) => !done[k]);
    setOpenItem(first ?? null);
    setAutoOpened(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLoaded, autoOpened]);

  // Once the currently-open item's submission actually lands (done flips true via the
  // underlying query refetching), advance to the next not-done item automatically — mirrors
  // the reference design's complete()->firstOpen() behavior instead of leaving the student to
  // manually tap the next card.
  useEffect(() => {
    if (openItem && done[openItem]) {
      const next = items.find((k) => !done[k]);
      setOpenItem(next ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done.reflect, done.practice, done.recall, done.hw]);

  const META: Record<ItemKey, { title: string; subtitle: string }> = {
    reflect: { title: 'Reflection', subtitle: 'A quick written or spoken check-in — a minute is plenty.' },
    practice: { title: 'Practice', subtitle: 'Log today’s study session.' },
    recall: { title: 'Post-Lesson Quiz', subtitle: lesson?.quizTitle ? `From ${lesson.title}` : 'Answer from memory.' },
    hw: { title: 'Post-Lesson Homework', subtitle: lesson?.homeworkInstructions || 'Submit your Post-Lesson Homework for today’s lesson.' },
  };

  const todayLabel = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date());

  const toggle = (k: ItemKey) => {
    if (done[k]) return;
    setOpenItem((cur) => (cur === k ? null : k));
  };

  return (
    <div className="kbv-log board">
      <div className="head">
        <h1>Today</h1>
        <div className="sub">{todayLabel}{lesson ? ' · Lesson day' : ''}</div>
      </div>

      {!allLoaded ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : allDone ? (
        <div className="alldone">
          <span className="rl" />
          <h2>All done for today.</h2>
          <p>Nothing left — well played.</p>
        </div>
      ) : (
        <div className="list">
          {items.map((k) => {
            const isDone = done[k];
            const isOpen = openItem === k && !isDone;
            return (
              <div key={k} className={`item${isDone ? ' done' : ''}${isOpen ? ' open' : ''}`}>
                <button type="button" className="ihead" onClick={() => toggle(k)}>
                  <span className="dot">{isDone ? '✓' : ''}</span>
                  <span className="itx">
                    <span className="t">{META[k].title}</span>
                    <span className="s">{META[k].subtitle}</span>
                  </span>
                  <span className="chev">›</span>
                </button>
                {isOpen && (
                  <div className="ibody">
                    <div className="divider" />
                    {k === 'reflect' && <ReflectCard />}
                    {k === 'practice' && (
                      <div>
                        <button type="button" className="btn gold" onClick={() => setPracticeModalOpen(true)}>
                          Log practice session
                        </button>
                      </div>
                    )}
                    {k === 'recall' && lesson?.quizId && (
                      <RecallCard quizId={lesson.quizId} onDone={() => setOpenItem(null)} />
                    )}
                    {k === 'hw' && lesson && <ModernHomeworkSubmission lesson={lesson} isStudent />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ModernPracticeFormModal open={practiceModalOpen} onClose={() => setPracticeModalOpen(false)} />
    </div>
  );
}

export default ModernLogPage;
