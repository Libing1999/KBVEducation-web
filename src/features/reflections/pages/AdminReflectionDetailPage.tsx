import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Pencil, Save, X, CalendarDays, Layers } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useAdminReflection, useAdminReflectionMutations } from '@/features/reflections/hooks/useAdminReflections';
import { adminReflectionsApi } from '@/features/reflections/api/adminReflectionsApi';
import { downloadFile } from '@/lib/download';
import { formatDate, formatDateTime } from '@/lib/format';
import { paths } from '@/routes/paths';
import type { AnswerInput } from '@/features/reflections/types/reflection.types';

export default function AdminReflectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: r, isLoading, isError, refetch } = useAdminReflection(id);
  const { updateText, remove } = useAdminReflectionMutations();

  const [editing, setEditing] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);

  const seeded = useMemo(() => {
    const map: Record<string, string> = {};
    r?.answers.forEach((a) => { map[a.questionId] = a.answerText ?? ''; });
    return map;
  }, [r]);

  if (isLoading) return <LoadingState label="Loading reflection…" />;
  if (isError || !r) return <ErrorState onRetry={() => refetch()} />;

  const startEdit = () => { setAnswers(seeded); setEditing(true); };
  const saveEdit = () => {
    const payload: AnswerInput[] = r.answers.map((a) => ({ questionId: a.questionId, answerText: answers[a.questionId] ?? '' }));
    updateText.mutate({ id: r.id, answers: payload }, { onSuccess: () => setEditing(false) });
  };

  return (
    <div className="space-y-5">
      <Link to={paths.admin.reflections} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> Back to reflections
      </Link>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link to={paths.admin.studentActivity(r.studentId)} className="text-lg font-semibold text-primary hover:text-primary-600">{r.studentName}</Link>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5"><Layers className="h-4 w-4" /> {r.cohortName ?? '—'}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDate(r.reflectionDate)}</span>
                <span>Submitted {formatDateTime(r.submittedAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={r.reflectionType === 'TYPED' ? 'info' : 'accent'}>{r.reflectionType}</Badge>
              <Button variant="secondary" size="sm" onClick={() => downloadFile(adminReflectionsApi.exportUrl(r.id), `reflection-${r.reflectionDate}.txt`)}>
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button variant="ghost" size="sm" title="Delete" onClick={() => setDeleteOpen(true)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {r.hasAudio && (
        <Card>
          <CardHeader title="Voice note" subtitle={r.audioFileName ?? undefined} />
          <CardBody><AudioPlayer url={adminReflectionsApi.audioUrl(r.id)} /></CardBody>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Answers"
          action={
            editing ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={updateText.isPending}><X className="h-4 w-4" /> Cancel</Button>
                <Button size="sm" onClick={saveEdit} isLoading={updateText.isPending}><Save className="h-4 w-4" /> Save</Button>
              </div>
            ) : (
              r.answers.length > 0 && <Button variant="secondary" size="sm" onClick={startEdit}><Pencil className="h-4 w-4" /> Edit text</Button>
            )
          }
        />
        <CardBody className="space-y-4">
          {r.answers.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No typed answers{r.hasAudio ? ' — voice note only.' : '.'}</p>
          ) : (
            r.answers.map((a) => (
              <div key={a.questionId} className="space-y-1.5">
                <p className="text-sm font-medium text-slate-700">{a.questionText}</p>
                {editing ? (
                  <textarea
                    rows={2}
                    value={answers[a.questionId] ?? ''}
                    onChange={(e) => setAnswers((p) => ({ ...p, [a.questionId]: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                ) : (
                  <p className="whitespace-pre-line rounded-lg bg-secondary px-3 py-2 text-sm text-slate-700">{a.answerText || <span className="text-slate-400">—</span>}</p>
                )}
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete reflection"
        message="Delete this reflection? This can’t be undone."
        confirmLabel="Delete"
        danger
        isLoading={remove.isPending}
        onConfirm={() => remove.mutate(r.id, { onSuccess: () => navigate(paths.admin.reflections) })}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
